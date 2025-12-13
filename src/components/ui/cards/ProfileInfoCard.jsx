import React from 'react';
import PropTypes from 'prop-types';
import { buildImageUrl } from '@/utils/image';

export default function ProfileInfoCard({
  styles,
  mbtiValue = 'INFJ',
  userName = '석현',
  userDescription = '함께 조용히 머무를 수 있는 곳을 좋아해요',
  profileImage = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
  onMBTIClick
}) {
  return (
    <div className={styles.group}>
      <div className={styles.groupWrapper}>
        <div className={styles.group2}>
          <img className={styles.rectangle} src="/rectangle-841.svg" alt="" />
          <div
            className={styles.group3}
            onClick={onMBTIClick}
            style={{ cursor: onMBTIClick ? 'pointer' : 'default' }}
          >
            <div className={styles.textWrapper}>MBTI</div>
            <div className={styles.textWrapper2}>{mbtiValue}</div>
          </div>
        </div>
      </div>
      <div className={styles.group5}>
        <div className={styles.group6}>
          <div className={styles.textWrapper5}>{userName}</div>
          <p className={styles.p}>{userDescription}</p>
        </div>
        <img className={styles.img} src={buildImageUrl(profileImage) || profileImage} alt="프로필" />
      </div>
    </div>
  );
}

ProfileInfoCard.propTypes = {
  styles: PropTypes.object.isRequired,
  mbtiValue: PropTypes.string,
  userName: PropTypes.string,
  userDescription: PropTypes.string,
  profileImage: PropTypes.string,
  onMBTIClick: PropTypes.func
};
