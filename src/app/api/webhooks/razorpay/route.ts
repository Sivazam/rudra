import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectDB from '@/lib/mongodb';
import { Order } from '@/lib/models';

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'YourWebhookSecret';

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature
    const signature = request.headers.get('x-razorpay-signature');
    const body = await request.text();

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const expectedSignature = Razorpay.validateWebhookSignature(
      body,
      signature,
      RAZORPAY_WEBHOOK_SECRET
    );

    if (!expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Parse webhook body
    const webhookData = JSON.parse(body);

    // Handle different webhook events
    switch (webhookData.event) {
      case 'payment.captured':
        await handlePaymentCaptured(webhookData.payload.payment.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(webhookData.payload.payment.entity);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${webhookData.event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(payment: any) {
  await connectDB();
  
  const order = await Order.findOne({ 
    razorpayOrderId: payment.order_id 
  });

  if (order && order.status !== 'paid') {
    order.razorpayPaymentId = payment.id;
    order.status = 'paid';
    await order.save();
    
    console.log(`Payment captured for order: ${order._id}`);
  }
}

async function handlePaymentFailed(payment: any) {
  await connectDB();
  
  const order = await Order.findOne({ 
    razorpayOrderId: payment.order_id 
  });

  if (order && order.status !== 'failed') {
    order.status = 'failed';
    await order.save();
    
    console.log(`Payment failed for order: ${order._id}`);
  }
}