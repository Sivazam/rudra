import { firestoreService } from '@/lib/firebase';

export interface IOrderItem {
  productId?: string;
  variantId?: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  totalPrice: number;
}

export interface ICustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IOrder {
  id?: string;
  userId: string;
  customerInfo: ICustomerInfo;
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  orderNumber?: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'processing' | 'shipped' | 'delivered';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  orderDate: Date;
  paidAt?: Date;
  createdAt?: any;
  updatedAt?: any;
}

class OrderService {
  private collection = 'orders';

  // Create a new order
  async createOrder(orderData: Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('OrderService: Creating order with data:', { 
        userId: orderData.userId, 
        itemCount: orderData.items.length,
        total: orderData.total 
      });
      
      // Generate order number
      const orderNumber = `RUD${Date.now().toString().slice(-8)}`;
      
      const orderToCreate = {
        ...orderData,
        orderNumber,
        orderDate: new Date().toISOString()
      };

      console.log('OrderService: Creating document in Firestore...');
      const orderId = await firestoreService.create(this.collection, orderToCreate);
      console.log('OrderService: Order created successfully with ID:', orderId);
      return orderId;
    } catch (error) {
      console.error('OrderService: Error creating order:', error);
      console.error('OrderService: Error details:', {
        name: (error as any).name,
        message: (error as any).message,
        stack: (error as any).stack,
        code: (error as any).code
      });
      throw new Error(`Failed to create order: ${(error as any).message || 'Unknown error'}`);
    }
  }

  // Get order by ID
  async getOrderById(id: string): Promise<IOrder | null> {
    try {
      return await firestoreService.getById(this.collection, id);
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  }

  // Get order by Razorpay order ID
  async getOrderByRazorpayOrderId(razorpayOrderId: string): Promise<IOrder | null> {
    try {
      const orders = await firestoreService.getAll(this.collection, {
        where: { field: 'razorpayOrderId', operator: '==', value: razorpayOrderId }
      });
      return orders.length > 0 ? orders[0] : null;
    } catch (error) {
      console.error('Error getting order by Razorpay ID:', error);
      throw error;
    }
  }

  // Get orders by user ID
  async getOrdersByUserId(userId: string): Promise<IOrder[]> {
    try {
      return await firestoreService.getAll(this.collection, {
        where: { field: 'userId', operator: '==', value: userId },
        orderBy: { field: 'orderDate', direction: 'desc' }
      });
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw error;
    }
  }

  // Get all orders (for admin)
  async getAllOrders(): Promise<IOrder[]> {
    try {
      return await firestoreService.getAll(this.collection, {
        orderBy: { field: 'orderDate', direction: 'desc' }
      });
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    }
  }

  // Update order
  async updateOrder(id: string, updateData: Partial<IOrder>): Promise<void> {
    try {
      await firestoreService.update(this.collection, id, updateData);
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  // Update payment status
  async updatePaymentStatus(
    razorpayOrderId: string, 
    paymentData: {
      razorpayPaymentId: string;
      razorpaySignature: string;
      status: 'paid' | 'failed';
    }
  ): Promise<void> {
    try {
      const order = await this.getOrderByRazorpayOrderId(razorpayOrderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const updateData: Partial<IOrder> = {
        razorpayPaymentId: paymentData.razorpayPaymentId,
        razorpaySignature: paymentData.razorpaySignature,
        status: paymentData.status,
        paymentStatus: paymentData.status === 'paid' ? 'completed' : 'failed',
        paidAt: paymentData.status === 'paid' ? new Date().toISOString() : undefined
      };

      await this.updateOrder(order.id!, updateData);
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Delete order
  async deleteOrder(id: string): Promise<void> {
    try {
      await firestoreService.delete(this.collection, id);
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  // Get order statistics
  async getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    paidOrders: number;
  }> {
    try {
      const orders = await this.getAllOrders();
      
      return {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
        pendingOrders: orders.filter(order => order.status === 'pending').length,
        paidOrders: orders.filter(order => order.paymentStatus === 'completed').length
      };
    } catch (error) {
      console.error('Error getting order stats:', error);
      throw error;
    }
  }
}

export const orderService = new OrderService();
export default orderService;