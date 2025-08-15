import React from 'react';
import { Container } from '@/components/ui/layout';
import { SkeletonImage, SkeletonText, SkeletonCircle } from '@/components/ui/layout/SkeletonLoader';
import styles from '@/styles/components/skeletons/bookmarks-skeleton.module.css';

export default function BookmarksSkeleton() {
  return (
    <div className={styles.bookmarksList}>
      {[...Array(8)].map((_, index) => (
        <div key={index} className={styles.card}>
          <div className={styles.imageContainer}>
            <SkeletonImage width="150px" height="150px" className={styles.image} />
          </div>
          
          <div className={styles.content}>
            <SkeletonText width="70%" height="28px" className={styles.name} />
            
            <div className={styles.locationRow}>
              <SkeletonCircle size="16px" />
              <SkeletonText width="50%" height="24px" />
            </div>
            
            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                <SkeletonCircle size="15px" />
                <SkeletonCircle size="15px" />
                <SkeletonCircle size="15px" />
              </div>
              <SkeletonText width="34px" height="24px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}