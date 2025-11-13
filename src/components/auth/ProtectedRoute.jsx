import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '@/services/authService';

/**
 * ProtectedRoute component that requires authentication
 * Redirects to login if user is not authenticated
 *
 * SIMPLIFIED VERSION: Uses synchronous check to prevent infinite loops
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();

  // Synchronous authentication check - runs only once during render
  const isAuthenticated = useMemo(() => {
    const user = authService.getCurrentUser();
    const token = authService.getToken();

    // Check if user exists and is not a guest
    if (!user || !token) {
      return false;
    }

    // Check if user is a guest user
    if (user.isGuest === true || user.id === 'guest') {
      return false;
    }

    return true;
  }, []);

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname,
          message: '이 기능을 사용하려면 로그인이 필요합니다.'
        }}
        replace
      />
    );
  }

  // Authenticated - render children
  return children;
}