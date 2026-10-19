import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, beforeEach, test } from "node:test";

const originalWindow = globalThis.window;
const originalFetch = globalThis.fetch;
const originalMock = process.env.NEXT_PUBLIC_INSCOPE_MOCK;
process.env.NEXT_PUBLIC_INSCOPE_MOCK = "0";
const source = await readFile(new URL("../lib/inscope.js", import.meta.url), "utf8");
const api = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);

function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

beforeEach(() => {
  globalThis.window = {
    location: { hostname: "localhost" },
    sessionStorage: storage(),
    localStorage: storage(),
    crypto: globalThis.crypto,
  };
});

after(() => {
  globalThis.window = originalWindow;
  globalThis.fetch = originalFetch;
  if (originalMock === undefined) delete process.env.NEXT_PUBLIC_INSCOPE_MOCK;
  else process.env.NEXT_PUBLIC_INSCOPE_MOCK = originalMock;
});

test("chat sends only a slot alias and a bearer token", async () => {
  const requests = [];
  globalThis.fetch = async (url, init) => {
    requests.push({ url, ...init });
    return Response.json({ reply: "Hello" });
  };
  await api.sendChat([], "Work?", "signed-token");
  await api.sendChat([], "Work?", "signed-token", { model: "llm-2" });
  await api.sendChat([], "Work?", "signed-token", { model: "llm-3" });
  assert.deepEqual(requests.map((request) => JSON.parse(request.body).model), ["llm-1", "llm-2", "llm-3"]);
  assert.equal(requests[0].headers.Authorization, "Bearer signed-token");
  assert.deepEqual(JSON.parse(requests[0].body).messages, [{ role: "user", content: "Work?" }]);
  await assert.rejects(api.sendChat([], "Work?", "token", { model: "raw-provider-name" }), { code: "bad_request" });
  assert.equal(requests.length, 3);
});

test("history fits the byte cap and keeps the current user message", async () => {
  let body;
  globalThis.fetch = async (_url, init) => {
    body = init.body;
    return Response.json({ reply: "Hello" });
  };
  const history = Array.from({ length: 10 }, () => [
    { role: "user", content: "界".repeat(500) },
    { role: "assistant", content: "界".repeat(1000) },
  ]).flat();
  await api.sendChat(history, "Current question", "token");
  const { messages } = JSON.parse(body);
  assert.ok(Buffer.byteLength(body) <= 40 * 1024);
  assert.ok(messages.length < 21);
  assert.equal(messages[0].role, "user");
  assert.deepEqual(messages.at(-1), { role: "user", content: "Current question" });
  await assert.rejects(api.sendChat([], "x".repeat(41 * 1024), "token"), { code: "bad_request" });
});

test("chat keeps server errors and rejects blank replies", async () => {
  globalThis.fetch = async () => Response.json({ error: "rate_limited" }, { status: 429 });
  await assert.rejects(api.sendChat([], "Work?", "token"), { status: 429, code: "rate_limited" });
  globalThis.fetch = async () => Response.json({ reply: "  " });
  await assert.rejects(api.sendChat([], "Work?", "token"), { code: "bad_response" });
});

function pendingFetch(_url, { signal }) {
  return new Promise((_resolve, reject) => {
    if (signal.aborted) reject(signal.reason);
    else signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  });
}

test("caller cancellation aborts the chat request", async () => {
  globalThis.fetch = pendingFetch;
  const controller = new AbortController();
  const result = api.sendChat([], "Work?", "token", { signal: controller.signal });
  controller.abort();
  await assert.rejects(result, { code: "timeout" });
});

test("chat times out after 30 seconds", async (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  globalThis.fetch = pendingFetch;
  const result = api.sendChat([], "Work?", "token");
  const rejected = assert.rejects(result, { code: "timeout" });
  context.mock.timers.tick(30000);
  await rejected;
});

test("session validates expiry and does not save a cancelled request", async () => {
  globalThis.fetch = async () => Response.json({ token: "signed-token", expires_at: 1 });
  await assert.rejects(api.createSession("turnstile-token"), { code: "bad_response" });
  assert.equal(api.getStoredSession(), null);
  const controller = new AbortController();
  globalThis.fetch = async () => {
    controller.abort();
    return Response.json({ token: "signed-token", expires_at: Math.floor(Date.now() / 1000) + 86400 });
  };
  await assert.rejects(api.createSession("turnstile-token", { signal: controller.signal }), { code: "timeout" });
  assert.equal(api.getStoredSession(), null);
});

test("session lifetime is capped at 24 hours and never extended by reads", (context) => {
  const start = 1800000000000;
  context.mock.timers.enable({ apis: ["Date"], now: start });
  const saved = api.saveSession({ token: "signed-token", expires_at: start / 1000 + 7 * 86400 });
  assert.equal(saved.expires_at, start / 1000 + 86400);
  context.mock.timers.tick(12 * 60 * 60 * 1000);
  assert.deepEqual(api.getStoredSession(), saved);
  context.mock.timers.tick((12 * 60 * 60 - 60) * 1000);
  assert.equal(api.getStoredSession(), null);
  assert.equal(window.sessionStorage.getItem("inscope.session"), null);
});

test("earlier server expiry wins and malformed sessions are removed", (context) => {
  const start = 1800000000000;
  context.mock.timers.enable({ apis: ["Date"], now: start });
  const saved = api.saveSession({ token: "signed-token", expires_at: start / 1000 + 3600 });
  assert.equal(saved.expires_at, start / 1000 + 3600);
  context.mock.timers.tick(3540 * 1000);
  assert.equal(api.getStoredSession(), null);
  window.sessionStorage.setItem("inscope.session", "invalid json");
  assert.equal(api.getStoredSession(), null);
  assert.equal(window.sessionStorage.getItem("inscope.session"), null);
});

test("legacy oversized expiry is capped once and storage failure preserves memory", (context) => {
  const start = 1800000000000;
  context.mock.timers.enable({ apis: ["Date"], now: start });
  window.sessionStorage.setItem("inscope.session", JSON.stringify({
    token: "signed-token", expires_at: start / 1000 + 7 * 86400,
  }));
  const session = api.getStoredSession();
  assert.equal(session.expires_at, start / 1000 + 86400);
  context.mock.timers.tick(3600 * 1000);
  assert.deepEqual(api.getStoredSession(), session);
  window.sessionStorage.setItem = () => { throw new Error("Storage unavailable"); };
  const memory = api.saveSession({ token: "memory-token", expires_at: start / 1000 + 7 * 86400 });
  assert.equal(memory.token, "memory-token");
  assert.equal(memory.expires_at, start / 1000 + 3600 + 86400);
});
