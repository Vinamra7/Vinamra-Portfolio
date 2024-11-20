import '../styles/global.css'
import { useState, useEffect } from 'react'
import gsap from 'gsap'
import CustomCursor from './components/customCursor/CustomCursor'
import LoadingScreen from './components/loading/LoadingScreen'
import AssetLoader from '../utils/assetLoader'
import { Analytics } from '@vercel/analytics/react'

const LOADING_TIMEOUT = 30000; // 30 seconds
const MOBILE_BREAKPOINT = 768; // Standard tablet/mobile breakpoint

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if device is mobile
      const checkMobile = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      };

      // Initial check
      checkMobile();

      // Add resize listener
      window.addEventListener('resize', checkMobile);

      const initializeApp = async () => {
        try {
          // Create a timeout promise
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Loading timeout')), LOADING_TIMEOUT);
          });

          // Race between asset loading and timeout
          await Promise.race([
            AssetLoader.loadAssets((progress) => {
              setLoadingProgress(progress);
            }),
            timeoutPromise
          ]);

          // Add a small delay to ensure all assets are properly initialized
          setTimeout(() => {
            // Fade out loading screen
            gsap.to('.loading-screen', {
              opacity: 0,
              duration: 0.5,
              onComplete: () => {
                setLoading(false);
                // Small delay before showing content
                setTimeout(() => {
                  setShowContent(true);
                }, 100);
              }
            });
          }, 500); // 500ms delay after assets are loaded

        } catch (error) {
          console.error('Error loading assets:', error);
          // Handle error appropriately
          setLoading(false);
          setShowContent(true);
        }
      };

      initializeApp();

      // Cleanup resize listener
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  if (isMobile) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-white p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">⚠️ Desktop View Only</h1>
          <p className="text-lg">
            This portfolio is optimized for desktop viewing. Please visit on a laptop or desktop computer for the best experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className="loading-screen">
          <LoadingScreen progress={loadingProgress} />
        </div>
      )}

      <div className={`main-content ${showContent ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
        <CustomCursor />
        <Component {...pageProps} showContent={showContent} />
      </div>
      <Analytics />
    </>
  )
}

export default MyApp
