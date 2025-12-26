import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    console.log('Payment cancel API called');

    // Get payment details from request body
    const { razorpayOrderId, reason } = await request.json();

    if (!razorpayOrderId) {
      return NextResponse.json(
        { success: false, error: 'Missing Razorpay order ID' },
        { status: 400 }
      );
    }

    // Get order by Razorpay order ID
    const order = await orderService.getOrderByRazorpayOrderId(razorpayOrderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Only update if payment is still pending (don't override completed payments)
    if (order.paymentStatus !== 'pending') {
      console.log('Order payment status is not pending:', order.paymentStatus);
      return NextResponse.json({
        success: true,
        message: 'Payment status already updated',
        order: {
          paymentStatus: order.paymentStatus
        }
      });
    }

    // Update order payment status to failed
    await orderService.updateOrder(order.id!, {
      paymentStatus: 'failed',
      cancellationReason: reason || 'Payment cancelled by user'
    });

    console.log('Order payment status updated to failed:', order.id);

    return NextResponse.json({
      success: true,
      message: 'Payment cancelled successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: 'failed'
      }
    });
  } catch (error) {
    console.error('Error cancelling payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel payment' },
      { status: 500 }
    );
  }
}
