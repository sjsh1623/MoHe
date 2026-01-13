import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { authService } from '@/services/authService';

/**
 * Protected routes that require authentication
 * Guest users will be redirected to login when trying to access these
 */
export const PROTECTED_ROUTES = [
  '/profile-settings',
  '/profile-edit',
  '/bookmarks',
  '/my-places',
  '/recent-view'
];

/**
 * Auth guard hook to protect routes that require login
 * @param {boolean} requireAuth - Whether this specific page requires authentication
 */
export function useAuthGuard(requireAuth = false) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const hasNavigatedRef = useRef(false);

  // Check if user is guest
  const isGuest = !isAuthenticated || user?.isGuest === true || user?.id === 'guest';

  useEffect(() => {
    // Wait for auth to be initialized
    if (isLoading) return;

    // Check if current route is protected
    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
      location.pathname.startsWith(route)
    );

    // Only navigate once per component lifecycle
    if ((requireAuth || isProtectedRoute) && isGuest && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;

      // Use setTimeout to prevent navigation during render
      const timer = setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { from: location.pathname }
        });
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [requireAuth, isGuest, isLoading, location.pathname, navigate]);

  return {
    isGuest,
    currentUser: user,
    isAuthenticated,
    isLoading,
    isProtectedRoute: PROTECTED_ROUTES.some(route =>
      location.pathname.startsWith(route)
    )
  };
}

/**
 * Utility function to check if a user action requires authentication
 * @param {function} callback - Function to execute if authenticated
 * @param {object} options - Options object
 * @param {function} options.onRequireAuth - Called when auth is required
 */
export function withAuthCheck(callback, { onRequireAuth } = {}) {
  return (...args) => {
    const currentUser = authService.getCurrentUser();
    
    if (currentUser?.isGuest) {
      if (onRequireAuth) {
        onRequireAuth();
      } else {
        // Default behavior: redirect to login
        window.location.href = '/login';
      }
      return;
    }
    
    return callback(...args);
  };
}

export default useAuthGuard;
