# Authentication Tests

This directory contains tests for the authentication functionality of the PVABGNG application.

## Test Structure

The tests are organized in the following structure:

- `__tests__/api/auth/login.test.ts`: Tests for the login API endpoint
- `__tests__/api/auth/signup.test.ts`: Tests for the signup API endpoint

## Setup Instructions

To run these tests, you need to set up Jest and related dependencies:

1. Install the required dependencies:

```bash
pnpm add -D jest @types/jest ts-jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom
```

2. Create a Jest configuration file (`jest.config.js`) in the project root:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
```

3. Create a Jest setup file (`jest.setup.js`) in the project root:

```javascript
// Add any global setup for Jest here
```

4. Add the test script to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

## Running the Tests

To run the tests:

```bash
pnpm test
```

To run the tests in watch mode (automatically re-run when files change):

```bash
pnpm test:watch
```

## Test Coverage

To generate a test coverage report:

```bash
pnpm test -- --coverage
```

This will create a coverage report in the `coverage` directory.

## Test Details

### Login Tests

The login tests (`login.test.ts`) verify that the login API endpoint:

- Returns a 400 error if email is missing
- Returns a 400 error if password is missing
- Returns a 401 error if the user is not found
- Returns a 401 error if the password is incorrect
- Returns a 200 success response with user data if login is successful
- Handles server errors correctly

### Signup Tests

The signup tests (`signup.test.ts`) verify that the signup API endpoint:

- Returns a 400 error if email is missing
- Returns a 400 error if password is missing
- Returns a 400 error if the email format is invalid
- Returns a 400 error if the password is too short
- Returns a 409 error if the email is already registered
- Returns a 200 success response with user data if signup is successful
- Handles server errors correctly
- Creates a user with an empty name if name is not provided

## Mocking

The tests use Jest's mocking capabilities to mock dependencies:

- `UserRepository` for database operations
- `auth` functions for token creation and cookie management
- `NextRequest` and `NextResponse` for handling HTTP requests and responses

This allows the tests to run without requiring a real database or making actual HTTP requests.