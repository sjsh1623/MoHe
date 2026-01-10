import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '@/styles/pages/place-detail-page.module.css';
import PlaceDetailSkeleton from '@/components/ui/skeletons/PlaceDetailSkeleton';
import ErrorMessage from '@/components/ui/alerts/ErrorMessage';
import { activityService, placeService } from '@/services/apiService';
import { authService } from '@/services/authService';
import { buildImageUrl, buildImageUrlList, normalizePlaceImages } from '@/utils/image';
import MenuFullscreenModal from '@/components/ui/modals/MenuFullscreenModal';

// Format date to Korean format (YY.MM.DD)
const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}.${month}.${day}`;
};

// Parse markdown-style bold (**text** or *text*) and convert to React elements
const parseMarkdown = (text) => {
  const parts = [];
  let currentIndex = 0;
  let key = 0;

  // Regex to match **text** or *text* (non-greedy)
  const boldRegex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      parts.push(text.slice(currentIndex, match.index));
    }

    // Add bold text
    const boldText = match[2] || match[4]; // Either **text** or *text*
    parts.push(<strong key={key++}>{boldText}</strong>);

    currentIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex));
  }

  return parts.length > 0 ? parts : text;
};

export default function PlaceDetailPage({
  place = null, // Allow prop injection for testing/reusability
  onExperience
}) {
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [placeData, setPlaceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [menus, setMenus] = useState([]);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const [showReviewsFullView, setShowReviewsFullView] = useState(false);

  // Bookmark state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

  // Get preloaded data from navigation state
  const preloadedImage = buildImageUrl(location.state?.preloadedImage);
  const preloadedData = location.state?.preloadedData
    ? normalizePlaceImages(location.state?.preloadedData)
    : null;

  useEffect(() => {
    const loadPlaceDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use prop data if available, or load from backend
        if (place) {
          setPlaceData(normalizePlaceImages(place));
          setIsLoading(false);
          return;
        }

        if (!id) {
          setError(t('places.detail.errors.idRequired'));
          setIsLoading(false);
          return;
        }

        // Use preloaded data for fast initial render
        if (preloadedData) {
          console.log('Using preloaded place data for initial render:', preloadedData);

          // Filter out invalid descriptions (category names, short text)
          let validDescription = null;
          if (preloadedData.description &&
              preloadedData.description.length > 10 &&
              preloadedData.description !== preloadedData.category) {
            validDescription = preloadedData.description;
          } else if (preloadedData.reasonWhy &&
                     preloadedData.reasonWhy.length > 10 &&
                     preloadedData.reasonWhy !== preloadedData.category) {
            validDescription = preloadedData.reasonWhy;
          }

          setPlaceData({
            ...preloadedData,
            description: validDescription,
            address: preloadedData.address || preloadedData.location,
            location: preloadedData.address || preloadedData.location,
            name: preloadedData.title || preloadedData.name
          });
          setIsLoading(false);
          // Don't return - continue to fetch full data from API
        }

        // Always load complete data from backend to get DB description
        console.log('Fetching complete place details from API for id:', id);
        const response = await placeService.getPlaceById(id);
        if (response.success && response.data.place) {
          const normalizedPlace = normalizePlaceImages(response.data.place);
          setPlaceData(normalizedPlace);

          // Use reviews from place detail response (already included)
          if (response.data.reviews && response.data.reviews.length > 0) {
            setReviews(response.data.reviews);
          }

          // Load menus for this place
          try {
            const menusResponse = await placeService.getPlaceMenus(id);
            if (menusResponse.success && menusResponse.data) {
              setMenus(menusResponse.data.menus || []);
            }
          } catch (err) {
            console.warn('Failed to load menus:', err);
          }

          if (authService.isAuthenticated()) {
            try {
              await activityService.recordRecentView(id);
            } catch (err) {
              console.warn('Failed to record recent view:', err);
            }
          }
        } else {
          console.error('Backend place detail not available for id:', id);
          if (!preloadedData) {
            setError(t('places.detail.errors.notFound'));
          }
        }
      } catch (err) {
        console.error('Failed to load place details:', err);
        if (!preloadedData) {
          setError(t('places.detail.errors.loadFailed'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaceDetail();
  }, [id, place]);

  // ========== AIRBNB-STYLE BOTTOM SHEET ==========
  // Implements seamless scroll-to-drag handoff like Airbnb's accommodation detail sheet
  //
  // Key behaviors:
  // 1. Collapsed state: Sheet at ~57% height, content scroll disabled, drag to expand
  // 2. Expanded state: Sheet at ~92% height, content scroll enabled
  // 3. Scroll-to-drag handoff: When scrolled to top + drag down → sheet drags (seamless)
  // 4. Spring physics for natural animations
  // 5. Velocity-based snap decisions

  const sheetRef = useRef(null);
  const scrollContentRef = useRef(null);
  const whiteFadeRef = useRef(null);
  const heroSectionRef = useRef(null);
  const headerActionsRef = useRef(null);

  // Core state
  const progressRef = useRef(0); // 0 = collapsed, 1 = expanded
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);

  // Unified touch tracking for scroll-to-drag handoff
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const lastTouchY = useRef(0);
  const lastTouchTime = useRef(0);
  const startProgress = useRef(0);
  const isDraggingSheet = useRef(false);
  const isScrolling = useRef(false);
  const velocityY = useRef(0);
  const initialScrollTop = useRef(0);
  const gesturePhase = useRef('idle'); // 'idle' | 'scroll' | 'drag'

  // Image swiping state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const startX = useRef(0);

  // Pull-to-dismiss state for image area
  const [dismissProgress, setDismissProgress] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);
  const dismissStartY = useRef(0);

  // Calculate heights
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  const minSheetHeight = viewportHeight * 0.57;
  const maxSheetHeight = viewportHeight * 0.92;
  const heightRange = maxSheetHeight - minSheetHeight;

  // Apply all visual updates based on progress (0-1)
  // AIRBNB BEHAVIOR: Direct, immediate updates - NO auto-animations
  // Hero image stays FIXED - only white fade overlay changes
  const applyProgress = useCallback((progress, animate = false) => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const height = minSheetHeight + heightRange * clampedProgress;
    // White overlay fades in as sheet expands (0 = transparent, 0.92 = fully white)
    const targetFadeOpacity = clampedProgress * 0.92;

    // Update header actions background based on progress
    // At full expansion, header becomes a solid white sticky header
    const updateHeaderBackground = (p) => {
      if (headerActionsRef.current) {
        if (p >= 0.9) {
          // Fully white sticky header
          headerActionsRef.current.style.background = 'white';
          headerActionsRef.current.style.boxShadow = '0 1px 0 rgba(0, 0, 0, 0.08)';
        } else if (p > 0.3) {
          // Transitioning - fade from gradient to white
          const whiteness = (p - 0.3) / 0.6;
          headerActionsRef.current.style.background = `rgba(255, 255, 255, ${whiteness * 0.95})`;
          headerActionsRef.current.style.boxShadow = `0 1px 0 rgba(0, 0, 0, ${whiteness * 0.08})`;
        } else {
          // Image visible - subtle gradient
          headerActionsRef.current.style.background = 'linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 0%, transparent 100%)';
          headerActionsRef.current.style.boxShadow = 'none';
        }
        headerActionsRef.current.style.transition = 'none';
      }
    };

    // All updates are immediate - NO spring physics, NO auto-animation
    // This ensures sheet moves exactly with user's finger
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none';
      sheetRef.current.style.height = `${height}px`;
    }
    if (whiteFadeRef.current) {
      whiteFadeRef.current.style.transition = 'none';
      whiteFadeRef.current.style.opacity = String(targetFadeOpacity);
    }
    updateHeaderBackground(clampedProgress);
  }, [minSheetHeight, heightRange]);

  // Initialize on mount
  useEffect(() => {
    applyProgress(0, false);
  }, [applyProgress]);

  // ========== UNIFIED GESTURE HANDLING ==========
  // This handles the critical scroll-to-drag handoff behavior

  // Called when touch starts on the sheet content area
  const handleContentTouchStart = useCallback((e) => {
    if (showReviewsFullView) return;

    const touch = e.touches[0];
    touchStartY.current = touch.clientY;
    touchStartTime.current = performance.now();
    lastTouchY.current = touch.clientY;
    lastTouchTime.current = performance.now();
    startProgress.current = progressRef.current;
    initialScrollTop.current = scrollContentRef.current?.scrollTop || 0;
    velocityY.current = 0;
    gesturePhase.current = 'idle';
    isDraggingSheet.current = false;
    isScrolling.current = false;
  }, [showReviewsFullView]);

  // Called during touch move - handles scroll-to-drag handoff
  // AIRBNB BEHAVIOR: Clear ownership - either scroll OR drag, never both
  const handleContentTouchMove = useCallback((e) => {
    if (showReviewsFullView) return;

    const touch = e.touches[0];
    const currentY = touch.clientY;
    const deltaY = touchStartY.current - currentY; // Positive = swipe up

    lastTouchY.current = currentY;
    lastTouchTime.current = performance.now();

    const scrollEl = scrollContentRef.current;
    const currentProgress = progressRef.current;
    const scrollTop = scrollEl?.scrollTop || 0;
    const isAtScrollTop = scrollTop <= 1;
    // Sheet is "scrollable" when pulled up enough
    const canScroll = currentProgress > 0.3;

    // Determine gesture phase on first significant movement
    if (gesturePhase.current === 'idle') {
      const absY = Math.abs(deltaY);

      if (absY > 5) {
        if (canScroll && !isAtScrollTop) {
          // Has scroll content and not at top: scroll mode
          gesturePhase.current = 'scroll';
          isScrolling.current = true;
        } else if (!canScroll) {
          // Sheet not expanded enough: drag mode
          gesturePhase.current = 'drag';
          isDraggingSheet.current = true;
          startProgress.current = currentProgress;
          touchStartY.current = currentY;
        } else if (canScroll && isAtScrollTop && deltaY < 0) {
          // At scroll top, pulling down: drag mode
          gesturePhase.current = 'drag';
          isDraggingSheet.current = true;
          startProgress.current = currentProgress;
          touchStartY.current = currentY;
        } else {
          // At scroll top, pushing up: scroll mode
          gesturePhase.current = 'scroll';
          isScrolling.current = true;
        }
      }
    }

    // Handle scroll-to-drag transition (seamless handoff at scroll top)
    if (gesturePhase.current === 'scroll' && isAtScrollTop && deltaY < 0) {
      gesturePhase.current = 'drag';
      isDraggingSheet.current = true;
      isScrolling.current = false;
      startProgress.current = currentProgress;
      touchStartY.current = currentY;

      if (scrollEl) {
        scrollEl.scrollTop = 0;
      }
    }

    // Process based on current phase - ONE owner at a time
    if (gesturePhase.current === 'drag') {
      e.preventDefault();

      const dragDeltaY = touchStartY.current - currentY;
      const progressDelta = dragDeltaY / heightRange;
      const newProgress = Math.max(0, Math.min(1, startProgress.current + progressDelta));

      progressRef.current = newProgress;
      applyProgress(newProgress, false);

      if (scrollEl) {
        scrollEl.style.overflowY = 'hidden';
      }
    } else if (gesturePhase.current === 'scroll') {
      if (scrollEl) {
        scrollEl.style.overflowY = 'auto';
      }
    }
  }, [showReviewsFullView, heightRange, applyProgress]);

  // Called when touch ends
  // AIRBNB BEHAVIOR: NO auto-movement, NO snapping, NO "helpful" positioning
  // Sheet stays EXACTLY where user left it
  const handleContentTouchEnd = useCallback(() => {
    if (showReviewsFullView) return;

    const scrollEl = scrollContentRef.current;
    const currentProgress = progressRef.current;

    // Simply update expanded state based on where the sheet currently is
    // No movement, no animation, no snapping
    const isExpanded = currentProgress > 0.3; // Low threshold for scroll enable
    setIsSheetExpanded(isExpanded);

    // Enable scroll when sheet is pulled up enough to show content
    if (scrollEl) {
      scrollEl.style.overflowY = isExpanded ? 'auto' : 'hidden';
    }

    // Reset gesture state - NO auto-movement
    gesturePhase.current = 'idle';
    isDraggingSheet.current = false;
    isScrolling.current = false;
    velocityY.current = 0;
  }, [showReviewsFullView]);

  // Note: Drag handle removed - entire sheet surface is now draggable
  // via the handleContentTouchStart/Move/End handlers above

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      applyProgress(progressRef.current, false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [applyProgress]);

  // Initialize scroll state based on sheet position
  // Scroll enabled when sheet is pulled up enough (> 30%)
  useEffect(() => {
    if (scrollContentRef.current) {
      const canScroll = progressRef.current > 0.3;
      scrollContentRef.current.style.overflowY = canScroll ? 'auto' : 'hidden';
    }
  }, [isSheetExpanded]);

  // Image dismiss handlers (pull down to go back)
  const handleImageDismissStart = (e) => {
    if (isImageDragging) return;
    const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
    dismissStartY.current = clientY;
    setIsDismissing(true);
  };

  const handleImageDismissMove = (e) => {
    if (!isDismissing || isImageDragging) return;

    const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
    const deltaY = clientY - dismissStartY.current;

    if (deltaY > 0) {
      // Pulling down - calculate progress (0 to 1)
      const progress = Math.min(deltaY / 150, 1);
      setDismissProgress(progress);
    } else {
      setDismissProgress(0);
    }
  };

  const handleImageDismissEnd = () => {
    if (!isDismissing) return;
    setIsDismissing(false);

    if (dismissProgress > 0.5) {
      // Dismiss - navigate back
      navigate(-1);
    } else {
      // Reset
      setDismissProgress(0);
    }
  };

  // Image swipe handlers (left/right)
  const handleImageSwipeStart = (e) => {
    e.stopPropagation();
    setIsImageDragging(true);
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    startX.current = clientX;
  };

  const handleImageSwipeEnd = (e) => {
    if (!isImageDragging) return;
    setIsImageDragging(false);

    let clientX;
    if (e.type === 'mouseup') {
      clientX = e.clientX;
    } else if (e.changedTouches && e.changedTouches[0]) {
      clientX = e.changedTouches[0].clientX;
    } else {
      return;
    }

    const distance = clientX - startX.current;
    const threshold = 30;

    if (Math.abs(distance) > threshold) {
      if (distance > 0 && currentImageIndex > 0) {
        setCurrentImageIndex(prev => prev - 1);
      } else if (distance < 0 && currentImageIndex < images.length - 1) {
        setCurrentImageIndex(prev => prev + 1);
      }
    }
  };

  // ========== BOOKMARK FUNCTIONALITY ==========
  // Check bookmark status on mount
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!id || !authService.isAuthenticated()) return;
      try {
        const response = await activityService.getBookmarks();
        if (response.success && response.data?.bookmarks) {
          const isPlaceBookmarked = response.data.bookmarks.some(
            bookmark => bookmark.placeId === id || bookmark.id === id
          );
          setIsBookmarked(isPlaceBookmarked);
        }
      } catch (err) {
        console.warn('Failed to check bookmark status:', err);
      }
    };
    checkBookmarkStatus();
  }, [id]);

  // Toggle bookmark handler
  const handleToggleBookmark = async () => {
    if (!authService.isAuthenticated()) {
      navigate('/login', { state: { from: `/place/${id}` } });
      return;
    }

    if (isBookmarkLoading) return;

    setIsBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await activityService.removeBookmark(id);
        setIsBookmarked(false);
      } else {
        await activityService.addBookmark(id);
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  // Share handler
  const handleShare = async () => {
    const shareData = {
      title: placeData?.name || placeData?.title || 'Mohe',
      text: `${placeData?.name || placeData?.title} - Mohe에서 발견한 장소`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        // Could show a toast notification here
        console.log('Link copied to clipboard');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  };


  // Show loading or error state
  if (isLoading) {
    return <PlaceDetailSkeleton />;
  }

  if (error || !placeData) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage message={error || t('places.detail.errors.notFound')} />
      </div>
    );
  }

  const defaultImages = [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=440&h=563&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=440&h=563&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=440&h=563&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=440&h=563&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1544918999-6c6b10bdb76f?w=440&h=563&fit=crop&crop=center'
  ];

  const candidateImages = placeData.images?.length
    ? placeData.images
    : placeData.gallery?.length
      ? buildImageUrlList(placeData.gallery)
      : [];

  const images = candidateImages.length ? candidateImages : defaultImages;

  // Calculate dismiss animation values
  const dismissScale = 1 - (dismissProgress * 0.1);
  const dismissOpacity = 1 - (dismissProgress * 0.3);
  const dismissTranslateY = dismissProgress * 100;

  return (
    <motion.div
      className={styles.pageContainer}
      style={{
        transform: `scale(${dismissScale}) translateY(${dismissTranslateY}px)`,
        opacity: dismissOpacity,
        borderRadius: dismissProgress > 0 ? '24px' : '0px',
      }}
      onMouseMove={(e) => {
        handleImageDismissMove(e);
      }}
      onMouseUp={(e) => {
        handleImageDismissEnd();
        handleImageSwipeEnd(e);
      }}
      onTouchMove={(e) => {
        handleImageDismissMove(e);
      }}
      onTouchEnd={(e) => {
        handleImageDismissEnd();
        handleImageSwipeEnd(e);
      }}
    >
      {/* Header Action Buttons - Airbnb style overlay */}
      {/* These buttons transition with the header: visible over image, become sticky header at full scroll */}
      <div
        ref={headerActionsRef}
        className={styles.headerActions}
      >
        {/* Back button - uses global styling but positioned here for layout */}
        <button
          className={styles.headerButton}
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Right side buttons */}
        <div className={styles.headerRightButtons}>
          {/* Share button */}
          <button
            className={styles.headerButton}
            onClick={handleShare}
            aria-label="공유하기"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16,6 12,2 8,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Bookmark button */}
          <button
            className={`${styles.headerButton} ${isBookmarked ? styles.bookmarked : ''}`}
            onClick={handleToggleBookmark}
            disabled={isBookmarkLoading}
            aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Full-screen Image Section */}
      <div
        ref={heroSectionRef}
        className={styles.heroSection}
        onMouseDown={(e) => {
          handleImageDismissStart(e);
          handleImageSwipeStart(e);
        }}
        onTouchStart={(e) => {
          handleImageDismissStart(e);
          handleImageSwipeStart(e);
        }}
      >
        <div
          className={styles.imageCarousel}
          style={{
            transform: `translateX(-${currentImageIndex * 100}%)`,
            transition: isImageDragging ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${placeData.name || placeData.title} ${index + 1}`}
              className={styles.heroImage}
              draggable={false}
            />
          ))}
        </div>

        {/* Image Indicators */}
        <div className={styles.imageIndicators}>
          {images.map((_, index) => (
            <div
              key={index}
              className={`${styles.indicator} ${index === currentImageIndex ? styles.active : ''}`}
            />
          ))}
        </div>

        {/* Gradient overlay at bottom */}
        <div className={styles.heroGradient} />

        {/* White fade overlay - increases with scroll */}
        <div
          ref={whiteFadeRef}
          className={styles.whiteFadeOverlay}
        />
      </div>

      {/* Bottom Sheet - height controlled by applyProgress */}
      {/* No drag handle - entire sheet surface is draggable via scrollContent touch handlers */}
      <div
        ref={sheetRef}
        className={styles.bottomSheet}
        style={{ height: '57vh' }}
      >
        {/* Sheet Content */}
        <div className={styles.sheetContent}>
          {/* Scrollable Content - with unified touch handling for scroll-to-drag handoff */}
          <div
            ref={scrollContentRef}
            className={styles.scrollContent}
            onTouchStart={handleContentTouchStart}
            onTouchMove={handleContentTouchMove}
            onTouchEnd={handleContentTouchEnd}
          >
            {/* Header - Title and Rating (scrolls with content) */}
            <div className={styles.sheetHeader}>
              {placeData.tags && placeData.tags.length > 0 && (
                <div className={styles.hashtags}>
                  {placeData.tags.map((tag, index) => (
                    <span key={index} className={styles.hashtag}>#{tag}</span>
                  ))}
                </div>
              )}

              <div className={styles.titleRow}>
                <h1 className={styles.title}>{placeData.name || placeData.title}</h1>
                <div className={styles.ratingContainer}>
                  <svg className={styles.starIcon} width="14" height="14" viewBox="0 0 14 13" fill="none">
                    <path d="M6.04914 0.927051C6.21045 0.429825 6.91123 0.429825 7.07254 0.927051L8.25254 4.57354C8.32461 4.79648 8.53119 4.94755 8.76531 4.94755H12.5832C13.1047 4.94755 13.3214 5.61782 12.8997 5.92484L9.81085 8.17764C9.62207 8.31511 9.54258 8.55947 9.61465 8.78241L10.7947 12.4289C10.956 12.9261 10.3841 13.3409 9.96241 13.0339L6.87355 10.7811C6.68478 10.6436 6.4369 10.6436 6.24813 10.7811L3.15927 13.0339C2.7376 13.3409 2.16566 12.9261 2.32697 12.4289L3.50697 8.78241C3.57904 8.55947 3.49955 8.31511 3.31078 8.17764L0.221913 5.92484C-0.199755 5.61782 0.0169654 4.94755 0.538474 4.94755H4.35637C4.59049 4.94755 4.79707 4.79648 4.86914 4.57354L6.04914 0.927051Z" fill="#FFD336"/>
                  </svg>
                  <span className={styles.ratingText}>{Number(placeData.rating).toFixed(1)}</span>
                  <span className={styles.reviewCount}>({placeData.reviewCount || placeData.userRatingsTotal || 0})</span>
                </div>
              </div>
            </div>
            {/* Location and Transportation */}
            <div className={styles.locationSection}>
              <div className={styles.locationRow}>
                <div className={styles.locationInfo}>
                  <svg className={styles.locationIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="7.33325" r="2" stroke="#7D848D" strokeWidth="1.5"/>
                    <path d="M14 7.25918C14 10.532 10.25 14.6666 8 14.6666C5.75 14.6666 2 10.532 2 7.25918C2 3.98638 4.68629 1.33325 8 1.33325C11.3137 1.33325 14 3.98638 14 7.25918Z" stroke="#7D848D" strokeWidth="1.5"/>
                  </svg>
                  <span className={styles.locationText}>{placeData.location || placeData.address}</span>
                </div>

                {(placeData.transportationCarTime || placeData.transportationBusTime) && (
                  <div className={styles.transportationRow}>
                    {placeData.transportationCarTime && (
                      <>
                        <svg className={styles.carIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M11.67 1.39C12.67 1.39 13.84 2.56 13.84 3.56V7.84H2.17V3.56C2.17 2.56 3.34 1.39 4.34 1.39H11.67Z" fill="#7D848D"/>
                          <path d="M0.83 6.83H15.17V11.16C15.17 12.16 14 13.33 13 13.33H3C2 13.33 0.83 12.16 0.83 11.16V6.83Z" fill="#7D848D"/>
                          <circle cx="4" cy="10.5" r="1" fill="white"/>
                          <circle cx="12" cy="10.5" r="1" fill="white"/>
                          <rect x="7" y="2" width="2" height="1" fill="white"/>
                        </svg>
                        <span className={styles.transportTime}>{placeData.transportationCarTime}</span>
                      </>
                    )}

                    {placeData.transportationBusTime && (
                      <>
                        <svg className={styles.busIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <rect x="2" y="1" width="12" height="13" rx="1.5" fill="#7D848D"/>
                          <rect x="2.5" y="4.5" width="11" height="4" fill="white"/>
                          <circle cx="5" cy="11.5" r="1" fill="white"/>
                          <circle cx="11" cy="11.5" r="1" fill="white"/>
                          <rect x="6" y="2.5" width="4" height="1" fill="white"/>
                        </svg>
                        <span className={styles.transportTime}>{placeData.transportationBusTime}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Menu Gallery */}
            {(() => {
              const menusWithImages = menus.filter(menu => menu.imagePath);
              const totalMenuImages = menusWithImages.length;

              if (totalMenuImages === 0) return null;

              const maxVisible = 5;
              const shouldShowOverlay = totalMenuImages > maxVisible;
              const displayMenus = shouldShowOverlay
                ? menusWithImages.slice(0, maxVisible - 1)
                : menusWithImages.slice(0, maxVisible);
              const remainingCount = totalMenuImages - (maxVisible - 1);

              const handleMenuClick = (index) => {
                setSelectedMenuIndex(index);
                setIsMenuModalOpen(true);
              };

              const handleMoreClick = () => {
                navigate(`/place/${id}/menu`, {
                  state: {
                    menus: menusWithImages,
                    placeName: placeData?.name || placeData?.title || ''
                  }
                });
              };

              return (
                <div className={styles.menuGallery}>
                  {displayMenus.map((menu, index) => (
                    <div
                      key={menu.id || index}
                      className={styles.menuGalleryItem}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuClick(index);
                      }}
                    >
                      <img
                        src={buildImageUrl(menu.imagePath)}
                        alt={menu.name || `메뉴 ${index + 1}`}
                        className={styles.menuGalleryImage}
                        draggable={false}
                      />
                    </div>
                  ))}
                  {shouldShowOverlay && (
                    <div
                      className={`${styles.menuGalleryItem} ${styles.moreOverlay}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoreClick();
                      }}
                    >
                      <img
                        src={buildImageUrl(menusWithImages[maxVisible - 1]?.imagePath)}
                        alt="더보기"
                        className={styles.menuGalleryImage}
                        draggable={false}
                      />
                      <div className={styles.overlayContent}>
                        <span className={styles.overlayText}>+{remainingCount}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Mohe AI Note Section */}
            <div className={styles.aiNoteSection}>
              <div className={styles.aiNoteHeader}>
                <h2 className={styles.aiNoteTitle}>Mohe AI 노트</h2>
                <p className={styles.aiNoteSubtitle}>
                  리뷰와 데이터를 읽고 AI가 정리했어요
                </p>
              </div>
              <div className={styles.description}>
                {placeData.description && placeData.description.length > 10 ? (
                  placeData.description.split('\n').map((line, index) => (
                    <span key={index}>
                      {parseMarkdown(line)}
                      {index < placeData.description.split('\n').length - 1 && <br />}
                    </span>
                  ))
                ) : (
                  <div className={styles.aiNotePlaceholder}>
                    <p>리뷰를 작성하면 Mohe가 리뷰를 기반으로 장소 설명을 생성해요</p>
                    <p className={styles.aiNotePlaceholderHighlight}>
                      {placeData.name || placeData.title}의 첫 리뷰어가 되어보세요!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className={styles.reviewsSection}>
              <div className={styles.reviewsHeader}>
                <div className={styles.reviewsTitleGroup}>
                  <h2 className={styles.reviewsTitle}>리뷰</h2>
                  <span className={styles.reviewsCount}>{reviews.length}개</span>
                </div>
                <button
                  className={styles.writeReviewButton}
                  onClick={() => {
                    if (authService.isAuthenticated()) {
                      navigate(`/place/${id}/review/write`);
                    } else {
                      navigate('/login', { state: { from: `/place/${id}/review/write` } });
                    }
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M10.5 1.16669C10.6526 1.01413 10.8339 0.893019 11.0334 0.810363C11.2329 0.727706 11.4467 0.685059 11.6626 0.685059C11.8786 0.685059 12.0924 0.727706 12.2919 0.810363C12.4914 0.893019 12.6727 1.01413 12.8253 1.16669C12.9779 1.31924 13.099 1.50054 13.1816 1.70004C13.2643 1.89955 13.307 2.11339 13.307 2.32935C13.307 2.54532 13.2643 2.75916 13.1816 2.95866C13.099 3.15817 12.9779 3.33947 12.8253 3.49202L4.66699 11.6504L1.16699 12.8337L2.35033 9.33369L10.5 1.16669Z" stroke="#4E5968" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  리뷰 쓰기
                </button>
              </div>
              <div className={styles.aiCommentsSection}>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className={styles.aiCommentCard}>
                      <p className={styles.commentText}>
                        {review.reviewText}
                      </p>
                      <div className={styles.commentFooter}>
                        <span className={styles.authorName}>{review.authorName || review.nickname || '익명'}</span>
                        <span className={styles.commentDate}>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.aiCommentCard}>
                    <p className={styles.commentText}>
                      아직 리뷰가 없어요. 첫 번째 리뷰를 남겨보세요!
                    </p>
                    <div className={styles.commentFooter}>
                      <span className={styles.authorName}>Mohe</span>
                    </div>
                  </div>
                )}
              </div>
              {reviews.length > 0 && (
                <button
                  className={styles.viewAllReviewsButton}
                  onClick={() => {
                    // Expand sheet fully before showing reviews
                    progressRef.current = 1;
                    applyProgress(1, true);
                    setIsSheetExpanded(true);
                    setShowReviewsFullView(true);
                  }}
                >
                  리뷰 모두 보기
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Reviews Full View */}
          <AnimatePresence>
            {showReviewsFullView && (
              <motion.div
                className={styles.reviewsFullView}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className={styles.reviewsFullViewHeader}>
                  <button
                    className={styles.reviewsFullViewBackButton}
                    onClick={() => setShowReviewsFullView(false)}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18L9 12L15 6" stroke="#1B1E28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <h2 className={styles.reviewsFullViewTitle}>리뷰 {reviews.length}개</h2>
                  <div className={styles.reviewsFullViewSpacer} />
                </div>
                <div className={styles.reviewsFullViewContent}>
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className={styles.reviewFullCard}>
                        <p className={styles.reviewFullText}>
                          {review.reviewText}
                        </p>
                        <div className={styles.reviewFullFooter}>
                          <span className={styles.reviewFullAuthor}>{review.authorName || review.nickname || '익명'}</span>
                          <span className={styles.reviewFullDate}>{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.noReviewsMessage}>
                      아직 리뷰가 없어요. 첫 번째 리뷰를 남겨보세요!
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Menu Fullscreen Modal */}
      <MenuFullscreenModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        menus={menus.filter(menu => menu.imagePath)}
        initialIndex={selectedMenuIndex}
      />
    </motion.div>
  );
}
