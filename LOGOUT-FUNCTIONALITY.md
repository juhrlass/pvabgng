# Logout Functionality Implementation

This document provides an overview of the logout functionality implemented in the PVABGNG application.

## Components and Files

### 1. Logout API Endpoint
- **File**: `src/app/api/auth/logout/route.ts`
- **Description**: Handles both POST and GET requests for logout
- **Functionality**: Removes the JWT token cookie using the `removeTokenCookie` function

### 2. Auth Library
- **File**: `src/lib/auth.ts`
- **Description**: Contains authentication-related utility functions
- **Functionality**: Includes the `removeTokenCookie` function that deletes the token cookie

### 3. LogoutButton Component
- **File**: `src/components/LogoutButton.tsx`
- **Description**: A reusable button component for logging out
- **Features**:
  - Loading state handling
  - Error handling
  - Multiple style variants
  - Success callback support

### 4. Dedicated Logout Page
- **Files**: 
  - `src/app/logout/page.tsx`
  - `src/app/logout/layout.tsx`
- **Description**: A dedicated page that automatically logs out the user
- **Features**:
  - Automatic logout on page load
  - Loading state display
  - Success message with login link
  - Error handling with retry option

### 5. Navbar Integration
- **File**: `src/components/Navbar.tsx`
- **Description**: Navigation bar with logout links
- **Features**:
  - Desktop and mobile logout links
  - Redirects to the dedicated logout page

### 6. Auth Provider
- **File**: `src/components/AuthProvider.tsx`
- **Description**: Context provider for authentication state
- **Functionality**:
  - Manages user state
  - Provides logout function that:
    - Calls the logout API
    - Clears user state
    - Redirects to login page

### 7. Middleware
- **File**: `src/middleware.ts`
- **Description**: Handles route protection and redirects
- **Functionality**:
  - Prevents access to protected routes for unauthenticated users
  - Redirects to login page when token is missing or invalid

## Logout Flow

1. User initiates logout by:
   - Clicking the logout link in the navbar, or
   - Navigating to the `/logout` page directly

2. If using the navbar link:
   - User is redirected to the dedicated logout page

3. On the logout page:
   - The page automatically calls the logout function from AuthProvider
   - Shows a loading indicator during the process

4. The logout function:
   - Makes a request to the logout API endpoint
   - The API endpoint removes the token cookie
   - Sets the user state to null
   - Redirects to the login page

5. After logout:
   - Protected routes are no longer accessible
   - Middleware redirects to login page if protected routes are accessed
   - User needs to log in again to access protected content

## Security Considerations

- The token cookie is HTTP-only, preventing JavaScript access
- The logout endpoint is accessible via both POST and GET for flexibility
- The middleware ensures proper route protection
- Error handling is implemented at multiple levels

## Testing

To test the logout functionality:

1. Log in with valid credentials
2. Navigate to protected routes to confirm access
3. Click the logout link in the navbar
4. Verify redirection to the logout page and then to the login page
5. Attempt to access protected routes to confirm they're no longer accessible