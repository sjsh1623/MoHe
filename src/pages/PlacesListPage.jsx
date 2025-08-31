import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/places-list-page.module.css';

import { Container } from '@/components/ui/layout';
import GridPlaceCard from '@/components/ui/cards/GridPlaceCard';
import PlacesListSkeleton from '@/components/ui/skeletons/PlacesListSkeleton';
import ErrorMessage from '@/components/ui/alerts/ErrorMessage';
import { placeService, bookmarkService, contextualRecommendationService } from '@/services/apiService';
import { authService } from '@/services/authService';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function PlacesListPage() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { location, error: locationError } = useGeolocation();

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let lat = 37.5665; // Default Seoul coordinates
        let lon = 126.9780;
        
        if (location) {
          lat = location.latitude;
          lon = location.longitude;
        }

        // Try to get nearby places first, fallback to general search
        let response;
        try {
          response = await placeService.getNearbyPlaces(lat, lon, {
            radius: 5000, // 5km radius
            limit: 20
          });
        } catch (nearbyError) {
          console.warn('Nearby places failed, trying general search:', nearbyError);
          // Fallback to contextual recommendations
          response = await contextualRecommendationService.getContextualRecommendations(
            '인기 장소', // Default query
            lat,
            lon,
            { limit: 20 }
          );
        }

        if (response.success) {
          setPlaces(response.data?.places || []);
        } else {
          setError('장소를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('Failed to load places:', err);
        setError('장소를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaces();
  }, [location]);

  const handlePlaceClick = (placeId) => {
    console.log('Place clicked:', placeId);
    const selectedPlace = places.find(place => place.id === placeId);
    navigate(`/place/${placeId}`, { 
      state: { preloadedImage: selectedPlace?.image || selectedPlace?.imageUrl, preloadedData: selectedPlace } 
    });
  };

  const handleBookmarkToggle = async (placeId, isBookmarked) => {
    try {
      const user = authService.getCurrentUser();
      if (!user || user.isGuest) {
        console.log('Guest user cannot bookmark places');
        return;
      }

      if (isBookmarked) {
        await bookmarkService.addBookmark(placeId);
      } else {
        await bookmarkService.removeBookmark(placeId);
      }
      
      // Update local state
      setPlaces(prevPlaces => 
        prevPlaces.map(place => 
          place.id === placeId ? { ...place, isBookmarked } : place
        )
      );
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
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
          <h2 className={styles.sectionTitle}>오늘, 이런 곳은 어때요?</h2>
          
          {error && (
            <ErrorMessage message={error} />
          )}
          
          {/* Places Grid - Show skeleton while loading */}
          {isLoading ? (
            <PlacesListSkeleton />
          ) : places.length === 0 ? (
            <div className={styles.emptyState}>
              <p>추천할 장소가 없습니다.</p>
              <p>위치 설정을 확인해보세요.</p>
            </div>
          ) : (
            <div className={styles.placesGrid}>
              {places.map((place) => (
              <GridPlaceCard
                key={place.id}
                title={place.name || place.title}
                rating={place.rating}
                location={place.location}
                image={place.image || place.imageUrl}
                isBookmarked={place.isBookmarked}
                onClick={() => handlePlaceClick(place.id)}
                onBookmarkToggle={(isBookmarked) => handleBookmarkToggle(place.id, isBookmarked)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}