import React from 'react';
import { Container } from '@/components/ui/layout';
import { SkeletonImage, SkeletonText, SkeletonCircle } from '@/components/ui/layout/SkeletonLoader';
import styles from '@/styles/components/skeletons/bookmarks-skeleton.module.css';

export default function BookmarksSkeleton() {
  return (
    <Container className={styles.container}>
      <div className={styles.bookmarksList}>
        {[...Array(8)].map((_, index) => (
          <div key={index} className={styles.bookmarkCard}>
            <SkeletonImage width="100%" height="200px" className={styles.image} />
            <div className={styles.content}>
              <SkeletonText width="70%" height="20px" className={styles.name} />
              
              <div className={styles.locationRow}>
                <SkeletonCircle size="16px" />
                <SkeletonText width="50%" height="16px" />
              </div>
              
              <div className={styles.ratingRow}>
                <div className={styles.stars}>
                  <SkeletonCircle size="15px" />
                  <SkeletonCircle size="15px" />
                  <SkeletonCircle size="15px" />
                </div>
                <SkeletonText width="30px" height="16px" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}