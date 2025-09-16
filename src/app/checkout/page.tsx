'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/cartStore';
import { loadRazorpayScript, initializeRazorpay } from '@/lib/razorpay';
import { ArrowLeft, Shield, Package } from 'lucide-react';
import { MainLayout } from '@/components/store/MainLayout';
import { AddressSelection } from '@/components/checkout/AddressSelection';
import { PaymentLoadingOverlay } from '@/components/ui/PaymentLoadingOverlay';
import { isUserAuthenticated, getCurrentUser } from '@/lib/auth';
import Link from 'next/link';

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showPaymentOverlay, setShowPaymentOverlay] = useState(false);

  useEffect(() => {
    loadRazorpayScript().then(setRazorpayLoaded);
    
    // Function to check authentication
    const checkAuth = () => {
      const authStatus = isUserAuthenticated();
      console.log('Checkout auth status:', authStatus);
      setIsAuthenticated(authStatus);
      
      // If not authenticated, redirect to login
      if (!authStatus) {
        console.log('User not authenticated, redirecting to login');
        // Store current URL to redirect back after login
        sessionStorage.setItem('redirectUrl', '/checkout');
        router.push('/auth/login');
        return;
      }
    };
    
    // Check authentication immediately
    checkAuth();
    
    // Set up an event listener for storage changes to detect auth state changes
    const handleStorageChange = () => {
      checkAuth();
    };
    
    const handleAuthStateChange = () => {
      console.log('Auth state change event received in checkout');
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-state-changed', handleAuthStateChange);
    
    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
    };
  }, [router]);

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-4">Add some products to checkout</p>
            <Button onClick={() => router.push('/')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show loading state while checking authentication
  if (!isAuthenticated && typeof window !== 'undefined') {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddressSelect = (address: ShippingAddress) => {
    console.log('Address selected:', address);
    setShippingAddress(address);
  };

  const validateForm = (): boolean => {
    if (!shippingAddress) return false;
    return Object.values(shippingAddress).every(value => {
      if (value === undefined || value === null) return false;
      return value.toString().trim() !== '';
    });
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      alert('Please select or add a shipping address');
      return;
    }

    if (!razorpayLoaded) {
      alert('Payment system is loading. Please wait...');
      return;
    }

    setLoading(true);

    try {
      console.log('Starting order creation process...');
      console.log('Shipping address:', shippingAddress);
      console.log('Cart items:', items);

      // Validate shipping address before sending
      if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.address) {
        console.error('Invalid shipping address:', shippingAddress);
        throw new Error('Please select a valid shipping address');
      }

      console.log('Sending shipping address to API:', shippingAddress);

      // Create Razorpay order
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          shippingAddress,
          customerInfo: {
            email: '', // Optional field
            phone: shippingAddress.phone
          }
        }),
      });

      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        const errorMessage = errorData.details || errorData.error || 'Failed to create order';
        throw new Error(errorMessage);
      }

      const apiResponse = await response.json();
      console.log('API Response:', apiResponse);
      
      if (!apiResponse.success) {
        console.error('API Error:', apiResponse);
        const errorMessage = apiResponse.details || apiResponse.error || 'Failed to create order';
        throw new Error(errorMessage);
      }

      const { orderId, amount, currency, keyId } = apiResponse.data;

      console.log('Razorpay order created:', { orderId, amount, currency, keyId });

      // Initialize Razorpay payment
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'Rudra Store',
        description: 'Purchase of Spiritual Products',
        order_id: orderId,
        prefill: {
          name: shippingAddress.name,
          contact: shippingAddress.phone,
        },
        theme: {
          color: '#A36922',
        },
        handler: async (response: any) => {
          try {
            console.log('Payment successful:', response);
            
            // Show loading state immediately
            setLoading(true);
            setPaymentProcessing(true);
            setShowPaymentOverlay(true);
            
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            console.log('Payment verification response status:', verifyResponse.status);

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              console.log('Payment verified:', verifyData);
              
              // Set sessionStorage flag before redirecting
              sessionStorage.setItem('fromCheckout', 'true');
              
              clearCart();
              
              // Add a small delay to ensure the loading overlay is visible
              setTimeout(() => {
                router.push('/order-success');
              }, 1500);
            } else {
              const verifyError = await verifyResponse.json();
              console.error('Payment verification failed:', verifyError);
              setPaymentProcessing(false);
              setShowPaymentOverlay(false);
              setLoading(false);
              throw new Error('Payment verification failed: ' + (verifyError.error || 'Unknown error'));
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setPaymentProcessing(false);
            setShowPaymentOverlay(false);
            setLoading(false);
            alert('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            setPaymentProcessing(false);
            setShowPaymentOverlay(false);
            setLoading(false);
          },
          onclose: () => {
            console.log('Payment modal closed');
            setPaymentProcessing(false);
            setShowPaymentOverlay(false);
            setLoading(false);
          }
        },
        "callback_url": undefined // Prevent automatic redirect
      };

      console.log('Initializing Razorpay with options:', { ...options, key: '***' });
      await initializeRazorpay(options);
    } catch (error) {
      console.error('Order creation error:', error);
      const errorMessage = (error as Error).message || 'Failed to place order. Please try again.';
      
      // Show more user-friendly error messages
      if (errorMessage.includes('Razorpay')) {
        alert('Payment service error: ' + errorMessage + '. Please try again later.');
      } else if (errorMessage.includes('address')) {
        alert('Address error: ' + errorMessage + '. Please select a valid address.');
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getTotalPrice();
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Address Selection */}
          <div className="space-y-6">
            <AddressSelection 
              onAddressSelect={handleAddressSelect}
              selectedAddress={shippingAddress || undefined}
            />

            {/* Security Badge */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Secure Payment</p>
                    <p className="text-sm text-green-600">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {items.map((item) => {
                    const itemPrice = item.variant.price - (item.variant.price * item.variant.discount) / 100;
                    const itemTotal = itemPrice * item.quantity;
                    
                    return (
                      <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-500">{item.variant.label}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm font-semibold text-orange-600">
                              {formatPrice(itemPrice)} × {item.quantity}
                            </span>
                            <span className="text-sm font-medium">
                              {formatPrice(itemTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-orange-600">{formatPrice(total)}</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  By placing this order, you agree to our Terms & Conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fixed Bottom Payment Button for All Devices */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-lg font-bold text-orange-600">{formatPrice(total)}</p>
              </div>
              <Button
                onClick={handlePlaceOrder}
                disabled={loading || !validateForm()}
                className="bg-orange-600 hover:bg-orange-700 px-8 py-3"
                size="lg"
              >
                {loading ? 'Processing...' : `Pay ${formatPrice(total)}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Processing Overlay */}
      <PaymentLoadingOverlay 
        isVisible={showPaymentOverlay} 
        message={paymentProcessing ? 'Processing your payment and creating your order...' : 'Finalizing your order...'}
      />
    </MainLayout>
  );
}