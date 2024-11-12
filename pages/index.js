import Head from 'next/head';
import AboutMe from './components/about/AboutMe';
import HomeSection from "./components/HomeSection";
import { useEffect, useState } from 'react';
import Projects from './components/projects/Projects';

export default function Home({ showContent }) {
  const [showAbout, setShowAbout] = useState(false);
  const [showProjects, setShowProjects] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      // Calculate thresholds for transitions
      const aboutThreshold = windowHeight * 0.2; // Show About early
      const projectThreshold = windowHeight * 2.5; // Increased threshold to give About more time

      // Update section visibility based on scroll position
      setShowAbout(scrollPosition > aboutThreshold && scrollPosition < projectThreshold);
      setShowProjects(scrollPosition > projectThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Head>
        <title>Vinamra's Portfolio</title>
        <meta name="description" content="Vinamra Mishra's Portfolio" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="relative">
        {/* First viewport - Home */}
        <div className="h-screen relative">
          <section className={`fixed inset-0 transition-opacity duration-1000 ${showAbout || showProjects ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
            }`}>
            <HomeSection showContent={showContent} />
          </section>
        </div>

        {/* Second viewport - About */}
        <div className="h-screen relative">
          <section className={`fixed inset-0 transition-all duration-1000 ${showAbout ? 'opacity-100 pointer-events-auto translate-y-0' :
            showProjects ? 'opacity-0 pointer-events-none -translate-y-full' :
              'opacity-0 pointer-events-none translate-y-full'
            }`}>
            <AboutMe showContent={showAbout} />
          </section>
        </div>

        {/* Third viewport - Projects */}
        <div className="h-screen relative">
          <section className={`fixed inset-0 transition-all duration-1000 ${showProjects ? 'opacity-100 pointer-events-auto translate-y-0' :
            'opacity-0 pointer-events-none translate-y-full'
            }`}>
            <Projects showContent={showProjects} />
          </section>
        </div>

        {/* Spacer divs for scroll height - adjusted for longer About section visibility */}
        <div className="h-screen"></div>
        <div className="h-screen"></div>
        <div className="h-[50vh]"></div> {/* Reduced last spacer to control total scroll length */}
      </main>
    </>
  );
}
