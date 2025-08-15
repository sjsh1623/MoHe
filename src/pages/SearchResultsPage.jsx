import React from 'react';
import styles from '@/styles/pages/search-results-page.module.css';

import { Container } from '@/components/ui/layout';
import SearchResultsSkeleton from '@/components/ui/skeletons/SearchResultsSkeleton';
import { useMockLoading } from '@/hooks/useLoadingState';

// Mock data for search results
const SEARCH_RESULTS = [
  {
    id: 1,
    name: '카페 무브먼트랩',
    hours: '09:00 ~ 19:00',
    location: '서울 성수동',
    rating: 4.7,
    carTime: '5분',
    busTime: '10분',
    tags: ['#조용한', '#카페', '#시원한'],
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=270&h=270&fit=crop&crop=center',
    isBookmarked: false,
    weatherTag: {
      text: '더운 날씨에 가기 좋은 카페',
      color: 'red',
      icon: 'thermometer'
    },
    noiseTag: {
      text: '시끄럽지 않은 카페',
      color: 'blue',
      icon: 'speaker'
    }
  },
  {
    id: 2,
    name: '카페 무브먼트랩',
    hours: '09:00 ~ 19:00',
    location: '서울 성수동',
    rating: 4.7,
    carTime: '5분',
    busTime: '10분',
    tags: ['#조용한', '#카페', '#시원한'],
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=270&h=270&fit=crop&crop=center',
    isBookmarked: false,
    weatherTag: {
      text: '더운 날씨에 가기 좋은 카페',
      color: 'red',
      icon: 'thermometer'
    },
    noiseTag: {
      text: '시끄럽지 않은 카페',
      color: 'blue',
      icon: 'speaker'
    }
  }
];

