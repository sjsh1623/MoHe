import React from 'react';
import PlaceCardSkeleton from './PlaceCardSkeleton';
import styles from '@/styles/components/skeletons/home-page-skeleton.module.css';

const cardPlaceholders = Array.from({ length: 4 });

export default function SectionSkeleton({ titleWidth = '160px' }) {
  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <div className={styles.titleSkeleton} style={{ width: titleWidth }} />
      </div>
      <div className={styles.scroller}>
        <div className={styles.track}>
          {cardPlaceholders.map((_, index) => (
            <PlaceCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
