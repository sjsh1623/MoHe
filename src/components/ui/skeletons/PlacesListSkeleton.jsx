import React from 'react';
import { Container } from '@/components/ui/layout';
import { SkeletonText } from '@/components/ui/layout/SkeletonLoader';
import PlaceCardSkeleton from './PlaceCardSkeleton';
import styles from '@/styles/components/skeletons/places-list-skeleton.module.css';

export default function PlacesListSkeleton() {
  return (
    <div className={styles.placesGrid}>
      {[...Array(6)].map((_, index) => (
        <div key={index} className={styles.gridItem}>
          <PlaceCardSkeleton variant="grid" />
        </div>
      ))}
    </div>
  );
}