import React from 'react';
import styles from '@/styles/components/layout/stack.module.css';

export default function Stack({ 
  children, 
  spacing = 'md', 
  align = 'stretch',
  justify = 'flex-start',
  className = '',
  ...props 
}) {
  const classes = [
    styles.stack,
    styles[`spacing-${spacing}`],
    styles[`align-${align}`],
    styles[`justify-${justify}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}