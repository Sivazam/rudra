'use client';

import { useState, useEffect } from 'react';
import { CategoryCarousel } from '@/components/store/CategoryCarousel';
import { ProductGrid } from '@/components/store/ProductGrid';
import { ProductCard } from '@/components/store/ProductCard';
import { BannerCarousel } from '@/components/store/BannerCarousel';
import { MainLayout } from '@/components/store/MainLayout';
import { PageTransitionWrapper } from '@/components/ui/PageTransitionWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { SlideInCart } from '@/components/store/SlideInCart';
import { ImagePreloader } from '@/components/ui/ImagePreloader';
import { useDataStore, getStoredCategories, getStoredProducts } from '@/lib/data-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  categoryName: string;
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
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/rudra-bb6b7.firebasestorage.app/o/Dupload%2FShop%20Now.jpg?alt=media&token=1c490243-b365-4d91-af57-1e6801d4a5da',
    categoryLink: '/',
    altText: 'Handmade Rudraksha Mala Banner'
  }
  // },
  // {
  //   id: '2',
  //   title: 'Sacred Malas Collection',
  //   description: 'Find Your Spiritual Path',
  //   imageUrl: '/banners/malas-collection.jpg',
  //   categoryLink: '/categories/malas',
  //   altText: 'Sacred Malas Collection Banner'
  // },
  // {
  //   id: '3',
  //   title: 'Divine Bracelets',
  //   description: 'Wear Your Faith',
  //   imageUrl: '/banners/bracelets.jpg',
  //   categoryLink: '/categories/bracelets',
  //   altText: 'Divine Bracelets Banner'
  // },
  // {
  //   id: '4',
  //   title: 'Spiritual Pendants',
  //   description: 'Carry Divinity With You',
  //   imageUrl: '/banners/pendants.jpg',
  //   categoryLink: '/categories/pendants',
  //   altText: 'Spiritual Pendants Banner'
  }
];

