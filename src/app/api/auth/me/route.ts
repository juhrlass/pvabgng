import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, handleAuthError } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the current user from the token
    const user = await getCurrentUser();
    
    // If no user is found, return unauthorized
    if (!user) {
      return handleAuthError('Not authenticated');
    }
    
    // Return user information (excluding sensitive data)
    return NextResponse.json({
      success: true,
      user: {
        id: user.sub,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('User info error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}