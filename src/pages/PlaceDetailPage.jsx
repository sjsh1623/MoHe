import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/place-detail-page.module.css';
import PlaceDetailSkeleton from '@/components/ui/skeletons/PlaceDetailSkeleton';
import ErrorMessage from '@/components/ui/alerts/ErrorMessage';
import ReviewCard from '@/components/ui/cards/ReviewCard';
import ImageGallery from '@/components/ui/images/ImageGallery';
import PlaceHeader from '@/components/ui/sections/PlaceHeader';
import LocationInfo from '@/components/ui/sections/LocationInfo';
import { placeService } from '@/services/apiService';
import { buildImageUrl } from '@/utils/image';

// Parse address to show only up to district/dong/road level
const parseAddress = (fullAddress) => {
  if (!fullAddress) return '';

  const parts = fullAddress.split(' ');

  // Find the index of the part that ends with 동, 로, 길, 대로
  let endIndex = -1;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.endsWith('동') || part.endsWith('로') || part.endsWith('길')) {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    // If no 동/로/길 found, return up to 2-3 parts
    return parts.slice(0, Math.min(3, parts.length)).join(' ');
  }

  // Include the district/city part before 동/로/길
  // Look for 구, 시, 군, 읍, 면
  let startIndex = endIndex;
  for (let i = endIndex - 1; i >= 0; i--) {
    const part = parts[i];
    if (part.endsWith('구') || part.endsWith('시') || part.endsWith('군') ||
        part.endsWith('읍') || part.endsWith('면')) {
      startIndex = i;
      break;
    }
  }

  return parts.slice(startIndex, endIndex + 1).join(' ');
};

// Parse markdown-style bold (**text** or *text*) and convert to React elements
const parseMarkdown = (text) => {
  if (!text) return '';

  const parts = [];
  let currentIndex = 0;
  let key = 0;

  // Regex to match **text** or *text* (non-greedy)
  const boldRegex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      parts.push(text.slice(currentIndex, match.index));
    }

    // Add bold text
    const boldText = match[2] || match[4]; // Either **text** or *text*
    parts.push(<strong key={key++}>{boldText}</strong>);

    currentIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex));
  }

  return parts.length > 0 ? parts : text;
};

export default function PlaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch place data
  useEffect(() => {
    const fetchPlaceData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await placeService.getPlaceById(id);
        setPlace(data);
      } catch (err) {
        console.error('Failed to fetch place:', err);
        setError('장소 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlaceData();
    }
  }, [id]);

  // Handlers
  const handleBack = () => {
    navigate(-1);
  };

  const handleGalleryImageClick = (index) => {
    setCurrentImageIndex(index);
  };

  if (loading) {
    return <PlaceDetailSkeleton />;
  }

  if (error || !place) {
    return (
      <div className={styles.pageContainer}>
        <ErrorMessage message={error || '장소를 찾을 수 없습니다.'} />
      </div>
    );
  }

  // Prepare data
  const images = place.images || [];
  const mainImage = images[currentImageIndex] || images[0] || '';
  const shortAddress = parseAddress(place.address);
  const description = place.aiDescription || place.description || '';

  return (
    <div className={styles.pageContainer}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <img
          src={buildImageUrl(mainImage)}
          alt={place.name}
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />

        {/* Back Button */}
        <div className={styles.backButtonContainer}>
          <button className={styles.backButton} onClick={handleBack} aria-label="뒤로 가기">
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
              <path d="M11.875 15.4375L5.9375 9.5L11.875 3.5625" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Image Indicators */}
        {images.length > 1 && (
          <div className={styles.imageIndicators}>
            {images.map((_, index) => (
              <div
                key={index}
                className={`${styles.indicator} ${index === currentImageIndex ? styles.active : ''}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={styles.contentSection}>
        {/* Header with Title and Rating */}
        <PlaceHeader
          name={place.name}
          rating={place.rating}
          reviewCount={place.reviewCount}
        />

        {/* Tags */}
        {place.tags && place.tags.length > 0 && (
          <div className={styles.tags}>
            {place.tags.map(tag => `#${tag}`).join(', ')}
          </div>
        )}

        {/* Location */}
        <LocationInfo
          address={shortAddress}
          carTime={place.carTime}
          busTime={place.busTime}
        />

        {/* Image Gallery */}
        <ImageGallery
          images={images}
          currentIndex={currentImageIndex}
          onImageClick={handleGalleryImageClick}
          placeName={place.name}
        />

        {/* AI Description Section */}
        {description && (
          <div className={styles.descriptionSection}>
            <h2 className={styles.descriptionTitle}>Mohe AI 노트</h2>
            <p className={styles.description}>
              {parseMarkdown(description)}
            </p>
            <p className={styles.aiNote}>리뷰와 데이터를 읽고 AI가 정리했어요</p>
          </div>
        )}

        {/* Reviews Section */}
        {place.reviews && place.reviews.length > 0 && (
          <div className={styles.reviewsSection}>
            {place.reviews.slice(0, 3).map((review, index) => (
              <ReviewCard key={index} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
