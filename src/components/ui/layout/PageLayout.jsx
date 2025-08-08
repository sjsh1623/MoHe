import React from 'react';
import PropTypes from 'prop-types';
import GlobalBackButton from './GlobalBackButton';
import styles from '@/styles/components/layout/page-layout.module.css';

export default function PageLayout({ 
  children, 
  showBackButton = true,
  onBackClick,
  className = '',
  ...props 
}) {
  return (
    <div className={`${styles.pageLayout} ${className}`} {...props}>
      {/* Global back button - fixed position */}
      <GlobalBackButton 
        show={showBackButton}
        onClick={onBackClick}
      />
      
      {/* Page content */}
      <div className={styles.pageContent}>
        {children}
      </div>
    </div>
  );
}

PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  showBackButton: PropTypes.bool,
  onBackClick: PropTypes.func,
  className: PropTypes.string
};