import React from 'react';
import styles from '@/styles/components/cards/profile-card.module.css';

export default function ProfileCard({
  name,
  description,
  mbti,
  placeCount,
  avatarSrc,
  className = ''
}) {
  return (
    <div className={`${styles.profileCard} ${className}`}>
      {/* Profile Info Section */}
      <div className={styles.profileInfo}>
        <div className={styles.textSection}>
          <h2 className={styles.name}>{name}</h2>
          <p className={styles.description}>{description}</p>
        </div>
        
        <div className={styles.avatarContainer}>
          {avatarSrc ? (
            <img 
              src={avatarSrc} 
              alt={`${name}의 프로필`}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder} />
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.statsSection}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>MBTI</span>
          <span className={styles.statValue}>{mbti}</span>
        </div>
        
        <div className={styles.statItem}>
          <span className={styles.statLabel}>내 장소</span>
          <span className={styles.statValue}>{placeCount}</span>
        </div>
      </div>
    </div>
  );
}