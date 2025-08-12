import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: [
      // Specific mocks first to override real modules
      { find: '@/db/repositories/userRepository', replacement: path.resolve(__dirname, 'src/__mocks__/userRepository.ts') },
      { find: '@/db', replacement: path.resolve(__dirname, 'src/__mocks__/db.ts') },
      { find: '@/lib/auth', replacement: path.resolve(__dirname, 'src/__mocks__/auth.ts') },
      { find: 'server-only', replacement: path.resolve(__dirname, '__mocks__/server-only.js') },
      { find: 'jose', replacement: path.resolve(__dirname, '__mocks__/jose.js') },
      // Generic path alias
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reports: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/*.stories.{ts,tsx}', 'src/db/migrations/**'],
      all: false,
    },
  },
});
