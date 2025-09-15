import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { idToken, phoneNumber } = await request.json();

    if (!idToken || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Create JWT token for session management
    const token = jwt.sign(
      { phoneNumber, idToken },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create response with session cookie
    const response = NextResponse.json(
      { message: 'OTP verified successfully' },
      { status: 200 }
    );

    // Set HTTP-only cookie for session
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}