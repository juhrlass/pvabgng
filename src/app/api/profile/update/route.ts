import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { UserRepository } from '@/db/repositories/userRepository';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify token and get user data
    const userData = await verifyToken(token);
    if (!userData || !userData.sub) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { name } = body;
    
    // Validate input
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Create user repository
    const userRepository = new UserRepository();
    
    // Find user by ID to ensure they exist
    const user = await userRepository.findById(userData.sub);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update user profile
    const updatedUser = await userRepository.update(userData.sub, {
      name,
      // Add other fields here if needed
    });
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'Failed to update profile' },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}