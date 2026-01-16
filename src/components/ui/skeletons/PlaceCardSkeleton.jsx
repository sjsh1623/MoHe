import React from 'react';
import styles from '@/styles/components/skeletons/place-card-skeleton.module.css';

export default function PlaceCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <div className={styles.imageSkeleton} />
        <div className={styles.bookmarkSkeleton} />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleSkeleton} />
          <div className={styles.ratingSkeleton}>
            <div className={styles.starSkeleton} />
            <div className={styles.ratingTextSkeleton} />
          </div>
        </div>

        <div className={styles.locationRow}>
          <div className={styles.locationIconSkeleton} />
          <div className={styles.locationTextSkeleton} />
        </div>
      </div>
    </div>
  );
}
