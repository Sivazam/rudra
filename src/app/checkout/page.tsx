'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/cartStore';
import { loadRazorpayScript, initializeRazorpay } from '@/lib/razorpay';
import { ArrowLeft, Shield, Truck, Package } from 'lucide-react';
import { MainLayout } from '@/components/store/MainLayout';
import { isUserAuthenticated, getCurrentUser } from '@/lib/auth';
import { userService } from '@/lib/services';
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
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

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

      // If authenticated, try to get user data and pre-fill shipping info
      try {
        const currentUser = getCurrentUser();
        if (currentUser) {
          console.log('Current user found:', currentUser.phoneNumber);
          
          // Try to get user addresses
          userService.getUserByPhoneNumber(currentUser.phoneNumber).then(user => {
            if (user && user.addresses && user.addresses.length > 0) {
              const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
              if (defaultAddress) {
                console.log('Pre-filling shipping address from user profile');
                setShippingAddress({
                  name: defaultAddress.name || user.name || '',
                  phone: defaultAddress.phone || user.phoneNumber || '',
                  address: defaultAddress.address,
                  city: defaultAddress.city,
                  state: defaultAddress.state,
                  pincode: defaultAddress.pincode
                });
              }
            } else if (user) {
              // User exists but no addresses, pre-fill basic info
              console.log('Pre-filling basic user info');
              setShippingAddress(prev => ({
                ...prev,
                name: user.name || prev.name,
                phone: user.phoneNumber || prev.phone
              }));
            }
          }).catch(error => {
            console.error('Error getting user addresses:', error);
          });
        }
      } catch (error) {
        console.error('Error getting current user:', error);
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

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    return Object.values(shippingAddress).every(value => value.trim() !== '');
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      alert('Please fill in all shipping details');
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
              clearCart();
              router.push('/order-success');
            } else {
              const verifyError = await verifyResponse.json();
              console.error('Payment verification failed:', verifyError);
              throw new Error('Payment verification failed: ' + (verifyError.error || 'Unknown error'));
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            setLoading(false);
          },
          onclose: () => {
            console.log('Payment modal closed');
            setLoading(false);
          }
        }
      };

      console.log('Initializing Razorpay with options:', { ...options, key: '***' });
      await initializeRazorpay(options);
    } catch (error) {
      console.error('Order creation error:', error);
      const errorMessage = (error as Error).message || 'Failed to place order. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getTotalPrice();
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
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
          {/* Shipping Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={shippingAddress.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={shippingAddress.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your complete address"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="State"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={shippingAddress.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      placeholder="Pincode"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

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
                
                <Button
                  onClick={handlePlaceOrder}
                  disabled={loading || !validateForm()}
                  className="w-full mt-6 bg-orange-600 hover:bg-orange-700"
                  size="lg"
                >
                  {loading ? 'Processing...' : `Pay ${formatPrice(total)}`}
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  By placing this order, you agree to our Terms & Conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}