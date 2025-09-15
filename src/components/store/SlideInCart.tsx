'use client';

import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Minus, Plus, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function SlideInCart() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeItem, 
    getTotalItems, 
    getTotalPrice,
    clearCart 
  } = useCartStore();

  const formatPrice = (price: number, discount: number = 0) => {
    const discountedPrice = price - (price * discount) / 100;
    return {
      current: `₹${discountedPrice.toLocaleString()}`,
      original: discount > 0 ? `₹${price.toLocaleString()}` : null,
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeCart}
      />
      
      {/* Cart Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#846549' }}>
            <div className="flex items-center space-x-3">
              <ShoppingBag className="h-6 w-6" style={{ color: 'rgba(156,86,26,255)' }} />
              <h2 className="text-xl font-semibold" style={{ color: '#755e3e' }}>Your Cart</h2>
              <Badge variant="secondary">{getTotalItems()} items</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={closeCart}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full" style={{ color: '#846549' }}>
                <ShoppingBag className="h-16 w-16 mb-4" />
                <p className="text-lg mb-2">Your cart is empty</p>
                <p className="text-sm">Add some spiritual products to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const pricing = formatPrice(item.variant.price, item.variant.discount);
                  const itemTotal = (item.variant.price - (item.variant.price * item.variant.discount) / 100) * item.quantity;
                  
                  return (
                    <div key={item.id} className="flex space-x-4 p-4 border rounded-lg" style={{ borderColor: '#846549' }}>
                      {/* Product Image */}
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      {/* Product Details */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-medium text-sm" style={{ color: '#755e3e' }}>{item.name}</h3>
                          <p className="text-xs" style={{ color: '#846549' }}>{item.deity}</p>
                          <p className="text-xs" style={{ color: '#846549' }}>{item.variant.label}</p>
                        </div>
                        
                        {/* Price */}
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm" style={{ color: '#755e3e' }}>
                            {pricing.current}
                          </span>
                          {pricing.original && (
                            <span className="text-xs line-through" style={{ color: '#846549' }}>
                              {pricing.original}
                            </span>
                          )}
                          {item.variant.discount > 0 && (
                            <Badge className="bg-red-600 hover:bg-red-700 text-xs">
                              {item.variant.discount}% OFF
                            </Badge>
                          )}
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              style={{ borderColor: '#846549', color: '#846549' }}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium" style={{ color: '#755e3e' }}>
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              style={{ borderColor: '#846549', color: '#846549' }}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            style={{ color: '#f20600' }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Cart Footer */}
          {items.length > 0 && (
            <div className="border-t p-6 space-y-4" style={{ borderColor: '#846549' }}>
              {/* Wishlist and Clear */}
              <div className="flex justify-between items-center">
                <Button variant="ghost" style={{ color: 'rgba(156,86,26,255)' }}>
                  <Heart className="h-4 w-4 mr-2" />
                  Save to Wishlist
                </Button>
                <Button variant="ghost" onClick={clearCart} style={{ color: '#f20600' }}>
                  Clear Cart
                </Button>
              </div>
              
              <Separator />
              
              {/* Total */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#846549' }}>Subtotal</span>
                  <span style={{ color: '#755e3e' }}>₹{getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#846549' }}>Shipping</span>
                  <span style={{ color: 'rgba(160,82,16,255)' }}>Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span style={{ color: '#755e3e' }}>Total</span>
                  <span style={{ color: '#755e3e' }}>₹{getTotalPrice().toLocaleString()}</span>
                </div>
              </div>
              
              {/* Checkout Button */}
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  style={{ backgroundColor: 'rgba(156,86,26,255)', color: 'white' }}
                  asChild
                >
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" style={{ borderColor: '#846549', color: '#846549' }} asChild>
                  <Link href="/cart">View Full Cart</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}