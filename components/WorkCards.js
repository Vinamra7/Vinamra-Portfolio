import { useEffect, useRef, useState } from "react";
import { FiArrowUpRight, FiX } from "react-icons/fi";

export default function WorkCards({ jobs, paused }) {
  const [selected, setSelected] = useState(null);
  const coverRefs = useRef([]);
  const touchState = useRef({});

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)");
    let raf = null;

    const updateMobileScan = () => {
      raf = null;
      const isMobile = coarse.matches || window.innerWidth <= 800;
      coverRefs.current.forEach((el, i) => {
        if (!el) return;
        if (!isMobile) {
          if (!el.matches(":hover") && !el.matches(":focus-visible")) {
            el.style.setProperty("--scan", "100%");
            delete el.dataset.scanning;
          }
          return;
        }
        if (touchState.current[i]?.scrubbing) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        if (rect.bottom < 0 || rect.top > vh) {
          el.style.setProperty("--scan", "100%");
          delete el.dataset.scanning;
          return;
        }
        if (paused) {
          const openScan = selected === i ? 64 : 74;
          el.style.setProperty("--scan", `${openScan}%`);
          el.dataset.scanning = "true";
          return;
        }
        // As the card travels from the bottom of the screen through the reading zone,
        // sweep the X-ray scanner beam across the right third of the card face.
        const center = rect.top + rect.height * 0.5;
        const norm = 1 - Math.max(0, Math.min(1, (center - vh * 0.18) / (vh * 0.72)));
        const curve = Math.sin(norm * Math.PI);
        const baseScan = selected === i ? 56 : 92 - curve * 34;
        const scan = Math.max(54, Math.min(94, baseScan));
        el.style.setProperty("--scan", `${scan.toFixed(1)}%`);
        if (scan < 92) {
          el.dataset.scanning = "true";
        } else {
          delete el.dataset.scanning;
        }
      });
    };

    const schedule = () => {
      if (raf === null) raf = requestAnimationFrame(updateMobileScan);
    };

    updateMobileScan();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    coarse.addEventListener("change", schedule);
    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      coarse.removeEventListener("change", schedule);
    };
  }, [paused, selected]);

  return (
    <div className="work-pair reveal">
      {jobs.map((job, i) => (
        <article
          className={`work-card ${selected === i ? "card-open" : ""}`}
          key={job.company}
        >
          <button
            ref={(el) => {
              coverRefs.current[i] = el;
            }}
            className="work-cover"
            aria-expanded={selected === i}
            aria-controls={`work-details-${i}`}
            onClick={() => {
              if (touchState.current[i]?.SuppressClick) {
                touchState.current[i].SuppressClick = false;
                return;
              }
              setSelected(selected === i ? null : i);
            }}
            onPointerDown={(e) => {
              if (e.pointerType !== "touch") return;
              touchState.current[i] = {
                startX: e.clientX,
                startY: e.clientY,
                scrubbing: false,
                SuppressClick: false,
              };
            }}
            onPointerMove={(e) => {
              if (paused) return;
              const r = e.currentTarget.getBoundingClientRect();
              if (!r.width) return;
              if (e.pointerType === "touch") {
                const st = touchState.current[i];
                if (!st) return;
                const dx = Math.abs(e.clientX - st.startX);
                const dy = Math.abs(e.clientY - st.startY);
                if (!st.scrubbing && dx > 10 && dx > dy * 1.2) {
                  st.scrubbing = true;
                  st.SuppressClick = true;
                }
                if (!st.scrubbing) return;
                const pct = Math.max(12, Math.min(94, ((e.clientX - r.left) / r.width) * 100));
                e.currentTarget.style.setProperty("--scan", `${pct}%`);
                e.currentTarget.dataset.scanning = "true";
                return;
              }
              e.currentTarget.style.setProperty(
                "--scan",
                `${Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))}%`,
              );
            }}
            onPointerUp={(e) => {
              if (e.pointerType === "touch" && touchState.current[i]) {
                touchState.current[i].scrubbing = false;
              }
            }}
            onPointerCancel={(e) => {
              if (e.pointerType === "touch" && touchState.current[i]) {
                touchState.current[i].scrubbing = false;
              }
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === "touch") return;
              if (window.innerWidth > 800 && !window.matchMedia("(pointer: coarse)").matches) {
                e.currentTarget.style.setProperty("--scan", "100%");
                delete e.currentTarget.dataset.scanning;
              }
            }}
          >
            <div className="work-code" aria-hidden="true">
              {Array.from({ length: 12 }, (_, n) => (
                <span key={n}>
                  {(i === 0
                    ? [
                        "merchant.identity → verified",
                        "access.roles.resolve(tenant)",
                        'event.publish("lifecycle")',
                        "account.scale = 5_000_000",
                      ][n % 4]
                    : [
                        "service.boot → quarkus",
                        "query.execute(procedure)",
                        "response.time *= 0.60",
                        "cold.start *= 0.40",
                      ][n % 4]
                  )
                    .concat("   /   ")
                    .repeat(4)}
                </span>
              ))}
            </div>
            <div className="work-face">
              <svg className="work-engraving" viewBox="0 0 460 270" fill="none" aria-hidden="true">
                {i === 0 ? (
                  <g transform="translate(260 125) rotate(-24)">
                    {Array.from({ length: 9 }, (_, n) => (
                      <ellipse key={n} rx={38 + n * 13} ry={80} />
                    ))}
                    <ellipse rx="142" ry="28" />
                    <ellipse rx="142" ry="56" />
                    <circle r="5" fill="currentColor" stroke="none" />
                  </g>
                ) : (
                  <g>
                    {Array.from({ length: 15 }, (_, n) => (
                      <path key={n} d={`M 40 ${50+n*8} C 150 ${-50+n*12}, 210 ${300-n*9}, 450 ${50+n*8}`} />
                    ))}
                    <circle cx="340" cy="123" r="36" strokeDasharray="2 7" />
                  </g>
                )}
              </svg>
              <span className="work-date mono">{job.dates}</span>
              <strong className={i === 0 ? "visa-name" : "openreach-name"}>
                {job.company}
              </strong>
              <span className="work-team">{job.team}</span>
              <div className="work-card-bottom">
                <span>{job.role}</span>
                <span className="card-arrow">
                  <FiArrowUpRight />
                </span>
              </div>
            </div>
            <span className="scan-beam" aria-hidden="true" />
          </button>
          <div className="work-caption">
            <p>{job.summary}</p>
            <button
              onClick={() => setSelected(selected === i ? null : i)}
              aria-expanded={selected === i}
              aria-controls={`work-details-${i}`}
            >
              {selected === i ? "Close" : "What I built"}{" "}
              {selected === i ? <FiX /> : <FiArrowUpRight />}
            </button>
          </div>
          <div
            className="work-detail"
            id={`work-details-${i}`}
            hidden={selected !== i}
          >
            <p className="work-stat">
              <strong>{job.metric}</strong> {job.metricDescription}
            </p>
            <ul>
              {job.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <p className="mono">{job.technologies.join(" / ")}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
