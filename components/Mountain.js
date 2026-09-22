import { useEffect, useRef } from "react";

export default function Mountain({ paused }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current,
      ctx = canvas.getContext("2d");
    if (!ctx) return;
    const hero = canvas.closest("section"),
      img = new Image();
    const base = document.createElement("canvas"),
      blue = document.createElement("canvas");
    let w = 0,
      h = 0,
      raf,
      ready = false,
      visible = true,
      last = 0,
      t = 0;
    const pointer = { x: -1000, y: -1000, strength: 0, target: 0 };
    const noise = (x, y) => {
      const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return n - Math.floor(n);
    };
    function resize() {
      w = hero.clientWidth;
      h = hero.clientHeight;
      const dpr = Math.min(devicePixelRatio, 1.5);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      base.width = blue.width = w;
      base.height = blue.height = h;
      if (!ready) return;
      const b = base.getContext("2d"),
        c = blue.getContext("2d");
      const scale = Math.max(w / img.width, (h * 0.95) / img.height),
        iw = img.width * scale,
        ih = img.height * scale;
      b.fillStyle = "#000";
      b.fillRect(0, 0, w, h);
      b.filter = "grayscale(1) contrast(1.3) brightness(.48)";
      b.drawImage(img, (w - iw) / 2, h * 0.1, iw, ih);
      b.filter = "none";
      const fade = b.createLinearGradient(0, 0, 0, h);
      fade.addColorStop(0, "#000");
      fade.addColorStop(0.12, "#000");
      fade.addColorStop(0.4, "#00000000");
      fade.addColorStop(0.55, "#00000033");
      fade.addColorStop(1, "#000");
      b.fillStyle = fade;
      b.fillRect(0, 0, w, h);
      c.drawImage(base, 0, 0);
      c.globalCompositeOperation = "source-atop";
      c.fillStyle = "#008cff";
      c.globalCompositeOperation = "color";
      c.fillRect(0, 0, w, h);
      c.globalCompositeOperation = "source-over";
    }
    img.onload = () => {
      ready = true;
      resize();
    };
    img.src = "/images/mountain.jpg";
    function move(e) {
      const r = hero.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.target = 1;
    }
    function leave() {
      pointer.target = 0;
    }
    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", leave);
    const ro = new ResizeObserver(resize);
    ro.observe(hero);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(hero);
    function draw(now) {
      raf = requestAnimationFrame(draw);
      if (!ready || !visible || document.hidden || now - last < 40) return;
      last = now;
      if (!paused) t = now / 1000;
      pointer.strength += (pointer.target - pointer.strength) * 0.12;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(base, 0, 0);
      const radius = Math.min(190, w * 0.36),
        s = pointer.strength;
      if (s > 0.005) {
        // A discontinuous field of refracted pixels, never a filled spotlight.
        for (let y = 0; y < h; y += 12)
          for (let x = 0; x < w; x += 24) {
            const n = noise(x, y),
              dx = (x - pointer.x) / 240,
              dy = (y - pointer.y) / 140;
            const influence = Math.max(0, 1 - dx * dx - dy * dy) * s;
            if (influence < 0.04 || n < 0.66) continue;
            const shift = Math.sin(y * 0.06 + t * 3) * influence * 18;
            ctx.globalAlpha = influence * (0.2 + n * 0.45);
            ctx.drawImage(
              blue,
              x,
              y,
              24,
              2 + n * 8,
              x + shift,
              y,
              24,
              2 + n * 8,
            );
            if (n > 0.9) {
              ctx.fillStyle = "rgba(124,205,255,.6)";
              ctx.fillRect(x + shift, y, 30 * influence, 1);
            }
          }
        ctx.globalAlpha = 1;
      }
      const cell = 20;
      ctx.font = "8px monospace";
      for (let x = 0; x < w; x += cell)
        for (let y = 0; y < h; y += cell) {
          const n = noise(x, y),
            d = Math.hypot(x - pointer.x, y - pointer.y),
            hit = s * Math.max(0, 1 - d / radius);
          const shimmer = 0.65 + 0.35 * Math.sin(t * 0.7 + n * 12);
          if (n > 0.48) {
            ctx.fillStyle = `rgba(0,0,0,${0.03 + n * 0.16})`;
            ctx.fillRect(x, y, cell - 1, cell - 1);
          }
          if (n > 0.86) {
            ctx.fillStyle =
              hit > 0.03
                ? `rgba(0,165,255,${hit * 0.7})`
                : `rgba(255,255,255,${0.07 * shimmer})`;
            ctx.fillText(n > 0.94 ? "1" : "0", x + 5, y + 12);
          }
          if (hit > 0.03 && n > 0.8) {
            ctx.fillStyle = `rgba(0,130,255,${hit * 0.15})`;
            ctx.fillRect(x, y, cell - 1, cell - 1);
          }
        }
    }
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
      img.onload = null;
    };
  }, [paused]);
  return <canvas ref={ref} className="mountain-canvas" aria-hidden="true" />;
}
