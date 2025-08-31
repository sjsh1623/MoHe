import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '@/services/authService';

/**
 * ProtectedRoute component that requires authentication
 * Redirects to login if user is not authenticated
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, true/false = determined
  
  useEffect(() => {
    let isMounted = true;
    
    const checkAuthentication = async () => {
      try {
        // Check if user has valid authentication
        const authenticated = authService.isAuthenticated();
        
        if (authenticated) {
          // Verify token is still valid by attempting to get user profile
          try {
            await authService.getUserProfile();
            if (isMounted) {
              setIsAuthenticated(true);
            }
          } catch (error) {
            console.warn('Token verification failed, redirecting to login:', error);
            if (isMounted) {
              setIsAuthenticated(false);
            }
          }
        } else {
          if (isMounted) {
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        if (isMounted) {
          setIsAuthenticated(false);
        }
      }
    };
    
    checkAuthentication();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Loading state
  if (isAuthenticated === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'white'
      }}>
        <div style={{
          fontSize: '16px',
          color: '#666'
        }}>
          인증 확인 중...
        </div>
      </div>
    );
  }
  
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