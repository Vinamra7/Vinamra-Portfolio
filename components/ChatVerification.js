import Script from "next/script";
import { useEffect, useRef, useState } from "react";

// Site keys are public. The fallback keeps deployments configured without secrets.
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAFM5G55V3dNnE_Br";
const siteKey = TURNSTILE_SITE_KEY;
if (process.env.NODE_ENV === "production" && /^[123]x/.test(siteKey)) {
  throw new Error("Use a real Turnstile site key for production builds.");
}

// Frontend token acquisition only. InScope must redeem the token at Siteverify.
// Tokens are single-use, so the parent bumps `resetKey` to obtain a fresh one
// after a failed /api/session or an expired chat session.
export default function ChatVerification({ active, resetKey, onVerify }) {
  const container = useRef(null);
  const verifyRef = useRef(onVerify);
  verifyRef.current = onVerify;
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
    setFailed(false);
    setInteractive(false);
    try {
      widgetId = window.turnstile.render(container.current, {
        sitekey: siteKey,
        action: "session",
        appearance: "interaction-only",
        theme: document.documentElement.dataset.theme === "light" ? "light" : "dark",
        size: window.innerWidth < 380 ? "compact" : "normal",
        "response-field": false,
        "refresh-expired": "never",
        "before-interactive-callback": () => {
          if (mounted) setInteractive(true);
        },
        "after-interactive-callback": () => {
          if (mounted) setInteractive(false);
        },
        callback: (value) => {
          if (!mounted) return;
          setToken(value);
          setFailed(false);
          setInteractive(false);
          verifyRef.current?.(value);
        },
        "expired-callback": () => {
          if (mounted) setToken("");
        },
        "error-callback": () => {
          if (mounted) {
            setToken("");
            setFailed(true);
          }
        },
        "timeout-callback": () => {
          if (mounted) {
            setToken("");
            setFailed(true);
          }
        },
      });
    } catch {
      setFailed(true);
    }
    return () => {
      mounted = false;
      if (widgetId !== undefined) window.turnstile?.remove(widgetId);
    };
  }, [active, ready, resetKey, retry]);

  if (!siteKey || !active) return null;
  return (
    <div className="chat-verification" hidden={Boolean(token)}>
      <Script
        id="chat-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => { setReady(true); setFailed(false); }}
        onError={() => { setToken(""); setFailed(true); }}
      />
      <p className="verification-heading mono" role="status">
        {failed ? "VERIFICATION UNAVAILABLE" : interactive ? "VERIFY TO CHAT" : "VERIFYING BROWSER…"}
      </p>
      <div ref={container} />
      {failed && (
        <p role="status">
          Verification unavailable. Contact shortcuts still work.{" "}
          {ready && <button type="button" onClick={() => setRetry((value) => value + 1)}>Retry</button>}
        </p>
      )}
    </div>
  );
}
