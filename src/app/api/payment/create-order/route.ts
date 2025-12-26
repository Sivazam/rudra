import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import jwt from 'jsonwebtoken';
import type { IOrderItem, type ICustomerInfo } from '@/lib/services';
import { getUserIdentifier, getGuestUserIdentifier, standardizeUserId } from '@/lib/userUtils';

// Razorpay Configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_RHpVquZ5e0nUkX';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'C0qZuu2HhC7cLYUKBxlKI2at';

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
    console.log('Payment create-order API called');

    // Get cart data from request body
    const body = await request.json();
    console.log('Request body received:', {
      hasItems: !!body.items,
      hasShippingAddress: !!body.shippingAddress,
      hasCustomerInfo: !!body.customerInfo,
      itemCount: body.items?.length || 0,
      shippingAddress: body.shippingAddress
    });

    const { items, shippingAddress, customerInfo } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Invalid cart data:', items);
      return NextResponse.json(
        { success: false, error: 'Invalid cart data' },
        { status: 400 }
      );
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.address) {
      console.error('Invalid shipping address:', shippingAddress);
      return NextResponse.json(
        { success: false, error: 'Complete shipping address is required', details: 'Missing required address fields' },
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

    console.log('Order totals calculated:', { subtotal, shippingCost, total });

    // Create Razorpay order
    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(total * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      payment_capture: 1,
      notes: {
        customer_name: shippingAddress.name,
        customer_phone: shippingAddress.phone,
        customer_email: customerInfo?.email || '',
        order_type: 'spiritual_products'
      }
    };

    console.log('Creating Razorpay order with options:', {
      ...options,
      key_secret: '***',
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt
    });

    let razorpayOrder: any;
    try {
      razorpayOrder = await razorpay.orders.create(options);
      console.log('Razorpay order created successfully:', razorpayOrder.id);
      console.log('Full Razorpay response:', razorpayOrder);
    } catch (razorpayError) {
      console.error('Razorpay order creation failed:', razorpayError);
      console.error('Razorpay error details:', {
        name: (razorpayError as any).name,
        message: (razorpayError as any).message,
        stack: (razorpayError as any).stack,
        code: (razorpayError as any).code,
        statusCode: (razorpayError as any).statusCode,
        description: (razorpayError as any).description
      });
      throw new Error(`Failed to create Razorpay order: ${(razorpayError as any).message || 'Unknown error'}`);
    }

    // Prepare order data (will be stored in session and sent to verify endpoint)
    const orderItems: IOrderItem[] = items.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      name: item.name,
      quantity: item.quantity,
      price: item.variant.price,
      discount: item.variant.discount,
      totalPrice: (item.variant.price - (item.variant.price * item.variant.discount) / 100) * item.quantity,
      image: item.image // Include product image from cart item
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

    console.log('Order data prepared for payment verification');

    return NextResponse.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: RAZORPAY_KEY_ID,
        subtotal,
        shippingCost,
        total,
        // Include order data to be sent back to verify endpoint
        orderData: {
          items: orderItems,
          customerInfo: customerData,
          subtotal,
          shippingCost,
          total
        }
      }
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    console.error('Error details:', {
      name: (error as any).name,
      message: (error as any).message,
      stack: (error as any).stack,
      code: (error as any).code
    });
    return NextResponse.json(
      { success: false, error: 'Failed to create order', details: (error as any).message },
      { status: 500 }
    );
  }
}
