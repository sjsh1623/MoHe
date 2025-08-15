import React from 'react';
import { Container } from '@/components/ui/layout';
import { SkeletonText, SkeletonBox } from '@/components/ui/layout/SkeletonLoader';
import PlaceCardSkeleton from './PlaceCardSkeleton';
import styles from '@/styles/components/skeletons/home-page-skeleton.module.css';

export default function HomePageSkeleton() {
  return (
    <div className={styles.contentContainer}>
      <div className={styles.contentWrapper}>
        {/* Personalized recommendations section */}
        <section className={styles.section}>
          <SkeletonText width="60%" height="24px" className={`${styles.sectionTitle} container-padding`} />
          <div className={styles.horizontalScroll}>
            <div className={styles.cardsContainer}>
              {[...Array(2)].map((_, index) => (
                <div key={index} className={styles.cardWrapper}>
                  <PlaceCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mood-based section */}
        <section className={`${styles.moodSection} container-padding`}>
          <SkeletonBox width="100%" height="120px" borderRadius="16px" className={styles.moodCard} />
        </section>

        {/* Popular destinations section */}
        <section className={styles.section}>
          <SkeletonText width="40%" height="24px" className={`${styles.sectionTitle} container-padding`} />
          <div className={styles.horizontalScroll}>
            <div className={styles.destinationsContainer}>
              {[...Array(2)].map((_, index) => (
                <div key={index} className={styles.destinationWrapper}>
                  <div className={styles.destinationCard}>
                    <SkeletonBox width="270px" height="177px" borderRadius="12px" />
                    <div className={styles.destinationInfo}>
                      <SkeletonText width="70%" height="18px" />
                      <div className={styles.destinationLocation}>
                        <SkeletonBox width="12px" height="12px" borderRadius="50%" />
                        <SkeletonText width="50%" height="14px" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={`${styles.seeMoreContainer} container-padding`}>
            <SkeletonBox width="140px" height="44px" borderRadius="22px" />
          </div>
        </section>
      </div>
    </div>
  );
}