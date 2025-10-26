import React, { useState } from 'react';
import styles from '@/styles/components/cards/grid-place-card.module.css';
import StarRating from '@/components/ui/indicators/StarRating';
import { buildImageUrl } from '@/utils/image';

export default function GridPlaceCard({
  title,
  rating,
  location,
  image,
  isBookmarked = false,
  onBookmarkToggle,
  onClick
}) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [imageError, setImageError] = useState(false);

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    if (onBookmarkToggle) {
      onBookmarkToggle(newBookmarked);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.imageContainer}>
        {imageError ? (
          <div className={styles.imagePlaceholder}>
            <div className={styles.placeholderText}>이미지를 불러올 수 없습니다</div>
          </div>
        ) : (
          <img 
            src={buildImageUrl(image) || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=176&h=159&fit=crop&crop=center'} 
            alt={title}
            className={styles.image}
            onError={handleImageError}
          />
        )}
        <button 
          className={styles.bookmarkButton}
          onClick={handleBookmarkClick}
          aria-label={bookmarked ? '북마크 제거' : '북마크 추가'}
        >
          <div className={styles.bookmarkBg}></div>
          <svg width="14" height="17" viewBox="0 0 14 17" fill="none">
            <path 
              d="M1.00009 4C1.00009 2.34315 2.34324 1 4.00009 1H10.0001C11.6569 1 13.0001 2.34315 13.0001 4V14.3358C13.0001 15.2267 11.9229 15.6729 11.293 15.0429L8.41431 12.1642C7.63326 11.3832 6.36693 11.3832 5.58588 12.1642L2.7072 15.0429C2.07723 15.6729 1.00009 15.2267 1.00009 14.3358V4Z" 
              stroke="white" 
              strokeWidth="1.5" 
              strokeLinejoin="round"
              fill={bookmarked ? 'white' : 'none'}
            />
          </svg>
        </button>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        
        <div className={styles.locationRow}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="7.33325" r="2" stroke="#7D848D" strokeWidth="1.5"/>
            <path d="M14 7.25918C14 10.532 10.25 14.6666 8 14.6666C5.75 14.6666 2 10.532 2 7.25918C2 3.98638 4.68629 1.33325 8 1.33325C11.3137 1.33325 14 3.98638 14 7.25918Z" stroke="#7D848D" strokeWidth="1.5"/>
          </svg>
          <span className={styles.location}>{location}</span>
        </div>

        <StarRating rating={rating} size="medium" />
      </div>
    </div>
  );
}
