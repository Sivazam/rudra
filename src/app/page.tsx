'use client';

import { useState } from 'react';
import { CategoryCarousel } from '@/components/store/CategoryCarousel';
import { ProductGrid } from '@/components/store/ProductGrid';
import { ProductCard } from '@/components/store/ProductCard';
import { BannerCarousel } from '@/components/store/BannerCarousel';
import { MainLayout } from '@/components/store/MainLayout';

// Mock data for now - will be replaced with API calls
const mockBanners = [
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

const mockProducts = [
  {
    id: '1',
    name: '10 Mukhi Lord Vishnu',
    deity: 'Lord Vishnu',
    price: 1499,
    originalPrice: 1799,
    rating: 4.7,
    reviews: 547,
    image: '/products/10-mukhi.jpg',
    badge: 'Best Seller'
  },
  {
    id: '2',
    name: '9 Mukhi Goddess Durga',
    deity: 'Goddess Durga',
    price: 1299,
    originalPrice: 1599,
    rating: 4.8,
    reviews: 423,
    image: '/products/9-mukhi.jpg',
    badge: 'Popular'
  },
  {
    id: '3',
    name: '7 Mukhi Goddess Lakshmi',
    deity: 'Goddess Lakshmi',
    price: 999,
    originalPrice: 1299,
    rating: 4.6,
    reviews: 389,
    image: '/products/7-mukhi.jpg'
  },
  {
    id: '4',
    name: '5 Mukhi Lord Shiva',
    deity: 'Lord Shiva',
    price: 799,
    originalPrice: 999,
    rating: 4.9,
    reviews: 612,
    image: '/products/5-mukhi.jpg',
    badge: 'Premium'
  },
  {
    id: '5',
    name: '14 Mukhi Lord Hanuman',
    deity: 'Lord Hanuman',
    price: 2499,
    originalPrice: 2999,
    rating: 4.7,
    reviews: 298,
    image: '/products/14-mukhi.jpg'
  },
  {
    id: '6',
    name: '12 Mukhi Lord Sun',
    deity: 'Lord Sun',
    price: 1999,
    originalPrice: 2499,
    rating: 4.8,
    reviews: 345,
    image: '/products/12-mukhi.jpg'
  },
  {
    id: '7',
    name: '11 Mukhi Lord Indra',
    deity: 'Lord Indra',
    price: 1799,
    originalPrice: 2199,
    rating: 4.6,
    reviews: 267,
    image: '/products/11-mukhi.jpg'
  },
  {
    id: '8',
    name: '8 Mukhi Lord Ganesha',
    deity: 'Lord Ganesha',
    price: 1199,
    originalPrice: 1499,
    rating: 4.9,
    reviews: 456,
    image: '/products/8-mukhi.jpg',
    badge: 'New'
  },
  {
    id: '9',
    name: '6 Mukhi Lord Kartikeya',
    deity: 'Lord Kartikeya',
    price: 899,
    originalPrice: 1199,
    rating: 4.7,
    reviews: 334,
    image: '/products/6-mukhi.jpg'
  },
  {
    id: '10',
    name: '4 Mukhi Lord Brahma',
    deity: 'Lord Brahma',
    price: 699,
    originalPrice: 899,
    rating: 4.8,
    reviews: 289,
    image: '/products/4-mukhi.jpg'
  },
  {
    id: '11',
    name: '3 Mukhi Lord Agni',
    deity: 'Lord Agni',
    price: 599,
    originalPrice: 799,
    rating: 4.6,
    reviews: 234,
    image: '/products/3-mukhi.jpg'
  },
  {
    id: '12',
    name: '2 Mukhi Lord Shiva Parvati',
    deity: 'Lord Shiva Parvati',
    price: 499,
    originalPrice: 699,
    rating: 4.9,
    reviews: 445,
    image: '/products/2-mukhi.jpg',
    badge: 'Divine'
  },
  // Products without variants
  {
    id: '13',
    name: 'Sacred Red Thread Mala',
    deity: 'Protection',
    price: 299,
    rating: 4.5,
    reviews: 156,
    image: '/products/red-thread.jpg',
    hasVariants: false
  },
  {
    id: '14',
    name: 'Natural Sandalwood Mala',
    deity: 'Meditation',
    price: 799,
    originalPrice: 999,
    rating: 4.8,
    reviews: 203,
    image: '/products/sandalwood.jpg',
    hasVariants: false
  },
  {
    id: '15',
    name: 'Tulsi Mala',
    deity: 'Purity',
    price: 399,
    rating: 4.6,
    reviews: 178,
    image: '/products/tulsi.jpg',
    hasVariants: false
  }
];

const mockCategories = [
  { id: '1', name: 'Rudraksha', image: '/categories/rudraksha.png' },
  { id: '2', name: 'Malas', image: '/categories/malas.png' },
  { id: '3', name: 'Bracelets', image: '/categories/bracelets.png' },
  { id: '4', name: 'Pendants', image: '/categories/pendants.png' },
  { id: '5', name: 'Yantras', image: '/categories/yantras.png' },
  { id: '6', name: 'Idols', image: '/categories/idols.png' },
  { id: '7', name: 'Gemstones', image: '/categories/gemstones.png' },
  { id: '8', name: 'Puja Items', image: '/categories/puja-items.png' },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('Rudraksha');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = mockProducts.filter(product => {
    const matchesCategory = selectedCategory === 'Rudraksha' || product.name.toLowerCase().includes(selectedCategory.toLowerCase());
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
          categories={mockCategories}
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