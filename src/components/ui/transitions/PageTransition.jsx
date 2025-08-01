import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from '@/styles/components/transitions/page-transition.module.css';

export default function PageTransition({ children, direction = 'slide-left' }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const location = useLocation();

  useEffect(() => {
    // Trigger animation on route change
    setIsAnimating(true);
    setAnimationClass(styles[direction]);

    // Reset animation after transition completes
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setAnimationClass('');
    }, 300); // Match CSS animation duration

    return () => clearTimeout(timer);
  }, [location.pathname, direction]);

  return (
    <div className={`${styles.container} ${animationClass}`}>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}