module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock the db module to avoid ESM-related issues
    '^@/db$': '<rootDir>/src/__mocks__/db.ts',
    // Mock UserRepository to avoid db module issues
    '^@/db/repositories/userRepository$': '<rootDir>/src/__mocks__/userRepository.ts',
    // Mock auth module to avoid TextEncoder issues
    '^@/lib/auth$': '<rootDir>/src/__mocks__/auth.ts',
    // Mock server-only module
    'server-only': '<rootDir>/__mocks__/server-only.js',
    // Mock jose module to avoid ESM syntax issues
    'jose': '<rootDir>/__mocks__/jose.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: true,
    }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(.*))'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/db/migrations/**',
  ],
  coverageDirectory: 'coverage',
};