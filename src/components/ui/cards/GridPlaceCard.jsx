import React, { useState } from 'react';
import styles from '@/styles/components/cards/grid-place-card.module.css';
import StarRating from '@/components/ui/indicators/StarRating';

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
            src={image || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=176&h=159&fit=crop&crop=center'} 
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
          <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
            <path 
              d="M10.19 3.77538L9.61715 4.39083L9.0443 3.77538C7.46241 2.07585 4.89765 2.07585 3.31575 3.77537C1.73386 5.4749 1.73386 8.23037 3.31575 9.92989L8.47145 15.469C9.1042 16.1488 10.1301 16.1488 10.7629 15.469L15.9186 9.92989C17.5005 8.23037 17.5005 5.4749 15.9186 3.77538C14.3367 2.07585 11.7719 2.07585 10.19 3.77538Z" 
              stroke="white" 
              strokeWidth="1.1" 
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