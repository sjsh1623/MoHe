import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Navigation flow mapping for auth pages
const NAVIGATION_FLOW = {
  '/': { 
    '/login': 'slide-left',
    '/signup': 'slide-left'
  },
  '/login': {
    '/': 'slide-right',
    '/forgot-password': 'slide-left'
  },
  '/signup': {
    '/': 'slide-right'
  },
  '/forgot-password': {
    '/login': 'slide-right'
  }
};

export function usePageTransition() {
  const location = useLocation();
  const [previousPath, setPreviousPath] = useState(location.pathname);
  const [transitionDirection, setTransitionDirection] = useState('slide-left');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Skip transition on initial load
    if (previousPath === currentPath) {
      return;
    }

    // Determine transition direction based on navigation flow
    const direction = NAVIGATION_FLOW[previousPath]?.[currentPath] || 'slide-left';
    
    setTransitionDirection(direction);
    setIsTransitioning(true);

    // Reset transition state after animation
    const timer = setTimeout(() => {
      setIsTransitioning(false);
      setPreviousPath(currentPath);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname, previousPath]);

  return {
    transitionDirection,
    isTransitioning,
    previousPath
  };
}