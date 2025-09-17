'use client';

import { useState, useEffect } from 'react';
import { CategoryCarousel } from '@/components/store/CategoryCarousel';
import { ProductGrid } from '@/components/store/ProductGrid';
import { ProductCard } from '@/components/store/ProductCard';
import { BannerCarousel } from '@/components/store/BannerCarousel';
import { MainLayout } from '@/components/store/MainLayout';
import { useDataStore, getStoredCategories, getStoredProducts } from '@/lib/data-store';

interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  categoryLink: string;
  altText: string;
}

interface StoreProduct {
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
}

interface StoreCategory {
  id: string;
  name: string;
  image: string;
}

// Mock banners (these can remain hardcoded as they are marketing content)
const mockBanners: Banner[] = [
  {
    id: '1',
    title: 'Handmade Rudraksha Mala',
    description: 'Authentic Spiritual Products',
    imageUrl: '/banners/rudraksha-mala.jpg',
    categoryLink: '/categories/rudraksha',
    altText: 'Handmade Rudraksha Mala Banner'
  },
  {
    id: '2',
    title: 'Sacred Malas Collection',
    description: 'Find Your Spiritual Path',
    imageUrl: '/banners/malas-collection.jpg',
    categoryLink: '/categories/malas',
    altText: 'Sacred Malas Collection Banner'
  },
  {
    id: '3',
    title: 'Divine Bracelets',
    description: 'Wear Your Faith',
    imageUrl: '/banners/bracelets.jpg',
    categoryLink: '/categories/bracelets',
    altText: 'Divine Bracelets Banner'
  },
  {
    id: '4',
    title: 'Spiritual Pendants',
    description: 'Carry Divinity With You',
    imageUrl: '/banners/pendants.jpg',
    categoryLink: '/categories/pendants',
    altText: 'Spiritual Pendants Banner'
  }
];

export default function Home() {
  const { categories, products, loading } = useDataStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [storeCategories, setStoreCategories] = useState<StoreCategory[]>([]);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);

  // Transform admin categories to store format
  useEffect(() => {
    if (!loading && categories.length > 0) {
      const transformedCategories = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        image: cat.image || '/categories/default.png'
      }));
      setStoreCategories(transformedCategories);
      
      // Set default selected category to first category or 'All'
      if (transformedCategories.length > 0 && selectedCategory === 'All') {
        setSelectedCategory(transformedCategories[0].name);
      }
    }
  }, [categories, loading, selectedCategory]);

  // Transform admin products to store format
  useEffect(() => {
    if (!loading && products.length > 0) {
      const transformedProducts = products.map(product => ({
        id: product.id,
        name: product.name,
        deity: product.categoryName, // Using category name as deity for now
        price: product.price,
        originalPrice: product.originalPrice,
        rating: 4.5, // Default rating
        reviews: 10, // Default reviews
        image: product.images[0] || '/products/default.jpg',
        badge: product.discount > 0 ? `${product.discount}% OFF` : undefined,
        hasVariants: product.variants.length > 0,
        variants: product.variants // Pass the actual variants
      }));
      setStoreProducts(transformedProducts);
    }
  }, [products, loading]);

  // Fallback to localStorage if context is not available (for server-side rendering)
  useEffect(() => {
    if (loading) {
      const savedCategories = getStoredCategories();
      const savedProducts = getStoredProducts();
      
      if (savedCategories.length > 0) {
        const transformedCategories = savedCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          image: cat.image || '/categories/default.png'
        }));
        setStoreCategories(transformedCategories);
      }
      
      if (savedProducts.length > 0) {
        const transformedProducts = savedProducts.map(product => ({
          id: product.id,
          name: product.name,
          deity: product.categoryName,
          price: product.price,
          originalPrice: product.originalPrice,
          rating: 4.5,
          reviews: 10,
          image: product.images[0] || '/products/default.jpg',
          badge: product.discount > 0 ? `${product.discount}% OFF` : undefined,
          hasVariants: product.variants.length > 0,
          variants: product.variants // Pass the actual variants
        }));
        setStoreProducts(transformedProducts);
      }
    }
  }, [loading]);

  const filteredProducts = storeProducts.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.deity === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.deity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <MainLayout onSearch={setSearchQuery}>
      {/* Banner Carousel */}
      <BannerCarousel banners={mockBanners} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Category Carousel */}
        <CategoryCarousel 
          categories={storeCategories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
        
        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Showing {filteredProducts.length} results
          </h3>
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
            <option>Sort by: Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Rating: High to Low</option>
          </select>
        </div>
        
        {/* Product Grid */}
        <ProductGrid products={filteredProducts} />
      </div>
    </MainLayout>
  );
}