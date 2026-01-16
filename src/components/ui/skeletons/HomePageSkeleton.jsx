import React from 'react';
import PlaceCardSkeleton from './PlaceCardSkeleton';
import styles from '@/styles/components/skeletons/home-page-skeleton.module.css';

const cardPlaceholders = Array.from({ length: 4 });

export default function HomePageSkeleton() {
  return (
    <div className={styles.content}>
      {/* Primary recommendations section */}
      <section className={styles.section}>
        <div className={styles.headerRow}>
          <div className={styles.titleSkeleton} />
        </div>
        <div className={styles.scroller}>
          <div className={styles.track}>
            {cardPlaceholders.map((_, index) => (
              <PlaceCardSkeleton key={`primary-${index}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Banner section */}
      <div className={styles.bannerWrapper}>
        <div className={styles.bannerSkeleton}>
          <div className={styles.bannerContent}>
            <div className={styles.bannerTitleSkeleton} />
            <div className={styles.bannerDescSkeleton} />
            <div className={styles.bannerDescSkeleton} style={{ width: '70%' }} />
          </div>
          <div className={styles.bannerImageSkeleton} />
        </div>
      </div>

      {/* Time-based recommendations section */}
      <section className={styles.section}>
        <div className={styles.headerRow}>
          <div className={styles.titleSkeleton} style={{ width: '140px' }} />
        </div>
        <div className={styles.scroller}>
          <div className={styles.track}>
            {cardPlaceholders.map((_, index) => (
              <PlaceCardSkeleton key={`time-${index}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Category section */}
      <section className={styles.section}>
        <div className={styles.headerRow}>
          <div className={styles.titleSkeleton} style={{ width: '180px' }} />
        </div>
        <div className={styles.scroller}>
          <div className={styles.track}>
            {cardPlaceholders.map((_, index) => (
              <PlaceCardSkeleton key={`category-${index}`} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
