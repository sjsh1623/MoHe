import React, { useRef, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Global scroll position store
const scrollPositions = new Map();

import AuthPage from '@/pages/auth/index.jsx';
import LoginPage from '@/pages/auth/LoginPage.jsx';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage.jsx';
import EmailSignupPage from '@/pages/auth/EmailSignupPage.jsx';
import EmailVerificationPage from '@/pages/auth/EmailVerificationPage.jsx';
import NicknameSetupPage from '@/pages/auth/NicknameSetupPage.jsx';
import TermsAgreementPage from '@/pages/auth/TermsAgreementPage.jsx';
import PasswordSetupPage from '@/pages/auth/PasswordSetupPage.jsx';
import HomePage from '@/pages/HomePage.jsx';
import PlacesListPage from '@/pages/PlacesListPage.jsx';
import PlaceDetailPage from '@/pages/PlaceDetailPage.jsx';
import ProfileSettingsPage from '@/pages/ProfileSettingsPage.jsx';
import ProfileEditPage from '@/pages/ProfileEditPage.jsx';
import AgeRangeSelectionPage from '@/pages/AgeRangeSelectionPage.jsx';
import MBTISelectionPage from '@/pages/MBTISelectionPage.jsx';
import SpacePreferenceSelectionPage from '@/pages/SpacePreferenceSelectionPage.jsx';
import TransportationSelectionPage from '@/pages/TransportationSelectionPage.jsx';
import HelloPage from '@/pages/HelloPage.jsx';
import BookmarksPage from '@/pages/BookmarksPage.jsx';

// Navigation flow hierarchy (lower = earlier in flow)
const ROUTE_HIERARCHY = {
  '/': 0,
  '/login': 1,
  '/forgot-password': 2,
  '/signup': 1,
  '/verify-email': 2,
  '/nickname-setup': 3,
  '/terms': 4,
  '/password-setup': 5,
  '/age-range': 6,
  '/mbti-selection': 7,
  '/space-preference': 8,
  '/transportation-selection': 9,
  '/hello': 10,
  '/home': 11,
  '/profile-settings': 12,
  '/profile-edit': 13,
  '/bookmarks': 13,
  '/places': 14,
  '/place': 15
};


export default function AnimatedRoutes() {
  const location = useLocation();
  const prevLocation = useRef(location.pathname);

  // Determine slide direction based on route hierarchy
  const getSlideDirection = () => {
    // Handle dynamic routes like /place/:id
    const getCurrentLevel = (path) => {
      if (path.startsWith('/place/')) return ROUTE_HIERARCHY['/place'];
      return ROUTE_HIERARCHY[path] || 0;
    };
    
    const currentLevel = getCurrentLevel(location.pathname);
    const prevLevel = getCurrentLevel(prevLocation.current);
    
    // If going to a higher level (forward), slide left
    // If going to a lower level (back), slide right
    return currentLevel > prevLevel ? 'forward' : 'backward';
  };

  const slideDirection = getSlideDirection();
  
  useEffect(() => {
    // Save scroll position when route changes
    if (prevLocation.current !== location.pathname) {
      if (prevLocation.current) {
        scrollPositions.set(prevLocation.current, window.scrollY);
        console.log(`Saved: ${prevLocation.current} = ${window.scrollY}px`);
      }
      prevLocation.current = location.pathname;
      
      // Page tracking for scroll preservation
    }
    
    // Disable browser scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Restore scroll position immediately for instant restoration
    const savedPosition = scrollPositions.get(location.pathname) || 0;
    console.log(`Restoring: ${location.pathname} = ${savedPosition}px`);
    
    // Use requestAnimationFrame for smoother restoration
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedPosition, behavior: 'instant' });
    });
    
    // Track scroll for current page
    const handleScroll = () => {
      scrollPositions.set(location.pathname, window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  const slideVariants = {
    initial: (direction) => ({
      x: direction === 'forward' ? '100%' : '-100%', // Forward: right to left, Backward: left to right
      opacity: 1
    }),
    animate: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction === 'forward' ? '-100%' : '100%', // Forward: exit left, Backward: exit right
      opacity: 1
    })
  };

  return (
    <div style={{ 
      width: '100%', 
      background: 'white', 
      position: 'relative', 
      minHeight: '100vh'
    }}>
      <AnimatePresence initial={false} custom={slideDirection}>
        <motion.div
          key={location.pathname}
          custom={slideDirection}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: 0.2,
            ease: "easeInOut"
          }}
          style={{
            width: '100%',
            minHeight: '100vh',
            background: 'white'
          }}
        >
          <Routes location={location}>
            <Route path="/" element={<AuthPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/signup" element={<EmailSignupPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/nickname-setup" element={<NicknameSetupPage />} />
            <Route path="/terms" element={<TermsAgreementPage />} />
            <Route path="/password-setup" element={<PasswordSetupPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/age-range" element={<AgeRangeSelectionPage />} />
            <Route path="/mbti-selection" element={<MBTISelectionPage />} />
            <Route path="/space-preference" element={<SpacePreferenceSelectionPage />} />
            <Route path="/transportation-selection" element={<TransportationSelectionPage />} />
            <Route path="/hello" element={<HelloPage />} />
            <Route path="/profile-settings" element={<ProfileSettingsPage />} />
            <Route path="/profile-edit" element={<ProfileEditPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/places" element={<PlacesListPage />} />
            <Route path="/place/:id" element={<PlaceDetailPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}