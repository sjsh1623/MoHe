import React, { useState } from 'react';
import styles from '@/styles/components/cards/place-card.module.css';

export default function PlaceCard({
  title,
  rating,
  location,
  image,
  isBookmarked = false,
  onBookmarkToggle,
  avatars = [],
  additionalCount = 0,
  variant = 'default' // 'default' | 'compact'
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

  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.imageContainer}>
        {imageError ? (
          <div className={styles.imagePlaceholder}>
            <div className={styles.placeholderText}>이미지를 불러올 수 없습니다</div>
          </div>
        ) : (
          <img 
            src={image || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=240&h=240&fit=crop&crop=center'} 
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
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path 
              d="M3.00009 4C3.00009 2.34315 4.34324 1 6.00009 1H12.0001C13.6569 1 15.0001 2.34315 15.0001 4V14.3358C15.0001 15.2267 13.9229 15.6729 13.293 15.0429L10.4143 12.1642C9.63326 11.3832 8.36693 11.3832 7.58588 12.1642L4.7072 15.0429C4.07723 15.6729 3.00009 15.2267 3.00009 14.3358V4Z" 
              stroke="white" 
              strokeWidth="1.5" 
              strokeLinejoin="round"
              fill={bookmarked ? 'white' : 'none'}
            />
          </svg>
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.rating}>
            <svg width="13" height="12" viewBox="0 0 13 12" fill="none">
              <path d="M5.59149 0.345492C5.74042 -0.115164 6.38888 -0.115164 6.53781 0.345491L7.62841 3.71885C7.69501 3.92486 7.88603 4.06434 8.10157 4.06434H11.6308C12.1128 4.06434 12.3132 4.68415 11.9233 4.96885L9.06803 7.0537C8.89366 7.18102 8.82069 7.4067 8.8873 7.61271L9.9779 10.9861C10.1268 11.4467 9.60222 11.8298 9.21232 11.5451L6.35708 9.46024C6.18271 9.33291 5.94659 9.33291 5.77222 9.46024L2.91698 11.5451C2.52708 11.8298 2.00247 11.4467 2.1514 10.9861L3.242 7.61271C3.30861 7.4067 3.23564 7.18102 3.06127 7.0537L0.206033 4.96885C-0.183869 4.68415 0.0165137 4.06434 0.49846 4.06434H4.02773C4.24326 4.06434 4.43428 3.92486 4.50089 3.71885L5.59149 0.345492Z" fill="#FFD336"/>
            </svg>
            <span>{rating}</span>
          </div>
        </div>

        <div className={styles.locationRow}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="7.33325" r="2" stroke="#7D848D" strokeWidth="1.5"/>
            <path d="M14 7.25918C14 10.532 10.25 14.6666 8 14.6666C5.75 14.6666 2 10.532 2 7.25918C2 3.98638 4.68629 1.33325 8 1.33325C11.3137 1.33325 14 3.98638 14 7.25918Z" stroke="#7D848D" strokeWidth="1.5"/>
          </svg>
          <span className={styles.location}>{location}</span>
        </div>
      </div>
    </div>
  );
}