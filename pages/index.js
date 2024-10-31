import Head from 'next/head';
import AboutMe from './components/about/AboutMe';
import HomeSection from "./components/HomeSection";
import { useEffect, useState } from 'react';
import AboutBack from './components/about/AboutBack';

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
        {/* HomeSection container */}
        <section className={`fixed inset-0 transition-opacity duration-1000 ${showAbout ? 'opacity-0' : 'opacity-100'}`}>
          <HomeSection showContent={showContent} />
        </section>

        {/* AboutMe section */}
        <AboutMe showContent={showAbout} />

        {/* Scrollable space */}
        <div className="h-[200vh]"></div>
      </main>
    </>
  );
}
