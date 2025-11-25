import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/pages/recent-view-page.module.css';

import { Container } from '@/components/ui/layout';
import GridPlaceCard from '@/components/ui/cards/GridPlaceCard';
import PlacesListSkeleton from '@/components/ui/skeletons/PlacesListSkeleton';
import ErrorMessage from '@/components/ui/alerts/ErrorMessage';
import { activityService, bookmarkService } from '@/services/apiService';
import { authService } from '@/services/authService';
import { buildImageUrl } from '@/utils/image';

export default function RecentViewPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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

        const response = await activityService.getRecentPlaces();
        if (response.success) {
          const recentPlacesData = response.data?.recent_places || response.data?.recentPlaces || [];
          const mapped = recentPlacesData.map(place => ({
            id: place.id,
            name: place.title || place.place?.title || place.place?.name,
            title: place.title || place.place?.title,
            location: place.location || place.place?.location,
            image: place.image || place.place?.imageUrl,
            imageUrl: place.place?.imageUrl,
            rating: place.rating || place.place?.rating,
            isBookmarked: place.place?.isBookmarked || false
          }));
          setRecentPlaces(mapped);
        } else {
          setError(t('recentPlaces.errors.loadFailed'));
        }
      } catch (err) {
        console.error('Failed to load recent views:', err);
        setError(t('recentPlaces.errors.loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentViews();
  }, []);

  const handlePlaceClick = (placeId) => {
    console.log('Recent place clicked:', placeId);
    const selectedPlace = recentPlaces.find(place => place.id === placeId);
    const preloadedImage = buildImageUrl(
      selectedPlace?.image || selectedPlace?.imageUrl || selectedPlace?.images?.[0]
    );

    navigate(`/place/${placeId}`, {
      state: { preloadedImage, preloadedData: selectedPlace }
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
        <h1 className={styles.pageTitle}>{t('recentPlaces.title')}</h1>
      </header>

      {error && (
        <ErrorMessage message={error} />
      )}

      {/* Main content */}
      <div className={styles.contentContainer}>
        <div className={styles.contentWrapper}>
          <h2 className={styles.sectionTitle}>{t('recentPlaces.sectionTitle')}</h2>

          {recentPlaces.length === 0 ? (
            <div className={styles.emptyState}>
              {t('recentPlaces.emptyState').split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
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
