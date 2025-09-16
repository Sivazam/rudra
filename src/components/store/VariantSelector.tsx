'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';

interface Variant {
  label: string;
  price: number;
  sku: string;
  discount: number;
  inventory: number;
  isDefault?: boolean;
}

interface VariantSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  variants: Variant[];
  productName: string;
  productImage?: string;
  onVariantSelect: (variant: Variant) => void;
}

export function VariantSelector({ 
  isOpen, 
  onClose, 
  variants, 
  productName, 
  productImage,
  onVariantSelect 
}: VariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  const handleAddToCart = () => {
    if (selectedVariant) {
      onVariantSelect(selectedVariant);
      onClose();
      setSelectedVariant(null);
    }
  };

  const formatPrice = (price: number, discount: number = 0) => {
    const discountedPrice = price - (price * discount) / 100;
    return {
      current: `₹${discountedPrice.toLocaleString()}`,
      original: discount > 0 ? `₹${price.toLocaleString()}` : null,
      savings: discount > 0 ? `${discount}% OFF` : null
    };
  };

  // Auto-select first available variant when drawer opens
  useEffect(() => {
    if (isOpen && variants.length > 0) {
      const availableVariants = variants.filter(v => v.inventory > 0);
      if (availableVariants.length > 0 && !selectedVariant) {
        setSelectedVariant(availableVariants[0]);
      }
    }
  }, [isOpen, variants, selectedVariant]);

  const availableVariants = variants.filter(v => v.inventory > 0);
  const hasAvailableVariants = availableVariants.length > 0;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[70vh] max-h-[70vh]">
        <DrawerHeader className="pb-4">
          <DrawerTitle>Select Variant</DrawerTitle>
          <DrawerDescription>Choose a variant for {productName}</DrawerDescription>
        </DrawerHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Product Image */}
          {productImage && (
            <div className="px-6 py-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={productImage}
                  alt={productName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          
          {/* Variant Options */}
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Available Variants</h3>
              
              {!hasAvailableVariants ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No variants available for this product.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {variants.map((variant) => {
                    const pricing = formatPrice(variant.price, variant.discount);
                    const isSelected = selectedVariant?.label === variant.label;
                    const isOutOfStock = variant.inventory === 0;
                    
                    return (
                      <div
                        key={variant.label}
                        onClick={() => !isOutOfStock && setSelectedVariant(variant)}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all min-h-[80px] ${
                          isSelected 
                            ? 'border-orange-600 bg-orange-50' 
                            : isOutOfStock
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-orange-400'
                        }`}
                        style={{
                          borderColor: isSelected ? 'rgba(156,86,26,255)' : isOutOfStock ? '#d1d5db' : '#d1d5db',
                          backgroundColor: isSelected ? '#fef3c7' : isOutOfStock ? '#f9fafb' : 'white'
                        }}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`font-medium text-xs ${isOutOfStock ? 'text-gray-400' : ''}`} style={{ color: isOutOfStock ? '#9ca3af' : '#755e3e' }}>
                              {variant.label}
                            </span>
                            <div className="flex space-x-1">
                              {variant.isDefault && (
                                <Badge variant="secondary" className="text-xs px-1 py-0">Default</Badge>
                              )}
                              {isOutOfStock && (
                                <Badge variant="destructive" className="text-xs px-1 py-0">Out of Stock</Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-bold ${isOutOfStock ? 'text-gray-400' : ''}`} style={{ color: isOutOfStock ? '#9ca3af' : '#755e3e' }}>
                              {pricing.current}
                            </span>
                            <div className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{
                              borderColor: isSelected ? 'rgba(156,86,26,255)' : isOutOfStock ? '#d1d5db' : '#d1d5db',
                              backgroundColor: isSelected ? 'rgba(156,86,26,255)' : isOutOfStock ? '#e5e7eb' : 'white'
                            }}>
                              {isSelected && (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {pricing.original && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 line-through">
                                {pricing.original}
                              </span>
                              {pricing.savings && (
                                <Badge className="bg-red-600 hover:bg-red-700 text-xs px-1 py-0">
                                  {pricing.savings}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <p className="text-xs" style={{ color: '#846549' }}>
                            SKU: {variant.sku} | Stock: {variant.inventory}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Add to Cart Button - Fixed at bottom */}
          <div className="border-t bg-white px-6 py-4">
            <Button 
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.inventory === 0}
              className="w-full"
              style={{ backgroundColor: 'rgba(156,86,26,255)', color: 'white' }}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}