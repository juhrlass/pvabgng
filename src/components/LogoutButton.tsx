'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';

interface LogoutButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'text';
  onLogoutSuccess?: () => void;
}

export default function LogoutButton({
  className = '',
  variant = 'secondary',
  onLogoutSuccess,
}: LogoutButtonProps) {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Define base styles based on variant
  let baseStyles = '';
  
  switch (variant) {
    case 'primary':
      baseStyles = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
      break;
    case 'secondary':
      baseStyles = 'px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700';
      break;
    case 'text':
      baseStyles = 'text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white';
      break;
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setError(null);
      
      await logout();
      
      // Call the success callback if provided
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="text-sm text-red-600 mb-2">{error}</div>
      )}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`${baseStyles} ${isLoggingOut ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
        aria-label="Logout"
      >
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
}