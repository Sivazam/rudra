'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Clock, CheckCircle, TrendingUp, Search, FileText, ArrowLeft, Edit, X, Plus, Play, Truck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OrderItem {
  productId?: string;
  variantId?: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  totalPrice: number;
  image?: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  id?: string;
  userId: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  orderNumber?: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  orderDate: string;
  paidAt?: string;
  createdAt?: any;
  updatedAt?: any;
  cancellationReason?: string;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
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

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [orderStatusToEdit, setOrderStatusToEdit] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    if (orders.length > 0) {
      calculateStats();
    }
  }, [orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders...');

      const response = await fetch(`/api/admin/orders?page=${currentPage}&limit=10`);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setOrders(data.orders);
        setTotalPages(data.pagination.pages);
        console.log('Orders loaded:', data.orders.length);
      } else {
        setError(data.error || 'Failed to fetch orders');
        console.log('Error in response:', data.error);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const newStats = orders.reduce((acc, order) => {
      acc.totalOrders++;
      if (order.status === 'pending') acc.pendingOrders++;
      if (order.status === 'delivered' || order.paymentStatus === 'completed') acc.completedOrders++;
      if (order.paymentStatus === 'completed') acc.totalRevenue += order.total;
      return acc;
    }, { totalOrders: 0, pendingOrders: 0, completedOrders: 0, totalRevenue: 0 });

    setStats(newStats);
  };

  const filteredOrders = orders.filter(order => {
    // Apply search filter
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply status filter
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
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

  const updateOrderStatus = async (orderId: string, newStatus: string, cancelReason?: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          cancellationReason: newStatus === 'cancelled' ? cancelReason : undefined
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchOrders();
        setShowCancelDialog(false);
        setCancellationReason('');
        setCustomReason('');
        setOrderStatusToEdit(null);
      } else {
        setError(data.error || 'Failed to update order status');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsUpdating(false);
    }
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

  const handleCancelConfirm = () => {
    if (!editingOrder) return;

    const reason = cancellationReason === 'Other' && customReason.trim()
      ? customReason.trim()
      : cancellationReason;

    updateOrderStatus(editingOrder.id!, 'cancelled', reason);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-red-600">Error: {error}</p>
          </div>
          <Button onClick={fetchOrders} variant="outline">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage and track all orders from Firestore</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Total Orders</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Pending Orders</p>
              <p className="text-lg font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Completed Orders</p>
              <p className="text-lg font-bold text-gray-900">{stats.completedOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Total Revenue</p>
              <p className="text-lg font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by order number, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Customer
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Items
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Payment
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/admin-dashboard/orders/${order.orderNumber}`)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm hidden sm:table-cell">
                      <div className="text-sm font-medium text-gray-900">{order.customerInfo.name}</div>
                      <div className="text-xs text-gray-500">{order.customerInfo.email}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      ₹{order.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 hidden md:table-cell">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span> pages
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Status Update Dialog */}
      <Dialog
        open={orderStatusToEdit !== null}
        onOpenChange={(open) => {
          if (!open) {
            setOrderStatusToEdit(null);
            setEditingOrder(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update the status for order {editingOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select
              value={orderStatusToEdit || editingOrder?.status}
              onValueChange={setOrderStatusToEdit}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setOrderStatusToEdit(null); setEditingOrder(null); }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingOrder && orderStatusToEdit) {
                  if (orderStatusToEdit === 'cancelled') {
                    handleCancelConfirm();
                  } else {
                    updateOrderStatus(editingOrder.id!, orderStatusToEdit);
                  }
                }
              }}
              disabled={!orderStatusToEdit || isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog
        open={showCancelDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowCancelDialog(false);
            setEditingOrder(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order {editingOrder?.orderNumber}?
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
            {cancellationReason === "Other" && (
              <div className="space-y-2">
                <Label htmlFor="custom-reason">Please specify</Label>
                <Textarea
                  id="custom-reason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  rows={3}
                  className="resize-none"
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
            >
              No, Go Back
            </Button>
            <Button
              onClick={handleCancelConfirm}
              disabled={!cancellationReason || (cancellationReason === "Other" && !customReason.trim()) || isUpdating}
              className="bg-red-600 hover:bg-red-700"
            >
              {isUpdating ? "Cancelling..." : "Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
