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
  const [input, setInput] = useState(""),
    [messages, setMessages] = useState([]),
    [busy, setBusy] = useState(false),
    [copied, setCopied] = useState("");
  const history = useRef(null),
    timer = useRef(null),
    replyIndex = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (history.current)
      history.current.scrollTop = history.current.scrollHeight;
  }, [messages, busy]);
  function ask(text, direct) {
    if (!text.trim() || busy) return;
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
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 380,
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
          <span className="signal-dot" /> contact / vm
        </span>
        <button
          aria-label="Reset conversation"
          title="Reset conversation"
          onClick={() => {
            window.clearTimeout(timer.current);
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
        aria-label="Contact conversation"
      >
        <div className="terminal-greeting">
          <span className="terminal-avatar" aria-hidden="true">
            <BotAvatar
              type="ghost"
              size={68}
              color="#b9beb8"
              shading="smooth"
              state={busy ? "working" : "default"}
              paused={paused}
            />
          </span>
          <div>
            <span className="mono terminal-agent-name">
              Vinamra’s contact desk
            </span>
            <p>
              Hey, you made it.
              <br />
              What can I help you find?
            </p>
            <span className="terminal-hint">Pick a channel, or ask below.</span>
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
            <ThinkingOrb state="searching" size={20} dark paused={paused} />
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
      <form
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
        <input
          id="contact-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Try “can I get your résumé?”"
          maxLength={200}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          aria-label="Send request"
        >
          <FiArrowUp />
        </button>
      </form>
      <div className="terminal-status mono">
        <span>
          <span className="status-square" /> {busy ? "ROUTING" : "READY"}
        </span>
        <span>CONTACT SHORTCUTS</span>
      </div>
    </div>
  );
}
