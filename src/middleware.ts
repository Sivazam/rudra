import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
      jwt.verify(token, JWT_SECRET);
      return NextResponse.redirect(new URL('/', request.url));
    } catch (error) {
      // Token is invalid, allow access to auth routes
    }
  }

  // Verify token for protected routes
  if (isProtectedRoute && token) {
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      // Token is invalid, redirect to login
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