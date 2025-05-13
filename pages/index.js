import Head from 'next/head';
import { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Use dynamic imports to reduce initial bundle size
const AboutMe = dynamic(() => import('./components/about/AboutMe'), { ssr: false });
const HomeSection = dynamic(() => import('./components/HomeSection'), { ssr: false });
const Projects = dynamic(() => import('./components/projects/Projects'), { ssr: false });
const ContactMe = dynamic(() => import('./components/contactMe/contactme'), { ssr: false });

// Debounce helper function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function Home({ showContent }) {
  const [showAbout, setShowAbout] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Calculate thresholds outside render function
  const thresholds = useMemo(() => {
    if (typeof window !== 'undefined') {
      const windowHeight = window.innerHeight;
      return {
        aboutThreshold: windowHeight * 0.2,
        projectThreshold: windowHeight * 2.5,
        contactThreshold: windowHeight * 4.5
      };
    }
    return {
      aboutThreshold: 0,
      projectThreshold: 0,
      contactThreshold: 0
    };
  }, []);

  // Debounced scroll handler
  const handleScroll = useCallback(
    debounce(() => {
      const currentPosition = window.scrollY;
      setScrollPosition(currentPosition);
    }, 10),
    []
  );

  // Update section visibility based on scroll position
  useEffect(() => {
    setShowAbout(scrollPosition > thresholds.aboutThreshold && scrollPosition < thresholds.projectThreshold);
    setShowProjects(scrollPosition > thresholds.projectThreshold && scrollPosition < thresholds.contactThreshold);
    setShowContact(scrollPosition > thresholds.contactThreshold);
  }, [scrollPosition, thresholds]);

  // Set up scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <>
      <Head>
        <title>Vinamra's Portfolio</title>
        <meta name="description" content="Vinamra Mishra's Portfolio" />
        <link rel="icon" href="/favicon.ico" />
        {/* Add additional performance meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </Head>
      <main className="relative">
        {/* First viewport - Home */}
        <div className="h-screen relative">
          <section className={`fixed inset-0 transition-opacity duration-1000 ${showAbout || showProjects || showContact ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
            }`}>
            <HomeSection showContent={showContent} />
          </section>
        </div>

        {/* Second viewport - About */}
        <div className="h-screen relative">
          <section className={`fixed inset-0 transition-all duration-1000 ${showAbout ? 'opacity-100 pointer-events-auto translate-y-0' :
            showProjects || showContact ? 'opacity-0 pointer-events-none -translate-y-full' :
              'opacity-0 pointer-events-none translate-y-full'
            }`}>
            <AboutMe showContent={showAbout} />
          </section>
        </div>

        {/* Third viewport - Projects */}
        <div className="h-screen relative">
          <section className={`fixed inset-0 transition-all duration-1000 ${showProjects ? 'opacity-100 pointer-events-auto translate-y-0' :
            showContact ? 'opacity-0 pointer-events-none -translate-y-full' :
              'opacity-0 pointer-events-none translate-y-full'
            }`}>
            <Projects showContent={showProjects} />
          </section>
        </div>

        {/* Fourth viewport - Contact */}
        <div className="h-screen relative">
          <section className={`fixed inset-0 transition-all duration-1000 ${showContact ? 'opacity-100 pointer-events-auto translate-y-0' :
            'opacity-0 pointer-events-none translate-y-full'
            }`}>
            <ContactMe showContent={showContact} />
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
