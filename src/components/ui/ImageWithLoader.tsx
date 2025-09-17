'use client';

import { useState, useEffect } from 'react';
import { useGlobalLoader } from '@/hooks/useGlobalLoader';

interface ImageWithLoaderProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export function ImageWithLoader({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  onLoad,
  onError 
}: ImageWithLoaderProps) {
  const { showLoader, hideLoader } = useGlobalLoader();
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (src && !imageLoaded) {
      showLoader('image');
      
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
        hideLoader('image');
        onLoad?.();
      };
      
      img.onerror = () => {
        setImageLoaded(true);
        hideLoader('image');
        onError?.();
      };
      
      img.src = src;
    }
  }, [src, imageLoaded, showLoader, hideLoader, onLoad, onError]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={{ 
        opacity: imageLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  );
}