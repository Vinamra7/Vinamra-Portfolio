import "../styles/global.css";
import { useEffect, useState } from "react";

export default function App({ Component, pageProps }) {
  const [mode, setMode] = useState("auto");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("portfolio-theme-mode");
      if (["auto", "dark", "light"].includes(saved)) setMode(saved);
    } catch {}
  }, []);
  useEffect(() => {
    let frame;
    const apply = () => {
      frame = null;
      let theme = mode;
      if (mode === "auto") {
        let active = "home";
        document.querySelectorAll(".portfolio main > section").forEach(section => {
          if (section.getBoundingClientRect().top <= innerHeight * .45) active = section.id;
        });
        theme = ["about", "projects"].includes(active) ? "light" : "dark";
      }
      if (document.documentElement.dataset.theme !== theme)
        document.documentElement.dataset.theme = theme;
    };
    const schedule = () => { if (frame == null) frame = requestAnimationFrame(apply); };
    const observer = new MutationObserver(schedule);
    observer.observe(document.getElementById("__next"), { childList: true, subtree: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    apply();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [mode]);
  function choose(next) {
    setMode(next);
    try { localStorage.setItem("portfolio-theme-mode", next); } catch {}
  }
  return (
    <>
      <Component {...pageProps} />
      <div className="theme-toggle" role="group" aria-label="Colour theme">
        {["auto", "dark", "light"].map(option => (
          <button key={option} type="button" aria-pressed={mode === option}
            onClick={() => choose(option)} title={option === "auto" ? "Cycle between dark and light as you scroll" : `Always ${option}`}>
            {{ auto: "CYCLE", dark: "DARK", light: "LIGHT" }[option]}
          </button>
        ))}
      </div>
    </>
  );
}
