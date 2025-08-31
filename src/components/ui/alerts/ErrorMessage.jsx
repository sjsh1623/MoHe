import React from 'react';
import styles from '@/styles/components/alerts/error-message.module.css';

const ErrorMessage = ({ 
  message, 
  onRetry = null, 
  onDismiss = null,
  variant = 'default' // 'default', 'inline', 'banner'
}) => {
  if (!message) return null;

  return (
    <div className={`${styles.errorContainer} ${styles[variant]}`}>
      <div className={styles.errorContent}>
        <div className={styles.iconContainer}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 6v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className={styles.messageContainer}>
          <p className={styles.message}>{message}</p>
        </div>
        <div className={styles.actions}>
          {onRetry && (
            <button 
              onClick={onRetry}
              className={styles.retryButton}
              type="button"
            >
              다시 시도
            </button>
          )}
          {onDismiss && (
            <button 
              onClick={onDismiss}
              className={styles.dismissButton}
              type="button"
              aria-label="오류 메시지 닫기"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12m0-8l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;