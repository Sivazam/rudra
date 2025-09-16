import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function GET(request: NextRequest) {
  try {
    console.log('Test payment API called');
    
    // Check environment variables
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    console.log('Environment variables check:', {
      hasKeyId: !!keyId,
      hasKeySecret: !!keySecret,
      keyId: keyId ? `${keyId.substring(0, 8)}...` : 'missing'
    });

    if (!keyId || !keySecret) {
      return NextResponse.json({
        success: false,
        error: 'Razorpay credentials not configured',
        details: {
          hasKeyId: !!keyId,
          hasKeySecret: !!keySecret
        }
      }, { status: 500 });
    }

    // Test Razorpay connection
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Test creating a small order
    const testOrder = await razorpay.orders.create({
      amount: 100, // ₹1 in paise
      currency: 'INR',
      receipt: `test_${Date.now()}`,
      payment_capture: 1,
    });

    console.log('Test order created successfully:', testOrder.id);

    return NextResponse.json({
      success: true,
      message: 'Payment system is working correctly',
      data: {
        testOrderId: testOrder.id,
        testAmount: testOrder.amount,
        testCurrency: testOrder.currency,
        environment: {
          hasKeyId: !!keyId,
          hasKeySecret: !!keySecret,
          nodeEnv: process.env.NODE_ENV
        }
      }
    });

  } catch (error) {
    console.error('Test payment error:', error);
    console.error('Error details:', {
      name: (error as any).name,
      message: (error as any).message,
      stack: (error as any).stack,
      code: (error as any).code,
      statusCode: (error as any).statusCode
    });

    return NextResponse.json({
      success: false,
      error: 'Payment system test failed',
      details: {
        name: (error as any).name,
        message: (error as any).message,
        code: (error as any).code,
        statusCode: (error as any).statusCode
      }
    }, { status: 500 });
  }
}