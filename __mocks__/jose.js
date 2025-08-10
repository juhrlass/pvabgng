// Mock for jose module
// This provides mock implementations of the jose functions used in the auth module

module.exports = {
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    setNotBefore: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock-token')
  })),
  jwtVerify: jest.fn().mockResolvedValue({
    payload: {
      sub: 'mock-user-id',
      name: 'Mock User',
      email: 'mock@example.com',
      role: 'user'
    }
  })
};