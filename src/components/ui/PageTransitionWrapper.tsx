'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGlobalLoader } from '@/hooks/useGlobalLoader';

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

export function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const pathname = usePathname();
  const { showLoader, hideLoader } = useGlobalLoader();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    showLoader('page');
    setIsTransitioning(true);

    // Simulate page transition
    const timer = setTimeout(() => {
      setIsTransitioning(false);
      hideLoader('page');
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname, showLoader, hideLoader]);

  return (
    <div
      style={{
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning ? 'translateY(10px)' : 'translateY(0)',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      {children}
    </div>
  );
}