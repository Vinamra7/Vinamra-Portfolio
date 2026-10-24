import { useEffect, useRef, useState } from "react";
import { FiArrowUpRight } from "react-icons/fi";

function Study({ index, symbol, paused, mobileActive }) {
  const ref = useRef(null);
  const mobileActiveRef = useRef(mobileActive);
  mobileActiveRef.current = mobileActive;
  const [light, setLight] = useState(false);
  useEffect(() => {
    const sync = () => setLight(document.documentElement.dataset.theme === "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const canvas = ref.current,
      ctx = canvas.getContext("2d");
    const art = document.createElement("canvas");
    art.width = 600;
    art.height = 720;
    const a = art.getContext("2d");

    a.save();
    a.translate(300, 350);
    if (symbol === "inscope-symbol") {
      // An original exploded cache sculpture: three layers of stored data.
      for (let layer = 2; layer >= 0; layer--) {
        const y = layer * 77 - 110;
        a.beginPath();
        a.moveTo(-190, y);
        a.lineTo(0, y - 95);
        a.lineTo(190, y);
        a.lineTo(0, y + 95);
        a.closePath();
        const g = a.createLinearGradient(-190, y - 90, 190, y + 95);
        g.addColorStop(0, "#a4e7ff");
        g.addColorStop(0.4, "#276d9c");
        g.addColorStop(1, "#091c3c");
        a.fillStyle = g;
        a.fill();
        a.strokeStyle = "#a5dfff";
        a.lineWidth = 1;
        a.stroke();
        a.beginPath();
        a.moveTo(-190, y);
        a.lineTo(0, y + 95);
        a.lineTo(190, y);
        a.lineTo(190, y + 17);
        a.lineTo(0, y + 112);
        a.lineTo(-190, y + 17);
        a.closePath();
        a.fillStyle = "#11253a";
        a.fill();
        a.strokeStyle = "#35718e";
        a.stroke();
        for (let n = 0; n < 9; n++) {
          a.fillStyle = n % 3 === 0 ? "#9ceaff" : "#2c708b";
          a.fillRect(-130 + n * 15, y + 33 + n * 7.5, 3, 3);
        }
      }
    } else if (symbol === "arroyo-symbol") {
      // Parallel streams converge through one processing surface.
      for (let n = 0; n < 48; n++) {
        a.beginPath();
        const y = (n - 24) * 9;
        a.moveTo(-350, y - 80);
        a.bezierCurveTo(
          -100,
          y - 90,
          -100,
          y + Math.sin(n * 0.14) * 120,
          30,
          y * 0.7,
        );
        a.bezierCurveTo(135, y * 0.15, 170, y + 90, 350, y + 20);
        a.strokeStyle = `hsla(${190 + n * 0.9},70%,${light ? 36 : 72}%,${0.13 + 0.5 * Math.sin((n / 48) * Math.PI)})`;
        a.lineWidth = n % 5 === 0 ? 1.4 : 0.7;
        a.stroke();
      }
      a.strokeStyle = "#568fab";
      a.lineWidth = 1;
      a.strokeRect(-65, -160, 130, 320);
      a.fillStyle = light ? "#176a91" : "#a9f0ff";
      a.fillRect(-2, -22, 4, 44);
    } else {
      // A quiet lens for the browser tooling contribution.
      for (let n = 36; n >= 0; n--) {
        const r = 60 + n * 3.5;
        a.beginPath();
        a.ellipse((n - 18) * 1.9, 0, r, r * 1.25, -0.25, 0, Math.PI * 2);
        a.strokeStyle = `hsla(${210 + n * 1.6},60%,${light ? 38 : 78}%,${0.08 + 0.38 * (1 - n / 37)})`;
        a.lineWidth = 1.2;
        a.stroke();
      }
      const g = a.createRadialGradient(-20, -60, 4, 0, 0, 120);
      g.addColorStop(0, "#3a528a");
      g.addColorStop(0.65, "#101523");
      g.addColorStop(1, "#000");
      a.fillStyle = g;
      a.beginPath();
      a.ellipse(0, 0, 80, 104, -0.25, 0, Math.PI * 2);
      a.fill();
    }
    a.restore();
    a.fillStyle = "#757575";
    a.font = "10px monospace";
    const captions = {
      "inscope-symbol": "IN-SCOPE INTELLIGENCE",
      "arroyo-symbol": "STREAM PROCESSING",
      "zen-symbol": "NATIVE BUILD SYSTEMS",
    };
    a.fillText(
      `${String(index + 1).padStart(2, "0")} / ${captions[symbol]}`,
      30,
      680,
    );
    const monochrome = document.createElement("canvas");
    monochrome.width = 600;
    monochrome.height = 720;
    const mono = monochrome.getContext("2d");
    mono.filter = "grayscale(1)";
    mono.drawImage(art, 0, 0);
    const fringes = ["#176a91", "#367c9e"].map((color) => {
      const layer = document.createElement("canvas");
      layer.width = 600;
      layer.height = 720;
      const l = layer.getContext("2d");
      l.drawImage(art, 0, 0);
      l.globalCompositeOperation = "source-in";
      l.fillStyle = color;
      l.fillRect(0, 0, 600, 720);
      return layer;
    });
    let raf,
      last = 0,
      amount = 0,
      hovered = false,
      touchTracking = false,
      visible = false,
      px = 0.5,
      py = 0.5,
      time = 0;
    const coarseQuery = window.matchMedia("(pointer: coarse)");
    const card = canvas.closest("a");
    const enter = (e) => {
        if (e?.pointerType === "touch") return;
        hovered = true;
      },
      leave = (e) => {
        if (e?.pointerType === "touch") {
          touchTracking = false;
          return;
        }
        hovered = false;
      };
    const move = (e) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      px = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      py = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
      if (e.pointerType === "touch") touchTracking = true;
    };
    const pointerEnd = (e) => {
      if (e.pointerType === "touch") touchTracking = false;
    };
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerup", pointerEnd);
    card.addEventListener("pointercancel", pointerEnd);
    card.addEventListener("focus", enter);
    card.addEventListener("blur", leave);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);
    canvas.width = 600;
    canvas.height = 720;
    function draw(now) {
      raf = requestAnimationFrame(draw);
      if (!visible || document.hidden || now - last < 40) return;
      last = now;
      if (!paused) time = now * 0.001;
      const isMobile = coarseQuery.matches || window.innerWidth <= 800;
      const target = hovered || (isMobile && mobileActiveRef.current) ? 1 : 0;
      if (isMobile && mobileActiveRef.current && !touchTracking && !paused) {
        py = 0.5 + 0.28 * Math.sin(time * 0.9 + index * 1.1);
      }
      amount += (target - amount) * 0.1;
      ctx.clearRect(0, 0, 600, 720);

      for (let y = 0; y < 720; y += 3) {
        const fall = Math.exp(-Math.pow((y - py * 720) / 170, 2));
        const warp = paused ? 0 : Math.sin(y * 0.018 + time * 1.4) * fall * amount * 28;
        ctx.drawImage(monochrome, 0, y, 600, 3, warp, y, 600, 3);
        ctx.globalAlpha = amount;
        ctx.drawImage(art, 0, y, 600, 3, warp, y, 600, 3);
        ctx.globalAlpha = 1;
        if (amount > 0.01) {
          ctx.globalCompositeOperation = light ? "source-over" : "screen";
          ctx.globalAlpha = amount * fall * 0.6;
          ctx.drawImage(fringes[0], 0, y, 600, 3, warp + 9 * amount, y, 600, 3);
          ctx.drawImage(fringes[1], 0, y, 600, 3, warp - 9 * amount, y, 600, 3);
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = "source-over";
        }
      }
    }
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointerleave", leave);
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerup", pointerEnd);
      card.removeEventListener("pointercancel", pointerEnd);
      card.removeEventListener("focus", enter);
      card.removeEventListener("blur", leave);
    };
  }, [index, symbol, paused, light]);
  return <canvas ref={ref} aria-hidden="true" />;
}

