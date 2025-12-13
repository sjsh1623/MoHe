import React from 'react';
import styles from '@/styles/pages/place-detail-page.module.css';
import { buildImageUrl } from '@/utils/image';

export default function ImageGallery({ images, currentIndex, onImageClick, placeName }) {
  if (!images || images.length === 0) return null;

  const displayImages = images.slice(0, 5);
  const remainingCount = Math.max(0, images.length - 5);

  return (
    <div className={styles.gallery}>
      {displayImages.map((img, index) => (
        <div
          key={index}
          className={`${styles.galleryItem} ${index === currentIndex ? styles.active : ''}`}
          onClick={() => onImageClick(index)}
        >
          <img
            src={buildImageUrl(img)}
            alt={`${placeName} ${index + 1}`}
            className={styles.galleryImage}
          />
          {index === 4 && remainingCount > 0 && (
            <>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '12px'
              }} />
              <span className={styles.additionalCount}>+{remainingCount}</span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
