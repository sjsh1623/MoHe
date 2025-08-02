import React from 'react';
import styles from '@/styles/components/indicators/location-pin.module.css';

export default function LocationPin({
  location,
  size = 'small', // 'small' | 'medium' | 'large'
  className = ''
}) {
  return (
    <div className={`${styles.container} ${styles[size]} ${className}`}>
      <div className={styles.pin}>
        <svg width="16" height="21" viewBox="0 0 16 21" fill="none">
          <path d="M16 7.89543C16 11.4895 11.125 17.8881 8.9875 20.5281C8.475 21.1573 7.525 21.1573 7.0125 20.5281C4.8375 17.8881 0 11.4895 0 7.89543C0 3.53485 3.58167 0 8 0C12.4167 0 16 3.53485 16 7.89543Z" fill="var(--Background-Positive-Default, #14AE5C)"/>
          <ellipse cx="8" cy="7.875" rx="2.66667" ry="2.625" fill="white"/>
        </svg>
      </div>
      <span className={styles.location}>{location}</span>
    </div>
  );
}