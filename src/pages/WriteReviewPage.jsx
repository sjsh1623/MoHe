import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { placeService, reviewService } from '@/services/apiService';
import { authService } from '@/services/authService';
import styles from '@/styles/pages/write-review-page.module.css';

export default function WriteReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [placeName, setPlaceName] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로그인 체크
    if (!authService.isAuthenticated()) {
      navigate('/login', { state: { from: `/place/${id}/review/write` } });
      return;
    }

    // 장소 정보 가져오기
    const loadPlace = async () => {
      try {
        const response = await placeService.getPlaceById(id);
        if (response.success && response.data.place) {
          setPlaceName(response.data.place.name || response.data.place.title);
        }
      } catch (err) {
        console.error('Failed to load place:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlace();
  }, [id, navigate]);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('별점을 선택해주세요');
      return;
    }
    if (reviewText.trim().length < 10) {
      alert('리뷰를 10자 이상 작성해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await reviewService.createReview(id, {
        rating,
        reviewText: reviewText.trim()
      });

      if (response.success) {
        navigate(`/place/${id}`, { replace: true });
      } else {
        alert(response.error?.message || '리뷰 작성에 실패했습니다');
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('리뷰 작성에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="#1B1E28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className={styles.headerTitle}>리뷰 작성</h1>
        <div className={styles.headerSpacer} />
      </header>

      {/* Content */}
      <div className={styles.content}>
        {/* Place Name */}
        <div className={styles.placeSection}>
          <h2 className={styles.placeName}>{placeName}</h2>
          <p className={styles.placeSubtext}>이 장소는 어떠셨나요?</p>
        </div>

        {/* Rating */}
        <div className={styles.ratingSection}>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={styles.starButton}
                onClick={() => setRating(star)}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill={star <= rating ? '#FFD336' : 'none'}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 4L24.4903 13.0557L34.5106 14.5106L27.2553 21.5443L28.9787 31.4894L20 26.76L11.0213 31.4894L12.7447 21.5443L5.48944 14.5106L15.5097 13.0557L20 4Z"
                    stroke={star <= rating ? '#FFD336' : '#D1D6DB'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))}
          </div>
          <p className={styles.ratingText}>
            {rating === 0 && '별점을 선택해주세요'}
            {rating === 1 && '별로예요'}
            {rating === 2 && '그저 그래요'}
            {rating === 3 && '괜찮아요'}
            {rating === 4 && '좋아요'}
            {rating === 5 && '최고예요!'}
          </p>
        </div>

        {/* Review Text */}
        <div className={styles.reviewSection}>
          <textarea
            className={styles.reviewTextarea}
            placeholder="방문 경험을 자세히 공유해주세요. 다른 사용자에게 도움이 됩니다."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            maxLength={1000}
          />
          <div className={styles.charCount}>
            <span className={reviewText.length < 10 ? styles.charCountWarning : ''}>
              {reviewText.length}
            </span>
            /1000
          </div>
        </div>

        {/* Guidelines */}
        <div className={styles.guidelines}>
          <p className={styles.guidelineTitle}>리뷰 작성 가이드</p>
          <ul className={styles.guidelineList}>
            <li>직접 방문한 경험을 바탕으로 작성해주세요</li>
            <li>욕설, 비방, 허위 내용은 삭제될 수 있어요</li>
            <li>10자 이상 작성해주세요</li>
          </ul>
        </div>
      </div>

      {/* Submit Button */}
      <div className={styles.footer}>
        <button
          className={`${styles.submitButton} ${rating > 0 && reviewText.length >= 10 ? styles.active : ''}`}
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0 || reviewText.length < 10}
        >
          {isSubmitting ? '작성 중...' : '리뷰 등록하기'}
        </button>
      </div>
    </div>
  );
}
