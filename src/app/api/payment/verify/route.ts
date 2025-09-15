import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'YourTestSecret';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.phoneNumber;

    // Get payment details from request body
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await request.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      );
    }

    // Verify signature
    const generatedSignature = Razorpay.validateWebhookSignature(
      `${razorpayOrderId}|${razorpayPaymentId}`,
      razorpaySignature,
      RAZORPAY_KEY_SECRET
    );

    if (!generatedSignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Update order status
    const order = await Order.findOne({ 
      razorpayOrderId, 
      userId 
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order with payment details
    order.razorpayPaymentId = razorpayPaymentId;
    order.status = 'paid';
    await order.save();

    return NextResponse.json({
      success: true,
      orderId: order._id,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}