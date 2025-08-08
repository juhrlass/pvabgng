import { NextResponse } from 'next/server';
import { getCurrentUser, handleAuthError } from '@/lib/auth';
import { UserRepository } from '@/db/repositories/userRepository';

export async function GET() {
  try {
    // Get the current user from the token
    const tokenUser = await getCurrentUser();
    
    // If no user is found, return unauthorized
    if (!tokenUser) {
      return handleAuthError('Not authenticated');
    }
    
    // Get the latest user data from the database
    const userRepository = new UserRepository();
    const dbUser = await userRepository.findById(tokenUser.sub);
    
    // If user no longer exists in the database, return unauthorized
    if (!dbUser) {
      return handleAuthError('User not found');
    }
    
    // Return user information (excluding sensitive data)
    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
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