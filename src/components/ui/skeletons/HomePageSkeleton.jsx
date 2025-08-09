import React from 'react';
import { Container } from '@/components/ui/layout';
import { SkeletonText, SkeletonBox } from '@/components/ui/layout/SkeletonLoader';
import PlaceCardSkeleton from './PlaceCardSkeleton';
import styles from '@/styles/components/skeletons/home-page-skeleton.module.css';

export default function HomePageSkeleton() {
  return (
    <Container className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <SkeletonText width="60%" height="32px" className={styles.greeting} />
        <SkeletonText width="80%" height="18px" className={styles.subtitle} />
      </div>

      {/* Weather/Context Section */}
      <div className={styles.contextSection}>
        <SkeletonBox width="100%" height="80px" borderRadius="16px" />
      </div>

      {/* Recommendations Title */}
      <div className={styles.sectionHeader}>
        <SkeletonText width="40%" height="24px" />
      </div>

      {/* Horizontal Scrollable Place Cards */}
      <div className={styles.horizontalScroll}>
        <div className={styles.cardContainer}>
          {[...Array(3)].map((_, index) => (
            <div key={index} className={styles.horizontalCard}>
              <PlaceCardSkeleton />
            </div>
          ))}
        </div>
      </div>

      {/* Another Section */}
      <div className={styles.sectionHeader}>
        <SkeletonText width="50%" height="24px" />
      </div>

      {/* Vertical Place Cards */}
      <div className={styles.verticalCards}>
        {[...Array(4)].map((_, index) => (
          <PlaceCardSkeleton key={index} />
        ))}
      </div>
    </Container>
  );
}