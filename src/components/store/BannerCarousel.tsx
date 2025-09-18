'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  categoryLink: string;
  altText: string;
}

interface BannerCarouselProps {
  banners: Banner[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function BannerCarousel({ 
  banners, 
  autoPlay = true, 
  autoPlayInterval = 5000 
}: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  }, [banners.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-play functionality
  React.useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, nextSlide]);

  if (banners.length === 0) {
    return (
      <div className="h-[50vh] bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">No banners available</p>
      </div>
    );
  }

  return (
    <div className="relative h-[50vh] w-full overflow-hidden">
      {/* Banner Images */}
      <div className="relative h-full">
        <div className="relative h-full w-full">
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/rudra-bb6b7.firebasestorage.app/o/Dupload%2FShop%20Now.jpg?alt=media&token=1c490243-b365-4d91-af57-1e6801d4a5da"
                alt="Hero Banner"
                fill
                className="object-cover"
                loading={'eager'}
              /> 
      </div>
  </div>
      {/* Navigation Arrows */}
      {/* <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border-none rounded-full"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border-none rounded-full"
        onClick={nextSlide}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button> */}

      {/* Dots Navigation */}
      {/* <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "transition-all duration-300 ease-in-out rounded-full",
              index === currentIndex 
                ? "w-3 h-3 bg-white"  // Larger dot for active slide
                : "w-2 h-2 bg-white/60 hover:bg-white/80"  // Regular dot for inactive slides
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div> */}
    </div>
  );
}