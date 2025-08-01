import React, { useRef, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import AuthPage from '@/pages/auth/index.jsx';
import LoginPage from '@/pages/auth/LoginPage.jsx';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage.jsx';
import EmailSignupPage from '@/pages/auth/EmailSignupPage.jsx';
import EmailVerificationPage from '@/pages/auth/EmailVerificationPage.jsx';
import TermsAgreementPage from '@/pages/auth/TermsAgreementPage.jsx';

// Navigation flow hierarchy (lower = earlier in flow)
const ROUTE_HIERARCHY = {
  '/': 0,
  '/login': 1,
  '/forgot-password': 2,
  '/signup': 1,
  '/verify-email': 2,
  '/terms': 3
};

export default function AnimatedRoutes() {
  const location = useLocation();
  const prevLocation = useRef(location.pathname);

  // Determine slide direction based on route hierarchy
  const getSlideDirection = () => {
    const currentLevel = ROUTE_HIERARCHY[location.pathname] || 0;
    const prevLevel = ROUTE_HIERARCHY[prevLocation.current] || 0;
    
    // If going to a higher level (forward), slide left
    // If going to a lower level (back), slide right
    return currentLevel > prevLevel ? 'forward' : 'backward';
  };

  const slideDirection = getSlideDirection();
  
  useEffect(() => {
    prevLocation.current = location.pathname;
  }, [location.pathname]);

  const slideVariants = {
    initial: (direction) => ({
      x: direction === 'forward' ? '100%' : '-100%',
      opacity: 0.8
    }),
    animate: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction === 'forward' ? '-100%' : '100%',
      opacity: 0.8
    })
  };

  return (
    <AnimatePresence mode="popLayout" custom={slideDirection}>
      <motion.div
        key={location.pathname}
        custom={slideDirection}
        variants={slideVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          type: "tween",
          ease: [0.25, 0.46, 0.45, 0.94],
          duration: 0.25,
        }}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100vh',
          background: 'white'
        }}
      >
        <Routes location={location}>
          <Route path="/" element={<AuthPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/signup" element={<EmailSignupPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/terms" element={<TermsAgreementPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}