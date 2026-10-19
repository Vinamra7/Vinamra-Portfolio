// Client helpers for the InScope Worker. Only public URLs and site keys live
// here; the Turnstile secret and model provider keys stay in the Worker.
const SESSION_KEY = "inscope.session";
const DEVICE_KEY = "inscope.device";
const SESSION_GRACE_SECONDS = 60;
const SESSION_TTL_SECONDS = 24 * 60 * 60;
const REQUEST_TIMEOUT_MS = 30000;
const MOCK = process.env.NEXT_PUBLIC_INSCOPE_MOCK === "1";

const PRIMARY_API = process.env.NEXT_PUBLIC_API_PRIMARY || "https://api.vinamramishra.dev";
const LOCAL_API = process.env.NEXT_PUBLIC_API_LOCAL || "http://localhost:8787";
const FALLBACK_API = process.env.NEXT_PUBLIC_API_FALLBACK || "";

function withoutTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

/** Worker origin for the current host. Empty until configured. */
export function apiBase() {
  if (typeof window === "undefined") return "";
  const host = window.location.hostname;
  if (host === "vinamramishra.dev" || host === "www.vinamramishra.dev") {
    return withoutTrailingSlash(PRIMARY_API);
  }
  if (host === "localhost" || host === "127.0.0.1") {
    return withoutTrailingSlash(LOCAL_API);
  }
  return withoutTrailingSlash(FALLBACK_API);
}

export class ApiError extends Error {
  constructor(message, status = 0, code = "network") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestContext(signal) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(abort, REQUEST_TIMEOUT_MS);
  return {
    controller,
    finish() {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
    },
  };
}

