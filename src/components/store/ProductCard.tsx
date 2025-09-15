'use client';

import { useState } from 'react';
import { Heart, Star, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const [showRepeatDialog, setShowRepeatDialog] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const { items, addItem, updateQuantity } = useCartStore();

  // Check if this product is already in cart - sum quantities of ALL variants
  const cartItemsForProduct = items.filter(item => item.productId === product.id);
  const totalQuantityInCart = cartItemsForProduct.reduce((sum, item) => sum + item.quantity, 0);
  
  // For increment/decrement operations, we still need the specific cart item
  const cartItem = cartItemsForProduct[0]; // Get first item for increment operations
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    // Always show variant selector for all products
    setShowVariantSelector(true);
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
      setShowVariantSelector(false);
    }, 500);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (cartItem) {
      if (newQuantity > quantityInCart) {
        // This is an increment operation
        setShowRepeatDialog(true);
      } else {
        // This is a decrement operation, just update the first item's quantity
        updateQuantity(cartItem.id, newQuantity);
      }
    }
  };

  const handleRepeat = () => {
    if (cartItem) {
      updateQuantity(cartItem.id, quantityInCart + 1);
      setShowRepeatDialog(false);
    }
  };

  const handleSelectDifferentVariant = () => {
    setShowRepeatDialog(false);
    setShowVariantSelector(true);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group" style={{ border: `1px solid #846549` }}>
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
            <Badge className="absolute top-2 left-2" style={{ backgroundColor: 'rgba(156,86,26,255)', color: 'white' }}>
              {product.badge}
            </Badge>
          )}
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <Badge className="absolute top-2 right-2 bg-red-600 hover:bg-red-700">
              {discountPercentage}% OFF
            </Badge>
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-4 space-y-2">
          {/* Deity */}
          <p className="text-sm font-medium" style={{ color: '#846549' }}>{product.deity}</p>
          
          {/* Product Name */}
          <Link href={`/products/${product.id}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold line-clamp-2 hover:opacity-80 transition-colors flex-1" style={{ color: '#755e3e' }}>
                {product.name}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 hover:bg-white/20 flex-shrink-0 ml-2"
                onClick={toggleWishlist}
              >
                <Heart 
                  className={`h-4 w-4 ${
                    isWishlisted ? 'fill-current' : ''
                  }`}
                  style={{ color: isWishlisted ? '#f20600' : '#846549' }}
                />
              </Button>
            </div>
          </Link>
          
          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? 'fill-current'
                      : 'text-gray-300'
                  }`}
                  style={{ color: i < Math.floor(product.rating) ? 'rgba(160,82,16,255)' : undefined }}
                />
              ))}
            </div>
            <span className="text-sm" style={{ color: '#846549' }}>
              {product.rating} ({product.reviews})
            </span>
          </div>
          
          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold" style={{ color: '#755e3e' }}>
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-sm line-through" style={{ color: '#846549' }}>
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Add to Cart Button or Counter */}
          {totalQuantityInCart === 0 ? (
            <Button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full mt-3"
              variant="outline"
              style={{ borderColor: '#846549', color: '#846549' }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isAdding ? 'Adding...' : 'ADD TO CART'}
            </Button>
          ) : (
            <div className="flex items-center justify-center space-x-2 mt-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                style={{ borderColor: '#846549', color: '#846549' }}
                onClick={() => handleQuantityChange(quantityInCart - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium" style={{ color: '#755e3e' }}>{totalQuantityInCart}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                style={{ borderColor: '#846549', color: '#846549' }}
                onClick={() => handleQuantityChange(quantityInCart + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Variant Selector Modal - Show for all products */}
      <VariantSelector
        isOpen={showVariantSelector}
        onClose={() => setShowVariantSelector(false)}
        variants={product.hasVariants === false ? [getDefaultVariant(product)] : getMockVariants(product.id)}
        productName={product.name}
        onVariantSelect={handleVariantSelect}
      />

      {/* Repeat or Select Different Variant Dialog */}
      <Dialog open={showRepeatDialog} onOpenChange={setShowRepeatDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose an option</DialogTitle>
            <DialogDescription>
              You already have this item in your cart. Would you like to add more of the same variant or select a different variant?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowRepeatDialog(false)} style={{ borderColor: '#846549', color: '#846549' }}>
              Cancel
            </Button>
            <Button onClick={handleSelectDifferentVariant} variant="outline" style={{ borderColor: '#846549', color: '#846549' }}>
              Select Different Variant
            </Button>
            <Button onClick={handleRepeat} style={{ backgroundColor: 'rgba(156,86,26,255)', color: 'white' }}>
              Add Same Variant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}