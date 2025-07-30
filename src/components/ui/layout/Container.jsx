import React from 'react';
import styles from '@/styles/components/layout/container.module.css';

export default function Container({ 
  children, 
  padding = 'md',
  maxWidth = 'mobile',
  className = '',
  ...props 
}) {
  const classes = [
    styles.container,
    styles[`padding-${padding}`],
    styles[`max-width-${maxWidth}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}