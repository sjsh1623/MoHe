import React from 'react';
import PropTypes from 'prop-types';
import styles from '@/styles/components/bottom-sheet/bottom-sheet-layers.module.css';

/**
 * LAYER A: Header Image Layer
 *
 * - Fixed height: 40% of viewport
 * - Never resizes or scales on scroll
 * - Only the IMAGE fades based on sheetProgress
 * - White background shows through as image fades
 */
export default function HeaderImageLayer({
  images = [],
  currentIndex = 0,
  onDotClick,
  sheetProgress = 0,
  alt = '',
}) {
  // Only the image opacity changes, not the container
  const imageOpacity = Math.max(0, 1 - sheetProgress);

  return (
    <div className={styles.headerImageLayer}>
      {images.length > 0 && (
        <img
          src={images[currentIndex]}
          alt={alt}
          className={styles.headerImage}
          style={{ opacity: imageOpacity }}
          draggable={false}
        />
      )}

      {images.length > 1 && (
        <div
          className={styles.imageDots}
          style={{ opacity: imageOpacity }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              className={`${styles.imageDot} ${i === currentIndex ? styles.active : ''}`}
              onClick={() => onDotClick?.(i)}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

HeaderImageLayer.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
  currentIndex: PropTypes.number,
  onDotClick: PropTypes.func,
  sheetProgress: PropTypes.number,
  alt: PropTypes.string,
};
