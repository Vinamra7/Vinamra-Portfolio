import '../styles/global.css'
import { useState, useEffect } from 'react'
import gsap from 'gsap'
import CustomCursor from './components/customCursor/CustomCursor'
import LoadingScreen from './components/loading/LoadingScreen'
import AssetLoader from '../utils/assetLoader'

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initializeApp = async () => {
        try {
          // Load all assets with progress callback
          await AssetLoader.loadAssets((progress) => {
            setLoadingProgress(progress);
          });
          
          // Fade out loading screen
          gsap.to('.loading-screen', {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
              setLoading(false);
              setShowContent(true);
            }
          });
        } catch (error) {
          console.error('Error loading assets:', error);
          // Handle error appropriately
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
