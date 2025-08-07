import React from 'react';
import { Link } from 'react-router-dom';
import styles from '@/styles/components/links/text-link.module.css';

export default function TextLink({ 
  children, 
  href,
  to,
  onClick,
  variant = 'default',
  className = '',
  external = false,
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

  // If external link or has href, use regular anchor
  if (external || (href && !to)) {
    return (
      <a 
        href={href}
        className={classes}
        onClick={handleClick}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        {...props}
      >
        {children}
      </a>
    );
  }

  // If has 'to' prop or onClick only, use React Router Link or button-like behavior
  if (to) {
    return (
      <Link 
        to={to}
        className={classes}
        onClick={onClick}
        {...props}
      >
        {children}
      </Link>
    );
  }

  // For onClick only (current usage pattern)
  return (
    <button 
      type="button"
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}