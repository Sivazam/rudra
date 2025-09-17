'use client';

import { useEffect, useState } from 'react';
import { globalLoaderManager } from '@/hooks/useGlobalLoader';
import { GlobalLoader } from '@/components/ui/GlobalLoader';

export function GlobalLoaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subscribe to global loader state changes
    const unsubscribe = globalLoaderManager.subscribe((state) => {
      setIsLoading(state.isLoading);
    });

    // Show initial loader
    globalLoaderManager.show('initial');
    
    // Hide initial loader after a short delay (simulating app initialization)
    const timer = setTimeout(() => {
      globalLoaderManager.hide('initial');
    }, 1500);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {children}
      <GlobalLoader isLoading={isLoading} />
    </>
  );
}