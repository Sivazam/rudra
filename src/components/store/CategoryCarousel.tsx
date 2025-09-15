'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryCarouselProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export function CategoryCarousel({ categories, selectedCategory, onCategorySelect }: CategoryCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('category-carousel');
    if (container) {
      const scrollAmount = 200;
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
      
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  return (
    <div className="relative mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => scroll('left')}
            disabled={scrollPosition === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        id="category-carousel"
        className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* All Categories Option */}
        <button
          onClick={() => onCategorySelect('all')}
          className={`flex flex-col items-center space-y-2 min-w-[100px] p-4 rounded-lg transition-all ${
            selectedCategory === 'all' 
              ? 'bg-orange-100 border-2 border-orange-600' 
              : 'bg-white border border-gray-200 hover:border-orange-400'
          }`}
        >
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-orange-600 font-bold text-lg">All</span>
          </div>
          <span className="text-sm font-medium text-gray-700">All</span>
        </button>
        
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.name)}
            className={`flex flex-col items-center space-y-2 min-w-[100px] p-4 rounded-lg transition-all ${
              selectedCategory === category.name 
                ? 'bg-orange-100 border-2 border-orange-600' 
                : 'bg-white border border-gray-200 hover:border-orange-400'
            }`}
          >
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-bold text-lg">
                {category.name.charAt(0)}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}