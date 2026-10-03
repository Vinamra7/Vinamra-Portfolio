import Script from "next/script";
import { useEffect, useRef, useState } from "react";

// Site keys are public. The fallback keeps deployments configured without secrets.
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAFM5G55V3dNnE_Br";
const siteKey = TURNSTILE_SITE_KEY;
if (process.env.NODE_ENV === "production" && /^[123]x/.test(siteKey)) {
  throw new Error("Use a real Turnstile site key for production builds.");
}

// Frontend token acquisition only. InScope must redeem the token at Siteverify.
export default function ChatVerification({ active, resetKey, onVerified }) {
  const container = useRef(null);
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState("");
  const [failed, setFailed] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!active || !ready || !siteKey || !container.current) return;
    let mounted = true;
    let widgetId;
    setToken("");
    onVerified(false);
    setFailed(false);
    setInteractive(false);
    try {
      widgetId = window.turnstile.render(container.current, {
        sitekey: siteKey,
        action: "chat",
        appearance: "interaction-only",
        theme: document.documentElement.dataset.theme === "light" ? "light" : "dark",
        size: "normal",
        "response-field": false,
        "before-interactive-callback": () => {
          if (mounted) setInteractive(true);
        },
        "after-interactive-callback": () => {
          if (mounted) setInteractive(false);
        },
        callback: (value) => {
          if (mounted) {
            setToken(value);
            onVerified(true);
            setFailed(false);
            setInteractive(false);
          }
        },
        "expired-callback": () => {
          if (mounted) {
            setToken("");
            onVerified(false);
          }
        },
        "error-callback": () => {
          if (mounted) {
            setToken("");
            onVerified(false);
            setFailed(true);
          }
        },
        "timeout-callback": () => {
          if (mounted) {
            setToken("");
            onVerified(false);
            setFailed(true);
          }
        },
      });
    } catch {
      onVerified(false);
      setFailed(true);
    }
    return () => {
      mounted = false;
      if (widgetId !== undefined) window.turnstile?.remove(widgetId);
    };
  }, [active, ready, resetKey, retry, onVerified]);

  if (!siteKey || !active) return null;
  return (
    <div className="chat-verification" hidden={Boolean(token)}>
      <Script
        id="chat-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => { setReady(true); setFailed(false); }}
        onError={() => { setToken(""); onVerified(false); setFailed(true); }}
      />
      <p className="verification-heading mono" role="status">
        {failed ? "VERIFICATION UNAVAILABLE" : interactive ? "VERIFY TO CHAT" : "VERIFYING BROWSER…"}
      </p>
      <div ref={container} />
      <input type="hidden" form="contact-form" name="cf-turnstile-response" value={token} />
      {failed && (
        <p role="status">
          Verification unavailable. Contact shortcuts still work.{" "}
          {ready && <button type="button" onClick={() => setRetry((value) => value + 1)}>Retry</button>}
        </p>
      )}
    </div>
  );
}
