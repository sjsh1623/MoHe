import React from 'react';
import PropTypes from 'prop-types';
import styles from '@/styles/components/home/home-horizontal-scroller.module.css';

export default function HomeHorizontalScroller({ children, className = '' }) {
  return (
    <div className={`${styles.scroller} ${className}`}>
      <div className={styles.track}>
        {children}
      </div>
    </div>
  );
}

HomeHorizontalScroller.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
