import { BotAvatar } from "bot-avatars";
import { ThinkingOrb } from "thinking-orbs";
import { useEffect, useRef, useState } from "react";
import {
  FiArrowUp,
  FiArrowUpRight,
  FiCopy,
  FiDownload,
  FiRefreshCw,
  FiAperture,
} from "react-icons/fi";
import { contact } from "../lib/content";
import ChatVerification, { TURNSTILE_SITE_KEY } from "./ChatVerification";
const MAX_MESSAGE_LENGTH = 500;
const MAX_MESSAGE_WORDS = 80;
const MAX_MESSAGE_LINES = 5;

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
const replies = [
  "That channel isn’t available. Try one of the options below.",
  "A little outside my orbit. I can help with contact details or a résumé.",
  "No signal on that one. Email, LinkedIn, GitHub, WhatsApp, phone, or résumé?",
];
// Local preview only. A future server-side Jev adapter can return these keys.
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
  const verificationRequired = Boolean(TURNSTILE_SITE_KEY);
  const inputLocked = verificationRequired && !verified;
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
    replyIndex = useRef(0);
  useEffect(() => () => {
    window.clearTimeout(timer.current);
    window.clearTimeout(errorTimer.current);
  }, []);
  useEffect(() => {
    if (history.current)
      history.current.scrollTop = history.current.scrollHeight;
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
    setInput("");
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
  function ask(text, direct) {
    if (messageTooLong(text) || (!direct && composer.current && measureComposer(composer.current).tooTall)) {
      rejectLongMessage();
      return;
    }
    if (!text.trim() || busy || (!direct && inputLocked)) return;
    const choices = direct ? [direct] : resolveContactIntent(text);
    setInput("");
    setBusy(true);
    setCopied("");
    setMessages((old) => [...old.slice(-10), { user: true, text }]);
    timer.current = window.setTimeout(
      () => {
        const answer =
          choices.length === 1
            ? actions[choices[0]].text
            : choices.length > 1
              ? "A couple of ways to connect. Take your pick."
              : replies[replyIndex.current++ % replies.length];
        setMessages((old) => [...old, { text: answer, choices }]);
        setBusy(false);
      },
      1200,
    );
  }
  async function copy(value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
    } catch {
      setCopied("Copy unavailable — select the address above.");
    }
  }
  return (
    <div className={`contact-terminal ${busy ? "terminal-busy" : ""}`}>
      <div className="terminal-bar mono">
        <span>
          <span className="signal-dot" /> vinamra — contact terminal
        </span>
        <button
          aria-label="Reset conversation"
          title="Reset conversation"
          onClick={() => {
            window.clearTimeout(timer.current);
            window.clearTimeout(errorTimer.current);
            setInputError(false);
            setInput("");
            setMessages([]);
            setBusy(false);
            setCopied("");
            setVerified(false);
            setVerificationReset((value) => value + 1);
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
        aria-label="Contact conversation"
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
              VM / CONTACT ASSISTANT
            </span>
            <p>
              Hello, visitor.
              <br />
              Where should we connect?
            </p>
            <span className="terminal-hint">
              Ask for my email, phone, links or résumé.
            </span>
          </div>
        </div>
        {messages.map((message, i) => (
          <div
            key={i}
            className={
              message.user
                ? "terminal-message user-message"
                : "terminal-message"
            }
          >
            <span className="mono message-prefix">
              {message.user ? "YOU" : "VM"}
            </span>
            <div>
              <p>{message.text}</p>
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
                      onClick={() => copy(actions[key].value)}
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
              Finding your channel<span className="blink">_</span>
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
      <ChatVerification active={verificationActive} resetKey={verificationReset} onVerified={setVerified} />
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
          aria-describedby={inputError ? "message-length-error" : inputLocked && verificationActive ? "verification-hint" : undefined}
          onFocus={() => setVerificationActive(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              ask(input);
            }
          }}
          placeholder={inputLocked && verificationActive ? "Complete verification above to chat" : "Try “can I get your résumé?”"}
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
      {inputLocked && verificationActive && <p id="verification-hint" className="verification-hint">Chat unlocks after verification. Contact shortcuts are always available.</p>}
      <div className="terminal-status mono">
        <span>
          <span className="status-square" /> {busy ? "ROUTING" : "READY"}
        </span>
        <span>CONTACT SHORTCUTS</span>
      </div>
      <details className="terminal-privacy">
        <summary>Privacy</summary>
        <p>
          Cloudflare Turnstile helps keep this chat free of bots. It checks browser
          and connection information. Learn more in the{" "}
          <a href="https://www.cloudflare.com/turnstile-privacy-policy/" target="_blank" rel="noreferrer">
            Cloudflare Turnstile Privacy Addendum
          </a>.
        </p>
      </details>
    </div>
  );
}
