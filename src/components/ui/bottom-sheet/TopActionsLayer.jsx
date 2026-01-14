import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/components/bottom-sheet/bottom-sheet-layers.module.css';

/**
 * LAYER B: Top Actions Layer
 *
 * - Contains: back, share, like buttons
 * - Always absolute-positioned and always visible
 * - NO background - buttons float above image and sheet
 * - Single source of back button (no duplication)
 */
export default function TopActionsLayer({
  onBackClick,
  onShareClick,
  onBookmarkClick,
  isBookmarked = false,
  isBookmarkLoading = false,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={styles.topActionsLayer}>
      {/* Back Button */}
      <button
        className={styles.actionButton}
        onClick={handleBack}
        aria-label="뒤로 가기"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Right Actions */}
      <div className={styles.actionButtonsRight}>
        {/* Share Button */}
        <button
          className={styles.actionButton}
          onClick={onShareClick}
          aria-label="공유하기"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="16,6 12,2 8,6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="12"
              y1="2"
              x2="12"
              y2="15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Bookmark Button */}
        <button
          className={`${styles.actionButton} ${isBookmarked ? styles.bookmarked : ''}`}
          onClick={onBookmarkClick}
          disabled={isBookmarkLoading}
          aria-label={isBookmarked ? '북마크 해제' : '북마크'}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isBookmarked ? 'currentColor' : 'none'}
          >
            <path
              d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

TopActionsLayer.propTypes = {
  onBackClick: PropTypes.func,
  onShareClick: PropTypes.func,
  onBookmarkClick: PropTypes.func,
  isBookmarked: PropTypes.bool,
  isBookmarkLoading: PropTypes.bool,
};
