import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { orderService, type IOrderItem, type ICustomerInfo } from '@/lib/services';
import { getUserIdentifier, getGuestUserIdentifier, standardizeUserId } from '@/lib/userUtils';
import jwt from 'jsonwebtoken';

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'YourWebhookSecret';

// JWT secret handling with error prevention
const getJwtSecret = (): string => {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    if (typeof secret !== 'string') {
      console.error('JWT_SECRET is not a string, using fallback');
      return 'your-secret-key';
    }
    return secret;
  } catch (error) {
    console.error('Error accessing JWT_SECRET:', error);
    return 'your-secret-key';
  }
};

// Buffer-based secret handling to avoid instanceof issues
const getSecretBuffer = (): Buffer => {
  const secret = getJwtSecret();
  try {
    return Buffer.from(secret);
  } catch (error) {
    console.error('Error creating buffer from secret:', error);
    return Buffer.from('your-secret-key');
  }
};

export async function POST(request: NextRequest) {
  try {
    console.log('Razorpay webhook received');

    // Get webhook signature
    const signature = request.headers.get('x-razorpay-signature');
    const body = await request.text();

    if (!signature) {
      console.error('Missing webhook signature');
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
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Parse webhook body
    const webhookData = JSON.parse(body);
    console.log('Webhook event:', webhookData.event);
    console.log('Razorpay Order ID:', webhookData.payload?.payment?.entity?.order_id);

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
  try {
    const razorpayOrderId = payment.order_id;
    console.log('Webhook: Processing payment captured for order:', razorpayOrderId);

    // Try to find existing order
    const existingOrder = await orderService.getOrderByRazorpayOrderId(razorpayOrderId);

    if (existingOrder) {
      // Order already exists (created by verify endpoint)
      console.log('Webhook: Order already exists with payment status:', existingOrder.paymentStatus);

      // Only update if payment is not already completed
      if (existingOrder.paymentStatus !== 'completed') {
        await orderService.updateOrder(existingOrder.id!, {
          razorpayPaymentId: payment.id,
          razorpaySignature: payment.signature || '',
          paymentStatus: 'completed',
          paidAt: new Date().toISOString()
        });
        console.log(`Webhook: Updated order payment status to completed: ${existingOrder.id}`);
      } else {
        console.log('Webhook: Order already has completed payment status, no update needed');
      }
    } else {
      // Order doesn't exist - this could happen if webhook fires before verify endpoint
      // or if verify endpoint failed. Since we don't have the order data here,
      // we can't create the order. The verify endpoint will handle it.
      console.log('Webhook: Order not found in database. This is expected if webhook fires before verify endpoint completes.');
      console.log('Webhook: Razorpay Order ID:', razorpayOrderId);
      console.log('Webhook: Payment ID:', payment.id);
      console.log('Webhook: Amount:', payment.amount);
      // We could log this for manual reconciliation if needed
    }
  } catch (error) {
    console.error('Error handling payment captured webhook:', error);
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    const razorpayOrderId = payment.order_id;
    console.log('Webhook: Processing payment failed for order:', razorpayOrderId);

    // Try to find existing order
    const existingOrder = await orderService.getOrderByRazorpayOrderId(razorpayOrderId);

    if (existingOrder) {
      // Order exists - update payment status
      console.log('Webhook: Order found with payment status:', existingOrder.paymentStatus);

      await orderService.updateOrder(existingOrder.id!, {
        razorpayPaymentId: payment.id,
        razorpaySignature: payment.signature || '',
        paymentStatus: 'failed'
      });
      console.log(`Webhook: Updated order payment status to failed: ${existingOrder.id}`);
    } else {
      // Order doesn't exist - this is expected with the new payment flow
      // since we only create orders for successful payments
      console.log('Webhook: Order not found in database. This is expected since orders are only created for successful payments.');
      console.log('Webhook: Razorpay Order ID:', razorpayOrderId);
      console.log('Webhook: Payment ID:', payment.id);
      console.log('Webhook: Failure reason:', payment.error?.description || payment.error?.code || 'Unknown');
      // No order to update - nothing to do
    }
  } catch (error) {
    console.error('Error handling payment failed webhook:', error);
  }
}
