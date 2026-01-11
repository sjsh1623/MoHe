import { useState, useRef, useCallback, useEffect } from 'react';

// Pure clamp function - no snapping, only boundary enforcement
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/**
 * Single source of truth for bottom sheet gesture coordination.
 *
 * @param {Object} options
 * @param {number} options.peekHeight - Initial peek position from bottom (default: 60% of viewport)
 * @param {number} options.minY - Minimum Y position (fully expanded, default: 0)
 * @param {number} options.maxY - Maximum Y position (collapsed/peek, calculated from peekHeight)
 * @returns {Object} Gesture state and handlers
 */
export function useBottomSheetGesture({
  peekHeight = 0.6, // 60% of viewport visible initially (sheet covers 60%)
  minY = 0,
} = {}) {
  // Calculate maxY based on viewport and peekHeight
  const getMaxY = useCallback(() => {
    if (typeof window === 'undefined') return 300;
    return window.innerHeight * (1 - peekHeight);
  }, [peekHeight]);

  // Current translateY of the sheet
  const [translateY, setTranslateY] = useState(getMaxY);

  // Whether we're currently in a drag gesture (controls transition)
  const [isInteracting, setIsInteracting] = useState(false);

  // Refs for gesture tracking
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startTranslateY = useRef(0);
  const lastVelocity = useRef(0);
  const lastTimestamp = useRef(0);
  const lastTouchY = useRef(0);
  const isScrollLocked = useRef(false);
  const maxY = useRef(getMaxY());

  // Update maxY on resize
  useEffect(() => {
    const handleResize = () => {
      maxY.current = getMaxY();
      // Reset to initial position on resize
      setTranslateY(maxY.current);
    };

    maxY.current = getMaxY();
    setTranslateY(maxY.current);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getMaxY]);

  // Calculate progress: 0 = collapsed (peek), 1 = fully expanded
  const sheetProgress = 1 - (translateY / maxY.current);
  const clampedProgress = Math.max(0, Math.min(1, sheetProgress));

  // Get current scroll position of inner content
  const getScrollTop = useCallback(() => {
    return scrollRef.current?.scrollTop ?? 0;
  }, []);

  // Determine if sheet is at top (can be dragged down)
  const isAtTop = useCallback(() => {
    return getScrollTop() <= 0;
  }, [getScrollTop]);

  // Determine if sheet is fully expanded
  const isExpanded = useCallback(() => {
    return translateY <= minY + 5; // 5px tolerance
  }, [translateY, minY]);

  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    startY.current = touch.clientY;
    startTranslateY.current = translateY;
    lastTouchY.current = touch.clientY;
    lastTimestamp.current = Date.now();
    lastVelocity.current = 0;
    isDragging.current = false;
    isScrollLocked.current = false;

    // Disable transition during drag for direct tracking
    setIsInteracting(true);
  }, [translateY]);

  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    const currentY = touch.clientY;
    const deltaY = currentY - startY.current;
    const now = Date.now();

    // Calculate velocity
    const timeDelta = now - lastTimestamp.current;
    if (timeDelta > 0) {
      lastVelocity.current = (currentY - lastTouchY.current) / timeDelta;
    }
    lastTouchY.current = currentY;
    lastTimestamp.current = now;

    // Gesture ownership logic:
    // If scrollTop > 0, let scroll handle it
    // If scrollTop === 0 and dragging down, sheet takes over
    const scrollTop = getScrollTop();
    const isDraggingDown = deltaY > 0;

    if (!isDragging.current) {
      // Decide whether to start sheet drag
      if (scrollTop <= 0 && isDraggingDown) {
        // Sheet takes over - prevent scroll
        isDragging.current = true;
        isScrollLocked.current = true;
        e.preventDefault();
      } else if (!isExpanded() && Math.abs(deltaY) > 5) {
        // Not expanded yet, allow sheet drag in any direction
        isDragging.current = true;
        isScrollLocked.current = true;
        e.preventDefault();
      }
    }

    if (isDragging.current) {
      e.preventDefault();

      // Calculate new position with rubber band effect at boundaries
      let newY = startTranslateY.current + deltaY;

      // Rubber band effect when pulling beyond bounds
      if (newY < minY) {
        const overflow = minY - newY;
        newY = minY - overflow * 0.3; // Resistance factor
      } else if (newY > maxY.current) {
        const overflow = newY - maxY.current;
        newY = maxY.current + overflow * 0.3;
      }

      setTranslateY(newY);
    }
  }, [getScrollTop, isExpanded, minY]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    // Enable transition for smooth settle animation
    setIsInteracting(false);

    if (!isDragging.current) {
      isDragging.current = false;
      isScrollLocked.current = false;
      return;
    }

    isDragging.current = false;
    isScrollLocked.current = false;

    // Use velocity for natural momentum settling
    const velocity = lastVelocity.current;
    const velocityThreshold = 0.5; // px/ms

    let targetY = translateY;

    // Apply velocity-based momentum (not position-based snapping)
    if (Math.abs(velocity) > velocityThreshold) {
      // Project where the sheet would end up with momentum
      const projectedY = translateY + velocity * 150; // 150ms projection
      targetY = projectedY;
    }

    // Pure clamp to valid range - NO auto-snap, NO threshold snapping
    // Sheet stops exactly where momentum takes it (within bounds)
    targetY = clamp(targetY, minY, maxY.current);

    setTranslateY(targetY);
  }, [translateY, minY]);

  // Handle scroll events to detect scroll-to-drag handoff
  const handleScroll = useCallback((e) => {
    if (isScrollLocked.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  // Programmatic controls
  const expand = useCallback(() => {
    setIsInteracting(false); // Enable transition for programmatic moves
    setTranslateY(minY);
  }, [minY]);

  const collapse = useCallback(() => {
    setIsInteracting(false); // Enable transition for programmatic moves
    setTranslateY(maxY.current);
  }, []);

  return {
    // State
    translateY,
    sheetProgress: clampedProgress,
    isExpanded: isExpanded(),
    isInteracting, // Exposed for conditional transition

    // Refs
    scrollRef,

    // Event handlers
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleScroll,

    // Programmatic controls
    expand,
    collapse,

    // Utilities
    getScrollTop,
    isAtTop,
  };
}

export default useBottomSheetGesture;
