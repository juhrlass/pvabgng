import "server-only"

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Secret key for JWT signing and verification
// In production, use a proper secret management system
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev_secret_key'
);

export interface JWTPayload {
  sub: string; // subject (user id)
  name?: string;
  email?: string;
  role?: string;
  iat?: number; // issued at
  exp?: number; // expiration time
}

/**
 * Creates a JWT token with the given payload
 */
export async function createToken(payload: JWTPayload): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * 7; // 7 days

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .setNotBefore(iat)
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT token and returns the payload
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
      console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Sets the JWT token in a cookie
 */
export async function setTokenCookie(token: string) {
    const cookieStore = await cookies();

    cookieStore.set({
    name: 'token',
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'strict',
  });
}

/**
 * Removes the JWT token cookie
 */
export async function removeTokenCookie() {
    const cookieStore = await cookies();

    cookieStore.delete('token');
}

/**
 * Gets the JWT token from the cookies
 */
export async function getTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

/**
 * Gets the current user from the JWT token in cookies
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;
  
  return verifyToken(token);
}

/**
 * Utility function to handle authentication errors in API routes
 */
export function handleAuthError(message = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { success: false, message },
    { status: 401 }
  );
}

/**
 * Utility function to check if a request is authenticated
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  if (!token) return false;
  
  // Verify token
  const payload = await verifyToken(token);
  return payload !== null;
}