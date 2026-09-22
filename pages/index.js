import Head from "next/head";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { FiArrowDown, FiArrowUpRight } from "react-icons/fi";
import ProjectGallery from "../components/ProjectGallery";
import Galaxy from "../components/Galaxy";
import DecodingName from "../components/DecodingName";
import WorkCards from "../components/WorkCards";
import ContactTerminal from "../components/ContactTerminal";
import { experience, projects, contact } from "../lib/content";
const Scene = dynamic(() => import("../components/Scene"), { ssr: false });

function SceneWindow({ variant, paused, ...props }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "250px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} {...props}>
      {ready && <Scene variant={variant} paused={paused} />}
    </div>
  );
}

export default function Home() {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPaused(reduced.matches);
    const onChange = () => setPaused(reduced.matches);
    reduced.addEventListener("change", onChange);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { rootMargin: "-20% 0px -35% 0px", threshold: 0 },
    );
    document
      .querySelectorAll("main > section")
      .forEach((section) => observer.observe(section));
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", onChange);
    };
  }, []);
  return (
    <div className={paused ? "portfolio motion-paused" : "portfolio"}>
      <Head>
        <title>Vinamra Mishra — Software Engineer</title>
        <meta
          name="description"
          content="Backend software engineer at Visa. Building identity services, payment systems, and software that holds up at scale. Bengaluru, India."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <a className="skip-link" href="#about">
        Skip to content
      </a>
      <Galaxy paused={paused} />
      <main>
        <section
          id="home"
          className="hero is-visible"
          aria-labelledby="hero-title"
        >
          <div className="hero-content">
            <p className="hero-hello">Hi, I’m</p>
            <h1 id="hero-title" aria-label="Vinamra Mishra">
              <DecodingName paused={paused} />
            </h1>
            <p className="hero-subtitle">
              Software developer from Bengaluru, India.
            </p>
          </div>
          <a href="#about" className="hero-scroll" aria-label="Scroll to about">
            <FiArrowDown />
          </a>
        </section>
        <section
          id="about"
          className="about section"
          aria-labelledby="about-title"
        >
          <div className="about-grid">
            <div className="about-copy reveal">
              <h2 id="about-title">A little about me.</h2>
              <p>
                I’m Vinamra, a backend engineer in Bengaluru. Currently building
                identity and merchant services at Visa. Before that, serverless
                systems at Openreach.
              </p>
              <p>
                I got into this through competitive programming. I’ve stayed for
                the problems that don’t come with a time limit.
              </p>
              <a className="text-link" href={contact.resume} download>
                The longer version <FiArrowUpRight />
              </a>
            </div>
            <div className="astronaut-composition reveal">
              <SceneWindow
                variant="astronaut"
                paused={paused}
                className="astronaut-window"
              />
              <span className="astronaut-caption mono">
                Hover to find colour
              </span>
            </div>
          </div>
        </section>
        <section
          id="work"
          className="work section"
          aria-labelledby="work-title"
        >
          <div className="section-heading reveal">
            <h2 id="work-title">Work.</h2>
            <span className="mono">2024 — NOW</span>
          </div>
          <WorkCards jobs={experience.slice(0, 2)} paused={paused} />
        </section>
        <section
          id="projects"
          className="projects section"
          aria-labelledby="projects-title"
        >
          <div className="section-heading reveal">
            <h2 id="projects-title">Off the clock.</h2>
            <span className="mono">PROJECTS & OPEN SOURCE</span>
          </div>
          <ProjectGallery projects={projects} paused={paused} />
        </section>
        <section
          id="contact"
          className="contact section"
          aria-labelledby="contact-title"
        >
          <div className="contact-grid">
            <h2 className="sr-only" id="contact-title">
              Contact Vinamra
            </h2>
            <div className="reveal">
              <ContactTerminal paused={paused} />
            </div>
          </div>
          <footer>
            <a href="#home" className="wordmark">
              vm.
            </a>
            <span className="mono">© 2026 VINAMRA MISHRA</span>
            <a className="mono back-top" href="#home">
              BACK TO TOP <FiArrowUpRight />
            </a>
          </footer>
        </section>
      </main>
    </div>
  );
}
