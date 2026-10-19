import Head from "next/head";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { about, experience, projects, contact } from "../lib/content";
import Startup from "../components/Startup";

const Portfolio = dynamic(() => import("../components/Portfolio"), {
  ssr: false,
  loading: () => <Startup />,
});

const SITE_URL = "https://www.vinamramishra.dev";
const PAGE_TITLE = "Vinamra Mishra — Software Engineer";
const PAGE_DESCRIPTION =
  "Backend software engineer at Visa. Building identity services, payment systems, and software that holds up at scale. Bengaluru, India.";

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Vinamra Mishra",
  jobTitle: "Software Engineer",
  description: PAGE_DESCRIPTION,
  email: `mailto:${contact.email}`,
  url: SITE_URL + "/",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bengaluru",
    addressCountry: "IN",
  },
  worksFor: { "@type": "Organization", name: "Visa", department: "Cybersource" },
  sameAs: [contact.linkedin, contact.github],
};

/**
 * Static, server-rendered version of the site. This is what every crawler
 * (vendor security classifiers, search engines) and no-JS visitor receives:
 * real text content straight from the résumé, without the interactive layer.
 */
function Plainfolio() {
  return (
    <main className="plainfolio">
      <header>
        <p className="mono kicker">VINAMRA MISHRA — BENGALURU, INDIA</p>
        <h1>Vinamra Mishra</h1>
        <p className="lead">
          Backend software engineer at Visa. Building identity services, payment
          systems, and software that holds up at scale.
        </p>
        <nav className="links" aria-label="Profile and contact links">
          <a href={contact.resume} download>Download résumé ↗</a>
          <a href={contact.github}>GitHub ↗</a>
          <a href={contact.linkedin}>LinkedIn ↗</a>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </nav>
      </header>

      <section id="about" aria-labelledby="about-title">
        <h2 id="about-title">About</h2>
        {about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </section>

      <section id="work" aria-labelledby="work-title">
        <h2 id="work-title">Work</h2>
        {experience.map(job => (
          <article key={`${job.company}-${job.dates}`}>
            <h3>{job.role} — {job.company} ({job.team})</h3>
            <p className="mono entry-meta">{job.dates}</p>
            <p>{job.summary}</p>
            <ul>
              {job.details.map(detail => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
            <p className="mono stack">{job.technologies.join(" · ")}</p>
          </article>
        ))}
      </section>

      <section id="projects" aria-labelledby="projects-title">
        <h2 id="projects-title">Projects & open source</h2>
        {projects.map(project => (
          <article key={project.name}>
            <h3>{project.name}</h3>
            <p className="mono entry-meta">
              {project.category.toUpperCase()} · {project.year}
            </p>
            <p>{project.description}</p>
            <p className="mono stack">{project.stack}</p>
            <p>
              <a href={project.url}>View on GitHub ↗</a>
            </p>
          </article>
        ))}
      </section>

      <section id="contact" aria-labelledby="contact-title">
        <h2 id="contact-title">Contact</h2>
        <p>
          The fastest way to reach me is email — <a href={`mailto:${contact.email}`}>{contact.email}</a>.
        </p>
        <nav className="links" aria-label="Contact links">
          <a href={contact.resume} download>Download résumé ↗</a>
          <a href={contact.github}>GitHub ↗</a>
          <a href={contact.linkedin}>LinkedIn ↗</a>
        </nav>
      </section>

      <footer>
        <span className="mono">© 2026 VINAMRA MISHRA</span>
        <a href="#" className="mono">BACK TO TOP ↗</a>
      </footer>
    </main>
  );
}

/** Deliberate small-screen notice; kept minimal on purpose. */
function PhoneNotice() {
  return (
    <main className="desktop-notice">
      <p className="mono">VINAMRA MISHRA</p>
      <h1>Best explored on desktop.</h1>
      <p>
        This portfolio is built for a larger screen and a mouse. Open it on your
        laptop or desktop to explore.
      </p>
      <nav aria-label="Contact and résumé">
        <a href={contact.resume} download>Download résumé ↗</a>
        <a href={`mailto:${contact.email}`}>Email me ↗</a>
        <a href={contact.linkedin}>LinkedIn ↗</a>
      </nav>
    </main>
  );
}

export default function Home() {
  const [device, setDevice] = useState("checking");
  useEffect(() => {
    // Include landscape phones; do not block a desktop just for a narrow window.
    const coarse = window.matchMedia("(pointer: coarse)");
    const evaluate = () => {
      const phone = /iPhone|iPod|Android.*Mobile|Windows Phone/i.test(navigator.userAgent)
        || (coarse.matches && Math.min(screen.width, screen.height) < 600);
      setDevice(phone ? "phone" : "desktop");
    };
    evaluate();
    coarse.addEventListener("change", evaluate);
    window.addEventListener("resize", evaluate);
    return () => {
      coarse.removeEventListener("change", evaluate);
      window.removeEventListener("resize", evaluate);
    };
  }, []);

  const view = device === "desktop"
    ? <Portfolio />
    : device === "phone"
      ? <PhoneNotice />
      : (
        <>
          <Startup />
          <div className="site-fallback"><Plainfolio /></div>
          <noscript>
            <style>{`.site-startup { display: none; } .site-fallback { display: block; }`}</style>
          </noscript>
        </>
      );

  return (
    <>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={SITE_URL + "/"} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preload" href="/fonts/portfolio/SpaceGrotesk.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <meta name="theme-color" content="#000000" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Vinamra Mishra" />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:url" content={SITE_URL + "/"} />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </Head>
      {view}
    </>
  );
}
