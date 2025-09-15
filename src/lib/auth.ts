import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface DecodedToken {
  phoneNumber: string;
  iat: number;
  exp: number;
}

export function getAuthToken(request?: Request): string | null {
  if (typeof window !== 'undefined') {
    // Client-side: try cookies first, then localStorage as fallback
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
    const token = authCookie ? authCookie.split('=')[1] : null;
    
    if (token) {
      console.log('Client-side auth token found in cookies');
      return token;
    }
    
    // Fallback to localStorage
    const localToken = localStorage.getItem('auth-token');
    if (localToken) {
      console.log('Client-side auth token found in localStorage');
      return localToken;
    }
    
    console.log('Client-side auth token not found in cookies or localStorage');
    return null;
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
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    console.log('Token verified successfully for phone:', decoded.phoneNumber);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function isUserAuthenticated(request?: Request): boolean {
  if (typeof window === 'undefined' && !request) {
    return false; // Server-side without request context
  }
  const token = getAuthToken(request);
  console.log('isUserAuthenticated - token exists:', !!token);
  if (!token) return false;
  
  const isValid = verifyToken(token) !== null;
  console.log('isUserAuthenticated - token valid:', isValid);
  return isValid;
}

export function isAuthenticated(request?: Request): boolean {
  return isUserAuthenticated(request);
}

export function getCurrentUser(request?: Request): DecodedToken | null {
  const token = getAuthToken(request);
  return token ? verifyToken(token) : null;
}