import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define which routes are protected and require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/api/protected',
];

// Define which routes should be accessible only for non-authenticated users
const authRoutes = [
  '/login',
  '/signup',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the JWT token from the cookies
  const token = request.cookies.get('token')?.value;
  
  // Check if the user is authenticated
  const isAuthenticated = token ? await verifyToken(token) : false;
  
  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Redirect unauthenticated users away from protected routes
  if (!isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// Verify the JWT token
async function verifyToken(token: string) {
  try {
    // Use environment variable for the secret key in production
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key_change_in_production');
    
    await jwtVerify(token, secret);
    return true;
  } catch (error) {
      console.error(error)
    return false;
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};