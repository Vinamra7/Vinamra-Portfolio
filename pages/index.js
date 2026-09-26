import Head from "next/head";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { contact } from "../lib/content";

const Portfolio = dynamic(() => import("../components/Portfolio"), { ssr: false });

export default function Home() {
  const [device, setDevice] = useState("checking");
  useEffect(() => {
    // Include landscape phones; do not block a desktop just for a narrow window.
    const coarse = window.matchMedia("(pointer: coarse)");
    const check = () => {
      const phone = /iPhone|iPod|Android.*Mobile|Windows Phone/i.test(navigator.userAgent)
        || (coarse.matches && Math.min(screen.width, screen.height) < 600);
      setDevice(phone ? "phone" : "desktop");
    };
    check();
    coarse.addEventListener("change", check);
    window.addEventListener("resize", check);
    return () => {
      coarse.removeEventListener("change", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  if (device === "desktop") return <Portfolio />;
  return (
    <>
      <Head>
        <title>Vinamra Mishra — Software Engineer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Vinamra Mishra, software engineer in Bengaluru. View my résumé or get in touch." />
      </Head>
      <main className="desktop-notice">
        <p className="mono">VINAMRA MISHRA</p>
        <h1>{device === "phone" ? "Best explored on desktop." : "Vinamra Mishra"}</h1>
        <p>{device === "phone"
          ? "This portfolio is built for a larger screen and a mouse. Open it on your laptop or desktop to explore."
          : "Software engineer in Bengaluru, India."}</p>
        <nav aria-label="Contact and résumé">
          <a href={contact.resume} download>Download résumé ↗</a>
          <a href={`mailto:${contact.email}`}>Email me ↗</a>
          <a href={contact.linkedin}>LinkedIn ↗</a>
        </nav>
      </main>
    </>
  );
}
