import React from 'react';
import PropTypes from 'prop-types';
import styles from '@/styles/components/cards/profile-header.module.css';
import { buildImageUrl } from '@/utils/image';

export default function ProfileHeader({
  name,
  description,
  profileImage,
  mbti,
  placesCount
}) {
  return (
    <div className={styles.profileHeader}>
      <div className={styles.groupWrapper}>
        <div className={styles.statsGroup}>
          <img className={styles.rectangle} src="/rectangle-841.svg" alt="" />
          <div className={styles.mbtiGroup}>
            <div className={styles.label}>MBTI</div>
            <div className={styles.value}>{mbti}</div>
          </div>
          <div className={styles.placesGroup}>
            <div className={styles.label}>내 장소</div>
            <div className={styles.value}>{placesCount}</div>
          </div>
        </div>
      </div>
      <div className={styles.userInfo}>
        <div className={styles.textInfo}>
          <div className={styles.name}>{name}</div>
          <p className={styles.description}>{description}</p>
        </div>
        <img 
          className={styles.profileImage} 
          src={buildImageUrl(profileImage) || profileImage} 
          alt="프로필" 
        />
      </div>
    </div>
  );
}

ProfileHeader.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  profileImage: PropTypes.string.isRequired,
  mbti: PropTypes.string.isRequired,
  placesCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};
