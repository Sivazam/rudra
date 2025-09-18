'use client';

import { useEffect, useState } from 'react';

interface GlobalLoaderProps {
  isLoading: boolean;
}

export function GlobalLoader({ isLoading }: GlobalLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShowLoader(true);
      setProgress(0);
      
      // Simulate progress animation
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      // Complete progress when loading finishes
      setProgress(100);
      setTimeout(() => {
        setShowLoader(false);
        setProgress(0);
      }, 300);
    }
  }, [isLoading]);

  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: 'rgba(156,86,26,255)' }}>
      <div className="text-center">
        {/* OM Logo Placeholder */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
            {/* <span className="text-4xl font-bold" style={{ color: 'rgba(156,86,26,255)' }}>OM</span> */}
            <img 
                  src="/logo-original.png" 
                  alt="Sanathan Rudraksha Logo" 
                  className="w-full h-full object-cover rounded-full"
                />
          </div>
        </div>

        {/* Fluid Progress Bar */}
        <div className="w-80 mx-auto">
          <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
            {/* Fluid animation */}
            <div 
              className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-300 ease-out"
              style={{ 
                width: `${progress}%`,
                boxShadow: '0 0 20px rgba(255,255,255,0.5)'
              }}
            />
            {/* Wave effect */}
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-pulse"
              style={{ 
                width: `${progress}%`,
                animationDuration: '2s'
              }}
            />
          </div>
          
          {/* Progress percentage */}
          <div className="mt-4">
            <span className="text-white text-sm font-medium">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Loading text */}
        <div className="mt-6">
          <p className="text-white/80 text-sm animate-pulse">
            Loading spiritual experience...
          </p>
        </div>
      </div>
    </div>
  );
}