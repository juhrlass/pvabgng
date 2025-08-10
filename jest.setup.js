// This file is used to set up the testing environment before running tests

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

// Mock Next.js headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn((name) => ({ value: `mock-${name}-value` })),
    set: jest.fn(),
    delete: jest.fn(),
  })),
  headers: jest.fn(() => new Map()),
}));

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Ignore specific errors that might occur during testing
  if (
    args[0]?.includes?.('Warning:') ||
    args[0]?.includes?.('Error:') ||
    args[0]?.includes?.('Invalid hook call')
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Clean up after tests
afterEach(() => {
  jest.clearAllMocks();
});