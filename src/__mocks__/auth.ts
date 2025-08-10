// Mock implementation of the auth module
// This avoids issues with TextEncoder and other browser APIs

export interface JWTPayload {
  sub: string; // subject (user id)
  name?: string;
  email?: string;
  role?: string;
  photoUrl?: string;
  iat?: number; // issued at
  exp?: number; // expiration time
}

/**
 * Creates a JWT token with the given payload
 */
export async function createToken(payload: JWTPayload): Promise<string> {
  return 'mock-token';
}

/**
 * Verifies a JWT token and returns the payload
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  if (token === 'invalid-token') {
    return null;
  }
  
  return {
    sub: 'mock-user-id',
    name: 'Mock User',
    email: 'mock@example.com',
    role: 'user',
  };
}

/**
 * Sets the JWT token in a cookie
 */
export async function setTokenCookie(token: string): Promise<void> {
  // Mock implementation - does nothing
}

/**
 * Removes the JWT token cookie
 */
export async function removeTokenCookie(): Promise<void> {
  // Mock implementation - does nothing
}

/**
 * Gets the JWT token from the cookies
 */
export async function getTokenFromCookies(): Promise<string | undefined> {
  return 'mock-token';
}

/**
 * Gets the current user from the JWT token in cookies
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  return {
    sub: 'mock-user-id',
    name: 'Mock User',
    email: 'mock@example.com',
    role: 'user',
  };
}

/**
 * Utility function to handle authentication errors in API routes
 */
export function handleAuthError(message = 'Unauthorized') {
  return {
    json: {
      success: false,
      message,
    },
    status: 401,
  };
}

/**
 * Utility function to check if a request is authenticated
 */
export async function isAuthenticated(request: any): Promise<boolean> {
  const token = request.cookies?.get?.('token')?.value;
  return token === 'mock-token';
}