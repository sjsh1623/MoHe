import React from 'react';
import styles from '@/styles/components/items/settings-item.module.css';

// Icon component for settings items
function SettingsIcon({ type }) {
  switch (type) {
    case 'bookmark':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.icon}>
          <path 
            d="M3 4C3 2.34315 4.34315 1 6 1H14C15.6569 1 17 2.34315 17 4V17.3358C17 18.2267 15.9228 18.6729 15.293 18.0429L11.4142 14.1642C10.6332 13.3832 9.36684 13.3832 8.58579 14.1642L4.70711 18.0429C4.07714 18.6729 3 18.2267 3 17.3358V4Z" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinejoin="round" 
            fill="none"
          />
        </svg>
      );
    
    case 'profile':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.icon}>
          <circle cx="10" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path 
            d="M5 17c0-3.5 2.5-6 5-6s5 2.5 5 6" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
        </svg>
      );
    
    case 'recent':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.icon}>
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path 
            d="M10 6v4l3 2" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      );
    
    case 'version':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.icon}>
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path 
            d="M10 7v3m0 3h.01" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      );
    
    default:
      return null;
  }
}

export default function SettingsItem({
  icon,
  title,
  subtitle,
  onClick,
  showArrow = true,
  className = ''
}) {
  return (
    <button 
      className={`${styles.settingsItem} ${className}`}
      onClick={onClick}
    >
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <SettingsIcon type={icon} />
        </div>
        
        <div className={styles.textContainer}>
          <span className={styles.title}>{title}</span>
          {subtitle && (
            <span className={styles.subtitle}>{subtitle}</span>
          )}
        </div>
      </div>
      
      {showArrow && (
        <div className={styles.arrowContainer}>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" className={styles.arrow}>
            <path 
              d="M1 1l6 6-6 6" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </button>
  );
}