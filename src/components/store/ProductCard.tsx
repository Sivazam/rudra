'use client';

import { useState } from 'react';
import { Heart, Star, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cartStore';
import { VariantSelector } from './VariantSelector';
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
  hasVariants?: boolean;
}

interface ProductCardProps {
  product: Product;
}

// Mock variants for each product
const getMockVariants = (productId: string) => [
  { label: 'Regular', price: 1499, sku: `REG-${productId}`, discount: 0, inventory: 50, isDefault: true },
  { label: 'Medium', price: 2499, sku: `MED-${productId}`, discount: 10, inventory: 30 },
  { label: 'Ultra', price: 3999, sku: `ULT-${productId}`, discount: 15, inventory: 15 },
  { label: 'Rare', price: 5999, sku: `RAR-${productId}`, discount: 20, inventory: 5 },
];

// Default variant for products without variants
const getDefaultVariant = (product: Product) => ({
  label: 'Default',
  price: product.price,
  sku: `DEF-${product.id}`,
  discount: 0,
  inventory: 100,
  isDefault: true
});

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const { items, addItem, updateQuantity } = useCartStore();

  // Check if this product is already in cart
  const cartItem = items.find(item => item.productId === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (product.hasVariants === false) {
      // Direct add to cart for products without variants
      setIsAdding(true);
      setTimeout(() => {
        addItem({
          productId: product.id,
          name: product.name,
          deity: product.deity,
          image: product.image,
          variant: getDefaultVariant(product)
        });
        setIsAdding(false);
      }, 500);
    } else {
      // Show variant selector for products with variants
      setShowVariantSelector(true);
    }
  };

  const handleVariantSelect = (variant: any) => {
    setIsAdding(true);
    
    // Simulate API call
    setTimeout(() => {
      addItem({
        productId: product.id,
        name: product.name,
        deity: product.deity,
        image: product.image,
        variant: {
          label: variant.label,
          price: variant.price,
          sku: variant.sku,
          discount: variant.discount
        }
      });
      setIsAdding(false);
    }, 500);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (cartItem) {
      updateQuantity(cartItem.id, newQuantity);
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <>
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
          
          {/* Add to Cart Button or Counter */}
          {quantityInCart === 0 ? (
            <Button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white mt-3"
            >
              {isAdding ? 'Adding...' : (product.hasVariants === false ? 'ADD TO CART' : 'SELECT VARIANT')}
            </Button>
          ) : (
            <div className="flex items-center justify-center space-x-2 mt-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(quantityInCart - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantityInCart}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(quantityInCart + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Variant Selector Modal - Only show for products with variants */}
      {product.hasVariants !== false && (
        <VariantSelector
          isOpen={showVariantSelector}
          onClose={() => setShowVariantSelector(false)}
          variants={getMockVariants(product.id)}
          productName={product.name}
          onVariantSelect={handleVariantSelect}
        />
      )}
    </>
  );
}