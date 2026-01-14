import React from 'react';
import styles from '@/styles/components/inputs/search-bar.module.css';

export default function SearchBar({
  onClick,
  className = '',
  ...props
}) {
  return (
    <button
      className={`${styles.searchBar} ${className}`}
      onClick={onClick}
      type="button"
      aria-label="검색"
      {...props}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="#222222" strokeWidth="2"/>
        <path d="M16 16L20 20" stroke="#222222" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </button>
  );
}
