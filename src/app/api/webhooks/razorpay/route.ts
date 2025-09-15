import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'YourWebhookSecret';
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (generatedSignature !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const webhookEvent = JSON.parse(body);

    // Handle payment authorized event
    if (webhookEvent.event === 'payment.authorized') {
      const payment = webhookEvent.payload.payment.entity;
      
      await connectDB();
      
      await Order.findOneAndUpdate(
        { razorpayOrderId: payment.order_id },
        {
          razorpayPaymentId: payment.id,
          status: payment.status === 'captured' ? 'paid' : 'pending',
        }
      );
    }

    // Handle payment failed event
    if (webhookEvent.event === 'payment.failed') {
      const payment = webhookEvent.payload.payment.entity;
      
      await connectDB();
      
      await Order.findOneAndUpdate(
        { razorpayOrderId: payment.order_id },
        {
          status: 'failed',
        }
      );
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error handling Razorpay webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handling failed' },
      { status: 500 }
    );
  }
}