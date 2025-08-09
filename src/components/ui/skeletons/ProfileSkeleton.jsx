import React from 'react';
import { Container } from '@/components/ui/layout';
import { SkeletonText, SkeletonCircle, SkeletonBox } from '@/components/ui/layout/SkeletonLoader';
import styles from '@/styles/components/skeletons/profile-skeleton.module.css';

export default function ProfileSkeleton() {
  return (
    <Container className={styles.container}>
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <SkeletonCircle size="80px" className={styles.avatar} />
        <div className={styles.profileInfo}>
          <SkeletonText width="60%" height="24px" className={styles.name} />
          <SkeletonText width="40%" height="16px" className={styles.email} />
        </div>
      </div>

      {/* Profile Stats */}
      <div className={styles.statsSection}>
        <div className={styles.statItem}>
          <SkeletonText width="30px" height="20px" className={styles.statNumber} />
          <SkeletonText width="50px" height="14px" className={styles.statLabel} />
        </div>
        <div className={styles.statItem}>
          <SkeletonText width="30px" height="20px" className={styles.statNumber} />
          <SkeletonText width="50px" height="14px" className={styles.statLabel} />
        </div>
        <div className={styles.statItem}>
          <SkeletonText width="30px" height="20px" className={styles.statNumber} />
          <SkeletonText width="50px" height="14px" className={styles.statLabel} />
        </div>
      </div>

      {/* Menu Items */}
      <div className={styles.menuSection}>
        {[...Array(8)].map((_, index) => (
          <div key={index} className={styles.menuItem}>
            <div className={styles.menuItemLeft}>
              <SkeletonCircle size="24px" className={styles.menuIcon} />
              <SkeletonText width="120px" height="16px" className={styles.menuText} />
            </div>
            <SkeletonCircle size="16px" className={styles.menuArrow} />
          </div>
        ))}
      </div>

      {/* Action Button */}
      <SkeletonBox width="100%" height="48px" borderRadius="12px" className={styles.actionButton} />
    </Container>
  );
}