async function fingerprintWithDeadline() {
  let timer;
  try {
    return await Promise.race([
      getFingerprint(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new ApiError("Device check timed out", 0, "timeout")), 8000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function requireBase() {
  const base = apiBase();
  if (!base) {
    throw new ApiError("The assistant API URL is not configured", 0, "config");
  }
  return base;
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/** Session kept in sessionStorage; discarded 60s before the server expiry. */
// Sessions now use localStorage; older tab-only sessions migrate with their original expiry.
export function getStoredSession() {
  if (typeof window === "undefined") return null;
  try {
    const persistent = readSessionStorage("localStorage");
    const raw = persistent || readSessionStorage("sessionStorage");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.token !== "string" || !parsed.token) {
      clearSession();
      return null;
    }
    const expires = Number(parsed.expires_at);
    if (!Number.isFinite(expires) || expires <= nowSeconds() + SESSION_GRACE_SECONDS) {
      clearSession();
      return null;
    }
    if (!persistent || expires > nowSeconds() + SESSION_TTL_SECONDS) return saveSession(parsed);
    return { token: parsed.token, expires_at: expires };
  } catch {
    clearSession();
    return null;
  }
}

function readSessionStorage(storageName) {
  try {
    return window[storageName].getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function saveSession({ token, expires_at } = {}) {
  const expires = Number(expires_at);
  if (typeof token !== "string" || !token || !Number.isFinite(expires) ||
      expires <= nowSeconds() + SESSION_GRACE_SECONDS) return null;
  const session = { token, expires_at: Math.min(expires, nowSeconds() + SESSION_TTL_SECONDS) };
  let persistent = false;
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      persistent = true;
    }
  } catch {}
  try {
    if (typeof window !== "undefined") {
      if (persistent) window.sessionStorage.removeItem(SESSION_KEY);
      else window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch {
    // Storage can be unavailable in private modes; the in-memory session still works.
  }
  return session;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {}
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Nothing to clear.
  }
}

function randomHexId() {
  const bytes = new Uint8Array(16);
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function storedDeviceId() {
  try {
    const saved = window.localStorage.getItem(DEVICE_KEY);
    if (/^[0-9a-f]{32}$/.test(saved || "")) return saved;
  } catch {
    // Fall through to a fresh id.
  }
  const fresh = randomHexId();
  try {
    window.localStorage.setItem(DEVICE_KEY, fresh);
  } catch {
    // The fresh id only needs to survive this page view.
  }
  return fresh;
}

let fingerprintAgent = null;

function loadFingerprintAgent() {
  if (!fingerprintAgent) {
    fingerprintAgent = import("@fingerprintjs/fingerprintjs")
      .then((module) => (module.default || module).load())
      .catch((error) => {
        fingerprintAgent = null;
        throw error;
      });
  }
  return fingerprintAgent;
}

/** Stable public device id plus coarse browser hints for the session request. */
export async function getFingerprint() {
  let visitorId = "";
  try {
    const agent = await loadFingerprintAgent();
    const result = await agent.get();
    visitorId = result?.visitorId || "";
  } catch {
    visitorId = "";
  }
  const deviceId = /^[0-9a-f]{32}$/.test(visitorId) ? visitorId : storedDeviceId();
  let tz = "";
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    tz = "";
  }
  const lang = (typeof navigator !== "undefined" && navigator.language) || "";
  return { device_id: deviceId, tz, lang };
}

/** Exchange a single-use Turnstile token for a short-lived chat session. */
export async function createSession(turnstileToken, { signal } = {}) {
  if (MOCK) {
    await wait(400);
    return saveSession({ token: "mock", expires_at: nowSeconds() + SESSION_TTL_SECONDS });
  }
  const base = requireBase();
  const request = requestContext(signal);
  try {
    const fingerprint = await fingerprintWithDeadline();
    const response = await fetch(`${base}/api/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ turnstile: turnstileToken, fingerprint }),
      signal: request.controller.signal,
    });
    const data = await readJson(response);
    request.controller.signal.throwIfAborted();
    if (!response.ok || !data || typeof data.token !== "string" || !data.token) {
      throw new ApiError(
        data?.error || "Session request failed",
        response.status,
        data?.error || "network",
      );
    }
    const expires = Number(data.expires_at);
    if (!Number.isFinite(expires) || expires <= nowSeconds() + SESSION_GRACE_SECONDS) {
      throw new ApiError("Malformed session response", response.status, "bad_response");
    }
    return saveSession({ token: data.token, expires_at: expires });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error?.name === "AbortError") throw new ApiError("The request timed out", 0, "timeout");
    throw new ApiError("Could not reach the assistant", 0, "network");
  } finally {
    request.finish();
  }
}

function mockReply(text) {
  const asked = String(text || "").slice(0, 120);
  return `This is a mock reply, so no model was called. You asked: “${asked}”. ` +
    "In production, InScope answers questions about Vinamra’s work, projects and contact details. " +
    "Try asking for the résumé, the email address, or the stack behind the Visa identity services.";
}

/**
 * Send the recent conversation plus the current message. The backend does not
 * stream, so the whole reply arrives at once.
 */
export async function sendChat(history, text, token, { signal, model = "llm-1" } = {}) {
  if (!["llm-1", "llm-2", "llm-3"].includes(model)) {
    throw new ApiError("Unknown model selection", 400, "bad_request");
  }
  const messages = [
    ...(Array.isArray(history) ? history.slice(-20) : []),
    { role: "user", content: text },
  ];
  while (messages.length > 1 && messages[0].role !== "user") messages.shift();
  let body = JSON.stringify({ model, messages });
  while (new TextEncoder().encode(body).length > 40 * 1024 && messages.length > 1) {
    messages.splice(0, 2);
    while (messages.length > 1 && messages[0].role !== "user") messages.shift();
    body = JSON.stringify({ model, messages });
  }
  if (new TextEncoder().encode(body).length > 40 * 1024) {
    throw new ApiError("Message too long", 400, "bad_request");
  }
  if (MOCK) {
    await wait(1200);
    return { reply: mockReply(text), usage: null };
  }
  const base = requireBase();
  const request = requestContext(signal);
  try {
    const response = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
      signal: request.controller.signal,
    });
    const data = await readJson(response);
    request.controller.signal.throwIfAborted();
    if (!response.ok) {
      throw new ApiError(
        data?.error || "Chat request failed",
        response.status,
        data?.error || "network",
      );
    }
    if (!data || typeof data.reply !== "string" || !data.reply.trim()) {
      throw new ApiError("Malformed chat response", response.status, "bad_response");
    }
    return { reply: data.reply, usage: data.usage ?? null };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error?.name === "AbortError") {
      throw new ApiError("The request timed out", 0, "timeout");
    }
    throw new ApiError("Could not reach the assistant", 0, "network");
  } finally {
    request.finish();
  }
}
