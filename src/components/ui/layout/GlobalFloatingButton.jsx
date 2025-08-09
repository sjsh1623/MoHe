import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FloatingButton from '@/components/ui/buttons/FloatingButton';

// Routes where the floating button should be shown (only home page)
const VISIBLE_ROUTES = [
  '/home'
];

export default function GlobalFloatingButton() {
  const location = useLocation();
  const navigate = useNavigate();

  // Show floating button only on home page
  const shouldShow = VISIBLE_ROUTES.includes(location.pathname);

  const handleFloatingButtonClick = () => {
    console.log('Search button clicked - navigating to search results');
    navigate('/search-results');
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <FloatingButton onClick={handleFloatingButtonClick} />
  );
}