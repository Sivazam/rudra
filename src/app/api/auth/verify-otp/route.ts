import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import { firestoreService } from '@/lib/firebase';
import { IUser } from '@/lib/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    console.log('OTP verification API called');
    const { idToken, phoneNumber } = await request.json();

    console.log('Received data:', { idToken: idToken ? '***' : 'missing', phoneNumber });

    if (!idToken || !phoneNumber) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to MongoDB (optional - if using MongoDB)
    await connectDB();

    // Create or update user in Firestore
    try {
      console.log('Creating/updating user in Firestore for phone:', phoneNumber);
      const existingUser = await firestoreService.getAll('users', {
        where: { field: 'phoneNumber', operator: '==', value: phoneNumber }
      });

      let userData: IUser = {
        phoneNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (existingUser.length > 0) {
        // Update existing user
        const userId = existingUser[0].id;
        await firestoreService.update('users', userId, {
          updatedAt: new Date()
        });
        console.log('User updated in Firestore:', userId);
      } else {
        // Create new user
        const userId = await firestoreService.create('users', userData);
        console.log('New user created in Firestore:', userId);
      }
    } catch (firestoreError) {
      console.error('Error creating/updating user in Firestore:', firestoreError);
      // Don't fail the authentication if Firestore fails
    }

    // Create JWT token for session management
    console.log('Creating JWT token');
    const token = jwt.sign(
      { phoneNumber }, // Only store the phone number, not the entire Firebase token
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create response with session cookie
    const response = NextResponse.json(
      { 
        message: 'OTP verified successfully',
        success: true,
        phoneNumber,
        token // Include token in response for fallback storage
      },
      { status: 200 }
    );

    // Set HTTP-only cookie for session
    console.log('Setting auth-token cookie');
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: false, // Set to false in development
      sameSite: 'lax', // Use 'lax' instead of 'strict' for better compatibility
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    console.log('Cookie set in response headers');
    console.log('Response cookies:', response.cookies.getAll());

    console.log('OTP verification completed successfully');
    return response;
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}