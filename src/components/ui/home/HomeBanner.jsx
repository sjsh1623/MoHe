import React from 'react';
import PropTypes from 'prop-types';
import styles from '@/styles/components/home/home-banner.module.css';

export default function HomeBanner({ title, description, image, onClick, className = '' }) {
  return (
    <button type="button" onClick={onClick} className={`${styles.banner} ${className}`}>
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <span className={styles.description}>{description}</span>
      </div>
      {image ? (
        <div className={styles.imageWrapper}>
          <img src={image} alt="" className={styles.image} />
        </div>
      ) : null}
    </button>
  );
}

HomeBanner.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
};
