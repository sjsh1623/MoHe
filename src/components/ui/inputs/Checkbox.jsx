import React from 'react';
import styles from '@/styles/components/inputs/checkbox.module.css';

export default function Checkbox({ 
  checked = false, 
  onChange, 
  label,
  required = false,
  showArrow = false,
  variant = 'default',
  onArrowClick,
  className = '',
  ...props 
}) {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  const handleArrowClick = (e) => {
    e.stopPropagation();
    if (onArrowClick) {
      onArrowClick();
    }
  };

  const containerClasses = [
    styles.container,
    variant === 'minimal' ? styles.minimal : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className={styles.checkboxWrapper}>
        <label className={styles.label}>
          <input
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            className={styles.hiddenInput}
            {...props}
          />
          <div className={`${styles.customCheckbox} ${checked ? styles.checked : ''}`}>
            {checked && (
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none" className={styles.checkmark}>
                <path 
                  d="M1 4.5L4.5 8L11 1.5" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span className={styles.labelText}>
            {label}
          </span>
        </label>
      </div>
      
      {showArrow && (
        <button 
          className={styles.arrowButton}
          onClick={handleArrowClick}
          type="button"
          aria-label="상세 보기"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              d="M3.40743 0.587249C3.03115 0.953357 3.03115 1.54694 3.40743 1.91304L9.14962 7.5L3.40743 13.087C3.03115 13.4531 3.03115 14.0466 3.40743 14.4128C3.78371 14.7789 4.39378 14.7789 4.77006 14.4128L11.8749 7.5L4.77006 0.587249C4.39378 0.221141 3.78371 0.221141 3.40743 0.587249Z" 
              fill="#2C2C2C"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
