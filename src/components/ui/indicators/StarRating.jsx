import React from 'react';
import styles from '@/styles/components/indicators/star-rating.module.css';

export default function StarRating({ rating, maxStars = 5, size = 'medium' }) {
  // Hide rating section if no valid rating
  const numericRating = parseFloat(rating);
  if (!rating || numericRating === 0) {
    return null;
  }

  const stars = [];
  
  for (let i = 0; i < maxStars; i++) {
    stars.push(
      <svg 
        key={i}
        className={`${styles.star} ${styles[size]}`}
        viewBox="0 0 16 15" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M7.10088 0.98589C7.29001 0.42723 8.11351 0.427229 8.30264 0.98589L9.68765 5.07693C9.77223 5.32677 10.0148 5.49593 10.2885 5.49593H14.7705C15.3825 5.49593 15.637 6.2476 15.1419 6.59287L11.5159 9.12128C11.2944 9.27569 11.2018 9.54939 11.2864 9.79923L12.6714 13.8903C12.8605 14.4489 12.1943 14.9135 11.6991 14.5682L8.07313 12.0398C7.85169 11.8854 7.55183 11.8854 7.33039 12.0398L3.7044 14.5682C3.20925 14.9135 2.54302 14.4489 2.73215 13.8903L4.11716 9.79923C4.20174 9.54939 4.10908 9.27569 3.88764 9.12128L0.261651 6.59287C-0.233504 6.2476 0.0209714 5.49593 0.633016 5.49593H5.11499C5.3887 5.49593 5.63129 5.32677 5.71587 5.07693L8.04241 0.98589Z" 
          fill="#FFD336"
        />
      </svg>
    );
  }

  // Format rating to 1 decimal place (4.0, 4.5, etc.)
  const formattedRating = numericRating.toFixed(1);

  return (
    <div className={styles.starRating}>
      <div className={styles.stars}>
        {stars}
      </div>
      <span className={`${styles.rating} ${styles[size]}`}>{formattedRating}</span>
    </div>
  );
}