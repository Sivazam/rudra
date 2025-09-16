'use client';

import { useState } from 'react';
import { Heart, Star, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCartStore } from '@/store/cartStore';
import { VariantSelector } from './VariantSelector';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

  // Check if this product is already in cart - sum quantities of ALL variants
  const cartItemsForProduct = items.filter(item => item.productId === product.id);
  const totalQuantityInCart = cartItemsForProduct.reduce((sum, item) => sum + item.quantity, 0);
  
  // For increment/decrement operations, we still need the specific cart item
  const cartItem = cartItemsForProduct[0]; // Get first item for increment operations
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    // Check if product has multiple variants
    const variants = product.hasVariants === false ? [getDefaultVariant(product)] : getMockVariants(product.id);
    const availableVariants = variants.filter(v => v.inventory > 0);
    
    if (availableVariants.length === 1) {
      // If only one variant available, add it directly to cart
      handleVariantSelect(availableVariants[0]);
    } else if (availableVariants.length > 1) {
      // If multiple variants available, show variant selector
      setShowVariantSelector(true);
    } else {
      // No variants available, show error or handle accordingly
      // For now, we'll still show the variant selector to display the out of stock state
      setShowVariantSelector(true);
    }
  };

  const handleVariantSelect = (variant: any) => {
    setIsAdding(true);
    
    // Simulate API call
    setTimeout(() => {
      addItem({
        productId: product.id,
        variantId: variant.sku,
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
      
      // Open cart after adding item
      useCartStore.getState().openCart();
      
      toast({
        title: "Added to cart",
        description: `${product.name} added to cart`,
      });
    }, 500);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > totalQuantityInCart) {
      // This is an increment operation
      const mockVariants = product.hasVariants === false ? [getDefaultVariant(product)] : getMockVariants(product.id);
      if (mockVariants.length > 1) {
        // If multiple variants exist, show dialog to choose
        setShowRepeatDialog(true);
      } else {
        // If only one variant, just increment the first item's quantity
        if (cartItem) {
          useCartStore.getState().updateQuantity(cartItem.id, newQuantity);
          
          // Open cart after updating quantity
          useCartStore.getState().openCart();
          
          toast({
            title: "Quantity updated",
            description: `${product.name} quantity increased to ${newQuantity}`,
          });
        }
      }
    } else if (newQuantity > 0) {
      // This is a decrement operation - find the most recent cart item and decrement it
      if (cartItemsForProduct.length > 0) {
        // Get the most recently added item (last in array)
        const mostRecentItem = cartItemsForProduct[cartItemsForProduct.length - 1];
        if (mostRecentItem.quantity > 1) {
          // Decrement the quantity
          useCartStore.getState().updateQuantity(mostRecentItem.id, mostRecentItem.quantity - 1);
          toast({
            title: "Quantity updated",
            description: `${product.name} quantity decreased to ${mostRecentItem.quantity - 1}`,
          });
        } else {
          // Remove the item if quantity would be 0
          useCartStore.getState().removeItem(mostRecentItem.id);
          toast({
            title: "Item removed",
            description: `${product.name} removed from cart`,
          });
        }
      }
    } else if (newQuantity === 0) {
      // Remove the item when quantity reaches 0
      if (cartItemsForProduct.length > 0) {
        // Get the most recently added item (last in array)
        const mostRecentItem = cartItemsForProduct[cartItemsForProduct.length - 1];
        useCartStore.getState().removeItem(mostRecentItem.id);
        toast({
          title: "Item removed",
          description: `${product.name} removed from cart`,
        });
      }
    }
  };

  const handleRepeat = () => {
    // Simply increment the first item's quantity (standard ecommerce behavior)
    if (cartItem) {
      useCartStore.getState().updateQuantity(cartItem.id, cartItem.quantity + 1);
      setShowRepeatDialog(false);
      
      // Open cart after updating quantity
      useCartStore.getState().openCart();
      
      toast({
        title: "Quantity updated",
        description: `${product.name} quantity increased to ${cartItem.quantity + 1}`,
      });
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
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full" style={{ border: `1px solid #846549` }}>
        {/* Product Image - Fixed height */}
        <div className="relative aspect-square overflow-hidden flex-shrink-0">
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
        
        {/* Product Info - Flexible content area */}
        <div className="p-4 space-y-2 flex flex-col flex-1">
          {/* Deity */}
          <p className="text-sm font-medium" style={{ color: '#846549' }}>{product.deity}</p>
          
          {/* Product Name - Flexible but with max lines */}
          <Link href={`/products/${product.id}`} className="flex-1">
            <div className="flex items-center justify-between h-full">
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
          
          {/* Rating - Fixed height */}
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
          
          {/* Price - Fixed height */}
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
          
          {/* Add to Cart Button OR Counter - Fixed height */}
          <div className="mt-auto pt-2">
            {totalQuantityInCart === 0 ? (
              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full h-10"
                variant="outline"
                style={{ borderColor: '#846549', color: '#846549' }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isAdding ? 'Adding...' : 'ADD TO CART'}
              </Button>
            ) : (
              <div className="flex items-center justify-center space-x-2 h-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  style={{ borderColor: '#846549', color: '#846549' }}
                  onClick={() => handleQuantityChange(totalQuantityInCart - 1)}
                  disabled={totalQuantityInCart <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium" style={{ color: '#755e3e' }}>{totalQuantityInCart}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  style={{ borderColor: '#846549', color: '#846549' }}
                  onClick={() => handleQuantityChange(totalQuantityInCart + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
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
        <DialogContent className="sm:max-w-[425px] max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:rounded-t-lg max-sm:max-w-none max-sm:translate-y-0 max-sm:h-auto max-sm:p-6">
          <DialogHeader className="max-sm:text-center max-sm:mb-4">
            <DialogTitle className="max-sm:text-lg max-sm:mb-2">Choose an option</DialogTitle>
            <DialogDescription className="max-sm:text-sm max-sm:px-4">
              Would you like to add more of the same variant or select a different variant?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 max-sm:gap-2 max-sm:w-full">
            <Button 
              onClick={handleSelectDifferentVariant} 
              variant="outline" 
              className="sm:flex-1 max-sm:w-full max-sm:order-2" 
              style={{ borderColor: '#846549', color: '#846549' }}
            >
              Select Different Variant
            </Button>
            <Button 
              onClick={handleRepeat} 
              className="sm:flex-1 max-sm:w-full max-sm:order-1" 
              style={{ backgroundColor: 'rgba(156,86,26,255)', color: 'white' }}
            >
              Add Same Variant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}