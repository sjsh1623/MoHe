import React, { useState, useEffect } from 'react';
import BookmarkPlaceCard from '@/components/ui/cards/BookmarkPlaceCard';
import BookmarksSkeleton from '@/components/ui/skeletons/BookmarksSkeleton';
import ErrorMessage from '@/components/ui/alerts/ErrorMessage';
// TODO: Import recentViewService when backend API is available
import { authService } from '@/services/authService';
import styles from '@/styles/pages/my-places-page.module.css';

export default function MyPlacesPage() {
  const [myPlaces, setMyPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMyPlaces = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const user = authService.getCurrentUser();
        if (!user || user.isGuest) {
          setMyPlaces([]);
          return;
        }

        // TODO: Load user's recent views when backend API is available
        // For now, show empty state
        console.log('MyPlacesPage: Recent view service not implemented yet');
        setMyPlaces([]);
      } catch (err) {
        console.error('Failed to load my places:', err);
        setError('내 장소를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMyPlaces();
  }, []);

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>내 장소</h1>
      </header>

      <main className={styles.main}>
        {error && (
          <ErrorMessage message={error} />
        )}
        
        {isLoading ? (
          <BookmarksSkeleton />
        ) : myPlaces.length === 0 ? (
          <div className={styles.emptyState}>
            <p>아직 방문한 장소가 없습니다.</p>
            <p>장소를 둘러보고 나만의 리스트를 만들어보세요!</p>
          </div>
        ) : (
          <div className={styles.placesList}>
            {myPlaces.map((place) => (
              <BookmarkPlaceCard
                key={place.id}
                name={place.name || place.title}
                location={place.location}
                image={place.image || place.imageUrl}
                rating={place.rating}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}