import React from 'react';
import { SkeletonImage, SkeletonText, SkeletonBox, SkeletonCircle } from '@/components/ui/layout/SkeletonLoader';
import styles from '@/styles/components/skeletons/place-detail-skeleton.module.css';
import { buildImageUrl } from '@/utils/image';

export default function PlaceDetailSkeleton({ preloadedImage = null }) {
  const resolvedPreloadedImage = buildImageUrl(preloadedImage);
  return (
    <div className={styles.pageContainer}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        {resolvedPreloadedImage ? (
          <img 
            src={resolvedPreloadedImage} 
            alt="" 
            className={styles.preloadedImage}
          />
        ) : (
          <SkeletonImage width="100%" height="100%" className={styles.heroImage} />
        )}
        <div className={styles.heroOverlay} />
        
        {/* Image Indicators */}
        <div className={styles.imageIndicators}>
          {[...Array(5)].map((_, index) => (
            <SkeletonCircle key={index} size="8px" />
          ))}
        </div>
        
        <div className={styles.bottomHandle} />
      </div>

      {/* Content Section */}
      <div className={styles.contentSection}>
        {/* Drag Indicator */}
        <SkeletonBox width="40px" height="4px" borderRadius="2px" className={styles.dragIndicator} />
        
        {/* Title and Rating */}
        <div className={styles.header}>
          <SkeletonText width="70%" height="28px" className={styles.title} />
          <div className={styles.ratingContainer}>
            <SkeletonCircle size="13px" />
            <SkeletonText width="25px" height="16px" />
            <SkeletonText width="60px" height="14px" />
          </div>
        </div>

        {/* Tags */}
        <div className={styles.tags}>
          <SkeletonText width="80%" height="16px" />
        </div>

        {/* Location and Transportation */}
        <div className={styles.locationSection}>
          <div className={styles.locationRow}>
            <div className={styles.locationInfo}>
              <SkeletonCircle size="16px" />
              <SkeletonText width="40%" height="16px" />
            </div>
            
            <div className={styles.transportationRow}>
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
        </div>

        {/* Gallery */}
        <div className={styles.gallery}>
          {[...Array(4)].map((_, index) => (
            <div key={index} className={styles.galleryItem}>
              <SkeletonImage width="42px" height="42px" borderRadius="8px" />
              {index === 3 && (
                <div className={styles.additionalCount}>
                  <SkeletonText width="20px" height="12px" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Description */}
        <div className={styles.descriptionSection}>
          <SkeletonText width="60%" height="20px" className={styles.descriptionTitle} />
          <div className={styles.description}>
            <SkeletonText width="100%" height="16px" />
            <SkeletonText width="90%" height="16px" />
            <SkeletonText width="95%" height="16px" />
            <SkeletonText width="60%" height="16px" />
          </div>
        </div>

        {/* Experience Button */}
        <SkeletonBox width="100%" height="48px" borderRadius="12px" className={styles.experienceButton} />
      </div>
    </div>
  );
}
