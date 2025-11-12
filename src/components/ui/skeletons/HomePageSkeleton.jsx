import React from 'react';
import PlaceCardSkeleton from './PlaceCardSkeleton';
import styles from '@/styles/components/skeletons/home-page-skeleton.module.css';
import bannerLeft from '@/assets/image/banner_left.png';

const cardPlaceholders = Array.from({ length: 3 });

export default function HomePageSkeleton() {
  return (
    <div className={styles.contentContainer}>
      <section className={styles.section}>
        <div className={styles.headerRow}>
          <h2 className={styles.sectionTitle}>지금 가기 좋은 플레이스</h2>
        </div>
        <div className={styles.horizontalScroll}>
          <div className={styles.cardsContainer}>
            {cardPlaceholders.map((_, index) => (
              <div key={`primary-card-${index}`} className={styles.cardWrapper}>
                <PlaceCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.moodSection}>
        <div className={styles.moodCard}>
          <div className={styles.moodContent}>
            <h3 className={styles.moodTitle}>지금 뭐하지?</h3>
            <p className={styles.moodDescription}>
              시간, 기분, 취향을 반영해서<br />
              당신에게 어울리는 곳을 골라봤어요.
            </p>
          </div>
          <div className={styles.moodImage}>
            <img src={bannerLeft} alt="Mood illustration" />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.headerRow}>
          <h2 className={styles.sectionTitle}>지금 이 시간 추천</h2>
        </div>
        <div className={styles.horizontalScroll}>
          <div className={styles.cardsContainer}>
            {cardPlaceholders.map((_, index) => (
              <div key={`secondary-card-${index}`} className={styles.cardWrapper}>
                <PlaceCardSkeleton variant="compact" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.headerRow}>
          <h2 className={styles.sectionTitle}>오늘은 이런 곳 어떠세요?</h2>
        </div>
        <div className={styles.horizontalScroll}>
          <div className={styles.cardsContainer}>
            {cardPlaceholders.map((_, index) => (
              <div key={`popular-card-${index}`} className={styles.cardWrapper}>
                <PlaceCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
