import React from 'react';
import styles from '@/styles/components/buttons/primary-button.module.css';

export default function PrimaryButton({
  children,
  disabled = false,
  variant = 'primary',
  onClick,
  className = '',
  ...props
}) {

  const classes = [
    styles.button,
    styles[variant],
    disabled ? styles.disabled : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}