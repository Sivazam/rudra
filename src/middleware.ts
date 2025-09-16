import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ['/admin'];
  const authRoutes = ['/auth/login', '/auth/verify'];

  // Check if the path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the path is auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If accessing auth route with token, redirect to home
  if (isAuthRoute && token) {
    try {
      // Try multiple verification approaches
      try {
        const secretBuffer = getSecretBuffer();
        jwt.verify(token, secretBuffer);
        console.log('Middleware: Token verified using Buffer secret');
      } catch (error) {
        console.warn('Middleware: Buffer verification failed, trying string approach');
        const secretString = getJwtSecret();
        jwt.verify(token, secretString, { algorithms: ['HS256'] });
        console.log('Middleware: Token verified using string secret');
      }
      return NextResponse.redirect(new URL('/', request.url));
    } catch (error) {
      // Token is invalid, allow access to auth routes
      console.log('Middleware: Token invalid, allowing access to auth routes');
    }
  }

  // Verify token for protected routes
  if (isProtectedRoute && token) {
    try {
      // Try multiple verification approaches
      try {
        const secretBuffer = getSecretBuffer();
        jwt.verify(token, secretBuffer);
        console.log('Middleware: Protected route token verified using Buffer secret');
      } catch (error) {
        console.warn('Middleware: Protected route Buffer verification failed, trying string approach');
        const secretString = getJwtSecret();
        jwt.verify(token, secretString, { algorithms: ['HS256'] });
        console.log('Middleware: Protected route token verified using string secret');
      }
    } catch (error) {
      // Token is invalid, redirect to login
      console.log('Middleware: Protected route token invalid, redirecting to login');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};