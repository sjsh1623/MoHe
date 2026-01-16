import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/pages/search-results-page.module.css';

import { Container } from '@/components/ui/layout';
import SearchResultsSkeleton from '@/components/ui/skeletons/SearchResultsSkeleton';
import ErrorMessage from '@/components/ui/alerts/ErrorMessage';
import { placeService, bookmarkService, unifiedSearchService } from '@/services/apiService';
import { authService } from '@/services/authService';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDebounce } from '@/hooks/useDebounce';
import { buildImageUrl, normalizePlaceImages } from '@/utils/image';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const locationState = useLocation().state;
  const query = searchParams.get('q') || locationState?.query || '';
  const debouncedQuery = useDebounce(query, 300);

  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { location } = useGeolocation();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && !user.isGuest) {
      setUserName(user.nickname || '사용자');
    } else {
      setUserName('고객');
    }
  }, []);

  useEffect(() => {
    const searchPlaces = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if we have pre-loaded results from navigation state
        if (locationState?.results) {
          setSearchResults(locationState.results.map(normalizePlaceImages));
          if (locationState.error) {
            setError(locationState.error);
          }
          setIsLoading(false);
          return;
        }

        let lat = 37.5665; // Default Seoul coordinates
        let lon = 126.9780;

        if (location) {
          lat = location.latitude;
          lon = location.longitude;
        }

        // Get unified search results (Embedding + keyword hybrid)
        let response;
        if (debouncedQuery) {
          // Use unified search API for queries (supports food, activity, location, etc.)
          response = await unifiedSearchService.search(debouncedQuery, lat, lon, { limit: 20 });
        } else {
          // Use general place search for no query
          response = await placeService.getNearbyPlaces(lat, lon, {
            radius: 3000, // 3km radius
            limit: 20
          });
        }

        if (response.success) {
          const data = response.data?.places || response.data || [];
          let normalizedResults = data.map(normalizePlaceImages);

          // Apply bookmark status for authenticated users
          const user = authService.getCurrentUser();
          if (user && !user.isGuest && authService.isAuthenticated()) {
            normalizedResults = await bookmarkService.applyBookmarkStatus(normalizedResults);
          }

          setSearchResults(normalizedResults);
        } else {
          setError('검색 결과를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('Failed to search places:', err);
        setError('검색 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    searchPlaces();
  }, [debouncedQuery, location]);

  const handleBookmarkToggle = async (placeId, shouldBookmark) => {
    try {
      const user = authService.getCurrentUser();
      if (!user || user.isGuest) {
        console.log('Guest user cannot bookmark places');
        return;
      }

      if (shouldBookmark) {
        await bookmarkService.addBookmark(placeId);
      } else {
        await bookmarkService.removeBookmark(placeId);
      }

      // Update local state
      setSearchResults(prevResults =>
        prevResults.map(place =>
          place.id === placeId ? { ...place, isBookmarked: shouldBookmark } : place
        )
      );
    } catch (err) {
      console.error('Failed to bookmark place:', err);
    }
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
            {query ? `"${query}" 검색 결과` : `${userName}님만을 위한 장소들을 찾아봤어요!`}
          </h1>
          <p className={styles.subtitle}>
            현재 위치 기반으로 추천 장소를 찾았습니다.
          </p>
        </div>

        {error && (
          <ErrorMessage message={error} />
        )}

        {/* Search Results - Show skeleton while loading */}
        {isLoading ? (
          <SearchResultsSkeleton />
        ) : searchResults.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{query ? '검색 결과가 없습니다.' : '추천할 장소가 없습니다.'}</p>
            <p>다른 키워드로 검색해보세요.</p>
          </div>
        ) : (
          <div className={styles.resultsContainer}>
            {searchResults.map((place) => (
            <div key={place.id} className={styles.placeCard}>
              <div className={styles.horizontalScroll}>
                <div className={styles.imagesContainer}>
                  <div className={styles.imageWrapper}>
                    <img
                      src={buildImageUrl(place.image || place.imageUrl) || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=270&h=270&fit=crop&crop=center'}
                      alt={place.name || place.title}
                      className={styles.placeImage}
                    />
                    <button
                      className={styles.bookmarkButton}
                      onClick={() => handleBookmarkToggle(place.id, !(place.isBookmarked || false))}
                    >
                      <svg width="14" height="17" viewBox="0 0 14 17" fill="none">
                        <path d="M1.00009 4C1.00009 2.34315 2.34324 1 4.00009 1H10.0001C11.6569 1 13.0001 2.34315 13.0001 4V14.3358C13.0001 15.2267 11.9229 15.6729 11.293 15.0429L8.41431 12.1642C7.63326 11.3832 6.36693 11.3832 5.58588 12.1642L2.7072 15.0429C2.07723 15.6729 1.00009 15.2267 1.00009 14.3358V4Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  {place.images && place.images.length > 1 && place.images.slice(1, 3).map((imageUrl, index) => (
                    <div key={index} className={styles.imageWrapper}>
                      <img src={buildImageUrl(imageUrl)} alt={place.name || place.title} className={styles.placeImage} />
                      <button
                        className={styles.bookmarkButton}
                        onClick={() => handleBookmarkToggle(place.id, !(place.isBookmarked || false))}
                      >
                        <svg width="14" height="17" viewBox="0 0 14 17" fill="none">
                          <path d="M1.00009 4C1.00009 2.34315 2.34324 1 4.00009 1H10.0001C11.6569 1 13.0001 2.34315 13.0001 4V14.3358C13.0001 15.2267 11.9229 15.6729 11.293 15.0429L8.41431 12.1642C7.63326 11.3832 6.36693 11.3832 5.58588 12.1642L2.7072 15.0429C2.07723 15.6729 1.00009 15.2267 1.00009 14.3358V4Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.placeInfo}>
                <div className={styles.placeHeader}>
                  <h3 className={styles.placeName}>{place.name || place.title}</h3>
                  <span className={styles.placeHours}>({place.operatingHours || '영업시간 정보 없음'})</span>
                  <div className={styles.rating}>
                    <svg width="13" height="12" viewBox="0 0 13 12" fill="none">
                      <path d="M6.5 0L8.5 4L13 4L9.5 7L11 11L6.5 8.5L2 11L3.5 7L0 4L4.5 4L6.5 0Z" fill="#FFC107"/>
                    </svg>
                    <span>{place.rating}</span>
                  </div>
                </div>

                <div className={styles.locationInfo}>
                  <span className={styles.location}>{place.location || place.address}</span>
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
                      <span>{place.transportationCarTime || '정보 없음'}</span>
                    </div>
                    <div className={styles.transport}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="1" width="12" height="13" rx="1.5" fill="#7D848D"/>
                        <rect x="2.5" y="4.5" width="11" height="4" fill="white"/>
                        <circle cx="5" cy="11.5" r="1" fill="white"/>
                        <circle cx="11" cy="11.5" r="1" fill="white"/>
                        <rect x="6" y="2.5" width="4" height="1" fill="white"/>
                      </svg>
                      <span>{place.transportationBusTime || '정보 없음'}</span>
                    </div>
                  </div>
                </div>

                {place.tags && place.tags.length > 0 && (
                  <div className={styles.tags}>
                    {place.tags.join(', ')}
                  </div>
                )}

                {place.weatherTags && place.weatherTags.length > 0 && (
                  <div className={styles.badges}>
                    {place.weatherTags.slice(0, 2).map((tag, index) => (
                      <div key={index} className={styles.badge} data-color="blue">
                        <div className={styles.badgeIcon}>
                          <svg width="15" height="15" viewBox="0 0 15 15">
                            <circle cx="7.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                            <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                        </div>
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            ))}
          </div>
        )}
    </Container>
  );
}
