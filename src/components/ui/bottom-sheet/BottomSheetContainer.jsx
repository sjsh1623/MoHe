import React from 'react';
import PropTypes from 'prop-types';
import styles from '@/styles/components/bottom-sheet/bottom-sheet-layers.module.css';

/**
 * LAYER C: Bottom Sheet Container
 *
 * - The ONLY layer that moves vertically (translateY)
 * - Slightly overlaps the bottom of the header image
 * - Contains scrollable content (children)
 * - Gesture coordination: scroll vs drag based on scrollTop
 * - Conditional transition: none during drag, smooth on release
 */
export default function BottomSheetContainer({
  children,
  translateY,
  isInteracting = false,
  scrollRef,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onScroll,
}) {
  // Conditional transition: disabled during drag, enabled on release for smooth settle
  const sheetStyle = {
    transform: `translateY(${translateY}px)`,
    transition: isInteracting
      ? 'none' // No transition during active drag - direct finger tracking
      : 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)', // Smooth iOS-like settle on release
  };

  return (
    <div className={styles.bottomSheetContainer}>
      <div
        className={styles.bottomSheet}
        style={sheetStyle}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={scrollRef}
          className={styles.bottomSheetContent}
          onScroll={onScroll}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

BottomSheetContainer.propTypes = {
  children: PropTypes.node.isRequired,
  translateY: PropTypes.number.isRequired,
  isInteracting: PropTypes.bool,
  scrollRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  onTouchStart: PropTypes.func,
  onTouchMove: PropTypes.func,
  onTouchEnd: PropTypes.func,
  onScroll: PropTypes.func,
};
