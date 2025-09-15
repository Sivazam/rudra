import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourSecretHere',
});

export async function POST(request: NextRequest) {
  try {
    const { items, total, shippingAddress } = await request.json();

    if (!items || !total || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Create Razorpay order
    const options = {
      amount: total * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create order in database
    const order = new Order({
      userId: 'guest', // Will be replaced with actual user ID from auth
      items: items.map((item: any) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        discount: 0 // Will calculate discount based on variant
      })),
      total,
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
      shippingAddress
    });

    await order.save();

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}