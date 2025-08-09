import { NextRequest, NextResponse } from 'next/server';
import { createToken, setTokenCookie } from '@/lib/auth';
import { UserRepository } from '@/db/repositories/userRepository';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
      console.log(body)

      const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create user repository
    const userRepository = new UserRepository();
    
    // Find user by email
    const user = await userRepository.findByEmail(email);
    console.dir(user)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await userRepository.verifyPassword(user, password);
    console.log(passwordMatch)
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await createToken({
      sub: user.id,
      name: user.name??undefined,
      email: user.email,
      role: user.role??undefined,
    });

    // Set token in HTTP-only cookie
    await setTokenCookie(token);

    // Return success response (without exposing sensitive data)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}