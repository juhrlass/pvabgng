import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './src/lib/auth';

// Define which routes should be protected
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/api/protected',
];

// Define which routes should be accessible only to non-authenticated users
const authRoutes = [
  '/login',
  '/register',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Check if the user is authenticated
  const isAuthenticated = token ? await verifyToken(token) !== null : false;
  
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

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    // Match all protected routes
    ...protectedRoutes.map(route => route + '/:path*'),
    // Match all auth routes
    ...authRoutes.map(route => route + '/:path*'),
    // Match the root path
    '/',
  ],
};