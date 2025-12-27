import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import jwt from 'jsonwebtoken';
import { orderService, userService, type IOrderItem, type ICustomerInfo } from '@/lib/services';
import { getUserIdentifier, getGuestUserIdentifier, standardizeUserId } from '@/lib/userUtils';

// Razorpay Configuration
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
    console.log('=== Payment Verify API Called ===');

    // Get payment details from request body
    const body = await request.json();
    console.log('Request body keys:', Object.keys(body));
    console.log('Razorpay Order ID:', body.razorpayOrderId);
    console.log('Razorpay Payment ID:', body.razorpayPaymentId);
    console.log('Razorpay Signature:', body.razorpaySignature);
    console.log('Order Data:', body.orderData);

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderData } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      console.error('Missing payment details');
      return NextResponse.json(
        { success: false, error: 'Missing payment details' },
        { status: 400 }
      );
    }

    if (!orderData) {
      console.error('Missing order data - this is required for order creation');
      return NextResponse.json(
        { success: false, error: 'Missing order data' },
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
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    console.log('Payment signature verified successfully');

    // Check if order already exists (for idempotency)
    const existingOrder = await orderService.getOrderByRazorpayOrderId(razorpayOrderId);
    if (existingOrder) {
      console.log('Order already exists:', existingOrder.id);
      return NextResponse.json({
        success: true,
        data: {
          orderId: existingOrder.id,
          orderNumber: existingOrder.orderNumber,
          razorpayOrderId: existingOrder.razorpayOrderId,
          razorpayPaymentId: existingOrder.razorpayPaymentId,
          status: existingOrder.status,
          paymentStatus: existingOrder.paymentStatus,
          total: existingOrder.total,
          message: 'Payment verified successfully'
        }
      });
    }

    // Check authentication
    const token = request.cookies.get('auth-token')?.value;
    let userIdentifier;

    if (token) {
      try {
        // Try multiple verification approaches
        let decoded: any;
        try {
          const secretBuffer = getSecretBuffer();
          decoded = jwt.verify(token, secretBuffer);
          console.log('Verify: Token verified using Buffer secret');
        } catch (error) {
          console.warn('Verify: Buffer verification failed, trying string approach');
          const secretString = getJwtSecret();
          decoded = jwt.verify(token, secretString, { algorithms: ['HS256'] });
          console.log('Verify: Token verified using string secret');
        }

        // Get standardized user identifier
        userIdentifier = getUserIdentifier(decoded);
        console.log('Verify: Authenticated user identifier:', userIdentifier);
      } catch (error) {
        // Invalid token, treat as guest
        userIdentifier = getGuestUserIdentifier(orderData?.customerInfo?.phone);
        console.log('Verify: Invalid token, using guest identifier:', userIdentifier);
      }
    } else {
      // Guest checkout
      userIdentifier = getGuestUserIdentifier(orderData?.customerInfo?.phone);
      console.log('Verify: Guest checkout identifier:', userIdentifier);
    }

    // Create or update user if phone number is provided
    if (orderData?.customerInfo?.phone) {
      try {
        const standardizedUserId = standardizeUserId(userIdentifier.userId);

        console.log('Creating or updating user for phone:', standardizedUserId);

        // Prepare user data with address
        const userData = {
          phoneNumber: standardizedUserId,
          name: orderData.customerInfo.name,
          email: orderData.customerInfo.email || '',
          address: orderData.customerInfo.address,
          city: orderData.customerInfo.city || '',
          state: orderData.customerInfo.state || '',
          pincode: orderData.customerInfo.pincode || ''
        };

        // Create or update user
        const userIdFromDb = await userService.createOrUpdateUser(userData);
        console.log('User created/updated with database ID:', userIdFromDb);

        console.log('User created/updated successfully:', standardizedUserId);
      } catch (error) {
        console.error('Error creating/updating user:', error);
        console.error('User creation error details:', {
          name: (error as any).name,
          message: (error as any).message,
          stack: (error as any).stack,
          code: (error as any).code
        });
        // Don't fail order creation if user creation fails
        // Continue with original user identifier
      }
    }

    // Create order in database with successful payment status
    console.log('Creating order in database...');

    const standardizedUserId = standardizeUserId(userIdentifier.userId);

    const newOrderData = {
      userId: standardizedUserId,
      customerInfo: orderData.customerInfo,
      items: orderData.items,
      subtotal: orderData.subtotal,
      shippingCost: orderData.shippingCost,
      total: orderData.total,
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      razorpaySignature: razorpaySignature,
      status: 'pending', // Order is pending processing
      paymentStatus: 'completed', // Payment is successful
      orderDate: new Date().toISOString(),
      paidAt: new Date().toISOString(), // Store as ISO string
      statusHistory: [{ // Initialize status history
        status: 'pending',
        timestamp: new Date().toISOString(),
        updatedBy: 'system'
      }]
    };

    const orderId = await orderService.createOrder(newOrderData);
    console.log('Order created successfully:', orderId, 'with userId:', standardizedUserId);

    // Associate order with user
    try {
      console.log('Associating order with user:', standardizedUserId, 'orderId:', orderId, 'isAuthenticated:', userIdentifier.isAuthenticated);
      if (userIdentifier.isAuthenticated) {
        await userService.addOrderToUser(standardizedUserId, orderId);
        console.log('Order associated with user successfully');
      } else {
        console.log('Skipping user association for guest user');
      }
    } catch (associationError) {
      console.error('Error associating order with user:', associationError);
      // Don't fail order creation if association fails
    }

    // Get created order
    const order = await orderService.getOrderById(orderId);

    return NextResponse.json({
      success: true,
      data: {
        orderId: order?.id,
        orderNumber: order?.orderNumber,
        razorpayOrderId: order?.razorpayOrderId,
        razorpayPaymentId: order?.razorpayPaymentId,
        status: order?.status,
        paymentStatus: order?.paymentStatus,
        total: order?.total,
        message: 'Payment verified and order created successfully'
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    console.error('Error details:', {
      name: (error as any).name,
      message: (error as any).message,
      stack: (error as any).stack,
      code: (error as any).code
    });
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
