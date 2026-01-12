import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Bottom sheet gesture hook - OBSERVATION ONLY, NO CONTROL.
 *
 * Philosophy:
 * - The user's finger is the source of truth
 * - We OBSERVE scroll/drag state
 * - We REACT visually (fade image)
 * - We NEVER auto-move, snap, or project
 * - We NEVER fight momentum
 */
export function useBottomSheetGesture({
  peekHeight = 0.6,
  minY = 0,
} = {}) {
  const getMaxY = useCallback(() => {
    if (typeof window === 'undefined') return 300;
    return window.innerHeight * (1 - peekHeight);
  }, [peekHeight]);

  const [translateY, setTranslateY] = useState(getMaxY);
  const scrollRef = useRef(null);
  const maxY = useRef(getMaxY());

  // Drag tracking - minimal state
  const dragState = useRef({
    active: false,
    startY: 0,
    startTranslateY: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      maxY.current = getMaxY();
      setTranslateY(maxY.current);
    };
    maxY.current = getMaxY();
    setTranslateY(maxY.current);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getMaxY]);

  // Progress for visual fade only
  const sheetProgress = Math.max(0, Math.min(1, 1 - (translateY / maxY.current)));

  const getScrollTop = useCallback(() => {
    return scrollRef.current?.scrollTop ?? 0;
  }, []);

  // Touch start - just record position, don't prevent anything
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    dragState.current = {
      active: false,
      startY: touch.clientY,
      startTranslateY: translateY,
    };
  }, [translateY]);

  // Touch move - ONLY move sheet when: scrollTop === 0 AND dragging DOWN
  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    const deltaY = touch.clientY - dragState.current.startY;
    const scrollTop = getScrollTop();
    const isDraggingDown = deltaY > 0;

    // Sheet drag condition: at scroll top AND pulling down
    // OR sheet is not fully expanded (can be dragged in any direction)
    const isFullyExpanded = translateY <= minY;
    const shouldDragSheet = (scrollTop <= 0 && isDraggingDown) || (!isFullyExpanded);

    if (shouldDragSheet && Math.abs(deltaY) > 5) {
      if (!dragState.current.active) {
        dragState.current.active = true;
        // Re-anchor from current position
        dragState.current.startY = touch.clientY;
        dragState.current.startTranslateY = translateY;
      }
    }

    if (dragState.current.active) {
      // Prevent scroll only when we're actively dragging the sheet
      e.preventDefault();

      const newDelta = touch.clientY - dragState.current.startY;
      let newY = dragState.current.startTranslateY + newDelta;

      // Simple clamp - no rubber band, no resistance
      newY = Math.max(minY, Math.min(maxY.current, newY));

      setTranslateY(newY);
    }
    // If not dragging sheet, let scroll happen naturally (no preventDefault)
  }, [getScrollTop, translateY, minY]);

  // Touch end - just reset drag state, NO momentum, NO settling
  const handleTouchEnd = useCallback(() => {
    dragState.current.active = false;
    // Sheet stays EXACTLY where user left it
    // No projection, no snap, no animation
  }, []);

  return {
    translateY,
    sheetProgress,
    scrollRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getScrollTop,
  };
}

export default useBottomSheetGesture;
