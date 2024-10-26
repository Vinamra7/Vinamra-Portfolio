import '../styles/global.css'
import { useState, useEffect } from 'react'
import gsap from 'gsap'
import CustomCursor from './components/customCursor/CustomCursor'
import TunnelBackground from './components/TunnelBackground'
import LoadingScreen from './components/LoadingScreen'

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleLoadingComplete = () => {
        gsap.to('.loading-screen', {
          opacity: 0,
          duration: 1,
          onComplete: () => {
            setLoading(false);
            setShowContent(true);
          }
        });
      };

      const timer = setTimeout(() => {
        handleLoadingComplete();
      }, 2000); // Changed from 3000 to 2000

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {loading && (
        <div className="loading-screen">
          <LoadingScreen />
        </div>
      )}
      
      <div className={`main-content ${showContent ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
        <TunnelBackground />
        <CustomCursor />
        <Component {...pageProps} showContent={showContent} />
      </div>
    </>
  )
}

export default MyApp
