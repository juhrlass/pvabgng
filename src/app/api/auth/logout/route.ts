import { NextRequest, NextResponse } from 'next/server';
import { removeTokenCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Remove the token cookie
    removeTokenCookie();
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also handle GET requests for logout (useful for simple logout links)
export async function GET(request: NextRequest) {
  return POST(request);
}