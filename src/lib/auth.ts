import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface DecodedToken {
  phoneNumber: string;
  idToken: string;
  iat: number;
  exp: number;
}

export function getAuthToken(request?: Request): string | null {
  if (typeof window !== 'undefined') {
    // Client-side: get from cookies
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
    return authCookie ? authCookie.split('=')[1] : null;
  } else if (request) {
    // Server-side: get from request cookies
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
    return authCookie ? authCookie.split('=')[1] : null;
  }
  return null;
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (error) {
    return null;
  }
}

export function isUserAuthenticated(request?: Request): boolean {
  if (typeof window === 'undefined' && !request) {
    return false; // Server-side without request context
  }
  const token = getAuthToken(request);
  return token ? verifyToken(token) !== null : false;
}

export function isAuthenticated(request?: Request): boolean {
  return isUserAuthenticated(request);
}

export function getCurrentUser(request?: Request): DecodedToken | null {
  const token = getAuthToken(request);
  return token ? verifyToken(token) : null;
}