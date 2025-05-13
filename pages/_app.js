import '../styles/global.css'
import { useState, useEffect, lazy, Suspense } from 'react'
import gsap from 'gsap'
import LoadingScreen from './components/loading/LoadingScreen'
import AssetLoader from '../utils/assetLoader'
import { Analytics } from '@vercel/analytics/react'

// Lazy load components to improve initial loading performance
const CustomCursor = lazy(() => import('./components/customCursor/CustomCursor'));

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

      // Add resize listener with debounce
      let resizeTimer;
      const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          checkMobile();
        }, 250);
      };
      
      window.addEventListener('resize', handleResize);

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
          // Handle error gracefully - show content anyway
          setLoading(false);
          setShowContent(true);
        }
      };

      initializeApp();

      // Cleanup resize listener
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimer);
      };
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
        <Suspense fallback={null}>
          {showContent && <CustomCursor />}
        </Suspense>
        <Component {...pageProps} showContent={showContent} />
      </div>
      <Analytics />
    </>
  )
}

export default MyApp
