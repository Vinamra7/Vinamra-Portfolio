import { useState, useEffect, useRef } from 'react';

export const useSkulpt = () => {
   const [skulptLoaded, setSkulptLoaded] = useState(false);
   const loadingRef = useRef(false);

   useEffect(() => {
      const loadSkulpt = async () => {
         if (loadingRef.current || window.Sk) return;
         loadingRef.current = true;

         try {
            // Load Skulpt main
            await loadScript('https://skulpt.org/js/skulpt.min.js');
            // Load Skulpt stdlib
            await loadScript('https://skulpt.org/js/skulpt-stdlib.js');
            setSkulptLoaded(true);
         } catch (error) {
            console.error('Error loading Skulpt:', error);
            throw new Error('Failed to load Python runtime');
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
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
   });
};
