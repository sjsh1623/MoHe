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
  const [manualVisibility, setManualVisibility] = useState(null); // null = follow route rules
  const [onBackClick, setOnBackClick] = useState(null);

  const shouldShowFromRoute = useMemo(() => {
    const currentPath = location.pathname;
    const shouldHideButton = ROUTES_WITHOUT_BACK_BUTTON.includes(currentPath);
    const matchesBackRoute = ROUTES_WITH_BACK_BUTTON.some(route =>
      route.endsWith('/') ? currentPath.startsWith(route) : currentPath === route
    );
    return !shouldHideButton && (matchesBackRoute || currentPath !== '/');
  }, [location.pathname]);

  // Manual override takes priority; otherwise fall back to route-based visibility
  const showBackButton = manualVisibility ?? shouldShowFromRoute;

  useEffect(() => {
    // Reset overrides and handlers whenever the route changes
    setManualVisibility(null);
    setOnBackClick(null);
  }, [location.pathname]);

  const hideBackButton = useCallback(() => setManualVisibility(false), []);
  const showBackButtonForced = useCallback(() => setManualVisibility(true), []);
  const setBackClickHandler = useCallback((handler) => {
    // Store handler directly instead of wrapping in a function
    // This prevents creating new function references on every call
    setOnBackClick(handler ? () => handler : null);
  }, []);
  const clearBackClickHandler = useCallback(() => setOnBackClick(null), []);

  const value = useMemo(() => ({
    showBackButton,
    onBackClick,
    hideBackButton,
    showBackButtonForced,
    setBackClickHandler,
    clearBackClickHandler,
  }), [showBackButton, onBackClick]);

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
