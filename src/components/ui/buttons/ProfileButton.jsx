import React from 'react';
import styles from '@/styles/components/buttons/profile-button.module.css';

export default function ProfileButton({
  onClick,
  className = '',
  ...props
}) {
  return (
    <button
      className={`${styles.profileButton} ${className}`}
      onClick={onClick}
      aria-label="메뉴"
      {...props}
    >
      <span className={styles.line}></span>
      <span className={styles.line}></span>
      <span className={styles.line}></span>
    </button>
  );
}