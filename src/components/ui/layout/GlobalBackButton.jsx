import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from '@/styles/components/layout/global-back-button.module.css';

export default function GlobalBackButton({ 
  onClick, 
  show = true,
  className = '',
  ...props 
}) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  if (!show) return null;

  return (
    <button 
      className={`${styles.globalBackButton} ${className}`}
      onClick={handleClick}
      aria-label="뒤로 가기"
      {...props}
    >
      <svg width="26" height="26" viewBox="0 0 30 30" fill="none" className={styles.icon}>
        <mask id="mask0_51_136" style={{maskType:"alpha"}} maskUnits="userSpaceOnUse" x="0" y="0" width="30" height="30">
          <rect width="30" height="30" fill="#D9D9D9"/>
        </mask>
        <g mask="url(#mask0_51_136)">
          <path d="M8.62 15.7853L16.1122 23.2691L15 24.375L5.625 15L15 5.625L16.1122 6.73094L8.62 14.2147H24.375V15.7853H8.62Z" fill="currentColor"/>
        </g>
      </svg>
    </button>
  );
}

GlobalBackButton.propTypes = {
  onClick: PropTypes.func,
  show: PropTypes.bool,
  className: PropTypes.string
};