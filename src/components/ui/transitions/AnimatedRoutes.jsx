import React, { useRef, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Global scroll position store
const scrollPositions = new Map();

import AuthPage from '@/pages/auth/index.jsx';
import LoginPage from '@/pages/auth/LoginPage.jsx';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage.jsx';
import EmailSignupPage from '@/pages/auth/EmailSignupPage.jsx';
import EmailVerificationPage from '@/pages/auth/EmailVerificationPage.jsx';
import TermsAgreementPage from '@/pages/auth/TermsAgreementPage.jsx';
import PasswordSetupPage from '@/pages/auth/PasswordSetupPage.jsx';
import HomePage from '@/pages/HomePage.jsx';
import PlacesListPage from '@/pages/PlacesListPage.jsx';
import PlaceDetailPage from '@/pages/PlaceDetailPage.jsx';

// Navigation flow hierarchy (lower = earlier in flow)
const ROUTE_HIERARCHY = {
  '/': 0,
  '/login': 1,
  '/forgot-password': 2,
  '/signup': 1,
  '/verify-email': 2,
  '/terms': 3,
  '/password-setup': 4,
  '/home': 5,
  '/places': 6,
  '/place': 7
};


export default function AnimatedRoutes() {
  const location = useLocation();
  const prevLocation = useRef(location.pathname);
  const [visitedPages, setVisitedPages] = useState(new Set([location.pathname]));

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
      
      // Add current page to visited pages for caching
      setVisitedPages(prev => new Set([...prev, location.pathname]));
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
      x: direction === 'forward' ? '-100%' : '100%', // Fixed direction
      opacity: 1
    }),
    animate: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction === 'forward' ? '100%' : '-100%', // Fixed direction
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
          {/* Render all visited pages but only show the current one */}
          <div style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
            {/* Always render visited pages to keep them cached */}
            {visitedPages.has('/') && (
              <div style={{ display: location.pathname === '/' ? 'block' : 'none' }}>
                <AuthPage />
              </div>
            )}
            {visitedPages.has('/login') && (
              <div style={{ display: location.pathname === '/login' ? 'block' : 'none' }}>
                <LoginPage />
              </div>
            )}
            {visitedPages.has('/forgot-password') && (
              <div style={{ display: location.pathname === '/forgot-password' ? 'block' : 'none' }}>
                <ForgotPasswordPage />
              </div>
            )}
            {visitedPages.has('/signup') && (
              <div style={{ display: location.pathname === '/signup' ? 'block' : 'none' }}>
                <EmailSignupPage />
              </div>
            )}
            {visitedPages.has('/verify-email') && (
              <div style={{ display: location.pathname === '/verify-email' ? 'block' : 'none' }}>
                <EmailVerificationPage />
              </div>
            )}
            {visitedPages.has('/terms') && (
              <div style={{ display: location.pathname === '/terms' ? 'block' : 'none' }}>
                <TermsAgreementPage />
              </div>
            )}
            {visitedPages.has('/password-setup') && (
              <div style={{ display: location.pathname === '/password-setup' ? 'block' : 'none' }}>
                <PasswordSetupPage />
              </div>
            )}
            {visitedPages.has('/home') && (
              <div style={{ display: location.pathname === '/home' ? 'block' : 'none' }}>
                <HomePage />
              </div>
            )}
            {visitedPages.has('/places') && (
              <div style={{ display: location.pathname === '/places' ? 'block' : 'none' }}>
                <PlacesListPage />
              </div>
            )}
            {/* Handle dynamic routes like /place/:id */}
            {Array.from(visitedPages).filter(path => path.startsWith('/place/')).map(path => (
              <div key={path} style={{ display: location.pathname === path ? 'block' : 'none' }}>
                <PlaceDetailPage />
              </div>
            ))}
            
            {/* Fallback for unvisited pages */}
            {!visitedPages.has(location.pathname) && (
              <Routes location={location}>
                <Route path="/" element={<AuthPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/signup" element={<EmailSignupPage />} />
                <Route path="/verify-email" element={<EmailVerificationPage />} />
                <Route path="/terms" element={<TermsAgreementPage />} />
                <Route path="/password-setup" element={<PasswordSetupPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/places" element={<PlacesListPage />} />
                <Route path="/place/:id" element={<PlaceDetailPage />} />
              </Routes>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}