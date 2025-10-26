import React from 'react';
import { SkeletonImage, SkeletonText, SkeletonCircle, SkeletonBox } from '@/components/ui/layout/SkeletonLoader';
import placeCardStyles from '@/styles/components/cards/place-card.module.css';
import styles from '@/styles/components/skeletons/place-card-skeleton.module.css';

export default function PlaceCardSkeleton({ variant = 'default' }) {
  const cardClassName = [
    placeCardStyles.card,
    placeCardStyles[variant] || '',
    styles.card
  ].join(' ').trim();

  return (
    <div className={cardClassName}>
      <div className={placeCardStyles.imageContainer}>
        <SkeletonImage width="100%" height="100%" className={styles.image} />
        <div className={styles.bookmarkPlaceholder}>
          <SkeletonCircle size="34px" />
        </div>
      </div>

      <div className={placeCardStyles.content}>
        <div className={placeCardStyles.header}>
          <SkeletonText width="70%" height="20px" />
          <div className={placeCardStyles.rating}>
            <SkeletonCircle size="13px" />
            <SkeletonText width="28px" height="16px" />
          </div>
        </div>

        <div className={placeCardStyles.locationRow}>
          <SkeletonCircle size="16px" />
          <SkeletonText width="55%" height="14px" />
        </div>

        <div className={styles.metaRow}>
          <SkeletonText width="80%" height="12px" />
          <SkeletonText width="60%" height="12px" />
        </div>

        <div className={placeCardStyles.avatarRow}>
          <SkeletonCircle size="32px" />
          <SkeletonCircle size="32px" />
          <SkeletonCircle size="32px" />
          <SkeletonBox width="36px" height="16px" borderRadius="999px" />
        </div>
      </div>
    </div>
  );
}
