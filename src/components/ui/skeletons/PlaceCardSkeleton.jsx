import React from 'react';
import { SkeletonCard, SkeletonImage, SkeletonText, SkeletonCircle } from '@/components/ui/layout/SkeletonLoader';
import styles from '@/styles/components/skeletons/place-card-skeleton.module.css';

export default function PlaceCardSkeleton({ variant = 'default' }) {
  if (variant === 'grid') {
    return (
      <SkeletonCard className={styles.gridCard}>
        <SkeletonImage width="100%" aspectRatio="176/159" className={styles.gridImage} />
        <div className={styles.gridContent}>
          <SkeletonText width="80%" height="18px" className={styles.title} />
          <div className={styles.locationRow}>
            <SkeletonCircle size="16px" />
            <SkeletonText width="60%" height="14px" />
          </div>
          <div className={styles.ratingRow}>
            <SkeletonCircle size="12px" />
            <SkeletonCircle size="12px" />
            <SkeletonCircle size="12px" />
            <SkeletonCircle size="12px" />
            <SkeletonCircle size="12px" />
            <SkeletonText width="30px" height="14px" />
          </div>
        </div>
      </SkeletonCard>
    );
  }

  return (
    <SkeletonCard className={styles.card}>
      <SkeletonImage width="120px" height="120px" className={styles.image} />
      <div className={styles.content}>
        <div className={styles.header}>
          <SkeletonText width="70%" height="20px" className={styles.title} />
          <div className={styles.rating}>
            <SkeletonCircle size="13px" />
            <SkeletonText width="25px" height="16px" />
          </div>
        </div>
        
        <div className={styles.locationRow}>
          <SkeletonCircle size="16px" />
          <SkeletonText width="50%" height="14px" />
        </div>
        
        {/* Avatar row */}
        <div className={styles.avatarRow}>
          <SkeletonCircle size="32px" />
          <SkeletonCircle size="32px" />
          <SkeletonCircle size="32px" />
          <SkeletonText width="30px" height="14px" className={styles.additionalCount} />
        </div>
      </div>
    </SkeletonCard>
  );
}