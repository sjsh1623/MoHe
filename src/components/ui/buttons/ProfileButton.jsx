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
      aria-label="프로필 메뉴"
      {...props}
    >
      <div className={styles.profileIcon}>
        {/* Head/Avatar circle */}
        <div className={styles.avatarCircle} />
        {/* Body/Shoulders shape */}
        <div className={styles.bodyShape} />
      </div>
    </button>
  );
}