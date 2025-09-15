'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Category {
  id: string;
  name: string;
  image: string;
}

interface CategoryCarouselProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export function CategoryCarousel({ categories, selectedCategory, onCategorySelect }: CategoryCarouselProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#755e3e' }}>Categories</h2>
      
      <div 
        className="category-scroll"
        style={{ 
          display: 'flex',
          flexDirection: 'row',
          gap: '1rem',
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: '1rem'
        }}
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.name)}
            className="category-button"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              flexShrink: '0',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: selectedCategory === category.name ? '#ffeee0' : 'transparent',
              border: selectedCategory === category.name ? `2px solid #9c542a` : 'none',
              minWidth: '70px',
              transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease'
            }}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
              <img
                src={category.image}
                alt={category.name}
                className="w-8 h-8 object-cover"
                onError={(e) => {
                  // Fallback to first letter if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `
                    <span class="font-bold text-sm" style="color: ${selectedCategory === category.name ? '#9c542a' : '#666666'}">
                      ${category.name.charAt(0)}
                    </span>
                  `;
                }}
              />
            </div>
            <span className="text-xs font-medium" style={{ 
              color: selectedCategory === category.name ? '#9c542a' : '#000000' 
            }}>
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}