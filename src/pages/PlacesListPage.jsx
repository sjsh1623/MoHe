import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/places-list-page.module.css';

import { Container } from '@/components/ui/layout';
import GridPlaceCard from '@/components/ui/cards/GridPlaceCard';

// Mock data for the places list
const PLACES_DATA = [
  {
    id: 1,
    title: 'Niladri Reservoir',
    rating: 4.7,
    location: 'Tekergat, Sunamgnj',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=176&h=159&fit=crop&crop=center',
    isBookmarked: false
  },
  {
    id: 2,
    title: 'Casa Las Tirtugas',
    rating: 4.8,
    location: 'Av Damero, Mexico',
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=176&h=159&fit=crop&crop=center',
    isBookmarked: false
  },
  {
    id: 3,
    title: 'Niladri Reservoir',
    rating: 4.7,
    location: 'Tekergat, Sunamgnj',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=176&h=159&fit=crop&crop=center',
    isBookmarked: false
  },
  {
    id: 4,
    title: 'Casa Las Tirtugas',
    rating: 4.8,
    location: 'Av Damero, Mexico',
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=176&h=159&fit=crop&crop=center',
    isBookmarked: false
  },
  {
    id: 5,
    title: 'Niladri Reservoir',
    rating: 4.7,
    location: 'Tekergat, Sunamgnj',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=176&h=159&fit=crop&crop=center',
    isBookmarked: false
  },
  {
    id: 6,
    title: 'Casa Las Tirtugas',
    rating: 4.8,
    location: 'Av Damero, Mexico',
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=176&h=159&fit=crop&crop=center',
    isBookmarked: false
  }
];

export default function PlacesListPage() {
  const navigate = useNavigate();

  const handlePlaceClick = (placeId) => {
    console.log('Place clicked:', placeId);
    navigate(`/place/${placeId}`);
  };

  const handleBookmarkToggle = (placeId, isBookmarked) => {
    console.log(`Place ${placeId} bookmark toggled:`, isBookmarked);
    // TODO: Update bookmark state in backend
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>지금 가볼만한 곳</h1>
      </header>

      {/* Main content */}
      <div className={styles.contentContainer}>
        <div className={styles.contentWrapper}>
          <h2 className={styles.sectionTitle}>오늘, 이런 곳은 어때요?</h2>
          
          <div className={styles.placesGrid}>
            {PLACES_DATA.map((place) => (
              <GridPlaceCard
                key={place.id}
                title={place.title}
                rating={place.rating}
                location={place.location}
                image={place.image}
                isBookmarked={place.isBookmarked}
                onClick={() => handlePlaceClick(place.id)}
                onBookmarkToggle={(isBookmarked) => handleBookmarkToggle(place.id, isBookmarked)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}