export default function SearchResultsPage() {
  const isLoading = useMockLoading(1300); // Simulate API loading

  const handleBookmark = (placeId) => {
    console.log('Bookmarking place:', placeId);
    // TODO: Implement bookmark logic
  };

  return (
    <Container className={styles.pageContainer}>
        {/* Header - Always shown immediately */}
        <div className={styles.header}>
          <button className={styles.mapButton}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <path d="M5.86 4.17L2.86 4.17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10.7 5L10.7 21.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M19.66 8.28L19.66 25.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Title Section - Always shown immediately */}
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            석현님만을 위한<br />장소들을 찾아봤어요!
          </h1>
          <p className={styles.subtitle}>
            지금은 오후 2시, 아주 덥고 습한날씨네요.<br />
            지금은 멀지 않고 실내 장소들을 추천드릴께요.
          </p>
        </div>

        {/* Search Results - Show skeleton while loading */}
        {isLoading ? (
          <SearchResultsSkeleton />
        ) : (
          <div className={styles.resultsContainer}>
            {SEARCH_RESULTS.map((place) => (
            <div key={place.id} className={styles.placeCard}>
              <div className={styles.horizontalScroll}>
                <div className={styles.imagesContainer}>
                  <div className={styles.imageWrapper}>
                    <img src={place.image} alt={place.name} className={styles.placeImage} />
                    <button 
                      className={styles.bookmarkButton}
                      onClick={() => handleBookmark(place.id)}
                    >
                      <svg width="14" height="17" viewBox="0 0 14 17" fill="none">
                        <path d="M1.00009 4C1.00009 2.34315 2.34324 1 4.00009 1H10.0001C11.6569 1 13.0001 2.34315 13.0001 4V14.3358C13.0001 15.2267 11.9229 15.6729 11.293 15.0429L8.41431 12.1642C7.63326 11.3832 6.36693 11.3832 5.58588 12.1642L2.7072 15.0429C2.07723 15.6729 1.00009 15.2267 1.00009 14.3358V4Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  {/* Add a second image for horizontal scrolling demonstration */}
                  <div className={styles.imageWrapper}>
                    <img src={place.image.replace('crop=center', 'crop=faces')} alt={place.name} className={styles.placeImage} />
                    <button 
                      className={styles.bookmarkButton}
                      onClick={() => handleBookmark(place.id)}
                    >
                      <svg width="14" height="17" viewBox="0 0 14 17" fill="none">
                        <path d="M1.00009 4C1.00009 2.34315 2.34324 1 4.00009 1H10.0001C11.6569 1 13.0001 2.34315 13.0001 4V14.3358C13.0001 15.2267 11.9229 15.6729 11.293 15.0429L8.41431 12.1642C7.63326 11.3832 6.36693 11.3832 5.58588 12.1642L2.7072 15.0429C2.07723 15.6729 1.00009 15.2267 1.00009 14.3358V4Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={styles.placeInfo}>
                <div className={styles.placeHeader}>
                  <h3 className={styles.placeName}>{place.name}</h3>
                  <span className={styles.placeHours}>({place.hours})</span>
                  <div className={styles.rating}>
                    <svg width="13" height="12" viewBox="0 0 13 12" fill="none">
                      <path d="M6.5 0L8.5 4L13 4L9.5 7L11 11L6.5 8.5L2 11L3.5 7L0 4L4.5 4L6.5 0Z" fill="#FFC107"/>
                    </svg>
                    <span>{place.rating}</span>
                  </div>
                </div>
                
                <div className={styles.locationInfo}>
                  <span className={styles.location}>{place.location}</span>
                  <div className={styles.locationIcon}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="7.33325" r="2" stroke="#7D848D" strokeWidth="1.5"/>
                      <path d="M14 7.25918C14 10.532 10.25 14.6666 8 14.6666C5.75 14.6666 2 10.532 2 7.25918C2 3.98638 4.68629 1.33325 8 1.33325C11.3137 1.33325 14 3.98638 14 7.25918Z" stroke="#7D848D" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <div className={styles.transportInfo}>
                    <div className={styles.transport}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M11.67 1.39C12.67 1.39 13.84 2.56 13.84 3.56V7.84H2.17V3.56C2.17 2.56 3.34 1.39 4.34 1.39H11.67Z" fill="#7D848D"/>
                        <path d="M0.83 6.83H15.17V11.16C15.17 12.16 14 13.33 13 13.33H3C2 13.33 0.83 12.16 0.83 11.16V6.83Z" fill="#7D848D"/>
                        <circle cx="4" cy="10.5" r="1" fill="white"/>
                        <circle cx="12" cy="10.5" r="1" fill="white"/>
                        <rect x="7" y="2" width="2" height="1" fill="white"/>
                      </svg>
                      <span>{place.carTime}</span>
                    </div>
                    <div className={styles.transport}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="1" width="12" height="13" rx="1.5" fill="#7D848D"/>
                        <rect x="2.5" y="4.5" width="11" height="4" fill="white"/>
                        <circle cx="5" cy="11.5" r="1" fill="white"/>
                        <circle cx="11" cy="11.5" r="1" fill="white"/>
                        <rect x="6" y="2.5" width="4" height="1" fill="white"/>
                      </svg>
                      <span>{place.busTime}</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.tags}>
                  {place.tags.join(', ')}
                </div>
                
                <div className={styles.badges}>
                  <div className={styles.badge} data-color={place.weatherTag.color}>
                    <div className={styles.badgeIcon}>
                      <svg width="15" height="15" viewBox="0 0 15 15">
                        <circle cx="7.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </div>
                    {place.weatherTag.text}
                  </div>
                  
                  <div className={styles.badge} data-color={place.noiseTag.color}>
                    <div className={styles.badgeIcon}>
                      <svg width="15" height="15" viewBox="0 0 15 15">
                        <path d="M3.12 1.25L11.87 1.25" stroke="currentColor" strokeWidth="1"/>
                        <path d="M5.62 7.5L9.37 7.5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M6.56 3.75L8.44 3.75" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </div>
                    {place.noiseTag.text}
                  </div>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
    </Container>
  );
}