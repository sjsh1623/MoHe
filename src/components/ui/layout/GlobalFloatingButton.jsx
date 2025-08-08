import React from 'react';
import { useLocation } from 'react-router-dom';
import FloatingButton from '@/components/ui/buttons/FloatingButton';

// Routes where the floating button should be shown (only home page)
const VISIBLE_ROUTES = [
  '/home'
];

export default function GlobalFloatingButton() {
  const location = useLocation();

  // Show floating button only on home page
  const shouldShow = VISIBLE_ROUTES.includes(location.pathname);

  const handleFloatingButtonClick = () => {
    console.log('Global floating button clicked');
    // TODO: Open AI assistant or quick actions
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <FloatingButton onClick={handleFloatingButtonClick} />
  );
}