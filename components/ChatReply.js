import ReactMarkdown from "react-markdown";

export function safeChatUrl(value) {
  const url = String(value || "").trim();
  if (/^(https?:|mailto:)/i.test(url)) return url;
  if (/^\/(?!\/)/.test(url) || url.startsWith("#")) return url;
  return "";
}

export default function ChatReply({ text, streaming = false }) {
  return (
    <div className="chat-reply" aria-busy={streaming || undefined}>
      <ReactMarkdown
        skipHtml
        disallowedElements={["img"]}
        urlTransform={safeChatUrl}
        components={{
          a: ({ href, children }) => href ? (
            <a href={href} target={/^https?:/i.test(href) ? "_blank" : undefined} rel="noopener noreferrer">
              {children}
            </a>
          ) : <span>{children}</span>,
        }}
      >
        {text || ""}
      </ReactMarkdown>
      {streaming && <span className="terminal-cursor" aria-hidden="true" />}
    </div>
  );
}
