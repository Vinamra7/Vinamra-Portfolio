import '../styles/global.css'
import { useState, useEffect } from 'react'
import gsap from 'gsap'
import CustomCursor from './components/customCursor/CustomCursor'
import LoadingScreen from './components/loading/LoadingScreen'
import AssetLoader from '../utils/assetLoader'

const LOADING_TIMEOUT = 30000; // 30 seconds

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    }
  }, []);

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
    </>
  )
}

export default MyApp
