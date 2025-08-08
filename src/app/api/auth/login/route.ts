import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { createToken, setTokenCookie } from '@/lib/auth';

// In a real application, you would fetch this from a database
const MOCK_USERS = [
  {
    id: '1',
    email: 'user@example.com',
    // Password: password123
    passwordHash: '$2b$10$8OxDEuDS1V0YDXzCj1LNyeEEfB5A5Z8nH9R9q0hNHBQnXQJW0blPG',
    name: 'Test User',
    role: 'user',
  },
  {
    id: '2',
    email: 'admin@example.com',
    // Password: admin123
    passwordHash: '$2b$10$8OxDEuDS1V0YDXzCj1LNyeEEfB5A5Z8nH9R9q0hNHBQnXQJW0blPG',
    name: 'Admin User',
    role: 'admin',
  },
];

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email (in a real app, query your database)
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await createToken({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
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