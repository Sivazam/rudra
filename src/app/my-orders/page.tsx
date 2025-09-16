'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { userService } from '@/lib/services';
import { AppLayout } from '@/components/layout/AppLayout';
import { isUserAuthenticated, getCurrentUser } from '@/lib/auth';
import { getUserIdentifier, standardizeUserId } from '@/lib/userUtils';

interface Order {
  id: string;
  orderNumber: string;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    discount: number;
    totalPrice: number;
  }>;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'processing' | 'shipped' | 'delivered';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  orderDate: string;
  paidAt?: string;
}

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log('MyOrders: Starting to fetch orders...');
        
        // Check if user is authenticated using our auth utility
        const isAuthenticated = isUserAuthenticated();
        console.log('MyOrders: Authentication status:', isAuthenticated);
        
        if (!isAuthenticated) {
          console.log('MyOrders: User not authenticated, redirecting to login');
          router.push('/auth/login');
          return;
        }

        // Get current user using our auth utility
        const currentUser = getCurrentUser();
        console.log('MyOrders: Current user:', currentUser);
        
        if (!currentUser) {
          console.log('MyOrders: No current user found, redirecting to login');
          router.push('/auth/login');
          return;
        }

        // Get standardized user identifier
        const userIdentifier = getUserIdentifier(currentUser);
        const standardizedUserId = standardizeUserId(userIdentifier.userId);
        
        console.log('MyOrders: Fetching orders for user:', currentUser.phoneNumber, 'standardizedUserId:', standardizedUserId);
        
        // Get user with orders using the improved service
        const userWithOrders = await userService.getUserWithOrders(standardizedUserId);
        
        console.log('MyOrders: User with orders result:', userWithOrders);
        console.log('MyOrders: User phone number:', currentUser.phoneNumber);
        console.log('MyOrders: Standardized userId:', standardizedUserId);
        
        if (userWithOrders) {
          console.log('MyOrders: User found, checking orders...');
          if (userWithOrders.orders && Array.isArray(userWithOrders.orders)) {
            console.log('MyOrders: Found orders array with length:', userWithOrders.orders.length);
            setOrders(userWithOrders.orders);
          } else {
            console.log('MyOrders: No orders array found or orders is not an array, trying direct query');
            // Fallback: try to get orders directly by userId
            try {
              const { orderService } = await import('@/lib/services');
              const directOrders = await orderService.getOrdersByUserId(standardizedUserId);
              console.log('MyOrders: Direct query found orders:', directOrders.length);
              setOrders(directOrders);
            } catch (directError) {
              console.error('MyOrders: Direct query failed:', directError);
              setOrders([]);
            }
          }
        } else {
          console.log('MyOrders: No user found, trying direct query');
          // Fallback: try to get orders directly by userId
          try {
            const { orderService } = await import('@/lib/services');
            const directOrders = await orderService.getOrdersByUserId(standardizedUserId);
            console.log('MyOrders: Direct query found orders:', directOrders.length);
            setOrders(directOrders);
          } catch (directError) {
            console.error('MyOrders: Direct query failed:', directError);
            setOrders([]);
          }
        }
      } catch (error) {
        console.error('MyOrders: Error fetching orders:', error);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state change listener
    const handleAuthStateChange = () => {
      console.log('MyOrders: Auth state change event received');
      fetchOrders();
    };

    window.addEventListener('auth-state-changed', handleAuthStateChange);
    
    // Initial fetch
    fetchOrders();

    // Cleanup
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
    };
  }, [router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'paid':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
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
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track your spiritual product orders</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
                <Link href="/">
                  <Button style={{ backgroundColor: 'rgba(156,86,26,255)', color: 'white' }}>
                    Start Shopping
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                      <p className="text-sm text-gray-600">{formatDate(order.orderDate)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm">{formatPrice(item.totalPrice)}</p>
                              {item.discount > 0 && (
                                <p className="text-xs text-gray-500 line-through">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                      <h4 className="font-semibold mb-3">Order Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Shipping</span>
                          <span>{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span className="text-lg">{formatPrice(order.total)}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-semibold mb-3">Shipping Address</h4>
                        <div className="text-sm text-gray-600">
                          <p>{order.customerInfo.name}</p>
                          <p>{order.customerInfo.phone}</p>
                          <p>{order.customerInfo.address}</p>
                          <p>{order.customerInfo.city}, {order.customerInfo.state} {order.customerInfo.pincode}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between items-center pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Payment:</span>
                      <Badge className={order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </Badge>
                    </div>
                    {order.paidAt && (
                      <p className="text-sm text-gray-600">
                        Paid on {formatDate(order.paidAt)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}