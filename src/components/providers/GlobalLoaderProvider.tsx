'use client';

import { useEffect, useState } from 'react';
import { globalLoaderManager } from '@/hooks/useGlobalLoader';
import { GlobalLoader } from '@/components/ui/GlobalLoader';

export function GlobalLoaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    // Subscribe to global loader state changes
    const unsubscribe = globalLoaderManager.subscribe((state) => {
      // Only show loader for initial app load
      const shouldShowLoader = state.sources.has('initial') && !initialLoadComplete;
      setIsLoading(shouldShowLoader);
    });

    // Show initial loader
    globalLoaderManager.show('initial');
    
    // Hide initial loader after a short delay (simulating app initialization)
    const timer = setTimeout(() => {
      globalLoaderManager.hide('initial');
      setInitialLoadComplete(true);
    }, 1500);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [initialLoadComplete]);

  return (
    <>
      {children}
      <GlobalLoader isLoading={isLoading} />
    </>
  );
}