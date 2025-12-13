import React from 'react';
import styles from '@/styles/pages/place-detail-page.module.css';

export default function ReviewCard({ review }) {
  const formatDate = (dateString) => {
    if (dateString) return dateString;

    return new Date().toLocaleDateString('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').replace(/\.$/, '.');
  };

  return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewHeader}>
        <div className={styles.reviewUser}>
          <div className={styles.userAvatar}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3" fill="#FAB9C9"/>
              <path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" fill="#0D6EFD"/>
            </svg>
          </div>
          <span className={styles.userId}>{review.userId || '사용자 아이디'}</span>
        </div>
        <span className={styles.reviewDate}>{formatDate(review.date)}</span>
      </div>
      <p className={styles.reviewText}>{review.text}</p>
    </div>
  );
}
