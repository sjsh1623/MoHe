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
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <g clipPath="url(#clip0_47_277)">
              <circle cx="8.98539" cy="8.23658" r="2.24635" stroke="#7D848D" strokeWidth="1.1"/>
              <path d="M15.7244 8.1534C15.7244 11.8293 11.5125 16.4732 8.98538 16.4732C6.45824 16.4732 2.24634 11.8293 2.24634 8.1534C2.24634 4.47748 5.26351 1.49756 8.98538 1.49756C12.7072 1.49756 15.7244 4.47748 15.7244 8.1534Z" stroke="#7D848D" strokeWidth="1.1"/>
            </g>
            <defs>
              <clipPath id="clip0_47_277">
                <rect width="17.9708" height="17.9708" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          <span className={styles.location}>{location}</span>
        </div>

        <StarRating rating={rating} size="medium" />
      </div>
    </div>
  );
}