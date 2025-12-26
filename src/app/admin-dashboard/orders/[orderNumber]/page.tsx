'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ArrowLeft, Package, Calendar, MapPin, Phone, Save, X, CheckCircle, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { OrderTimeline, type OrderStatus } from '@/components/orders/OrderTimeline';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

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
    image?: string;
  }>;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  orderDate: string;
  paidAt?: string;
  cancellationReason?: string;
  razorpayOrderId?: string;
}

const CANCELLATION_REASONS = [
  'Out of stock',
  'Customer request',
  'Payment issue',
  'Shipping constraint',
  'Product unavailable',
  'Pricing error',
  'Other'
];

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        console.log('Admin OrderDetail: Fetching order:', orderNumber);

        // Fetch all orders and find matching one
        const response = await fetch('/api/admin/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        const allOrders = data.orders || [];
        const foundOrder = allOrders.find((o: Order) => o.orderNumber === orderNumber);

        if (foundOrder) {
          setOrder(foundOrder);
          setStatus(foundOrder.status);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'packed': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductImage = (item: { name: string; image?: string }) => {
    if (item.image) {
      return item.image;
    }

    return '/products/10-mukhi.jpg';
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order || isUpdating) return;

    setIsUpdating(true);

    try {
      console.log('Updating order status:', order.id, 'to:', newStatus);

      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          status: newStatus,
          cancellationReason: newStatus === 'cancelled' ? (customReason ? customReason : cancellationReason) : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      const data = await response.json();
      if (data.success) {
        setStatus(newStatus);
        setShowCancelDialog(false);
        setCancellationReason('');
        setCustomReason('');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
    setCancellationReason('');
    setCustomReason('');
  };

  const handleCancelConfirm = () => {
    if (cancellationReason === 'Other' && !customReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    handleStatusUpdate('cancelled');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center justify-center">
          <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 text-sm sm:text-base">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4 text-sm">{error}</p>
            <Button onClick={() => router.push('/admin-dashboard/orders')} className="w-full sm:w-auto">
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center justify-center">
          <div className="text-center max-w-md">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-4 text-sm">The order you're looking for does not exist.</p>
            <Button onClick={() => router.push('/admin-dashboard/orders')} className="w-full sm:w-auto">
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        {/* Back button */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin-dashboard/orders')}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>

        {/* Order Header Card */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Order Number and Date */}
              <div className="flex flex-col gap-2">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                  Order #{order.orderNumber}
                </h1>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-600">
                    {formatDate(order.orderDate)}
                  </p>
                </div>
              </div>

              {/* Status Badges - Responsive Layout */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <span className="text-xs sm:text-sm text-gray-600">Payment:</span>
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    {order.paymentStatus === 'completed' ? 'Completed' :
                     order.paymentStatus === 'failed' ? 'Failed' :
                     order.paymentStatus === 'refunded' ? 'Refunded' :
                     'Pending'}
                  </Badge>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <span className="text-xs sm:text-sm text-gray-600">Order:</span>
                  <Badge className={getOrderStatusColor(status)}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                </div>

                {/* Admin Actions - Stack on mobile, row on desktop */}
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto pt-2 sm:pt-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                      <Label htmlFor="status-select" className="text-xs sm:text-sm text-gray-600">Status:</Label>
                      <Select
                        id="status-select"
                        value={status}
                        onValueChange={(newStatus: OrderStatus) => setStatus(newStatus)}
                        disabled={isUpdating || order.status === 'cancelled'}
                        className="w-full sm:w-40"
                      >
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="packed">Packed</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {status === 'cancelled' ? (
                        <span className="text-xs sm:text-sm text-gray-500">Order Cancelled</span>
                      ) : (
                        <>
                          <Button
                            onClick={() => status !== 'cancelled' && handleStatusUpdate(status)}
                            disabled={isUpdating || status === order.status || status === 'cancelled'}
                            size="sm"
                            className="w-full sm:w-auto min-h-[44px]"
                          >
                            {isUpdating ? 'Updating...' : 'Update'}
                          </Button>
                          <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleCancelClick}
                                disabled={isUpdating}
                                className="w-full sm:w-auto min-h-[44px]"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel Order
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md w-[95vw] sm:w-auto">
                              <DialogHeader>
                                <DialogTitle>Cancel Order</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to cancel order {order.orderNumber}?
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label htmlFor="cancel-reason">Reason for cancellation</Label>
                                  <Select
                                    id="cancel-reason"
                                    value={cancellationReason}
                                    onValueChange={setCancellationReason}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a reason" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {CANCELLATION_REASONS.map((reason) => (
                                        <SelectItem key={reason} value={reason}>
                                          {reason}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                {cancellationReason === 'Other' && (
                                  <div className="space-y-2">
                                    <Label htmlFor="custom-reason">Please specify</Label>
                                    <Textarea
                                      id="custom-reason"
                                      value={customReason}
                                      onChange={(e) => setCustomReason(e.target.value)}
                                      placeholder="Enter reason for cancellation..."
                                      className="resize-none"
                                      rows={3}
                                    />
                                  </div>
                                )}
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowCancelDialog(false);
                                    setCancellationReason("");
                                    setCustomReason("");
                                  }}
                                  disabled={isUpdating}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={handleCancelConfirm}
                                  disabled={!cancellationReason || (cancellationReason === "Other" && !customReason.trim()) || isUpdating}
                                >
                                  {isUpdating ? "Cancelling..." : "Cancel Order"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {order.status === 'pending' && order.paymentStatus === 'failed' && (
                  <div className="w-full sm:w-auto mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-yellow-800">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
                      Payment failed. Customer can retry payment within 7 days.
                    </p>
                  </div>
                )}
              </div>

              {order.cancellationReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <span className="font-medium">Cancellation Reason:</span> {order.cancellationReason}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Responsive Layout - Stack everything on mobile, grid on desktop */}
        <div className="space-y-4 sm:space-y-6">
          {/* Mobile: Vertical stack, Desktop: 2-column grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Order Progress Timeline - Always full width on mobile, half on desktop */}
            <div className="xl:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Order Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderTimeline status={status} />
                </CardContent>
              </Card>
            </div>

            {/* Order Items - Always full width on mobile, half on desktop */}
            <div className="xl:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Order Items ({order.items.length})</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-2 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 sm:gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0">
                          <OptimizedImage
                            src={getProductImage(item)}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-md"
                            width={96}
                            height={96}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-xs sm:text-sm truncate mb-1">{item.name}</h3>
                          <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-600">
                            <span>Qty: {item.quantity}</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-xs sm:text-sm">{formatPrice(item.price)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-center flex-shrink-0">
                          {item.discount > 0 && (
                            <p className="text-xs text-gray-400 line-through">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          )}
                          <p className="font-semibold text-xs sm:text-sm text-green-700">{formatPrice(item.totalPrice)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary - Full width mobile */}
            <div className="xl:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
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
                    <div className="flex justify-between font-semibold text-sm sm:text-base">
                      <span>Total</span>
                      <span style={{ color: '#A36922' }}>
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  {order.paidAt && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <span>
                          Paid on {formatDate(order.paidAt)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Customer Information - Full width mobile */}
            <div className="xl:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2">
                      <Package className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="font-medium text-sm break-words">{order.customerInfo.name}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{order.customerInfo.phone}</span>
                    </div>
                    <div className="text-sm text-gray-600 break-words">{order.customerInfo.email}</div>
                    <div className="text-sm text-gray-600 break-words">{order.customerInfo.address}</div>
                    <div className="text-sm text-gray-600">
                      {order.customerInfo.city}, {order.customerInfo.state} {order.customerInfo.pincode}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
