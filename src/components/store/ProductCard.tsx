'use client';

import { useState } from 'react';
import { Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart';
import Link from 'next/link';

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
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    // Add item to cart
    addItem({
      productId: product.id,
      variantId: product.id, // Using product ID as variant ID for now
      name: product.name,
      variantLabel: 'Regular', // Default variant
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      quantity: 1,
      sku: `${product.id}-REG`
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsAdding(false);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // Here you would add to wishlist state/context
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Badge */}
        {product.badge && (
          <Badge className="absolute top-2 left-2 bg-orange-600 hover:bg-orange-700">
            {product.badge}
          </Badge>
        )}
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <Badge className="absolute top-2 right-2 bg-red-600 hover:bg-red-700">
            {discountPercentage}% OFF
          </Badge>
        )}
        
        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-12 bg-white/80 hover:bg-white"
          onClick={toggleWishlist}
        >
          <Heart 
            className={`h-4 w-4 ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </Button>
      </div>
      
      {/* Product Info */}
      <div className="p-4 space-y-2">
        {/* Deity */}
        <p className="text-sm text-gray-600 font-medium">{product.deity}</p>
        
        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating */}
        <div className="flex items-center space-x-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.rating} ({product.reviews})
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-orange-600">
            ₹{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white mt-3"
        >
          {isAdding ? 'Adding...' : 'ADD'}
        </Button>
      </div>
    </div>
  );
}