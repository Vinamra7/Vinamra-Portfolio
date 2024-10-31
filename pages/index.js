import Head from 'next/head';
import AboutMe from './components/about/AboutMe';
import HomeSection from "./components/HomeSection";
import { useEffect, useState } from 'react';

export default function Home({ showContent }) {
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Show AboutMe when scrolled more than 10% of viewport height
      setShowAbout(scrollPosition > windowHeight * 0.1);
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
        <section className="fixed inset-0">
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
