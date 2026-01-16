import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'mohe_recently_viewed';
const MAX_ITEMS = 10;

/**
 * Hook for managing recently viewed places in localStorage
 */
export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentlyViewed(parsed);
      }
    } catch (err) {
      console.warn('Failed to load recently viewed:', err);
    }
  }, []);

  // Add a place to recently viewed
  const addRecentlyViewed = useCallback((place) => {
    if (!place || !place.id) return;

    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.id !== place.id);

      // Add to beginning with timestamp
      const updated = [
        {
          id: place.id,
          title: place.title || place.name,
          rating: place.rating,
          location: place.location,
          image: place.image || place.imageUrl,
          images: place.images || [],
          viewedAt: Date.now(),
        },
        ...filtered,
      ].slice(0, MAX_ITEMS);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save recently viewed:', err);
      }

      return updated;
    });
  }, []);

  // Remove a place from recently viewed
  const removeRecentlyViewed = useCallback((placeId) => {
    setRecentlyViewed((prev) => {
      const updated = prev.filter((p) => p.id !== placeId);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save recently viewed:', err);
      }

      return updated;
    });
  }, []);

  // Clear all recently viewed
  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear recently viewed:', err);
    }
  }, []);

  return {
    recentlyViewed,
    addRecentlyViewed,
    removeRecentlyViewed,
    clearRecentlyViewed,
  };
};

export default useRecentlyViewed;
