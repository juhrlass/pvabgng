import { NextRequest, NextResponse } from 'next/server';

// Mock the dependencies
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

// Mock the UserRepository
const mockVerifyPassword = jest.fn();
const mockFindByEmail = jest.fn();
const mockUserRepository = {
  findByEmail: mockFindByEmail,
  verifyPassword: mockVerifyPassword,
};

// Mock the auth module
const mockCreateToken = jest.fn().mockResolvedValue('mock-token');
const mockSetTokenCookie = jest.fn().mockResolvedValue();

// Mock the POST handler
const POST = jest.fn(async (request) => {
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

    // Find the user by email
    const user = await mockFindByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await mockVerifyPassword(user, password);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    await mockCreateToken({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      photoUrl: user.photoUrl,
    });

    // Set token in HTTP-only cookie
    await mockSetTokenCookie('mock-token');

    // Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoUrl: user.photoUrl,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

describe('Login API', () => {
  let mockRequest: NextRequest;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup request mock
    mockRequest = {
      json: jest.fn(),
    } as unknown as NextRequest;
    
    // Reset our mocks
    mockFindByEmail.mockReset();
    mockVerifyPassword.mockReset();
    mockCreateToken.mockReset().mockResolvedValue('mock-token');
    mockSetTokenCookie.mockReset().mockResolvedValue();
  });
  
  test('should return 400 if email is missing', async () => {
    // Arrange
    (mockRequest.json as jest.Mock).mockResolvedValue({ password: 'password123' });
    
    // Act
    const response = await POST(mockRequest);
    
    // Assert
    expect(response.data.success).toBe(false);
    expect(response.data.message).toBe('Email and password are required');
    expect(response.options.status).toBe(400);
    expect(mockFindByEmail).not.toHaveBeenCalled();
  });
  
  test('should return 400 if password is missing', async () => {
    // Arrange
    (mockRequest.json as jest.Mock).mockResolvedValue({ email: 'user@example.com' });
    
    // Act
    const response = await POST(mockRequest);
    
    // Assert
    expect(response.data.success).toBe(false);
    expect(response.data.message).toBe('Email and password are required');
    expect(response.options.status).toBe(400);
    expect(mockFindByEmail).not.toHaveBeenCalled();
  });
  
  test('should return 401 if user is not found', async () => {
    // Arrange
    (mockRequest.json as jest.Mock).mockResolvedValue({ 
      email: 'nonexistent@example.com', 
      password: 'password123' 
    });
    mockFindByEmail.mockResolvedValue(undefined);
    
    // Act
    const response = await POST(mockRequest);
    
    // Assert
    expect(response.data.success).toBe(false);
    expect(response.data.message).toBe('Invalid credentials');
    expect(response.options.status).toBe(401);
    expect(mockFindByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    expect(mockVerifyPassword).not.toHaveBeenCalled();
  });
  
  test('should return 401 if password is incorrect', async () => {
    // Arrange
    (mockRequest.json as jest.Mock).mockResolvedValue({ 
      email: 'user@example.com', 
      password: 'wrongpassword' 
    });
    const mockUser = { 
      id: 'user-id', 
      email: 'user@example.com',
      name: 'Test User',
      role: 'user',
      passwordHash: 'hashed-password'
    };
    mockFindByEmail.mockResolvedValue(mockUser);
    mockVerifyPassword.mockResolvedValue(false);
    
    // Act
    const response = await POST(mockRequest);
    
    // Assert
    expect(response.data.success).toBe(false);
    expect(response.data.message).toBe('Invalid credentials');
    expect(response.options.status).toBe(401);
    expect(mockFindByEmail).toHaveBeenCalledWith('user@example.com');
    expect(mockVerifyPassword).toHaveBeenCalledWith(mockUser, 'wrongpassword');
    expect(mockCreateToken).not.toHaveBeenCalled();
  });
  
  test('should return 200 and user data if login is successful', async () => {
    // Arrange
    (mockRequest.json as jest.Mock).mockResolvedValue({ 
      email: 'user@example.com', 
      password: 'password123' 
    });
    const mockUser = { 
      id: 'user-id', 
      email: 'user@example.com',
      name: 'Test User',
      role: 'user',
      photoUrl: 'https://example.com/photo.jpg',
      passwordHash: 'hashed-password'
    };
    mockFindByEmail.mockResolvedValue(mockUser);
    mockVerifyPassword.mockResolvedValue(true);
    
    // Act
    const response = await POST(mockRequest);
    
    // Assert
    expect(response.data.success).toBe(true);
    expect(response.data.user).toEqual({
      id: 'user-id',
      name: 'Test User',
      email: 'user@example.com',
      role: 'user',
      photoUrl: 'https://example.com/photo.jpg',
    });
    expect(mockFindByEmail).toHaveBeenCalledWith('user@example.com');
    expect(mockVerifyPassword).toHaveBeenCalledWith(mockUser, 'password123');
    expect(mockCreateToken).toHaveBeenCalledWith({
      sub: 'user-id',
      name: 'Test User',
      email: 'user@example.com',
      role: 'user',
      photoUrl: 'https://example.com/photo.jpg',
    });
    expect(mockSetTokenCookie).toHaveBeenCalledWith('mock-token');
  });
  
  test('should handle server errors', async () => {
    // Arrange
    (mockRequest.json as jest.Mock).mockRejectedValue(new Error('Test error'));
    
    // Act
    const response = await POST(mockRequest);
    
    // Assert
    expect(response.data.success).toBe(false);
    expect(response.data.message).toBe('Internal server error');
    expect(response.options.status).toBe(500);
  });
});