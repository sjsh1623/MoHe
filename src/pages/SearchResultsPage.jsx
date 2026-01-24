import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/pages/search-results-page.module.css';

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
  const navigate = useNavigate();
  const query = searchParams.get('q') || locationState?.query || '';
  const debouncedQuery = useDebounce(query, 300);

  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchMessage, setSearchMessage] = useState('');
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

        // Get unified search results (OpenAI + Kanana Embedding + keyword hybrid)
        let response;
        if (debouncedQuery) {
          response = await unifiedSearchService.search(debouncedQuery, lat, lon, { limit: 20 });
        } else {
          response = await placeService.getNearbyPlaces(lat, lon, {
            radius: 3000,
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
          setSearchMessage(response.data?.message || '');
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
        navigate('/login', { state: { from: `/search?q=${query}` } });
        return;
      }

      if (shouldBookmark) {
        await bookmarkService.addBookmark(placeId);
      } else {
        await bookmarkService.removeBookmark(placeId);
      }

      setSearchResults(prevResults =>
        prevResults.map(place =>
          place.id === placeId ? { ...place, isBookmarked: shouldBookmark } : place
        )
      );
    } catch (err) {
      console.error('Failed to bookmark place:', err);
    }
  };

  const handlePlaceClick = (place) => {
    navigate(`/place/${place.id}`, {
      state: { preloadedData: place }
    });
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className={styles.headerTitle}>
          {query ? `"${query}"` : '추천 장소'}
        </div>
        <div className={styles.headerSpacer} />
      </header>

      {/* Title Section */}
      <div className={styles.titleSection}>
        <h1 className={styles.title}>
          {searchMessage || (query ? `${query} 검색 결과` : `${userName}님을 위한 추천`)}
        </h1>
        <p className={styles.subtitle}>
          {searchResults.length}개의 장소를 찾았습니다
        </p>
      </div>

      {error && (
        <div className={styles.errorWrapper}>
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <SearchResultsSkeleton />
      ) : searchResults.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="#DDDDDD" strokeWidth="2"/>
              <path d="M21 21L16.65 16.65" stroke="#DDDDDD" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className={styles.emptyTitle}>{query ? '검색 결과가 없습니다' : '추천할 장소가 없습니다'}</p>
          <p className={styles.emptySubtitle}>다른 키워드로 검색해보세요</p>
        </div>
      ) : (
        <div className={styles.resultsGrid}>
          {searchResults.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onBookmarkToggle={handleBookmarkToggle}
              onClick={() => handlePlaceClick(place)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Airbnb-style Place Card Component
function PlaceCard({ place, onBookmarkToggle, onClick }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const sliderRef = useRef(null);

  // Get images array
  const images = place.images?.length > 0
    ? place.images
    : place.image
      ? [place.image]
      : place.imageUrl
        ? [place.imageUrl]
        : ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=400&fit=crop'];

  const handleScroll = (e) => {
    const slider = e.target;
    const scrollLeft = slider.scrollLeft;
    const itemWidth = slider.offsetWidth;
    const newIndex = Math.round(scrollLeft / itemWidth);
    if (newIndex !== currentImageIndex) {
      setCurrentImageIndex(newIndex);
    }
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    onBookmarkToggle(place.id, !place.isBookmarked);
  };

  return (
    <div className={styles.placeCard} onClick={onClick}>
      {/* Image Slider */}
      <div className={styles.imageContainer}>
        <div
          ref={sliderRef}
          className={styles.imageSlider}
          onScroll={handleScroll}
        >
          {images.slice(0, 5).map((imgSrc, index) => (
            <div key={index} className={styles.imageSlide}>
              <img
                src={buildImageUrl(imgSrc)}
                alt={`${place.name || place.title} ${index + 1}`}
                className={styles.placeImage}
                draggable={false}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=400&fit=crop';
                }}
              />
            </div>
          ))}
        </div>

        {/* Bookmark Button */}
        <button
          className={`${styles.bookmarkButton} ${place.isBookmarked ? styles.bookmarked : ''}`}
          onClick={handleBookmarkClick}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill={place.isBookmarked ? '#FF385C' : 'rgba(0,0,0,0.5)'}
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </button>

        {/* Image Indicators */}
        {images.length > 1 && (
          <div className={styles.imageIndicators}>
            {images.slice(0, 5).map((_, index) => (
              <span
                key={index}
                className={`${styles.indicator} ${index === currentImageIndex ? styles.active : ''}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Place Info */}
      <div className={styles.placeInfo}>
        <div className={styles.placeHeader}>
          <h3 className={styles.placeName}>{place.name || place.title}</h3>
          <div className={styles.rating}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 0L7.34708 4.1459H11.7063L8.17963 6.7082L9.52671 10.8541L6 8.2918L2.47329 10.8541L3.82037 6.7082L0.293661 4.1459H4.65292L6 0Z" fill="#222222"/>
            </svg>
            <span>{Number(place.rating || 4.0).toFixed(1)}</span>
          </div>
        </div>

        <p className={styles.placeLocation}>{place.location || place.address || place.shortAddress}</p>

        {place.description && (
          <p className={styles.placeDescription}>{place.description}</p>
        )}

        {place.tags && place.tags.length > 0 && (
          <div className={styles.placeTags}>
            {place.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className={styles.tag}>#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
