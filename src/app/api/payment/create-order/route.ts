import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import jwt from 'jsonwebtoken';
import { orderService, type IOrderItem, type ICustomerInfo } from '@/lib/services';

// Razorpay Configuration
const RAZORPAY_KEY_ID = 'rzp_test_RHpVquZ5e0nUkX';
const RAZORPAY_KEY_SECRET = 'C0qZuu2HhC7cLYUKBxlKI2at';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.phoneNumber;

    // Get cart data from request body
    const { items, shippingAddress, customerInfo } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid cart data' },
        { status: 400 }
      );
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.address) {
      return NextResponse.json(
        { success: false, error: 'Complete shipping address is required' },
        { status: 400 }
      );
    }

    // Calculate total amount
    const subtotal = items.reduce((sum, item) => {
      const price = item.variant.price - (item.variant.price * item.variant.discount) / 100;
      return sum + (price * item.quantity);
    }, 0);

    // Add shipping cost (free shipping for orders above 999)
    const shippingCost = subtotal >= 999 ? 0 : 99;
    const total = subtotal + shippingCost;

    // Create Razorpay order
    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(total * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}_${userId}`,
      payment_capture: 1,
      notes: {
        customer_name: shippingAddress.name,
        customer_phone: shippingAddress.phone,
        customer_email: customerInfo?.email || '',
        order_type: 'spiritual_products'
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Prepare order data for Firebase
    const orderItems: IOrderItem[] = items.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      name: item.name,
      quantity: item.quantity,
      price: item.variant.price,
      discount: item.variant.discount,
      totalPrice: (item.variant.price - (item.variant.price * item.variant.discount) / 100) * item.quantity
    }));

    const customerData: ICustomerInfo = {
      name: shippingAddress.name,
      phone: shippingAddress.phone,
      email: customerInfo?.email || '',
      address: shippingAddress.address,
      city: shippingAddress.city || '',
      state: shippingAddress.state || '',
      pincode: shippingAddress.pincode || ''
    };

    // Create order in Firebase
    const orderId = await orderService.createOrder({
      userId,
      customerInfo: customerData,
      items: orderItems,
      subtotal,
      shippingCost,
      total,
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
      paymentStatus: 'pending',
      orderDate: new Date()
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: RAZORPAY_KEY_ID,
        dbOrderId: orderId,
        subtotal,
        shippingCost,
        total
      }
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}