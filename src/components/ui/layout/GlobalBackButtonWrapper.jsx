import React from 'react';
import { useBackButton } from '@/contexts/BackButtonContext';
import GlobalBackButton from './GlobalBackButton';

export default function GlobalBackButtonWrapper() {
  const { showBackButton, onBackClick } = useBackButton();

  const handleClick = () => {
    const handler = onBackClick();
    if (handler) {
      handler();
    }
  };

  return (
    <GlobalBackButton
      show={showBackButton}
      onClick={handleClick}
    />
  );
}