export default function ProjectGallery({ projects, paused }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const galleryRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    let raf = null;
    const onScroll = () => {
      if (raf !== null) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        if (window.innerWidth > 800) return;
        const galleryRect = gallery.getBoundingClientRect();
        const galleryCenter = galleryRect.left + galleryRect.width * 0.5;
        let closest = 0;
        let minDistance = Infinity;
        cardRefs.current.forEach((card, idx) => {
          if (!card) return;
          const r = card.getBoundingClientRect();
          const cardCenter = r.left + r.width * 0.5;
          const dist = Math.abs(cardCenter - galleryCenter);
          if (dist < minDistance) {
            minDistance = dist;
            closest = idx;
          }
        });
        setActiveIndex(closest);
      });
    };
    gallery.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      gallery.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollToProject = (index) => {
    setActiveIndex(index);
    const card = cardRefs.current[index];
    const gallery = galleryRef.current;
    if (!card || !gallery) return;
    const left = card.offsetLeft - (gallery.clientWidth - card.clientWidth) * 0.5;
    gallery.scrollTo({
      left: Math.max(0, left),
      behavior: paused ? "auto" : "smooth",
    });
  };

  return (
    <div className="project-showcase reveal">
      <div className="project-mobile-rail mono" role="tablist" aria-label="Select project study">
        {projects.map((project, index) => (
          <button
            key={project.name}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            className={activeIndex === index ? "active" : ""}
            onClick={() => scrollToProject(index)}
          >
            <span className="project-rail-num">{String(index + 1).padStart(2, "0")}</span>
            <span>{project.name}</span>
          </button>
        ))}
      </div>
      <div className="project-gallery" ref={galleryRef}>
        {projects.map((project, index) => (
          <a
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className={`study ${activeIndex === index ? "study-mobile-active" : ""}`}
            key={project.name}
            href={project.url}
            target="_blank"
            rel="noreferrer"
          >
            <div className="study-image">
              <Study
                index={index}
                symbol={project.symbol}
                paused={paused}
                mobileActive={activeIndex === index}
              />
              <span className="study-action">
                <FiArrowUpRight />
              </span>
            </div>
            <div className="study-meta mono">
              <span>{project.category}</span>
              <span>{project.year}</span>
            </div>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
