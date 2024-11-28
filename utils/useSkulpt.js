import { useState, useEffect, useRef } from 'react';

export const useSkulpt = () => {
   const [skulptLoaded, setSkulptLoaded] = useState(false);
   const loadingRef = useRef(false);

   useEffect(() => {
      if (typeof window === 'undefined') return;
      
      const loadSkulpt = async () => {
         if (loadingRef.current || window.Sk) {
            setSkulptLoaded(true);
            return;
         }
         
         loadingRef.current = true;

         try {
            const timeout = 5000; // 5 seconds timeout
            const loadWithTimeout = async (src) => {
               const result = await Promise.race([
                  loadScript(src),
                  new Promise((_, reject) => 
                     setTimeout(() => reject(new Error(`Loading ${src} timed out`)), timeout)
                  )
               ]);
               return result;
            };

            // Load Skulpt main
            await loadWithTimeout('https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js');
            // Load Skulpt stdlib
            await loadWithTimeout('https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js');
            
            if (window.Sk) {
               setSkulptLoaded(true);
            } else {
               throw new Error('Skulpt failed to initialize');
            }
         } catch (error) {
            console.error('Error loading Skulpt:', error);
            // Retry loading from alternative CDN
            try {
               await loadScript('https://skulpt.org/js/skulpt.min.js');
               await loadScript('https://skulpt.org/js/skulpt-stdlib.js');
               if (window.Sk) {
                  setSkulptLoaded(true);
               }
            } catch (retryError) {
               console.error('Failed to load from alternative source:', retryError);
            }
         } finally {
            loadingRef.current = false;
         }
      };

      loadSkulpt();
      return () => { loadingRef.current = false; };
   }, []);

   return { skulptLoaded };
};

const loadScript = (src) => {
   return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
   });
};
