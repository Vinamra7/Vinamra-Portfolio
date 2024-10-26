import { useEffect, useState } from 'react';
import LoadingCube from './LoadingCube';

const LoadingScreen = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Animate loading dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => {
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
      <div className="w-16 h-16">
        <LoadingCube />
      </div>
      <div className="text-white text-2xl mt-8 font-mono min-w-[120px] text-center">
        Loading{dots}
      </div>
    </div>
  );
};

export default LoadingScreen;
