import React from 'react';
import styles from '@/styles/components/layout/skeleton-loader.module.css';

// Basic skeleton box component
export function SkeletonBox({ width, height, className = '', borderRadius = '8px', transparent = false }) {
  return (
    <div 
      className={`${styles.skeleton} ${transparent ? styles.transparent : ''} ${className}`}
      style={{ 
        width,
        height,
        borderRadius
      }}
    />
  );
}

// Text line skeleton
export function SkeletonText({ width = '100%', height = '16px', className = '', transparent = false }) {
  return (
    <SkeletonBox 
      width={width}
      height={height}
      borderRadius="4px"
      className={className}
      transparent={transparent}
    />
  );
}

// Circle skeleton (for avatars, profile images)
export function SkeletonCircle({ size = '40px', className = '', transparent = false }) {
  return (
    <SkeletonBox
      width={size}
      height={size}
      borderRadius="50%"
      className={className}
      transparent={transparent}
    />
  );
}

// Image placeholder skeleton
export function SkeletonImage({ width, height, className = '', aspectRatio, transparent = false }) {
  const style = {
    width,
    height,
    borderRadius: '8px'
  };
  
  if (aspectRatio && !height) {
    style.aspectRatio = aspectRatio;
  }
  
  return (
    <SkeletonBox
      width={style.width}
      height={style.height}
      borderRadius={style.borderRadius}
      className={className}
      transparent={transparent}
    />
  );
}

// Card skeleton wrapper
export function SkeletonCard({ children, className = '' }) {
  return (
    <div className={`${styles.skeletonCard} ${className}`}>
      {children}
    </div>
  );
}

// Main skeleton loader component
export default function SkeletonLoader({ children, loading = true, className = '' }) {
  if (!loading) {
    return children;
  }
  
  return (
    <div className={`${styles.skeletonContainer} ${className}`}>
      {children}
    </div>
  );
}