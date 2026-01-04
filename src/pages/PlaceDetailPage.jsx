import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/pages/place-detail-page.module.css';
import PlaceDetailSkeleton from '@/components/ui/skeletons/PlaceDetailSkeleton';
import ErrorMessage from '@/components/ui/alerts/ErrorMessage';
import { activityService, placeService } from '@/services/apiService';
import { authService } from '@/services/authService';
import { buildImageUrl, buildImageUrlList, normalizePlaceImages } from '@/utils/image';

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
          // API returns { place: SimplePlaceDto, images: [], reviews: [], isBookmarked: false, similarPlaces: [] }
          console.log('API response place data:', response.data.place);
          console.log('API response description:', response.data.place.description);
          console.log('API response reviews:', response.data.reviews);

          const normalizedPlace = normalizePlaceImages(response.data.place);
          console.log('Normalized place description:', normalizedPlace.description);
          setPlaceData(normalizedPlace);

          // Use reviews from place detail response (already included)
          if (response.data.reviews && response.data.reviews.length > 0) {
            console.log('Reviews loaded from place detail:', response.data.reviews.length);
            setReviews(response.data.reviews);
          }

          // Load menus for this place
          try {
            const menusResponse = await placeService.getPlaceMenus(id);
            if (menusResponse.success && menusResponse.data) {
              console.log('Menus loaded:', menusResponse.data);
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

  const [sheetState, setSheetState] = useState('half'); // 'half' (50%), 'large' (80%), 'expanded' (100%)
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const initialOffset = useRef(0);

  // Image swiping state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const startX = useRef(0);
  const DRAG_THRESHOLD = 50; // Minimum drag distance to change image

  // Calculate sheet heights based on viewport (ensure image shows at least 40%)
  const getSheetHeight = (state) => {
    const vh = window.innerHeight;
    switch (state) {
      case 'half': return vh * 0.60; // 60% of screen (image shows 40%)
      case 'large': return vh * 0.80; // 80% of screen (image shows 20%)
      case 'expanded': return vh * 1.0; // 100% of screen
      default: return vh * 0.5;
    }
  };

  const getCurrentSheetHeight = () => {
    return getSheetHeight(sheetState) + dragOffset;
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

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
    dragStartY.current = clientY;
    initialOffset.current = dragOffset;
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;

    const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
    const deltaY = dragStartY.current - clientY; // Inverted: positive = drag up
    const newOffset = initialOffset.current + deltaY;

    // Limit drag range
    const minHeight = getSheetHeight('half');
    const maxHeight = getSheetHeight('expanded');
    const currentBaseHeight = getSheetHeight(sheetState);
    const maxOffset = maxHeight - currentBaseHeight;
    const minOffset = minHeight - currentBaseHeight;

    const clampedOffset = Math.max(minOffset, Math.min(maxOffset, newOffset));
    setDragOffset(clampedOffset);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const currentHeight = getCurrentSheetHeight();

    // Determine which state to snap to based on current height
    const halfHeight = getSheetHeight('half');
    const largeHeight = getSheetHeight('large');
    const expandedHeight = getSheetHeight('expanded');

    let newState = sheetState;

    if (currentHeight < (halfHeight + largeHeight) / 2) {
      newState = 'half';
    } else if (currentHeight < (largeHeight + expandedHeight) / 2) {
      newState = 'large';
    } else {
      newState = 'expanded';
    }

    setSheetState(newState);
    setDragOffset(0);
  };

  // Simple image navigation functions
  const nextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  // Image swipe handlers
  const handleImageStart = (e) => {
    e.stopPropagation();
    setIsImageDragging(true);
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    startX.current = clientX;
  };

  const handleImageEnd = (e) => {
    if (!isImageDragging) return;

    setIsImageDragging(false);

    // Get the end position
    let clientX;
    if (e.type === 'mouseup') {
      clientX = e.clientX;
    } else if (e.changedTouches && e.changedTouches[0]) {
      clientX = e.changedTouches[0].clientX;
    } else {
      return; // No valid touch data
    }

    const distance = clientX - startX.current;

    // Use a smaller threshold for more responsive swiping
    const threshold = 30;

    // Check if drag distance exceeds threshold
    if (Math.abs(distance) > threshold) {
      if (distance > 0) {
        // Dragged right, go to previous image
        prevImage();
      } else {
        // Dragged left, go to next image
        nextImage();
      }
    }
  };

  // Show skeleton loader while loading (with preloaded image if available)
  if (isLoading) {
    return <PlaceDetailSkeleton preloadedImage={preloadedImage} />;
  }

  return (
    <div
      className={styles.pageContainer}
      onMouseMove={(e) => {
        if (!isImageDragging) {
          handleDragMove(e);
        }
      }}
      onMouseUp={(e) => {
        if (isImageDragging) {
          handleImageEnd(e);
        } else {
          handleDragEnd();
        }
      }}
      onTouchMove={(e) => {
        if (!isImageDragging) {
          handleDragMove(e);
        }
      }}
      onTouchEnd={(e) => {
        if (isImageDragging) {
          handleImageEnd(e);
        } else {
          handleDragEnd();
        }
      }}
    >
      {/* Header Image Carousel */}
      <div className={styles.heroSection}>
        <div
          className={styles.imageCarousel}
          style={{
            transform: `translateX(-${currentImageIndex * 20}%)`,
            transition: 'transform 0.3s ease-out'
          }}
          onMouseDown={handleImageStart}
          onTouchStart={handleImageStart}
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
        <div className={styles.heroOverlay} />

        {/* Bottom Handle */}
        <div
          className={styles.bottomHandle}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        />
      </div>

      {/* Image Indicators - positioned above modal */}
      <div
        className={styles.imageIndicators}
        style={{
          bottom: `${getCurrentSheetHeight() + 20}px`,
          transition: isDragging ? 'none' : 'bottom 0.3s ease-out'
        }}
      >
        {images.map((_, index) => (
          <div
            key={index}
            className={`${styles.indicator} ${index === currentImageIndex ? styles.active : ''}`}
          />
        ))}
      </div>

      {/* Content Section */}
      <div
        className={styles.contentSection}
        style={{
          height: `${getCurrentSheetHeight()}px`,
          transition: isDragging ? 'none' : 'height 0.3s ease-out'
        }}
      >
        {/* Draggable Header Area */}
        <div
          className={styles.draggableHeader}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          {/* Drag Indicator */}
          <div className={styles.dragIndicator} />

          {/* Tags (Hashtags) */}
          {placeData.tags && placeData.tags.length > 0 && (
            <div className={styles.hashtags}>
              {placeData.tags.map((tag, index) => (
                <span key={index} className={styles.hashtag}>#{tag}</span>
              ))}
            </div>
          )}

          {/* Title and Rating */}
          <div className={styles.header}>
            <h1 className={styles.title}>{placeData.name || placeData.title}</h1>
            <div className={styles.ratingContainer}>
              <svg className={styles.starIcon} width="12.94" height="11.64" viewBox="0 0 13 12" fill="none">
                <path d="M5.59149 0.345492C5.74042 -0.115164 6.38888 -0.115164 6.53781 0.345491L7.62841 3.71885C7.69501 3.92486 7.88603 4.06434 8.10157 4.06434H11.6308C12.1128 4.06434 12.3132 4.68415 11.9233 4.96885L9.06803 7.0537C8.89366 7.18102 8.82069 7.4067 8.8873 7.61271L9.9779 10.9861C10.1268 11.4467 9.60222 11.8298 9.21232 11.5451L6.35708 9.46024C6.18271 9.33291 5.94659 9.33291 5.77222 9.46024L2.91698 11.5451C2.52708 11.8298 2.00247 11.4467 2.1514 10.9861L3.242 7.61271C3.30861 7.4067 3.23564 7.18102 3.06127 7.0537L0.206033 4.96885C-0.183869 4.68415 0.0165137 4.06434 0.49846 4.06434H4.02773C4.24326 4.06434 4.43428 3.92486 4.50089 3.71885L5.59149 0.345492Z" fill="#FFD336"/>
              </svg>
              <span className={styles.ratingText}>{Number(placeData.rating).toFixed(1)}</span>
              <span className={styles.reviewCount}>({placeData.reviewCount || placeData.userRatingsTotal || 0})</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className={styles.contentScrollArea}>

          {/* Location and Transportation */}
          <div className={styles.locationSection}>
            <div className={styles.locationRow}>
              <div className={styles.locationInfo}>
                <svg className={styles.locationIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            // Filter menus with images
            const menusWithImages = menus.filter(menu => menu.imagePath);
            const totalMenuImages = menusWithImages.length;

            if (totalMenuImages === 0) return null;

            // If 5 or fewer menus, show all; if more than 5, show 4 + "+" overlay
            const shouldShowOverlay = totalMenuImages > 5;
            const displayMenus = shouldShowOverlay
              ? menusWithImages.slice(0, 4)
              : menusWithImages.slice(0, 5);
            const remainingCount = totalMenuImages - 4;

            return (
              <div className={styles.menuGallery}>
                <h3 className={styles.menuGalleryTitle}>메뉴</h3>
                <div className={styles.menuGalleryItems}>
                  {displayMenus.map((menu, index) => (
                    <div
                      key={menu.id || index}
                      className={styles.menuGalleryItem}
                    >
                      <img
                        src={buildImageUrl(menu.imagePath)}
                        alt={menu.name || `메뉴 ${index + 1}`}
                        className={styles.menuGalleryImage}
                      />
                      {menu.name && (
                        <span className={styles.menuName}>{menu.name}</span>
                      )}
                    </div>
                  ))}
                  {shouldShowOverlay && (
                    <div className={`${styles.menuGalleryItem} ${styles.moreOverlay}`}>
                      <img
                        src={buildImageUrl(menusWithImages[4]?.imagePath)}
                        alt="더보기"
                        className={styles.menuGalleryImage}
                      />
                      <div className={styles.overlayContent}>
                        <span className={styles.overlayText}>+{remainingCount}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Mohe AI Note Section - Always visible */}
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
                <span>이 장소에 대한 AI 분석을 준비 중이에요.</span>
              )}
            </div>
          </div>

          {/* Reviews Section - Always visible */}
          <div className={styles.reviewsSection}>
            <div className={styles.reviewsHeader}>
              <h2 className={styles.reviewsTitle}>리뷰</h2>
              <span className={styles.reviewsCount}>{reviews.length}개</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
