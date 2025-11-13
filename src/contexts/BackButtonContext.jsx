import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const BackButtonContext = createContext();

// Routes that should NOT show the back button
const ROUTES_WITHOUT_BACK_BUTTON = [
  '/', // Landing page
  '/home', // Home page - main app entry point
];

// Routes that should always show the back button
const ROUTES_WITH_BACK_BUTTON = [
  '/login',
  '/forgot-password',
  '/signup',
  '/verify-email',
  '/nickname-setup',
  '/terms',
  '/password-setup',
  '/age-range',
  '/mbti-selection',
  '/space-preference',
  '/transportation-selection',
  '/hello',
  '/profile-settings',
  '/profile-edit',
  '/bookmarks',
  '/my-places',
  '/recent-view',
  '/places',
  '/place/', // Dynamic route prefix
];

export function BackButtonProvider({ children }) {
  const location = useLocation();
  const [showBackButton, setShowBackButton] = useState(true);
  const [onBackClick, setOnBackClick] = useState(null);

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Check if current route should not show back button
    const shouldHideButton = ROUTES_WITHOUT_BACK_BUTTON.includes(currentPath);
    
    // Check if it's a dynamic route that should show back button
    const isDynamicRoute = ROUTES_WITH_BACK_BUTTON.some(route => 
      route.endsWith('/') ? currentPath.startsWith(route) : currentPath === route
    );
    
    // Show back button unless explicitly hidden
    setShowBackButton(!shouldHideButton && (isDynamicRoute || currentPath !== '/'));
  }, [location.pathname]);

  const hideBackButton = useCallback(() => setShowBackButton(false), []);
  const showBackButtonForced = useCallback(() => setShowBackButton(true), []);
  const setBackClickHandler = useCallback((handler) => setOnBackClick(() => handler), []);
  const clearBackClickHandler = useCallback(() => setOnBackClick(null), []);

  const value = useMemo(() => ({
    showBackButton,
    onBackClick,
    hideBackButton,
    showBackButtonForced,
    setBackClickHandler,
    clearBackClickHandler,
  }), [showBackButton, onBackClick, hideBackButton, showBackButtonForced, setBackClickHandler, clearBackClickHandler]);

  return (
    <BackButtonContext.Provider value={value}>
      {children}
    </BackButtonContext.Provider>
  );
}

BackButtonProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useBackButton() {
  const context = useContext(BackButtonContext);
  if (!context) {
    throw new Error('useBackButton must be used within a BackButtonProvider');
  }
  return context;
}