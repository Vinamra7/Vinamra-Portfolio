import Head from "next/head";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  FiArrowDown,
  FiArrowUpRight,
  FiPlus,
  FiMinus,
  FiGithub,
  FiDownload,
  FiPause,
  FiPlay,
  FiLayers,
  FiGitPullRequest,
  FiCommand,
} from "react-icons/fi";
import WorkCards from "../components/WorkCards";
import ContactTerminal from "../components/ContactTerminal";
import { experience, projects, contact } from "../lib/content";
const Scene = dynamic(() => import("../components/Scene"), { ssr: false });
const sections = ["home", "about", "work", "projects", "contact"];
const projectIcons = [FiLayers, FiGitPullRequest, FiCommand];

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
  const [active, setActive] = useState("home");
  const [paused, setPaused] = useState(false);

  const [projectFilter, setProjectFilter] = useState("All");
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
            if (entry.target.id) setActive(entry.target.id);
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
        <meta name="theme-color" content="#0c0d0e" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <a className="skip-link" href="#about">
        Skip to content
      </a>
      <main>
        <section
          id="home"
          className="hero is-visible"
          aria-labelledby="hero-title"
        >
          <SceneWindow
            variant="threshold"
            paused={paused}
            className="hero-scene"
            aria-hidden="true"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <h1 id="hero-title">Vinamra Mishra</h1>
            <p className="hero-subtitle">Software engineer</p>
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
            <h2 id="projects-title">Side projects & contributions.</h2>
            <div
              className="project-filters"
              role="group"
              aria-label="Filter projects"
            >
              {["All", "Projects", "Open source"].map((filter) => (
                <button
                  key={filter}
                  aria-pressed={projectFilter === filter}
                  onClick={() => setProjectFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="project-list reveal">
            {projects
              .filter(
                (project) =>
                  projectFilter === "All" || project.category === projectFilter,
              )
              .map((project) => {
                const Icon = projectIcons[projects.indexOf(project)];
                return (
                  <a
                    key={project.name}
                    className="project"
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div
                      className={`project-symbol ${project.symbol}`}
                      aria-hidden="true"
                    >
                      <Icon />
                    </div>
                    <div className="project-copy">
                      <span className="mono project-type">
                        {project.category} / {project.year}
                      </span>
                      <h3>{project.name}</h3>
                      <p>{project.description}</p>
                      <span className="mono project-stack">
                        {project.stack}
                      </span>
                    </div>
                    <span className="project-out">
                      <span className="mono">
                        {project.category === "Projects"
                          ? "EXPLORE REPO"
                          : "VIEW CONTRIBUTION"}
                      </span>
                      <FiArrowUpRight />
                    </span>
                  </a>
                );
              })}
          </div>
          <a
            className="text-link github-link"
            href={contact.github}
            target="_blank"
            rel="noreferrer"
          >
            <FiGithub /> More on GitHub <FiArrowUpRight />
          </a>
        </section>
        <section
          id="contact"
          className="contact section"
          aria-labelledby="contact-title"
        >
          <div className="contact-grid">
            <div className="contact-copy reveal">
              <h2 id="contact-title">
                Your move<span className="name-period">.</span>
              </h2>
              <p>
                A question, an interesting problem,
                <br />
                or just a hello. I’m a message away.
              </p>
              <a className="contact-email" href={`mailto:${contact.email}`}>
                {contact.email}
                <FiArrowUpRight />
              </a>
              <div className="direct-links mono">
                <a href={contact.linkedin} target="_blank" rel="noreferrer">
                  LINKEDIN <FiArrowUpRight />
                </a>
                <a href={contact.github} target="_blank" rel="noreferrer">
                  GITHUB <FiArrowUpRight />
                </a>
                <a href={contact.resume} download>
                  RÉSUMÉ <FiDownload />
                </a>
              </div>
            </div>
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

      <button
        className="motion-control mono"
        onClick={() => setPaused(!paused)}
        aria-label={paused ? "Enable motion" : "Pause motion"}
        aria-pressed={paused}
      >
        {paused ? <FiPlay /> : <FiPause />}
        <span>MOTION {paused ? "OFF" : "ON"}</span>
      </button>
    </div>
  );
}
