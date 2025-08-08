import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from '@/styles/pages/place-detail-page.module.css';

export default function PlaceDetailPage({
  place = null, // Allow prop injection for testing/reusability
  onExperience
}) {
  const { id } = useParams();
  const [sheetState, setSheetState] = useState('half'); // 'half' (50%), 'large' (80%), 'expanded' (100%)
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const initialOffset = useRef(0);
  
  // Image swiping state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const startX = useRef(0);
  const dragThreshold = 50; // Minimum drag distance to change image
  
  // Calculate sheet heights based on viewport
  const getSheetHeight = (state) => {
    const vh = window.innerHeight;
    switch (state) {
      case 'half': return vh * 0.55; // 50% of screen
      case 'large': return vh * 0.8; // 80% of screen  
      case 'expanded': return vh * 1.0; // 100% of screen
      default: return vh * 0.5;
    }
  };
  
  const getCurrentSheetHeight = () => {
    return getSheetHeight(sheetState) + dragOffset;
  };
  
  // Mock data - in real app, this would come from API or props
  const mockPlace = {
    id: id || 1,
    title: '카페 무브먼트랩',
    tags: ['#성수동', '#카페', '#인기 플레이스'],
    location: '서울 성수동',
    rating: 4.7,
    reviewCount: 2498,
    description: '가벼운 이야기를 나누기 좋은 조용한 골목의 카페,\n따뜻한 조명과 나지막한 음악이 흐르는 이 공간은\n소란스럽지 않은 만남이 필요한 날에 잘 어울려요.\n오늘은 의미 있는 대화를 나눌 수 있는 이곳에서 시간을 보내보세요.',
    images: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=440&h=563&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=440&h=563&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1442975631115-c4f7b05b8a2c?w=440&h=563&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=440&h=563&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=440&h=563&fit=crop&crop=center'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=42&h=42&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=42&h=42&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1442975631115-c4f7b05b8a2c?w=42&h=42&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=42&h=42&fit=crop&crop=center'
    ],
    additionalImageCount: 16,
    transportation: {
      car: '5분',
      bus: '10분'
    }
  };

  const placeData = place || mockPlace;

  const handleExperienceClick = () => {
    if (onExperience) {
      onExperience(placeData);
    } else {
      console.log('Experience clicked for:', placeData.title);
      // Default behavior - could navigate to booking page
    }
  };

  const handleReadMore = () => {
    console.log('Read more clicked');
    // Handle read more functionality
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
    if (currentImageIndex < placeData.images.length - 1) {
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
          {placeData.images.map((image, index) => (
            <img 
              key={index}
              src={image} 
              alt={`${placeData.title} ${index + 1}`}
              className={styles.heroImage}
              draggable={false}
            />
          ))}
        </div>
        <div className={styles.heroOverlay} />
        

        {/* Image Indicators */}
        <div className={styles.imageIndicators}>
          {placeData.images.map((_, index) => (
            <div 
              key={index}
              className={`${styles.indicator} ${index === currentImageIndex ? styles.active : ''}`}
            />
          ))}
        </div>
        
        
        {/* Bottom Handle */}
        <div 
          className={styles.bottomHandle}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        />
      </div>

      {/* Content Section */}
      <div 
        className={styles.contentSection}
        style={{ 
          height: `${getCurrentSheetHeight()}px`,
          transition: isDragging ? 'none' : 'height 0.3s ease-out'
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        {/* Drag Indicator */}
        <div className={styles.dragIndicator} />
        
        {/* Title and Rating */}
        <div className={styles.header}>
          <h1 className={styles.title}>{placeData.title}</h1>
          <div className={styles.ratingContainer}>
            <svg className={styles.starIcon} width="12.94" height="11.64" viewBox="0 0 13 12" fill="none">
              <path d="M5.59149 0.345492C5.74042 -0.115164 6.38888 -0.115164 6.53781 0.345491L7.62841 3.71885C7.69501 3.92486 7.88603 4.06434 8.10157 4.06434H11.6308C12.1128 4.06434 12.3132 4.68415 11.9233 4.96885L9.06803 7.0537C8.89366 7.18102 8.82069 7.4067 8.8873 7.61271L9.9779 10.9861C10.1268 11.4467 9.60222 11.8298 9.21232 11.5451L6.35708 9.46024C6.18271 9.33291 5.94659 9.33291 5.77222 9.46024L2.91698 11.5451C2.52708 11.8298 2.00247 11.4467 2.1514 10.9861L3.242 7.61271C3.30861 7.4067 3.23564 7.18102 3.06127 7.0537L0.206033 4.96885C-0.183869 4.68415 0.0165137 4.06434 0.49846 4.06434H4.02773C4.24326 4.06434 4.43428 3.92486 4.50089 3.71885L5.59149 0.345492Z" fill="#FFD336"/>
            </svg>
            <span className={styles.ratingText}>{placeData.rating}</span>
            <span className={styles.reviewCount}>({placeData.reviewCount})</span>
          </div>
        </div>

        {/* Tags */}
        <div className={styles.tags}>
          {placeData.tags.join(', ')}
        </div>

        {/* Location and Transportation */}
        <div className={styles.locationSection}>
          <div className={styles.locationRow}>
            <div className={styles.locationInfo}>
              <svg className={styles.locationIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="7.33325" r="2" stroke="#7D848D" strokeWidth="1.5"/>
                <path d="M14 7.25918C14 10.532 10.25 14.6666 8 14.6666C5.75 14.6666 2 10.532 2 7.25918C2 3.98638 4.68629 1.33325 8 1.33325C11.3137 1.33325 14 3.98638 14 7.25918Z" stroke="#7D848D" strokeWidth="1.5"/>
              </svg>
              <span className={styles.locationText}>{placeData.location}</span>
            </div>
            
            <div className={styles.transportationRow}>
              <svg className={styles.carIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M11.67 1.39C12.67 1.39 13.84 2.56 13.84 3.56V7.84H2.17V3.56C2.17 2.56 3.34 1.39 4.34 1.39H11.67Z" fill="#7D848D"/>
                <path d="M0.83 6.83H15.17V11.16C15.17 12.16 14 13.33 13 13.33H3C2 13.33 0.83 12.16 0.83 11.16V6.83Z" fill="#7D848D"/>
                <circle cx="4" cy="10.5" r="1" fill="white"/>
                <circle cx="12" cy="10.5" r="1" fill="white"/>
                <rect x="7" y="2" width="2" height="1" fill="white"/>
              </svg>
              <span className={styles.transportTime}>{placeData.transportation.car}</span>
              
              <svg className={styles.busIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="1" width="12" height="13" rx="1.5" fill="#7D848D"/>
                <rect x="2.5" y="4.5" width="11" height="4" fill="white"/>
                <circle cx="5" cy="11.5" r="1" fill="white"/>
                <circle cx="11" cy="11.5" r="1" fill="white"/>
                <rect x="6" y="2.5" width="4" height="1" fill="white"/>
              </svg>
              <span className={styles.transportTime}>{placeData.transportation.bus}</span>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className={styles.gallery}>
          {placeData.gallery.map((image, index) => (
            <div key={index} className={styles.galleryItem}>
              <img src={image} alt={`Gallery ${index + 1}`} className={styles.galleryImage} />
              {index === placeData.gallery.length - 1 && placeData.additionalImageCount > 0 && (
                <div className={styles.additionalCount}>
                  +{placeData.additionalImageCount}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Description */}
        <div className={styles.descriptionSection}>
          <h2 className={styles.descriptionTitle}>이런 오늘 어때요?</h2>
          <div className={styles.description}>
            {placeData.description.split('\n').map((line, index) => (
              <span key={index}>
                {line}
                {index < placeData.description.split('\n').length - 1 && <br />}
              </span>
            ))}
            <button className={styles.readMore} onClick={handleReadMore}>
              Read More
            </button>
          </div>
        </div>

        {/* Experience Button */}
        <button className={styles.experienceButton} onClick={handleExperienceClick}>
          경험하기
        </button>
      </div>
    </div>
  );
}