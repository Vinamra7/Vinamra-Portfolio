import { useEffect, useRef } from "react";

const clamp = (v) => Math.max(0, Math.min(1, v));
// Most stars remain neutral; a few have a quiet stellar colour temperature.
const starTone = (index) => {
  const tone = index % 100;
  return tone < 6
    ? "136,188,255"
    : tone < 10
      ? "255,222,145"
      : tone < 12
        ? "255,148,137"
        : "235,235,235";
};
const smooth = (v) => {
  const t = clamp(v);
  return t * t * (3 - 2 * t);
};

export default function Galaxy({ paused }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current,
      ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Render the quiet, seamless far-star layer only when the viewport changes.
    const distant = document.createElement("canvas");
    let w = 0,
      h = 0,
      raf,
      last = 0,
      scroll = window.scrollY,
      target = scroll,
      previous = scroll,
      visible = true;
    let seed = 83;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const particles = Array.from({ length: 2200 }, (_, i) => {
      const radius = Math.pow(random(), 0.72),
        arm = i % 3;
      const angle =
        radius * 7.2 +
        arm * Math.PI * (2 / 3) +
        (random() - 0.5) * (0.25 + radius * 0.55);
      return {
        radius,
        angle,
        spread: (random() - 0.5) * 0.065,
        size: 0.35 + Math.pow(random(), 5) * 1.6,
        light: 0.5 + random() * 0.7,
        x: random(),
        y: random(),
        speed: 0.14 + random() * 0.6,
        phase: random() * Math.PI * 2,
      };
    });
    function resize() {
      w = innerWidth;
      h = innerHeight;
      const d = Math.min(devicePixelRatio, 1.5);
      canvas.width = w * d;
      canvas.height = h * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      distant.width = canvas.width;
      distant.height = canvas.height;
      const sky = distant.getContext("2d");
      sky.setTransform(d, 0, 0, d, 0, 0);
      let skySeed = 1947;
      const starRandom = () => {
        skySeed = (Math.imul(skySeed, 1664525) + 1013904223) >>> 0;
        return skySeed / 4294967296;
      };
      const farCount = Math.min(2200, Math.max(420, Math.round((w * h) / 950)));
      for (let i = 0; i < farCount; i++) {
        const x = starRandom() * w,
          y = starRandom() * h;
        const bright = starRandom(),
          size = 0.25 + starRandom() * 0.65;
        sky.fillStyle = `rgba(${starTone(i)},${0.12 + bright * 0.4})`;
        sky.beginPath();
        sky.arc(x, y, size, 0, Math.PI * 2);
        sky.fill();
        if (bright > 0.98) {
          sky.fillStyle = `rgba(${starTone(i)},.045)`;
          sky.beginPath();
          sky.arc(x, y, size * 3, 0, Math.PI * 2);
          sky.fill();
        }
      }
    }
    const onScroll = () => {
      target = window.scrollY;
    };
    const onVisibility = () => {
      visible = !document.hidden;
    };
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    resize();
    function draw(now) {
      raf = requestAnimationFrame(draw);
      if (!visible || now - last < 32) return;
      last = now;
      scroll = paused ? target : scroll + (target - scroll) * 0.16;
      const velocity = Math.min(16, Math.abs(scroll - previous));
      previous = scroll;
      const progress = scroll / h,
        breakup = smooth((progress - 0.035) / 0.95),
        time = paused ? 0 : now * 0.00007;
      canvas.dataset.phase =
        progress < 0.05
          ? "galaxy"
          : progress < 1.1
            ? "separating"
            : "starfield";
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(distant, 0, 0, w, h);
      const cx = w * 0.5,
        cy = h * 0.48 - scroll * 0.22 * (1 - breakup),
        scale = Math.min(w * (w < 600 ? 0.78 : 0.47), h * 0.72);
      if (breakup < 0.98) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.28);
        ctx.scale(1, 0.42);
        const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, scale * 0.85);
        halo.addColorStop(0, `rgba(224,233,245,${0.14 * (1 - breakup)})`);
        halo.addColorStop(0.2, `rgba(210,221,235,${0.045 * (1 - breakup)})`);
        halo.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = halo;
        ctx.fillRect(-scale, -scale, scale * 2, scale * 2);
        ctx.restore();
      }
      const count = w < 600 ? 1400 : particles.length;
      for (let i = 0; i < count; i++) {
        const p = particles[i],
          a = p.angle + time * (1 - breakup),
          r = p.radius * scale;
        const sx = Math.cos(a) * r,
          sy = Math.sin(a) * r * 0.43 + p.spread * scale;
        const gx = cx + sx * 0.96 - sy * -0.276,
          gy = cy + sx * -0.276 + sy * 0.96;
        // Release the upper rows first, keeping each star's identity throughout.
        const delay = (gy / h) * 0.21;
        const release = paused
          ? progress > 0.5
            ? 1
            : 0
          : smooth((progress - 0.02 - delay) / 0.8);
        const fx = p.x * w;
        const fy =
          ((p.y * (h + 160) + (paused ? 0 : scroll * p.speed)) % (h + 160)) -
          80;
        const x = gx + (fx - gx) * release,
          y = gy + (fy - gy) * release;
        const sparse = i % 5 === 0 ? 1 : 0.14;
        const opacity =
          p.light * ((1 - release) * 0.82 + release * 0.46 * sparse);
        const twinkle = paused
          ? 1
          : 0.85 + 0.15 * Math.sin(now * 0.0007 + p.phase);
        ctx.fillStyle = `rgba(${starTone(i)},${opacity * twinkle})`;
        if (release > 0.2 && velocity > 1 && !paused) {
          ctx.strokeStyle = `rgba(196,219,250,${opacity * 0.25})`;
          ctx.lineWidth = 0.65;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y - velocity * p.speed * release * 2);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(x, y, p.size * (1 - release * 0.22), 0, Math.PI * 2);
        ctx.fill();
        if (p.size > 1.6 && i % 3 === 0) {
          ctx.fillStyle = `rgba(${starTone(i)},${opacity * 0.06})`;
          ctx.beginPath();
          ctx.arc(x, y, p.size * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [paused]);
  return <canvas className="galaxy-canvas" ref={ref} aria-hidden="true" />;
}
