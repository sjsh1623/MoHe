import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/components/buttons/back-button.module.css';

export default function BackButton({ onClick, className = '', ...props }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  return (
    <button 
      className={`${styles.button} ${className}`}
      onClick={handleClick}
      aria-label="뒤로 가기"
      {...props}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.icon}>
        <path 
          d="M3.62 10.7853L11.1122 18.2691L10 19.375L0.625 10L10 0.625L11.1122 1.73094L3.62 9.21469H19.375V10.7853H3.62Z" 
          fill="currentColor"
        />
      </svg>
    </button>
  );
}