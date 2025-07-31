import React from 'react';
import styles from '@/styles/components/links/text-link.module.css';

export default function TextLink({ 
  children, 
  href,
  onClick,
  variant = 'default',
  className = '',
  ...props 
}) {
  const classes = [
    styles.link,
    styles[variant],
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <a 
      href={href}
      className={classes}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}