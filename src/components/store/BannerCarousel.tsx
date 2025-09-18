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
        {banners.map((banner, index) => (
          // <Link 
          //   key={banner.id} 
          //   href={banner.categoryLink}
          //   className={cn(
          //     "absolute inset-0 transition-opacity duration-500 ease-in-out",
          //     index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
          //   )}
          // >
            <div className="relative h-full w-full">
              <Image
                src={banner.imageUrl}
                alt={banner.altText}
                fill
                className="object-cover"
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              {/* Optional: Overlay with text */}
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                {/* <div className="text-center text-white">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">{banner.title}</h2>
                  <p className="text-lg md:text-xl opacity-90">{banner.description}</p>
                </div> */}
              </div>
            </div>
          // </Link>
        ))}
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