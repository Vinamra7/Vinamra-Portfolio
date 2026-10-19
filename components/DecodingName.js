import { useEffect, useRef, useState } from "react";

const NAME = "Vinamra Mishra";
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/%<>";

export default function DecodingName({ paused, delay = 0 }) {
  const [text, setText] = useState({ settled: "", current: "" });
  const finished = useRef(false);
  useEffect(() => {
    if (
      paused ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      finished.current
    ) {
      finished.current = true;
      setText({ settled: NAME, current: "" });
      return;
    }
    let frame,
      start,
      lastFrame = -1;
    const tick = (now) => {
      if (start === undefined) start = now;
      const elapsed = now - start - delay;
      if (elapsed < 0) {
        frame = requestAnimationFrame(tick);
        return;
      }
      let remaining = elapsed,
        index = 0;
      while (index < NAME.length) {
        const duration = NAME[index] === " " ? 40 : 110;
        if (remaining < duration) break;
        remaining -= duration;
        index++;
      }
      if (index === NAME.length) {
        finished.current = true;
        setText({ settled: NAME, current: "" });
        return;
      }
      const step = Math.floor(elapsed / 35);
      if (step !== lastFrame) {
        lastFrame = step;
        const current =
          NAME[index] === " " || remaining > 70
            ? NAME[index]
            : GLYPHS[
                (index * 11 + Math.floor(remaining / 35) * 7) % GLYPHS.length
              ];
        setText({ settled: NAME.slice(0, index), current });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, delay]);
  return (
    <span className="decoding-name" aria-hidden="true">
      <span className="name-measure">{NAME}</span>
      <span className="name-live">
        {text.settled}
        <span className="name-decoding-glyph">{text.current}</span>
      </span>
    </span>
  );
}
