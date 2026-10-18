// Word-by-word reveal for replies that arrive in one piece. The Worker does
// not stream, so this only affects presentation.
const MIN_DELAY_MS = 12;
const MAX_DELAY_MS = 45;
const TARGET_DURATION_MS = 2200;

/**
 * Reveal `fullText` inside `onUpdate`, then call `onDone`.
 * Returns a cancel function that finishes immediately.
 */
export function typeOut(fullText, onUpdate, onDone) {
  const text = typeof fullText === "string" ? fullText : "";
  const words = text.split(/\s+/).filter(Boolean);
  const reducedMotion = typeof window !== "undefined" &&
    Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);

  if (reducedMotion || !words.length) {
    onUpdate?.(text);
    onDone?.();
    return () => {};
  }

  const tokens = text.split(/(\s+)/).filter((token) => token !== "");
  const delay = Math.min(
    MAX_DELAY_MS,
    Math.max(MIN_DELAY_MS, TARGET_DURATION_MS / words.length),
  );
  let index = 0;
  let visible = "";
  let timer = null;
  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    if (timer !== null) clearTimeout(timer);
    timer = null;
    onUpdate?.(text);
    onDone?.();
  }

  function step() {
    if (finished) return;
    // Attach whitespace to the word that follows it so the timing stays
    // per-word rather than per-token.
    while (index < tokens.length && /^\s+$/.test(tokens[index])) {
      visible += tokens[index];
      index += 1;
    }
    if (index >= tokens.length) {
      finish();
      return;
    }
    visible += tokens[index];
    index += 1;
    onUpdate?.(visible);
    if (index >= tokens.length) {
      finish();
      return;
    }
    timer = setTimeout(step, delay);
  }

  timer = setTimeout(step, delay);

  return function cancel() {
    finish();
  };
}
