import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import { firestoreService } from '@/lib/firebase';
import { IUser } from '@/lib/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Ensure JWT_SECRET is a string and handle potential module conflicts
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
    let existingUser: any[] = [];
    let isNewUser = false;
    let needsProfileCompletion = true;
    
    try {
      console.log('Creating/updating user in Firestore for phone:', phoneNumber);
      existingUser = await firestoreService.getAll('users', {
        where: { field: 'phoneNumber', operator: '==', value: phoneNumber }
      });

      let userData: IUser = {
        phoneNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      let userId: string;

      if (existingUser.length > 0) {
        // Update existing user
        userId = existingUser[0].id!;
        await firestoreService.update('users', userId, {
          updatedAt: new Date()
        });
        console.log('User updated in Firestore:', userId);
        
        // Check if user has completed profile
        const user = existingUser[0];
        needsProfileCompletion = !user.name || !user.email;
        if (needsProfileCompletion) {
          console.log('User profile incomplete, needs completion');
        }
      } else {
        // Create new user
        userId = await firestoreService.create('users', userData);
        isNewUser = true;
        console.log('New user created in Firestore:', userId);
      }
    } catch (firestoreError) {
      console.error('Error creating/updating user in Firestore:', firestoreError);
      // Don't fail the authentication if Firestore fails
      // Assume it's a new user if we can't check
      isNewUser = true;
      needsProfileCompletion = true;
    }

    // Create JWT token for session management
    console.log('Creating JWT token');
    
    // Try multiple approaches for token signing
    let token: string;
    try {
      // Approach 1: Use Buffer-based secret
      const secretBuffer = getSecretBuffer();
      token = jwt.sign(
        { phoneNumber },
        secretBuffer,
        { expiresIn: '7d' }
      );
      console.log('Token created successfully using Buffer secret');
    } catch (error) {
      console.warn('Buffer approach failed, trying string approach:', error);
      // Approach 2: Use string secret with explicit options
      const secretString = getJwtSecret();
      token = jwt.sign(
        { phoneNumber },
        secretString,
        { algorithm: 'HS256', expiresIn: '7d' }
      );
      console.log('Token created successfully using string secret');
    }

    // Create response with session cookie
    const response = NextResponse.json(
      { 
        message: 'OTP verified successfully',
        success: true,
        phoneNumber,
        token, // Include token in response for fallback storage
        isNewUser, // Indicate if this is a new user
        needsProfileCompletion // Indicate if profile completion is needed
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