'use client';

import { useState } from 'react';
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
  productImage: string;
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

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[80vh]">
        <DrawerHeader>
          <DrawerTitle>Select Variant</DrawerTitle>
          <DrawerDescription>Choose a variant for {productName}</DrawerDescription>
        </DrawerHeader>
        
        <div className="p-6 space-y-6">
          {/* Product Image */}
          <div className="flex justify-center">
            <img 
              src={productImage} 
              alt={productName}
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>
          
          {/* Variant Options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Available Variants</h3>
            <div className="space-y-3">
              {variants.map((variant) => {
                const pricing = formatPrice(variant.price, variant.discount);
                const isSelected = selectedVariant?.label === variant.label;
                
                return (
                  <div
                    key={variant.label}
                    onClick={() => setSelectedVariant(variant)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-orange-600 bg-orange-50' 
                        : 'border-gray-200 hover:border-orange-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{variant.label}</span>
                          {variant.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                          {variant.inventory === 0 && (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-lg font-bold text-orange-600">
                            {pricing.current}
                          </span>
                          {pricing.original && (
                            <span className="text-sm text-gray-500 line-through">
                              {pricing.original}
                            </span>
                          )}
                          {pricing.savings && (
                            <Badge className="bg-red-600 hover:bg-red-700">
                              {pricing.savings}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          SKU: {variant.sku} | Stock: {variant.inventory}
                        </p>
                      </div>
                      
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        isSelected 
                          ? 'border-orange-600 bg-orange-600' 
                          : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Add to Cart Button */}
          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddToCart}
              disabled={!selectedVariant}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}