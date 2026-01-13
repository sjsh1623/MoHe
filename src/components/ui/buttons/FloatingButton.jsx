import React from 'react';
import styles from '@/styles/components/buttons/floating-button.module.css';

export default function FloatingButton({
  onClick,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={`${styles.floatingButton} ${className}`}
      onClick={onClick}
      {...props}
    >
      <div className={styles.searchIcon}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2"/>
          <path d="M16 16L20 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div className={styles.textContent}>
        <span className={styles.primaryText}>어디로 가볼까요?</span>
        <span className={styles.secondaryText}>장소 검색</span>
      </div>
      {children}
    </button>
  );
}