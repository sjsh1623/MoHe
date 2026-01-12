import React from 'react';
import PropTypes from 'prop-types';
import styles from '@/styles/components/bottom-sheet/bottom-sheet-layers.module.css';

/**
 * Bottom Sheet Container - PASSIVE, NO CONTROL
 *
 * - Moves ONLY when user drags
 * - Content scrolls naturally
 * - NO transitions (sheet stays where user leaves it)
 * - Prevents pull-to-refresh via overscroll-behavior
 */
export default function BottomSheetContainer({
  children,
  translateY,
  scrollRef,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}) {
  return (
    <div className={styles.bottomSheetContainer}>
      <div
        className={styles.bottomSheet}
        style={{ transform: `translateY(${translateY}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={scrollRef}
          className={styles.bottomSheetContent}
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
  scrollRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  onTouchStart: PropTypes.func,
  onTouchMove: PropTypes.func,
  onTouchEnd: PropTypes.func,
};
