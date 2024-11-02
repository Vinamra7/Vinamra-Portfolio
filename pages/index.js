import Head from 'next/head';
import AboutMe from './components/about/AboutMe';
import HomeSection from "./components/HomeSection";
import { useEffect, useState } from 'react';
import Projects from './components/projects/Projects';

export default function Home({ showContent }) {
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Calculate a threshold for when to start showing AboutMe
      const threshold = windowHeight * 0.5; // Show when scrolled halfway
      
      // Use scrollPosition relative to threshold to determine visibility
      setShowAbout(scrollPosition > threshold);
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
          <section className={`fixed inset-0 transition-opacity duration-1000 ${showAbout ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
            <HomeSection showContent={showContent} />
          </section>
        </div>

        {/* Second viewport - About */}
        <div className="h-screen relative">
          <section className={`fixed inset-0 transition-opacity duration-1000 ${showAbout ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <AboutMe showContent={showAbout} />
          </section>
        </div>

        {/* Third viewport - Projects */}
        <Projects />
      </main>
    </>
  );
}
