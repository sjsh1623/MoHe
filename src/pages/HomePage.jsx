import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/home-page.module.css';

import { Container } from '@/components/ui/layout';
import PlaceCard from '@/components/ui/cards/PlaceCard';
import LocationPin from '@/components/ui/indicators/LocationPin';
import ProfileButton from '@/components/ui/buttons/ProfileButton';
import OutlineButton from '@/components/ui/buttons/OutlineButton';
import FloatingButton from '@/components/ui/buttons/FloatingButton';
import bannerLeft from '@/assets/image/banner_left.png';

// Mock data for the recommendations
const RECOMMENDATION_DATA = [
  {
    id: 1,
    title: '색의 흐름',
    rating: 4.7,
    location: '서울 성수동',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=240&h=240&fit=crop&crop=center',
    isBookmarked: false
  },
  {
    id: 2,
    title: '카페 무브먼트랩',
    rating: 4.9,
    location: '서울 강남구',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=240&h=240&fit=crop&crop=center',
    isBookmarked: false,
    avatars: [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=24&h=24&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108755-2616b332c234?w=24&h=24&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=24&h=24&fit=crop&crop=face'
    ],
    additionalCount: 50
  }
];

const DESTINATION_DATA = [
  {
    id: 1,
    title: 'Niladri Reservoir',
    location: 'Tekergat, Sunamgnj',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=270&h=177&fit=crop&crop=center',
    isBookmarked: false
  },
  {
    id: 2,
    title: 'Niladri Reservoir',
    location: 'Tekergat, Sunamgnj',
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=277&h=177&fit=crop&crop=center',
    isBookmarked: false
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  console.log('HomePage component loaded');

  const handleProfileClick = () => {
    console.log('Profile clicked');
    navigate('/profile-settings');
  };

  const handleBookmarkToggle = (placeId, isBookmarked) => {
    console.log(`Place ${placeId} bookmark toggled:`, isBookmarked);
    // TODO: Update bookmark state in backend
  };

  const handleSeeMore = () => {
    console.log('See more places clicked');
    navigate('/places');
  };

  const handlePlaceClick = (placeId) => {
    console.log('Place clicked:', placeId);
    navigate(`/place/${placeId}`);
  };

  const handleFloatingButtonClick = () => {
    console.log('Floating button clicked');
    // TODO: Open AI assistant or quick actions
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.logo}>MOHE</h1>
        <ProfileButton onClick={handleProfileClick} />
      </header>

      {/* Location indicator */}
      <div className={`${styles.locationSection} container-padding`}>
        <LocationPin location="용인시 보정동" size="medium" />
      </div>

      {/* Main content */}
      <div className={styles.contentContainer}>
        <div className={styles.contentWrapper}>
          {/* Personalized recommendations section */}
          <section className={styles.section}>
            <h2 className={`${styles.sectionTitle} container-padding`}>내 취향에 맞는 추천 플레이스</h2>
            <div className={styles.horizontalScroll}>
              <div className={styles.cardsContainer}>
                {RECOMMENDATION_DATA.map((place) => (
                  <div key={place.id} className={styles.cardWrapper}>
                    <div onClick={() => handlePlaceClick(place.id)} style={{ cursor: 'pointer' }}>
                      <PlaceCard
                        title={place.title}
                        rating={place.rating}
                        location={place.location}
                        image={place.image}
                        isBookmarked={place.isBookmarked}
                        avatars={place.avatars}
                        additionalCount={place.additionalCount}
                        onBookmarkToggle={(isBookmarked) => handleBookmarkToggle(place.id, isBookmarked)}
                        variant={place.id === 2 ? 'compact' : 'default'}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Mood-based section */}
          <section className={`${styles.moodSection} container-padding`}>
            <div className={styles.moodCard} onClick={() => navigate('/age-range')} style={{ cursor: 'pointer' }}>
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

          {/* Popular destinations section */}
          <section className={styles.section}>
            <h2 className={`${styles.sectionTitle} container-padding`}>인기 여행지</h2>
            <div className={styles.horizontalScroll}>
              <div className={styles.destinationsContainer}>
                {DESTINATION_DATA.map((destination) => (
                  <div key={destination.id} className={styles.destinationWrapper}>
                    <div 
                      className={styles.destinationCard}
                      onClick={() => handlePlaceClick(destination.id)}
                      style={{ cursor: 'pointer' }}
                    >
                  <div className={styles.destinationImageContainer}>
                    <img 
                      src={destination.image} 
                      alt={destination.title}
                      className={styles.destinationImage}
                    />
                    <button 
                      className={styles.destinationBookmark}
                      onClick={() => handleBookmarkToggle(destination.id, !destination.isBookmarked)}
                      aria-label={destination.isBookmarked ? '북마크 제거' : '북마크 추가'}
                    >
                      <div className={styles.bookmarkBg}></div>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path 
                          d="M3.00009 4C3.00009 2.34315 4.34324 1 6.00009 1H12.0001C13.6569 1 15.0001 2.34315 15.0001 4V14.3358C15.0001 15.2267 13.9229 15.6729 13.293 15.0429L10.4143 12.1642C9.63326 11.3832 8.36693 11.3832 7.58588 12.1642L4.7072 15.0429C4.07723 15.6729 3.00009 15.2267 3.00009 14.3358V4Z" 
                          stroke="white" 
                          strokeWidth="1.5" 
                          strokeLinejoin="round"
                          fill={destination.isBookmarked ? 'white' : 'none'}
                        />
                      </svg>
                    </button>
                  </div>
                  <div className={styles.destinationInfo}>
                    <h3 className={styles.destinationTitle}>{destination.title}</h3>
                    <div className={styles.destinationLocation}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="5.5" r="1.5" stroke="#7D848D" strokeWidth="1.125"/>
                        <path d="M10.5 5.44438C10.5 7.899 7.6875 11 6 11C4.3125 11 1.5 7.899 1.5 5.44438C1.5 2.98969 3.51472 1 6 1C8.48528 1 10.5 2.98969 10.5 5.44438Z" stroke="#7D848D" strokeWidth="1.125"/>
                      </svg>
                      <span>{destination.location}</span>
                    </div>
                  </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${styles.seeMoreContainer} container-padding`}>
              <OutlineButton onClick={handleSeeMore}>
                새로운 곳 더보기
              </OutlineButton>
            </div>
          </section>

        </div>
      </div>

      {/* Footer moved outside contentWrapper */}
      <footer className={styles.footer}>
        <div className={`${styles.footerContent} container-padding`}>
          <p className={styles.footerText}>
            © 2025 MOHAE<br />
            서비스 이용약관 | 개인정보처리방침 | 문의하기<br />
            hello@mohae.app
          </p>
        </div>
      </footer>

      {/* Floating action button */}
      <FloatingButton onClick={handleFloatingButtonClick} />
    </div>
  );
}