import assert from "node:assert/strict";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { after, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { transform } from "next/dist/build/swc/index.js";

const source = await readFile(new URL("../components/ChatReply.js", import.meta.url), "utf8");
const compiled = await transform(source, {
  filename: "ChatReply.js",
  jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } },
  module: { type: "es6" },
});
const artifact = new URL(`../artifacts/chat-reply-test-${process.pid}.mjs`, import.meta.url);
await mkdir(new URL("../artifacts/", import.meta.url), { recursive: true });
await writeFile(artifact, compiled.code);
const { default: ChatReply } = await import(artifact.href);
after(() => unlink(artifact));
const render = (text, streaming) => renderToStaticMarkup(createElement(ChatReply, { text, streaming }));

test("formats real reply paragraphs, bold list items, inline code and links", () => {
  const html = render("His contributions:\n\n- **Arroyo:** Rust `str` support. [PR](https://github.com/ArroyoSystems/arroyo/pull/870)\n- **Zen Browser:** Windows builds.");
  assert.match(html, /<p>His contributions:<\/p>/);
  assert.match(html, /<ul>/);
  assert.match(html, /<strong>Arroyo:<\/strong>/);
  assert.match(html, /<code>str<\/code>/);
  assert.match(html, /href="https:\/\/github.com\/ArroyoSystems\/arroyo\/pull\/870" target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(html, /\*\*Arroyo/);
});

test("drops raw HTML, remote images and executable link schemes", () => {
  const html = render('<script>alert(1)</script>\n\n<img src="https://tracker.invalid/pixel" onerror="alert(2)">\n\n![pixel](https://tracker.invalid/image)\n\n[bad](javascript:alert%281%29) [data](data:text/html,test) [good](mailto:mishravinamra5@gmail.com)');
  assert.doesNotMatch(html, /<script|<img|onerror=|href="javascript:|href="data:/);
  assert.match(html, /href="mailto:mishravinamra5@gmail.com"/);
  assert.match(html, /<span>bad<\/span>/);
});

test("partial Markdown stays safe during the typing reveal", () => {
  const html = render("**Arroyo** is a project. [Partial](javascript:", true);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /terminal-cursor/);
  assert.doesNotMatch(html, /href="javascript:/);
});
