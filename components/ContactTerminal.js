import { BotAvatar } from "bot-avatars";
import { ThinkingOrb } from "thinking-orbs";
import { useEffect, useRef, useState } from "react";
import {
  FiArrowUp,
  FiArrowUpRight,
  FiCopy,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";
import { contact } from "../lib/content";
import { typeOut } from "../lib/fakeStream";
import {
  ApiError,
  clearSession,
  createSession,
  getStoredSession,
  sendChat,
} from "../lib/inscope";
import ChatVerification, { TURNSTILE_SITE_KEY } from "./ChatVerification";
import ChatReply from "./ChatReply";
const MAX_MESSAGE_LENGTH = 500;
const MAX_MESSAGE_WORDS = 80;
const MAX_MESSAGE_LINES = 5;
const MAX_HISTORY_ENTRIES = 20;
const MAX_ASSISTANT_HISTORY_WORDS = 300;
const MAX_ASSISTANT_HISTORY_BYTES = 3000;
const MAX_STORED_EXCHANGES = 20;
const SESSION_RETRY_DELAY_MS = 60000;
const CONTACT_CHOICES = ["email", "linkedin", "github", "resume", "whatsapp", "phone"];

function messageTooLong(text) {
  return text.length > MAX_MESSAGE_LENGTH || (text.match(/\S+/g) || []).length > MAX_MESSAGE_WORDS || text.split("\n").length > MAX_MESSAGE_LINES;
}
function measureComposer(element) {
  const style = window.getComputedStyle(element);
  const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const maximum = parseFloat(style.lineHeight) * MAX_MESSAGE_LINES + padding;
  const previous = element.style.height;
  element.style.height = "0px";
  const height = element.scrollHeight;
  element.style.height = previous;
  return { height, maximum, tooTall: height > Math.ceil(maximum) + 1 };
}
function byteLength(value) {
  return new TextEncoder().encode(value).length;
}
// The Worker caps assistant history at 300 words / 3072 bytes. Trim with room
// to spare without touching the full reply kept in memory.
function trimAssistantContent(content) {
  let text = typeof content === "string" ? content : "";
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length > MAX_ASSISTANT_HISTORY_WORDS) {
    text = words.slice(0, MAX_ASSISTANT_HISTORY_WORDS).join(" ");
  }
  if (byteLength(text) > MAX_ASSISTANT_HISTORY_BYTES) {
    let low = 0;
    let high = text.length;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (byteLength(text.slice(0, middle)) <= MAX_ASSISTANT_HISTORY_BYTES) {
        low = middle;
      } else {
        high = middle - 1;
      }
    }
    text = text.slice(0, low);
  }
  return text;
}
const actions = {
  email: {
    label: "Email",
    text: "Straight to the inbox. Here’s my email.",
    value: contact.email,
    href: `mailto:${contact.email}`,
  },
  linkedin: {
    label: "LinkedIn",
    text: "Let’s connect. You’ll find me here.",
    href: contact.linkedin,
  },
  github: {
    label: "GitHub",
    text: "A little code speaks for itself.",
    href: contact.github,
  },
  resume: {
    label: "Résumé",
    text: "The whole story, in one document.",
    href: contact.resume,
    download: true,
  },
  whatsapp: {
    label: "WhatsApp",
    text: "A more direct line. Say hello on WhatsApp.",
    href: contact.whatsapp,
  },
  phone: {
    label: "Phone",
    text: "Here’s my contact number.",
    value: contact.phone,
    href: "tel:+919173255769",
  },
};
// Local shortcuts only. General questions go to the InScope Worker.
export function resolveContactIntent(input) {
  const text = input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (/wechat|telegram|instagram|twitter|facebook|snapchat/.test(text))
    return [];
  return Object.entries({
    email: /\b(e-?mail|inbox)\b/,
    linkedin: /\blinked\s?in\b/,
    github: /\b(github|code|repos?|repository)\b/,
    resume: /\b(resume|résumé|cv|curriculum)\b/,
    whatsapp: /\b(whats\s?app)\b/,
    phone: /\b(phone|number|call|mobile)\b/,
  })
    .filter(([, regex]) => regex.test(text))
    .map(([key]) => key);
}
export default function ContactTerminal({ paused = false }) {
  const [verificationActive, setVerificationActive] = useState(false);
  const [verificationReset, setVerificationReset] = useState(0);
  const [verified, setVerified] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState(0);
  const [sessionStatus, setSessionStatus] = useState(null);
  const [limitLocked, setLimitLocked] = useState(false);
  const verificationRequired = Boolean(TURNSTILE_SITE_KEY);
  const inputLocked = (verificationRequired && !verified) || limitLocked;
  const [light, setLight] = useState(false);
  useEffect(() => {
    const sync = () => setLight(document.documentElement.dataset.theme === "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  const [input, setInput] = useState(""),
    [inputError, setInputError] = useState(false),
    [messages, setMessages] = useState([]),
    [busy, setBusy] = useState(false),
    [copied, setCopied] = useState("");
  const history = useRef(null),
    composer = useRef(null),
    timer = useRef(null),
    errorTimer = useRef(null),
    sessionTimer = useRef(null);
  const apiHistory = useRef([]);
  const session = useRef(null);
  const stream = useRef(null);
  const nearBottom = useRef(true);
  const mounted = useRef(true);
  const pendingRetry = useRef(null);
  const retriedAuth = useRef(false);
  const badRequestStreak = useRef(0);
  const lastToken = useRef("");
  const nextMessageId = useRef(0);
  const sendRef = useRef(null);
  const chatVersion = useRef(0);
  const chatAbort = useRef(null);
  const sessionAbort = useRef(null);

  useEffect(() => {
    const stored = getStoredSession();
    if (stored) {
      session.current = stored;
      setSessionExpiresAt(stored.expires_at);
      setVerified(true);
    }
    mounted.current = true;
    return () => {
      mounted.current = false;
      chatVersion.current += 1;
      chatAbort.current?.abort();
      sessionAbort.current?.abort();
      window.clearTimeout(timer.current);
      window.clearTimeout(errorTimer.current);
      window.clearTimeout(sessionTimer.current);
      if (stream.current) {
        stream.current();
        stream.current = null;
      }
    };
  }, []);
  useEffect(() => {
    if (!sessionExpiresAt) return;
    const expire = () => {
      if (session.current?.expires_at !== sessionExpiresAt) return;
      if (sessionExpiresAt > Math.floor(Date.now() / 1000) + 60) return;
      const stored = getStoredSession();
      if (stored) {
        session.current = stored;
        setSessionExpiresAt(stored.expires_at);
        setVerified(true);
        return;
      }
      clearSession();
      session.current = null;
      setSessionExpiresAt(0);
      setVerified(false);
      setVerificationActive(false);
    };
    const expiryTimer = window.setTimeout(
      expire,
      Math.max(0, (sessionExpiresAt - 60) * 1000 - Date.now()),
    );
    document.addEventListener("visibilitychange", expire);
    return () => {
      window.clearTimeout(expiryTimer);
      document.removeEventListener("visibilitychange", expire);
    };
  }, [sessionExpiresAt]);
  useEffect(() => {
    if (history.current && nearBottom.current) {
      history.current.scrollTop = history.current.scrollHeight;
    }
  }, [messages, busy]);
  useEffect(() => {
    if (!composer.current) return;
    const resize = () => {
      const element = composer.current;
      const measured = measureComposer(element);
      if (measured.tooTall && element.value) {
        rejectLongMessage();
        return;
      }
      element.style.height = `${Math.min(measured.height, measured.maximum)}px`;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [input]);
  function rejectLongMessage() {
    setInputError(true);
    window.clearTimeout(errorTimer.current);
    errorTimer.current = window.setTimeout(() => setInputError(false), 2500);
  }
  function changeInput(text, element) {
    if (messageTooLong(text) || measureComposer(element).tooTall) {
      rejectLongMessage();
      return;
    }
    setInput(text);
  }
  function addMessage(message) {
    const id = (nextMessageId.current += 1);
    setMessages((old) => [...old, { id, ...message }]);
  }
  function addSystemMessage(text, extra) {
    addMessage({ system: true, text, ...extra });
  }
  function restoreInput(text) {
    setInput(text);
    setInputError(false);
  }
  function cancelStream() {
    if (!stream.current) return;
    const cancel = stream.current;
    stream.current = null;
    cancel();
  }
  function startStream(id, fullText) {
    cancelStream();
    const cancel = typeOut(
      fullText,
      (partial) => {
        if (!mounted.current) return;
        setMessages((old) =>
          old.map((message) => (message.id === id ? { ...message, text: partial } : message)),
        );
      },
      () => {
        if (!mounted.current) return;
        stream.current = null;
        setMessages((old) =>
          old.map((message) => (message.id === id ? { ...message, streaming: false } : message)),
        );
      },
    );
    stream.current = cancel;
  }
  function beginReverification(text) {
    clearSession();
    session.current = null;
    setSessionExpiresAt(0);
    setVerified(false);
    setVerificationActive(true);
    setSessionStatus(null);
    setVerificationReset((value) => value + 1);
    if (text) {
      pendingRetry.current = text;
      retriedAuth.current = true;
      addSystemMessage("Session expired — re-verifying…");
    }
  }
  async function startSession(token) {
    if (!token || token === lastToken.current || sessionAbort.current) return;
    lastToken.current = token;
    const controller = new AbortController();
    sessionAbort.current = controller;
    setSessionStatus({ text: "Securing session…" });
    try {
      const next = await createSession(token, { signal: controller.signal });
      if (!mounted.current || controller.signal.aborted) return;
      session.current = next;
      setSessionExpiresAt(next.expires_at);
      setVerified(true);
      setVerificationActive(false);
      setSessionStatus(null);
      window.clearTimeout(sessionTimer.current);
      composer.current?.focus();
      const queued = pendingRetry.current;
      pendingRetry.current = null;
      if (queued) sendRef.current?.(queued);
    } catch (error) {
      if (!mounted.current || controller.signal.aborted) return;
      lastToken.current = "";
      const status = error instanceof ApiError ? error.status : 0;
      if (status === 429) {
        setSessionStatus({ text: "Too many attempts. Try again in a minute." });
        window.clearTimeout(sessionTimer.current);
        sessionTimer.current = window.setTimeout(() => {
          if (!mounted.current) return;
          setSessionStatus(null);
          setVerificationReset((value) => value + 1);
        }, SESSION_RETRY_DELAY_MS);
        return;
      }
      if (status === 403) {
        setSessionStatus({ text: "Verification failed. Please refresh the page." });
        return;
      }
      setSessionStatus({ text: "Couldn't start a session. Retry", retry: true });
    } finally {
      if (sessionAbort.current === controller) sessionAbort.current = null;
    }
  }
  function retrySession() {
    lastToken.current = "";
    setVerificationActive(true);
    setSessionStatus(null);
    setVerificationReset((value) => value + 1);
  }
  function handleChatError(error, text) {
    const status = error instanceof ApiError ? error.status : 0;
    if (status === 401) {
      if (!retriedAuth.current) {
        beginReverification(text);
      } else {
        clearSession();
        session.current = null;
        setSessionExpiresAt(0);
        setVerified(false);
        setVerificationActive(true);
        setSessionStatus(null);
        setVerificationReset((value) => value + 1);
        retriedAuth.current = false;
        pendingRetry.current = null;
        addSystemMessage("Couldn't reach the assistant. Try again.");
        restoreInput(text);
      }
      return;
    }
    if (status === 400) {
      badRequestStreak.current += 1;
      addSystemMessage("That message couldn't be processed. Try rephrasing it.");
      if (badRequestStreak.current >= 2) {
        apiHistory.current = [];
        badRequestStreak.current = 0;
        addSystemMessage("Conversation history cleared, so we can start fresh.");
      }
      return;
    }
    if (status === 403) {
      addSystemMessage("Request blocked. If you're on Tor or a strict VPN, try a normal connection.");
      return;
    }
    if (status === 429) {
      addSystemMessage("You've reached today's message limit. You can still reach me directly:", {
        choices: CONTACT_CHOICES,
      });
      setLimitLocked(true);
      return;
    }
    if (status === 503) {
      addSystemMessage("The assistant is resting for today. Reach me directly:", {
        choices: CONTACT_CHOICES,
      });
      setLimitLocked(true);
      return;
    }
    addSystemMessage("Couldn't reach the assistant. Try again.");
    restoreInput(text);
  }
  async function sendBackend(text) {
    const current = session.current?.expires_at > Math.floor(Date.now() / 1000) + 60
      ? session.current : getStoredSession();
    if (!current) {
      clearSession();
      session.current = null;
      setSessionExpiresAt(0);
      pendingRetry.current = text;
      retriedAuth.current = true;
      setBusy(false);
      setVerified(false);
      setVerificationActive(true);
      setSessionStatus(null);
      setVerificationReset((value) => value + 1);
      addSystemMessage("Session expired — re-verifying…");
      return;
    }
    session.current = current;
    setBusy(true);
    const prepared = apiHistory.current
      .slice(-MAX_HISTORY_ENTRIES)
      .map((entry) =>
        entry.role === "assistant"
          ? { role: "assistant", content: trimAssistantContent(entry.content) }
          : { role: "user", content: entry.content },
      );
    while (prepared.length && prepared[0].role !== "user") prepared.shift();
    const version = ++chatVersion.current;
    const controller = new AbortController();
    chatAbort.current = controller;
    try {
      const { reply } = await sendChat(prepared, text, current.token, { signal: controller.signal, model: "llm-1" });
      if (!mounted.current || version !== chatVersion.current) return;
      apiHistory.current = [
        ...apiHistory.current,
        { role: "user", content: text },
        { role: "assistant", content: reply },
      ].slice(-MAX_STORED_EXCHANGES);
      badRequestStreak.current = 0;
      retriedAuth.current = false;
      pendingRetry.current = null;
      setBusy(false);
      const id = (nextMessageId.current += 1);
      setMessages((old) => [...old, { id, text: "", streaming: true }]);
      startStream(id, reply);
    } catch (error) {
      if (!mounted.current || version !== chatVersion.current) return;
      setBusy(false);
      handleChatError(error, text);
    } finally {
      if (chatAbort.current === controller) chatAbort.current = null;
    }
  }
  function ask(text, direct) {
    if (messageTooLong(text) || (!direct && composer.current && measureComposer(composer.current).tooTall)) {
      rejectLongMessage();
      return;
    }
    if (!text.trim() || busy || (!direct && inputLocked)) return;
    const choices = direct ? [direct] : resolveContactIntent(text);
    const words = (text.match(/\S+/g) || []).length;
    const local = Boolean(direct) || (choices.length > 0 && words <= 6);
    cancelStream();
    setInput("");
    setCopied("");
    if (!local) {
      retriedAuth.current = false;
      pendingRetry.current = null;
    }
    const id = (nextMessageId.current += 1);
    setMessages((old) => [...old, { id, user: true, text, local }]);
    if (local) {
      setBusy(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(
        () => {
          const answer =
            choices.length === 1
              ? actions[choices[0]].text
              : "A couple of ways to connect. Take your pick.";
          addMessage({ text: answer, choices, local: true });
          if (!chatAbort.current) setBusy(false);
        },
        1200,
      );
      return;
    }
    setBusy(true);
    sendBackend(text);
  }
  async function copy(value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
    } catch {
      setCopied("Copy unavailable — select the address above.");
    }
  }
  sendRef.current = sendBackend;
  const streaming = messages.some((message) => message.streaming);
  return (
    <div className={`contact-terminal${busy ? " terminal-busy" : ""}${messages.length > 0 ? " terminal-has-messages" : ""}`}>
      <div className="terminal-bar mono">
        <span>
          <span className="signal-dot" /> vinamra — terminal
        </span>
        <button
          aria-label="Reset conversation"
          title="Reset conversation"
          onClick={() => {
            chatVersion.current += 1;
            chatAbort.current?.abort();
            chatAbort.current = null;
            window.clearTimeout(timer.current);
            window.clearTimeout(errorTimer.current);
            cancelStream();
            apiHistory.current = [];
            pendingRetry.current = null;
            retriedAuth.current = false;
            badRequestStreak.current = 0;
            setInputError(false);
            setInput("");
            setMessages([]);
            setBusy(false);
            setCopied("");
          }}
        >
          <FiRefreshCw />
        </button>
      </div>
      <div
        className="terminal-body"
        ref={history}
        role="log"
        aria-live="polite"
        aria-label="Portfolio AI conversation"
        onScroll={() => {
          const element = history.current;
          if (!element) return;
          nearBottom.current =
            element.scrollHeight - element.scrollTop - element.clientHeight < 72;
        }}
      >
        <div className="terminal-greeting">
          <span className="terminal-avatar" aria-hidden="true">
            <BotAvatar
              type="ghost"
              size={96}
              color={light ? "#657178" : "#bdbdbd"}
              shading="smooth"
              state={busy ? "working" : "default"}
              paused={paused}
            />
          </span>
          <div>
            <span className="mono terminal-agent-name">
              VM / AI ASSISTANT
            </span>
            <p>
              Hello, visitor.
              <br />
              What would you like to know?
            </p>
            <span className="terminal-hint">
              Ask about my work, projects, experience or how to reach me.
            </span>
          </div>
        </div>
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.user
                ? "terminal-message user-message"
                : message.system
                  ? "terminal-message system-message"
                  : `terminal-message${message.streaming ? " is-streaming" : ""}`
            }
            onClick={message.streaming ? cancelStream : undefined}
            title={message.streaming ? "Click to show the full reply" : undefined}
          >
            <span className="mono message-prefix">
              {message.user ? "YOU" : message.system ? "SYS" : "VM"}
            </span>
            <div>
              {message.user || message.system || message.local ? (
                <p>{message.text}</p>
              ) : (
                <ChatReply text={message.text} streaming={message.streaming} />
              )}
              {message.choices?.map((key) => (
                <div className="terminal-result" key={key}>
                  {actions[key].value && <span>{actions[key].value}</span>}
                  <a
                    href={actions[key].href}
                    download={actions[key].download || undefined}
                    target={
                      actions[key].href.startsWith("https")
                        ? "_blank"
                        : undefined
                    }
                    rel="noreferrer"
                  >
                    {actions[key].download
                      ? "Download résumé"
                      : `Open ${actions[key].label}`}{" "}
                    {actions[key].download ? (
                      <FiDownload />
                    ) : (
                      <FiArrowUpRight />
                    )}
                  </a>
                  {actions[key].value && (
                    <button
                      aria-label={`Copy ${actions[key].label}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        copy(actions[key].value);
                      }}
                    >
                      {copied === actions[key].value ? "Copied" : <FiCopy />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {busy && (
          <p className="terminal-thinking mono">
            <ThinkingOrb state="searching" size={20} dark={!light} paused={paused} />
            <span>
              Thinking<span className="blink">_</span>
            </span>
          </p>
        )}
        {copied.startsWith("Copy unavailable") && <p role="status">{copied}</p>}
      </div>
      <div className="terminal-options">
        {Object.entries(actions).map(([key, action]) => (
          <button
            key={key}
            disabled={busy}
            onClick={() => ask(action.label, key)}
          >
            {action.label}
            <FiArrowUpRight />
          </button>
        ))}
      </div>
      <ChatVerification
        active={verificationActive}
        resetKey={verificationReset}
        onVerify={(token) => {
          if (!token) return;
          if (getStoredSession() && !pendingRetry.current) return;
          startSession(token);
        }}
      />
      {sessionStatus && (
        <p className="terminal-session-status mono" role="status">
          {sessionStatus.text}
          {sessionStatus.retry && (
            <button type="button" onClick={retrySession}>
              Retry
            </button>
          )}
        </p>
      )}
      <form
        id="contact-form"
        className="terminal-input"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <span aria-hidden="true">›</span>
        <label className="sr-only" htmlFor="contact-input">
          Ask for a contact method or résumé
        </label>
        <textarea
          id="contact-input"
          ref={composer}
          rows={1}
          value={input}
          onChange={(e) => changeInput(e.target.value, e.target)}
          readOnly={inputLocked || busy}
          aria-describedby={
            inputError
              ? "message-length-error"
              : limitLocked
                ? "limit-hint"
                : inputLocked && verificationActive
                  ? "verification-hint"
                  : undefined
          }
          onFocus={() => {
            if (!verified && !session.current) setVerificationActive(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              ask(input);
            }
          }}
          placeholder={
            limitLocked
              ? "Free-text paused — use a contact shortcut"
              : inputLocked && verificationActive
                ? "Complete verification above to chat"
                : "Ask anything about me"
          }
          autoComplete="off"
          spellCheck={false}
          autoCorrect="off"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy || inputLocked}
          aria-label="Send request"
        >
          <FiArrowUp />
        </button>
      </form>
      {inputError && <p id="message-length-error" className="terminal-input-error mono" role="alert">Message too long</p>}
      {inputLocked && verificationActive && !limitLocked && <p id="verification-hint" className="verification-hint">Chat unlocks after verification. Contact shortcuts are always available.</p>}
      {limitLocked && <p id="limit-hint" className="verification-hint">Free-text chat is paused. Contact shortcuts still work.</p>}
      <div className="terminal-status mono">
        <span>
          <span className="status-square" /> {busy ? "ROUTING" : streaming ? "TYPING" : "READY"}
        </span>
        <span>CONTACT SHORTCUTS</span>
      </div>
      <details className="terminal-privacy">
        <summary>Privacy</summary>
        <p>
          Cloudflare Turnstile helps keep this chat free of bots. It checks browser
          and connection information. A device identifier, time zone and browser
          language are used to rate-limit sessions. Learn more in the{" "}
          <a href="https://www.cloudflare.com/turnstile-privacy-policy/" target="_blank" rel="noreferrer">
            Cloudflare Turnstile Privacy Addendum
          </a>.
          {" "}Chat messages and recent conversation history are sent to OpenCode to generate replies.
          A device identifier and daily usage counts are stored for rate limiting.
          Your browser keeps the signed session for up to 24 hours, including across visits.
        </p>
      </details>
    </div>
  );
}
