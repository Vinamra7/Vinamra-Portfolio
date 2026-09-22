import { useEffect, useState } from 'react';
import LoadingCube from './LoadingCube';

const LoadingScreen = ({ progress }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => {
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#11151C] flex flex-col items-center justify-center">
      <div className="w-16 h-16">
        <LoadingCube />
      </div>
      <div className="text-white text-2xl mt-8 font-mono min-w-[120px] text-center">
        {progress === 100 ? 'Ready' : `Loading${dots}`}
      </div>
      <div className="mt-4 text-white/50 text-sm">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

export default LoadingScreen;
