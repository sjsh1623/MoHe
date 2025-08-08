import React from 'react';
import { useBackButton } from '@/contexts/BackButtonContext';
import GlobalBackButton from './GlobalBackButton';

export default function GlobalBackButtonWrapper() {
  const { showBackButton, onBackClick } = useBackButton();

  return (
    <GlobalBackButton 
      show={showBackButton}
      onClick={onBackClick}
    />
  );
}