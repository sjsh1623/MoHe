import React, { useState, useEffect } from 'react';
import BookmarkPlaceCard from '@/components/ui/cards/BookmarkPlaceCard';
import BookmarksSkeleton from '@/components/ui/skeletons/BookmarksSkeleton';
import ErrorMessage from '@/components/ui/alerts/ErrorMessage';
import { bookmarkService } from '@/services/apiService';
import { authService } from '@/services/authService';
import styles from '@/styles/pages/bookmarks-page.module.css';
import useAuthGuard from '@/hooks/useAuthGuard';

function BookmarksPage() {
  useAuthGuard(true); // Protect this page
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const user = authService.getCurrentUser();
        if (!user || user.isGuest) {
          // No bookmarks for guest users
          setBookmarkedPlaces([]);
          return;
        }

        // Load user's bookmarks from backend
        const response = await bookmarkService.getUserBookmarks();
        if (response.success) {
          setBookmarkedPlaces(response.data || []);
        } else {
          setError('북마크를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('Failed to load bookmarks:', err);
        setError('북마크를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarks();
  }, []);

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>북마크</h1>
      </header>

      <main className={styles.main}>
        {error && (
          <ErrorMessage message={error} />
        )}
        
        {isLoading ? (
          <BookmarksSkeleton />
        ) : bookmarkedPlaces.length === 0 ? (
          <div className={styles.emptyState}>
            <p>아직 북마크한 장소가 없습니다.</p>
            <p>마음에 드는 장소를 북마크해보세요!</p>
          </div>
        ) : (
          <div className={styles.placesList}>
            {bookmarkedPlaces.map((place) => (
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

export default BookmarksPage;