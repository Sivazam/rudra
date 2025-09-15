import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { userService } from '@/lib/services';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                 request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const phoneNumber = decoded.phoneNumber;

    // Get user from database
    const user = await userService.getUserByPhoneNumber(phoneNumber);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode
      }
    });

  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}