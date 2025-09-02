import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/places-list-page.module.css';

import { Container } from '@/components/ui/layout';
import GridPlaceCard from '@/components/ui/cards/GridPlaceCard';
import PlacesListSkeleton from '@/components/ui/skeletons/PlacesListSkeleton';
import ErrorMessage from '@/components/ui/alerts/ErrorMessage';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import { placeService, bookmarkService } from '@/services/apiService';
import { authService } from '@/services/authService';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function PlacesListPage() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMorePlaces, setHasMorePlaces] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [user, setUser] = useState(null);
  const { location, error: locationError } = useGeolocation();
  
  const PLACES_PER_PAGE = 20;

  // Initialize user state
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Load places function
  const loadPlaces = useCallback(async (page = 0, append = false) => {
    try {
      if (!append) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      // Use the general places list endpoint with pagination
      const response = await placeService.getPlacesList({
        page: page,
        limit: PLACES_PER_PAGE,
        sort: 'popularity' // Default sort by popularity
      });

      if (response.success) {
        const { places: newPlaces, pagination } = response.data;
        
        if (append) {
          setPlaces(prev => [...prev, ...newPlaces]);
        } else {
          setPlaces(newPlaces);
        }
        
        if (pagination) {
          setTotalPages(pagination.totalPages);
          setHasMorePlaces(pagination.currentPage < pagination.totalPages);
        }
        
        setCurrentPage(page);
      } else {
        setError('장소를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to load places:', err);
      setError('장소를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadPlaces(0, false);
  }, [loadPlaces]);

  const handlePlaceClick = (placeId) => {
    console.log('Place clicked:', placeId);
    const selectedPlace = places.find(place => place.id === placeId);
    navigate(`/place/${placeId}`, { 
      state: { preloadedImage: selectedPlace?.image || selectedPlace?.imageUrl, preloadedData: selectedPlace } 
    });
  };

  const handleBookmarkToggle = async (placeId, isBookmarked) => {
    try {
      if (!user || user.isGuest) {
        console.log('Guest user redirected to login for bookmarking');
        navigate('/login', {
          state: { 
            from: '/places',
            message: '북마크 기능을 사용하려면 로그인이 필요합니다.'
          }
        });
        return;
      }

      const response = await bookmarkService.toggleBookmark(placeId);
      
      if (response.success) {
        // Update local state
        setPlaces(prevPlaces => 
          prevPlaces.map(place => 
            place.id === placeId ? { ...place, isBookmarked: response.data.isBookmarked } : place
          )
        );
      } else {
        console.error('Failed to toggle bookmark:', response.message);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleLoadMore = () => {
    if (hasMorePlaces && !isLoadingMore) {
      loadPlaces(currentPage + 1, true);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header - Always shown immediately */}
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>지금 가볼만한 곳</h1>
      </header>

      {/* Main content */}
      <div className={styles.contentContainer}>
        <div className={styles.contentWrapper}>
          <h2 className={styles.sectionTitle}>모든 장소</h2>
          <p className={styles.sectionSubtitle}>평점과 인기도를 기준으로 정렬된 장소들입니다</p>
          
          {error && (
            <ErrorMessage message={error} />
          )}
          
          {/* Places Grid - Show skeleton while loading */}
          {isLoading ? (
            <PlacesListSkeleton />
          ) : places.length === 0 ? (
            <div className={styles.emptyState}>
              <p>추천할 장소가 없습니다.</p>
              <p>잠시 후 다시 시도해주세요.</p>
            </div>
          ) : (
            <>
              <div className={styles.placesGrid}>
                {places.map((place) => (
                  <GridPlaceCard
                    key={place.id}
                    title={place.title}
                    rating={place.rating}
                    location={place.location}
                    image={place.image}
                    isBookmarked={place.isBookmarked || false}
                    onClick={() => handlePlaceClick(place.id)}
                    onBookmarkToggle={(isBookmarked) => handleBookmarkToggle(place.id, isBookmarked)}
                  />
                ))}
              </div>
              
              {/* Load More Button */}
              {hasMorePlaces && (
                <div className={styles.loadMoreContainer}>
                  <PrimaryButton 
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className={styles.loadMoreButton}
                  >
                    {isLoadingMore ? '더 많은 장소를 불러오는 중...' : '더 많은 장소 보기'}
                  </PrimaryButton>
                </div>
              )}
              
              {/* Show current progress */}
              {totalPages > 1 && (
                <div className={styles.paginationInfo}>
                  <p>{currentPage + 1} / {totalPages} 페이지</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}