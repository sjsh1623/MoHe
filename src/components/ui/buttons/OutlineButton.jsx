import React from 'react';
import styles from '@/styles/components/buttons/outline-button.module.css';

export default function OutlineButton({ 
  children,
  onClick,
  variant = 'default', // 'default' | 'secondary'
  size = 'medium', // 'small' | 'medium' | 'large'
  disabled = false,
  className = '',
  ...props 
}) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
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