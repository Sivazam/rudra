import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { orderService } from '@/lib/services';

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

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return null;
  }

  try {
    // Try multiple verification approaches
    try {
      const secretBuffer = getSecretBuffer();
      return jwt.verify(token, secretBuffer);
    } catch (error) {
      console.warn('Buffer verification failed, trying string approach');
      const secretString = getJwtSecret();
      return jwt.verify(token, secretString, { algorithms: ['HS256'] });
    }
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    let orders = await orderService.getAllOrders();

    // Filter by status if provided
    if (status) {
      orders = orders.filter(order => order.status === status);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = orders.slice(startIndex, endIndex);

    const total = orders.length;

    return NextResponse.json({
      success: true,
      orders: paginatedOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}