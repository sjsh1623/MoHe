import React from 'react';
import { Container } from '@/components/ui/layout';
import { SkeletonText, SkeletonImage, SkeletonBox, SkeletonCircle } from '@/components/ui/layout/SkeletonLoader';
import styles from '@/styles/components/skeletons/search-results-skeleton.module.css';

export default function SearchResultsSkeleton() {
  return (
    <div className={styles.resultsContainer}>
        {[...Array(2)].map((_, index) => (
          <div key={index} className={styles.placeCard}>
            {/* Horizontal Images */}
            <div className={styles.horizontalScroll}>
              <div className={styles.imagesContainer}>
                {[...Array(2)].map((_, imgIndex) => (
                  <div key={imgIndex} className={styles.imageWrapper}>
                    <SkeletonImage width="270px" height="270px" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Place Info */}
            <div className={styles.placeInfo}>
              <div className={styles.placeHeader}>
                <SkeletonText width="60%" height="20px" />
                <SkeletonText width="80px" height="14px" />
                <div className={styles.rating}>
                  <SkeletonCircle size="13px" />
                  <SkeletonText width="25px" height="16px" />
                </div>
              </div>
              
              <div className={styles.locationInfo}>
                <SkeletonText width="40%" height="16px" />
                <div className={styles.locationIcon}>
                  <SkeletonCircle size="16px" />
                </div>
                <div className={styles.transportInfo}>
                  <div className={styles.transport}>
                    <SkeletonCircle size="16px" />
                    <SkeletonText width="30px" height="14px" />
                  </div>
                  <div className={styles.transport}>
                    <SkeletonCircle size="16px" />
                    <SkeletonText width="30px" height="14px" />
                  </div>
                </div>
              </div>
              
              <div className={styles.tags}>
                <SkeletonText width="70%" height="14px" />
              </div>
              
              <div className={styles.badges}>
                <SkeletonBox width="180px" height="28px" borderRadius="14px" />
                <SkeletonBox width="150px" height="28px" borderRadius="14px" />
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}