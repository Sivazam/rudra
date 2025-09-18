'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ProductCard } from './ProductCard';

interface Product {
  id: string;
  name: string;
  deity: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  hasVariants?: boolean;
  variants?: Array<{
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount: number;
    stock: number;
    sku: string;
  }>;
}

interface VirtualizedProductGridProps {
  products: Product[];
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

export function VirtualizedProductGrid({ 
  products, 
  itemHeight = 400, // Approximate height of each product card
  containerHeight = 800, // Default viewport height
  overscan = 3 // Number of items to render outside viewport
}: VirtualizedProductGridProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle scroll events with throttling
  const handleScroll = useCallback(() => {
    if (!containerRef) return;
    
    setScrollTop(containerRef.scrollTop);
    setIsScrolling(true);
    
    // Clear previous timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Set new timeout to reset scrolling state
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [containerRef]);

  // Calculate visible items
  const { visibleItems, startIndex, endIndex, totalHeight } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      products.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    const visibleItems = products.slice(startIndex, endIndex + 1);
    const totalHeight = products.length * itemHeight;
    
    return { visibleItems, startIndex, endIndex, totalHeight };
  }, [products, scrollTop, itemHeight, containerHeight, overscan]);

  // Setup scroll listener
  useEffect(() => {
    const container = containerRef;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [containerRef, handleScroll]);

  // If there are no products or very few, render normally without virtualization
  if (products.length <= 12) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {products.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={setContainerRef}
      className="relative overflow-y-auto smooth-scroll-container"
      style={{ height: containerHeight, maxHeight: '70vh' }}
    >
      {/* Spacer element to maintain scroll height */}
      <div style={{ height: totalHeight }} />
      
      {/* Visible items */}
      <div className="absolute top-0 left-0 right-0">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 p-1">
          {visibleItems.map((product, index) => {
            const actualIndex = startIndex + index;
            const topOffset = actualIndex * itemHeight;
            
            return (
              <div
                key={product.id}
                className="transition-opacity duration-200"
                style={{
                  opacity: isScrolling ? 0.8 : 1,
                  transform: isScrolling ? 'scale(0.98)' : 'scale(1)'
                }}
              >
                <ProductCard product={product} />
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Loading indicator for large lists */}
      {products.length > 50 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex + 1, products.length)} of {products.length} products
            </p>
          </div>
        </div>
      )}
    </div>
  );
}