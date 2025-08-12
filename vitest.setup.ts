import '@testing-library/jest-dom/vitest';
import { vi, afterEach } from 'vitest';
import { TextEncoder, TextDecoder } from 'util';

// Ensure TextEncoder/TextDecoder exist on globalThis
if (!('TextEncoder' in globalThis)) {
  Object.defineProperty(globalThis, 'TextEncoder', { value: TextEncoder, configurable: true, writable: true });
}
if (!('TextDecoder' in globalThis)) {
  Object.defineProperty(globalThis, 'TextDecoder', { value: TextDecoder as unknown, configurable: true, writable: true });
}

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

// Mock Next.js headers
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn((name: string) => ({ value: `mock-${name}-value` })),
    set: vi.fn(),
    delete: vi.fn(),
  }),
  headers: () => new Map(),
}));

// Suppress console errors during tests (allow most but filter noisy ones)
const originalConsoleError = console.error;
console.error = (...args: Parameters<typeof console.error>) => {
  const msg = args[0] as unknown;
  if (
    typeof msg === 'string' && (
      msg.includes('Warning:') ||
      msg.includes('Error:') ||
      msg.includes('Invalid hook call')
    )
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Clean up after tests
afterEach(() => {
  vi.clearAllMocks();
});

// Provide a Jest-compatible global for legacy tests that might use jest.fn, jest.mock, etc.
Object.defineProperty(globalThis, 'jest', { value: vi, configurable: true, writable: true });

// Type declaration for global jest when using Vitest
// This helps TypeScript understand the global `jest` in test files
declare global {
  // eslint-disable-next-line no-var
  var jest: typeof vi;
}
