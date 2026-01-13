import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts';

/**
 * ProtectedRoute component that requires authentication
 * Redirects to login if user is not authenticated
 * Uses AuthContext for proper token validation and refresh
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#fff'
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3182F6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Check if user is a guest
  const isGuest = user?.isGuest === true || user?.id === 'guest';

  // Not authenticated or is guest - redirect to login
  if (!isAuthenticated || isGuest) {
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