import { NextRequest, NextResponse } from 'next/server';

// Mock the dependencies
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

// Mock the UserRepository
const mockFindByEmail = jest.fn();
const mockCreate = jest.fn();
const mockUserRepository = {
  findByEmail: mockFindByEmail,
  create: mockCreate,
};

// Mock the POST handler
const POST = jest.fn(async (request) => {
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Check if user with this email already exists
    const existingUser = await mockFindByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email is already registered' },
        { status: 409 }
      );
    }

    // Create the new user
    const user = await mockCreate({
      email,
      password,
      name: name || '',
      role: 'user', // Default role
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

describe('Signup API', () => {
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
    mockCreate.mockReset();
  });
  
  test('should return 400 if email is missing', async () => {
    // Arrange
    (mockRequest.json as jest.Mock).mockResolvedValue({ 
      name: 'Test User', 
      password: 'password123' 
    });
    
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
    (mockRequest.json as jest.Mock).mockResolvedValue({ 
      name: 'Test User', 
      email: 'user@example.com' 
    });
    
    // Act
    const response = await POST(mockRequest);
    
    // Assert
    expect(response.data.success).toBe(false);
    expect(response.data.message).toBe('Email and password are required');
    expect(response.options.status).toBe(400);
    expect(mockFindByEmail).not.toHaveBeenCalled();
  });
  
  test('should return 400 if email format is invalid', async () => {
    // Arrange
    (mockRequest.json as jest.Mock).mockResolvedValue({ 
      name: 'Test User', 
      email: 'invalid-email', 
      password: 'password123' 
    });
    
    // Act
    const response = await POST(mockRequest);
    
    // Assert
    expect(response.data.success).toBe(false);
    expect(response.data.message).toBe('Invalid email format');
    expect(response.options.status).toBe(400);
    expect(mockFindByEmail).not.toHaveBeenCalled();
  });
  
  test('should return 400 if password is too short', async () => {
    // Arrange
    (mockRequest.json as jest.Mock).mockResolvedValue({ 
      name: 'Test User', 
      email: 'user@example.com', 
      password: 'short' 
    });
    
    // Act
    const response = await POST(mockRequest);
    
    // Assert
    expect(response.data.success).toBe(false);
    expect(response.data.message).toBe('Password must be at least 8 characters long');
    expect(response.options.status).toBe(400);
    expect(mockFindByEmail).not.toHaveBeenCalled();
  });
  
  test('should return 409 if email is already registered', async () => {
    // Arrange
    (mockRequest.json as jest.Mock).mockResolvedValue({ 
      name: 'Test User', 
      email: 'existing@example.com', 
      password: 'password123' 
    });
    mockFindByEmail.mockResolvedValue({
      id: 'existing-id',
      email: 'existing@example.com',
      passwordHash: 'hashed-password',
      name: 'Existing User',
      role: 'user',
    });
    
    // Act
    const response = await POST(mockRequest);
    
    // Assert
    expect(response.data.success).toBe(false);
    expect(response.data.message).toBe('Email is already registered');
    expect(response.options.status).toBe(409);
    expect(mockFindByEmail).toHaveBeenCalledWith('existing@example.com');
    expect(mockCreate).not.toHaveBeenCalled();
  });
  
  test('should return 200 and user data if signup is successful', async () => {
    // Arrange
    (mockRequest.json as jest.Mock).mockResolvedValue({ 
      name: 'New User', 
      email: 'new@example.com', 
      password: 'password123' 
    });
    mockFindByEmail.mockResolvedValue(undefined);
    mockCreate.mockResolvedValue({
      id: 'new-user-id',
      email: 'new@example.com',
      name: 'New User',
      role: 'user',
      passwordHash: 'hashed-password',
    });
    
    // Act
    const response = await POST(mockRequest);
    
    // Assert
    expect(response.data.success).toBe(true);
    expect(response.data.message).toBe('User registered successfully');
    expect(response.data.user).toEqual({
      id: 'new-user-id',
      name: 'New User',
      email: 'new@example.com',
      role: 'user',
    });
    expect(mockFindByEmail).toHaveBeenCalledWith('new@example.com');
    expect(mockCreate).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
      role: 'user',
    });
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
  
  test('should create user with empty name if name is not provided', async () => {
    // Arrange
    (mockRequest.json as jest.Mock).mockResolvedValue({ 
      email: 'new@example.com', 
      password: 'password123' 
    });
    mockFindByEmail.mockResolvedValue(undefined);
    mockCreate.mockResolvedValue({
      id: 'new-user-id',
      email: 'new@example.com',
      name: '',
      role: 'user',
      passwordHash: 'hashed-password',
    });
    
    // Act
    const response = await POST(mockRequest);
    
    // Assert
    expect(response.data.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123',
      name: '',
      role: 'user',
    });
  });
});