import React from 'react';
import styles from '@/styles/pages/place-detail-page.module.css';

export default function PlaceHeader({ name, rating, reviewCount }) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{name}</h1>

      {rating && (
        <div className={styles.ratingContainer}>
          <svg className={styles.starIcon} viewBox="0 0 13 12" fill="none">
            <path d="M6.5 0L8.23 4.47L13 5.18L9.75 8.32L10.46 13L6.5 10.77L2.54 13L3.25 8.32L0 5.18L4.77 4.47L6.5 0Z" fill="#FFD336"/>
          </svg>
          <span className={styles.ratingText}>{rating}</span>
          {reviewCount && (
            <span className={styles.reviewCount}>({reviewCount})</span>
          )}
        </div>
      )}
    </div>
  );
}
