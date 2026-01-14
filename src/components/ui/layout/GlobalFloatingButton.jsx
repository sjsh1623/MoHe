import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FloatingButton from '@/components/ui/buttons/FloatingButton';

// Routes where the floating button should be shown (only home page)
const VISIBLE_ROUTES = [
  '/home'
];

// Scroll threshold to show/hide button (show after scrolling past header ~50px)
const SCROLL_THRESHOLD = 50;

export default function GlobalFloatingButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  // Show floating button only on home page
  const shouldShow = VISIBLE_ROUTES.includes(location.pathname);

  const handleScroll = useCallback(() => {
    // Try multiple scroll containers
    const pageContainer = document.querySelector('[data-page-container]');
    const routeContainer = document.querySelector(`[data-route="${location.pathname}"]`);

    let scrollY = 0;
    if (routeContainer) {
      scrollY = routeContainer.scrollTop;
    } else if (pageContainer) {
      scrollY = pageContainer.scrollTop;
    } else {
      scrollY = window.scrollY || document.documentElement.scrollTop;
    }

    // Show button when scrolled down past threshold
    setIsVisible(scrollY > SCROLL_THRESHOLD);
  }, [location.pathname]);

  useEffect(() => {
    if (!shouldShow) {
      setIsVisible(false);
      return;
    }

    // Delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const pageContainer = document.querySelector('[data-page-container]');
      const routeContainer = document.querySelector(`[data-route="${location.pathname}"]`);

      // Add scroll listeners to all potential containers
      if (routeContainer) {
        routeContainer.addEventListener('scroll', handleScroll, { passive: true });
      }
      if (pageContainer) {
        pageContainer.addEventListener('scroll', handleScroll, { passive: true });
      }
      window.addEventListener('scroll', handleScroll, { passive: true });

      // Initial check
      handleScroll();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      const pageContainer = document.querySelector('[data-page-container]');
      const routeContainer = document.querySelector(`[data-route="${location.pathname}"]`);

      if (routeContainer) {
        routeContainer.removeEventListener('scroll', handleScroll);
      }
      if (pageContainer) {
        pageContainer.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [shouldShow, location.pathname, handleScroll]);

  const handleFloatingButtonClick = () => {
    navigate('/search-results');
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <FloatingButton onClick={handleFloatingButtonClick} isVisible={isVisible} />
  );
}