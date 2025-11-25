import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import BookmarkPlaceCard from '@/components/ui/cards/BookmarkPlaceCard';
import BookmarksSkeleton from '@/components/ui/skeletons/BookmarksSkeleton';
import ErrorMessage from '@/components/ui/alerts/ErrorMessage';
import { bookmarkService } from '@/services/apiService';
import { authService } from '@/services/authService';
import styles from '@/styles/pages/bookmarks-page.module.css';
import useAuthGuard from '@/hooks/useAuthGuard';

function BookmarksPage() {
  const { t } = useTranslation();
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
          const bookmarks = response.data?.bookmarks ?? response.data ?? [];
          setBookmarkedPlaces(bookmarks);
        } else {
          setError(t('bookmarks.errors.loadFailed'));
        }
      } catch (err) {
        console.error('Failed to load bookmarks:', err);
        setError(t('bookmarks.errors.loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarks();
  }, []);

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('bookmarks.title')}</h1>
      </header>

      <main className={styles.main}>
        {error && (
          <ErrorMessage message={error} />
        )}

        {isLoading ? (
          <BookmarksSkeleton />
        ) : bookmarkedPlaces.length === 0 ? (
          <div className={styles.emptyState}>
            {t('bookmarks.emptyState').split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
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
