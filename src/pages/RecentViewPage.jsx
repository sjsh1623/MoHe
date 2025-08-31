import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/recent-view-page.module.css';

import { Container } from '@/components/ui/layout';
import GridPlaceCard from '@/components/ui/cards/GridPlaceCard';
import PlacesListSkeleton from '@/components/ui/skeletons/PlacesListSkeleton';
import ErrorMessage from '@/components/ui/alerts/ErrorMessage';
import { bookmarkService } from '@/services/apiService';
import { authService } from '@/services/authService';

export default function RecentViewPage() {
  const navigate = useNavigate();
  const [recentPlaces, setRecentPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRecentViews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const user = authService.getCurrentUser();
        if (!user || user.isGuest) {
          setRecentPlaces([]);
          return;
        }

        // TODO: Load user's recent views when backend API is available
        // For now, show empty state
        console.log('RecentViewPage: Recent view service not implemented yet');
        setRecentPlaces([]);
      } catch (err) {
        console.error('Failed to load recent views:', err);
        setError('최근 본 장소를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentViews();
  }, []);

  const handlePlaceClick = (placeId) => {
    console.log('Recent place clicked:', placeId);
    const selectedPlace = recentPlaces.find(place => place.id === placeId);
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
      setRecentPlaces(prevPlaces => 
        prevPlaces.map(place => 
          place.id === placeId ? { ...place, isBookmarked } : place
        )
      );
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  // Show skeleton loader while loading
  if (isLoading) {
    return <PlacesListSkeleton />;
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>최근 본 장소</h1>
      </header>

      {error && (
        <ErrorMessage message={error} />
      )}

      {/* Main content */}
      <div className={styles.contentContainer}>
        <div className={styles.contentWrapper}>
          <h2 className={styles.sectionTitle}>최근에 확인한 곳들이에요</h2>
          
          {recentPlaces.length === 0 ? (
            <div className={styles.emptyState}>
              <p>최근에 본 장소가 없습니다.</p>
              <p>새로운 장소를 탐색해보세요!</p>
            </div>
          ) : (
            <div className={styles.placesGrid}>
              {recentPlaces.map((place) => (
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