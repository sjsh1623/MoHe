import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

export const useAppNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Enhanced navigation function with WebView optimizations
  const navigateTo = useCallback((path, options = {}) => {
    // Prevent navigation if already on the target route
    if (location.pathname === path) {
      return;
    }

    // Use replace for certain navigation patterns to optimize history
    const { replace = false, state } = options;
    
    if (replace) {
      navigate(path, { replace: true, state });
    } else {
      navigate(path, { state });
    }
  }, [navigate, location.pathname]);

  // Go back with fallback
  const goBack = useCallback((fallbackPath = '/') => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigateTo(fallbackPath, { replace: true });
    }
  }, [navigate, navigateTo]);

  // Replace current route
  const replaceCurrent = useCallback((path, state) => {
    navigateTo(path, { replace: true, state });
  }, [navigateTo]);

  return {
    navigateTo,
    goBack,
    replaceCurrent,
    currentPath: location.pathname,
    location
  };
};