export default function Home() {
  const { categories, products, loading } = useDataStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [storeCategories, setStoreCategories] = useState<StoreCategory[]>([]);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Always ensure "All" category is available as a fallback
  useEffect(() => {
    console.log('Emergency fallback check:', { 
      storeCategoriesLength: storeCategories.length, 
      loading, 
      initialLoadComplete 
    });
    
    // If no categories after loading is complete, add the "All" category
    if (!loading && initialLoadComplete && storeCategories.length === 0) {
      const allCategory: StoreCategory = {
        id: 'all',
        name: 'All',
        image: '/categories/all.png'
      };
      console.log('Emergency fallback: Adding "All" category');
      setStoreCategories([allCategory]);
    }
  }, [storeCategories.length, loading, initialLoadComplete]);

  // Handle category from URL parameter
  useEffect(() => {
    // Only access searchParams on the client side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const categoryParam = urlParams.get('category');
      if (categoryParam && storeCategories.length > 0) {
        const categoryExists = storeCategories.some(cat => cat.name === categoryParam);
        if (categoryExists) {
          setSelectedCategory(categoryParam);
        }
      }
    }
  }, [storeCategories]);

  // Show loader when data is loading (but not for API calls anymore)
  useEffect(() => {
    console.log('Loader logic:', { 
      loading, 
      initialLoadComplete, 
      storeCategoriesLength: storeCategories.length, 
      storeProductsLength: storeProducts.length 
    });
    // Note: API calls no longer trigger global loader per requirements
    // We'll just set initialLoadComplete when loading is done
    if (!loading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [loading, storeCategories.length, storeProducts.length, initialLoadComplete]);

  // Transform admin categories to store format
  useEffect(() => {
    console.log('Transforming categories:', { loading, categories: categories.length, categoriesData: categories });
    if (!loading && categories.length > 0) {
      // Add "All" category as the first category
      const allCategory: StoreCategory = {
        id: 'all',
        name: 'All',
        image: '/categories/all.png' // You can create a special image for this
      };
      
      const transformedCategories = [allCategory, ...categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        image: cat.image || '/categories/default.png'
      }))];
      console.log('Setting store categories:', transformedCategories);
      setStoreCategories(transformedCategories);
      
      // Set default selected category to 'All'
      if (selectedCategory === 'All') {
        setSelectedCategory('All');
      }
    } else if (!loading && categories.length === 0) {
      // If no categories exist, at least show the "All" category
      const allCategory: StoreCategory = {
        id: 'all',
        name: 'All',
        image: '/categories/all.png'
      };
      console.log('No categories found, showing only "All" category');
      setStoreCategories([allCategory]);
    }
  }, [categories, loading, selectedCategory]);

  // Transform admin products to store format
  useEffect(() => {
    if (!loading && products.length > 0 && categories.length > 0) {
      const transformedProducts = products.map(product => {
        // Find the category name from the categories array
        const category = categories.find(cat => cat.id === product.category);
        const categoryName = category ? category.name : 'Unknown';
        
        return {
          id: product.id,
          name: product.name,
          deity: product.deity, // Use actual deity field
          categoryName: categoryName, // Populate category name from categories data
          price: product.price,
          originalPrice: product.originalPrice,
          rating: 4.5, // Default rating
          reviews: 10, // Default reviews
          image: product.images[0] || '/products/default.jpg',
          badge: product.discount > 0 ? `${product.discount}% OFF` : undefined,
          hasVariants: product.variants.length > 0,
          variants: product.variants // Pass the actual variants
        };
      });
      setStoreProducts(transformedProducts);
    }
  }, [products, loading, categories]);

  // Fallback to localStorage if context is not available (for server-side rendering)
  useEffect(() => {
    console.log('Fallback useEffect:', { loading, hasStoredData: getStoredCategories().length > 0 });
    if (loading) {
      const savedCategories = getStoredCategories();
      const savedProducts = getStoredProducts();
      
      console.log('Saved data:', { savedCategories: savedCategories.length, savedProducts: savedProducts.length });
      
      let hasData = false;
      
      if (savedCategories.length > 0) {
        // Add "All" category as the first category
        const allCategory: StoreCategory = {
          id: 'all',
          name: 'All',
          image: '/categories/all.png'
        };
        
        const transformedCategories = [allCategory, ...savedCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          image: cat.image || '/categories/default.png'
        }))];
        console.log('Setting fallback categories:', transformedCategories);
        setStoreCategories(transformedCategories);
        hasData = true;
      } else {
        // If no saved categories, at least show the "All" category
        const allCategory: StoreCategory = {
          id: 'all',
          name: 'All',
          image: '/categories/all.png'
        };
        console.log('No saved categories, showing only "All" category in fallback');
        setStoreCategories([allCategory]);
        hasData = true;
      }
      
      if (savedProducts.length > 0) {
        const transformedProducts = savedProducts.map(product => ({
          id: product.id,
          name: product.name,
          deity: product.deity, // Use actual deity field
          categoryName: product.categoryName || 'Unknown', // Use actual category name field or fallback
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
        hasData = true;
      }
      
      // If we have data from localStorage, mark initial load as complete
      if (hasData && !initialLoadComplete) {
        setInitialLoadComplete(true);
      }
    }
  }, [loading, initialLoadComplete]);

  const filteredProducts = storeProducts.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.categoryName === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.deity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort products based on selected sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low-high':
        return a.price - b.price;
      case 'price-high-low':
        return b.price - a.price;
      case 'rating-high-low':
        return b.rating - a.rating;
      case 'discount-high-low':
        const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0;
        const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0;
        return discountB - discountA;
      default: // featured
        return 0; // Keep original order for featured
    }
  });

  // Preload product images for better performance
  const productImages = storeProducts.map(product => product.image);
  const bannerImages = mockBanners.map(banner => banner.imageUrl);
  
  return (
    <>
      {/* Preload critical images */}
      <ImagePreloader images={[...bannerImages, ...productImages.slice(0, 8)]} priority={true} />
      
      <PageTransitionWrapper>
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
                Showing {sortedProducts.length} results
              </h3>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 border-gray-200 focus:border-orange-300 focus:ring-orange-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Sort by: Featured</SelectItem>
                  <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                  <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                  <SelectItem value="rating-high-low">Rating: High to Low</SelectItem>
                  <SelectItem value="discount-high-low">Discount: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Product Grid */}
            {storeProducts.length > 0 ? (
              <div className="smooth-scroll-container">
                <ProductGrid products={sortedProducts} />
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600">
                    {selectedCategory === 'All' 
                      ? 'There are no products in the store yet.' 
                      : `There are no products in the "${selectedCategory}" category yet.`
                    }
                  </p>
                  {selectedCategory !== 'All' && (
                    <button 
                      onClick={() => setSelectedCategory('All')}
                      className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                      View All Products
                    </button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </MainLayout>
      </PageTransitionWrapper>
      <SlideInCart />
    </>
  );
}