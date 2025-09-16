'use client';

import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Minus, Plus as PlusIcon, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isUserAuthenticated } from '@/lib/auth';
import { useEffect, useState } from 'react';

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
  
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [shouldSlideIn, setShouldSlideIn] = useState(false);

  // Handle component mounting
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setShouldSlideIn(false); // Start in hidden position
      
      // Use a timeout to trigger the slide-in animation after the component is mounted
      setTimeout(() => {
        setShouldSlideIn(true); // Trigger slide-in animation
      }, 10);
      
      // Prevent body scrolling when cart is open
      document.body.style.overflow = 'hidden';
    } else {
      setShouldSlideIn(false); // Start slide-out animation
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      // Restore body scrolling when cart is closed
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
    
    // Cleanup: restore body scrolling when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const formatPrice = (price: number, discount: number = 0) => {
    const discountedPrice = price - (price * discount) / 100;
    return {
      current: `₹${discountedPrice.toLocaleString()}`,
      original: discount > 0 ? `₹${price.toLocaleString()}` : null,
    };
  };

  const handleProceedToCheckout = () => {
    console.log('handleProceedToCheckout called');
    console.log('isUserAuthenticated:', isUserAuthenticated());
    
    // Check if user is authenticated first (before closing cart)
    if (!isUserAuthenticated()) {
      console.log('User not authenticated, storing redirect URL and navigating to login');
      // Store the checkout redirect URL
      sessionStorage.setItem('redirectUrl', '/checkout');
      // Close cart and navigate immediately
      closeCart();
      router.push('/auth/login');
    } else {
      console.log('User authenticated, navigating to checkout');
      // Close cart and navigate immediately
      closeCart();
      router.push('/checkout');
    }
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-transparent">
      {/* Very subtle overlay */}
      <div 
        className="fixed inset-0 transition-opacity"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        onClick={closeCart}
      />
      
      {/* Cart Panel */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-hidden ${
        shouldSlideIn ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex items-center space-x-3">
              <ShoppingBag className="h-5 w-5" style={{ color: 'rgba(156,86,26,255)' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#755e3e' }}>Your Cart</h2>
              <Badge variant="secondary" className="text-xs">{getTotalItems()} items</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={closeCart} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12" style={{ color: '#846549' }}>
                <ShoppingBag className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-base mb-1">Your cart is empty</p>
                <p className="text-sm opacity-75">Add some spiritual products to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const pricing = formatPrice(item.variant.price, item.variant.discount);
                  const itemTotal = (item.variant.price - (item.variant.price * item.variant.discount) / 100) * item.quantity;
                  
                  return (
                    <div key={item.id} className="flex space-x-3 p-3 border rounded-lg bg-white shadow-sm" style={{ borderColor: '#f3f4f6' }}>
                      {/* Product Image */}
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      
                      {/* Product Details */}
                      <div className="flex-1 space-y-1">
                        <div>
                          <h3 className="font-medium text-sm" style={{ color: '#755e3e' }}>{item.name}</h3>
                          <p className="text-xs opacity-75" style={{ color: '#846549' }}>{item.deity}</p>
                          <p className="text-xs opacity-60" style={{ color: '#846549' }}>{item.variant.label}</p>
                        </div>
                        
                        {/* Price */}
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm" style={{ color: '#755e3e' }}>
                            {pricing.current}
                          </span>
                          {pricing.original && (
                            <span className="text-xs line-through opacity-60" style={{ color: '#846549' }}>
                              {pricing.original}
                            </span>
                          )}
                          {item.variant.discount > 0 && (
                            <Badge className="bg-red-600 hover:bg-red-700 text-xs px-1 py-0">
                              {item.variant.discount}% OFF
                            </Badge>
                          )}
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium" style={{ color: '#755e3e' }}>
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <PlusIcon className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            style={{ color: '#f20600' }}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          </div>
          
          {/* Cart Footer */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-3 bg-gray-50" style={{ borderColor: '#e5e7eb' }}>
              {/* Wishlist and Clear */}
              <div className="flex justify-between items-center">
                <Button variant="ghost" size="sm" style={{ color: 'rgba(156,86,26,255)' }}>
                  <Heart className="h-3 w-3 mr-1" />
                  Save to Wishlist
                </Button>
                <Button variant="ghost" size="sm" onClick={clearCart} style={{ color: '#f20600' }}>
                  Clear Cart
                </Button>
              </div>
              
              <Separator />
              
              {/* Total */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#6b7280' }}>Subtotal</span>
                  <span style={{ color: '#755e3e' }}>₹{getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#6b7280' }}>Shipping</span>
                  <span style={{ color: 'rgba(160,82,16,255)' }}>Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span style={{ color: '#755e3e' }}>Total</span>
                  <span style={{ color: '#755e3e' }}>₹{getTotalPrice().toLocaleString()}</span>
                </div>
              </div>
              
              {/* Checkout Button */}
              <div className="space-y-2 pt-2">
                <Button 
                  className="w-full text-sm" 
                  style={{ backgroundColor: 'rgba(156,86,26,255)', color: 'white' }}
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout
                  <ArrowRight className="h-3 w-3 ml-2" />
                </Button>
                <Button variant="outline" className="w-full text-sm" style={{ borderColor: '#e5e7eb', color: '#6b7280' }} asChild>
                  <Link href="/cart">View Full Cart</Link>
                </Button>
                <Button variant="ghost" className="w-full text-sm" style={{ color: 'rgba(156,86,26,255)' }} asChild>
                  <Link href="/" onClick={closeCart}>
                    <PlusIcon className="h-3 w-3 mr-2" />
                    Add more items
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}