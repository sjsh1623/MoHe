import React from 'react';
import BookmarkPlaceCard from '@/components/ui/cards/BookmarkPlaceCard';
import BookmarksSkeleton from '@/components/ui/skeletons/BookmarksSkeleton';
import { useMockLoading } from '@/hooks/useLoadingState';
import styles from '@/styles/pages/bookmarks-page.module.css';

const mockBookmarkedPlaces = [
  {
    id: 1,
    name: '카페 무브먼트랩',
    location: '서울 성수동',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=240&h=240&fit=crop&crop=center',
    rating: 4.8
  },
  {
    id: 2,
    name: '카페 무브먼트랩',
    location: '서울 성수동',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=240&h=240&fit=crop&crop=center',
    rating: 4.8
  },
  {
    id: 3,
    name: '카페 무브먼트랩',
    location: '서울 성수동',
    image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=240&h=240&fit=crop&crop=center',
    rating: 4.8
  },
  {
    id: 4,
    name: '카페 무브먼트랩',
    location: '서울 성수동',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=240&h=240&fit=crop&crop=center',
    rating: 4.8
  },
  {
    id: 5,
    name: '카페 무브먼트랩',
    location: '서울 성수동',
    image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=240&h=240&fit=crop&crop=center',
    rating: 4.8
  },
  {
    id: 6,
    name: '카페 무브먼트랩',
    location: '서울 성수동',
    image: 'https://images.unsplash.com/photo-1442975631115-c4f7b5d6b907?w=240&h=240&fit=crop&crop=center',
    rating: 4.8
  },
  {
    id: 7,
    name: '스타벅스 강남점',
    location: '서울 강남구',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=240&h=240&fit=crop&crop=center',
    rating: 4.5
  },
  {
    id: 8,
    name: '블루보틀 성수점',
    location: '서울 성동구',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=240&h=240&fit=crop&crop=center',
    rating: 4.7
  },
  {
    id: 9,
    name: '카페 온누리',
    location: '서울 홍대입구',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=240&h=240&fit=crop&crop=center',
    rating: 4.6
  },
  {
    id: 10,
    name: '투썸플레이스',
    location: '서울 신촌',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=240&h=240&fit=crop&crop=center',
    rating: 4.3
  }
];

export default function BookmarksPage() {
  const isLoading = useMockLoading(900); // Simulate API loading

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>북마크</h1>
      </header>

      <main className={styles.main}>
        {isLoading ? (
          <BookmarksSkeleton />
        ) : (
          <div className={styles.placesList}>
          {mockBookmarkedPlaces.map((place) => (
            <BookmarkPlaceCard
              key={place.id}
              name={place.name}
              location={place.location}
              image={place.image}
              rating={place.rating}
            />
          ))}
          </div>
        )}
      </main>
    </>
  );
}