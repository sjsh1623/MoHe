import React from 'react';
import { Container } from '@/components/ui/layout';
import PlaceCardSkeleton from './PlaceCardSkeleton';
import styles from '@/styles/components/skeletons/places-list-skeleton.module.css';

export default function PlacesListSkeleton() {
  return (
    <Container className={styles.container}>
      <div className={styles.gridContainer}>
        {[...Array(12)].map((_, index) => (
          <div key={index} className={styles.gridItem}>
            <PlaceCardSkeleton variant="grid" />
          </div>
        ))}
      </div>
    </Container>
  );
}