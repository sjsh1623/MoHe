import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/home-page.module.css';

import { Container } from '@/components/ui/layout';
import PlaceCard from '@/components/ui/cards/PlaceCard';
import LocationPin from '@/components/ui/indicators/LocationPin';
import ProfileButton from '@/components/ui/buttons/ProfileButton';
import OutlineButton from '@/components/ui/buttons/OutlineButton';
import HomePageSkeleton from '@/components/ui/skeletons/HomePageSkeleton';
import ErrorMessage from '@/components/ui/alerts/ErrorMessage';
import { useGeolocation, useLocationStorage } from '@/hooks/useGeolocation';
import { weatherService, contextualRecommendationService, recommendationService, bookmarkService, addressService, guestRecommendationService, placeService } from '@/services/apiService';
import { authService } from '@/services/authService';
import { withAuthCheck } from '@/hooks/useAuthGuard';
import bannerLeft from '@/assets/image/banner_left.png';

export default function HomePage() {
  const navigate = useNavigate();
  console.log('HomePage component loaded');

  // Location and weather state
  const { location, requestLocation, loading: locationLoading, error: locationError } = useGeolocation();
  const { saveLocation, getStoredLocation } = useLocationStorage();
  const [weather, setWeather] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationPermissionRequested, setLocationPermissionRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [popularPlaces, setPopularPlaces] = useState([]);

  // Initialize app only once on mount
  useEffect(() => {
    let isMounted = true; // Cleanup flag
    
    const initializeApp = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        
        // Initialize user (authenticated or guest)
        let currentUser = authService.getCurrentUser();
        if (!currentUser) {
          if (authService.isAuthenticated()) {
            try {
              currentUser = await authService.getUserProfile();
            } catch (error) {
              console.warn('Failed to get user profile:', error);
              currentUser = authService.createGuestSession();
            }
          } else {
            currentUser = authService.createGuestSession();
          }
        }
        
        if (!isMounted) return;
        setUser(currentUser);

        // Initialize location
        await initializeLocationData();
        
      } catch (error) {
        if (isMounted) {
          console.error('Failed to initialize app:', error);
          setError('앱 초기화 중 오류가 발생했습니다.');
          setIsLoading(false);
        }
      }
    };

    const initializeLocationData = async () => {
      if (!isMounted) return;
      
      // Check for stored location first
      const storedLocation = getStoredLocation();
      if (storedLocation) {
        if (isMounted) {
          setCurrentLocation(storedLocation);
          // If stored location doesn't have address, resolve it
          if (!storedLocation.address && storedLocation.latitude && storedLocation.longitude) {
            await resolveAddress(storedLocation.latitude, storedLocation.longitude);
          }
          await loadWeatherData(storedLocation.latitude, storedLocation.longitude);
        }
        return;
      }

      // Request location only once
      if (!locationPermissionRequested) {
        setLocationPermissionRequested(true);
        try {
          const locationData = await requestLocation();
          if (locationData && isMounted) {
            setCurrentLocation(locationData);
            // Resolve address for the location
            await resolveAddress(locationData.latitude, locationData.longitude);
            saveLocation(locationData);
            await loadWeatherData(locationData.latitude, locationData.longitude);
          }
        } catch (error) {
          console.warn('Failed to get location:', error);
          // Use default location (Seoul City Hall) if geolocation fails
          const defaultLocation = {
            latitude: 37.5665,
            longitude: 126.9780,
            address: null // Will be resolved by address API
          };
          if (isMounted) {
            setCurrentLocation(defaultLocation);
            // Resolve address for default location
            await resolveAddress(defaultLocation.latitude, defaultLocation.longitude);
            await loadWeatherData(defaultLocation.latitude, defaultLocation.longitude);
          }
        }
      }
    };

    initializeApp();
    
    return () => {
      isMounted = false; // Cleanup
    };
  }, []); // Empty dependency array - run only once on mount

  // Resolve address from coordinates
  const resolveAddress = async (latitude, longitude) => {
    try {
      const addressResponse = await addressService.reverseGeocode(latitude, longitude);
      if (addressResponse.success) {
        setCurrentLocation(prev => ({
          ...prev,
          latitude,
          longitude,
          address: addressResponse.data.shortAddress || addressResponse.data.fullAddress
        }));
        return addressResponse.data;
      }
    } catch (error) {
      console.warn('Failed to resolve address:', error);
      // Keep coordinates as fallback
      setCurrentLocation(prev => ({
        ...prev,
        latitude,
        longitude,
        address: `위도 ${latitude.toFixed(4)}, 경도 ${longitude.toFixed(4)}`
      }));
    }
  };

  // Load weather data for location
  const loadWeatherData = async (latitude, longitude) => {
    try {
      const weatherResponse = await weatherService.getWeatherContext(latitude, longitude);
      if (weatherResponse.success) {
        setWeather(weatherResponse.data);
      }
    } catch (error) {
      console.warn('Failed to load weather data:', error);
    }
  };

  // Load recommendations when dependencies change
  useEffect(() => {
    let isMounted = true;
    
    const loadRecommendations = async () => {
      if (!currentLocation || !user || !isMounted) return;

      console.log('Loading recommendations...', { hasWeather: !!weather, userType: user.isGuest ? 'guest' : 'authenticated' });

      try {
        let recommendationsData = [];

        // For guest users, use guest recommendation service
        if (user.isGuest && isMounted) {
          try {
            const guestResponse = await guestRecommendationService.getGuestRecommendations(
              currentLocation.latitude,
              currentLocation.longitude,
              { limit: 10 }
            );
            
            if (guestResponse.success && guestResponse.data.length > 0) {
              recommendationsData = guestResponse.data.map(place => ({
                id: place.id,
                title: place.name,
                rating: place.rating,
                location: place.location,
                image: place.image,
                isBookmarked: place.isBookmarked,
                distance: null,
                weatherSuitability: place.weatherSuitability,
                reasonWhy: place.description
              }));
            }
          } catch (error) {
            console.warn('Guest recommendations failed:', error);
          }
        } else {
          // For authenticated users, try contextual recommendations first if weather is available
          if (weather && isMounted) {
            try {
              const contextualData = await loadContextualRecommendations();
              if (contextualData.length > 0 && isMounted) {
                recommendationsData = contextualData;
              }
            } catch (error) {
              console.warn('Contextual recommendations failed:', error);
            }
          }

          // Fallback to personalized recommendations for authenticated users
          if (recommendationsData.length === 0 && !user.isGuest && isMounted) {
            try {
              const personalizedData = await loadPersonalizedRecommendations();
              if (personalizedData.length > 0 && isMounted) {
                recommendationsData = personalizedData;
              }
            } catch (error) {
              console.warn('Personalized recommendations failed:', error);
            }
          }
        }

        if (!isMounted) return;

        // Load bookmark status for all places (only for authenticated users)
        if (!user.isGuest && recommendationsData.length > 0) {
          await loadBookmarkStatus(recommendationsData);
        }
        
        if (isMounted) {
          setRecommendations(recommendationsData);
          setIsLoading(false);
        }

      } catch (error) {
        if (isMounted) {
          console.error('Failed to load recommendations:', error);
          setRecommendations([]);
          
          // Only show error for authenticated users or non-auth related errors
          if (!user.isGuest) {
            if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
              setError('인증이 필요합니다. 다시 로그인해주세요.');
            } else {
              setError('추천 장소를 불러오는데 실패했습니다.');
            }
          }
          // For guest users, silently fail and show empty state instead of error
          
          setIsLoading(false);
        }
      }
    };

    const loadContextualRecommendations = async () => {
      if (!weather || !currentLocation) return [];
      
      const timeOfDay = new Date().getHours();
      let contextQuery = '내 주변 좋은 곳';

      // Enhance query based on weather and time
      if (weather.isRainy) {
        contextQuery = '비 오는 날 실내에서 즐길 수 있는 곳';
      } else if (weather.isHot) {
        contextQuery = '더운 날씨에 시원한 곳';
      } else if (weather.isCold) {
        contextQuery = '추운 날씨에 따뜻한 곳';
      } else if (timeOfDay >= 6 && timeOfDay < 12) {
        contextQuery = '아침에 좋은 카페나 브런치 맛집';
      } else if (timeOfDay >= 12 && timeOfDay < 17) {
        contextQuery = '점심 시간에 좋은 맛집이나 휴식공간';
      } else if (timeOfDay >= 17 && timeOfDay < 21) {
        contextQuery = '저녁에 즐길 수 있는 분위기 좋은 곳';
      } else {
        contextQuery = '밤에 갈 만한 늦은 시간까지 하는 곳';
      }

      const response = await contextualRecommendationService.getContextualRecommendations(
        contextQuery,
        currentLocation.latitude,
        currentLocation.longitude,
        { limit: 10 }
      );

      if (response.success && response.data.places.length > 0) {
        return response.data.places.map(place => ({
          id: place.id,
          title: place.name,
          rating: place.rating,
          location: place.category || '알 수 없음',
          image: place.imageUrl || place.images?.[0],
          isBookmarked: false,
          distance: place.distanceM,
          weatherSuitability: place.weatherSuitability,
          reasonWhy: place.reasonWhy
        }));
      }
      return [];
    };

    const loadPersonalizedRecommendations = async () => {
      if (!user || user.isGuest) return [];
      
      const response = await recommendationService.getPersonalizedRecommendations(
        { limit: 10, includeBookmarked: false }
      );

      if (response.success && response.data.recommendations.length > 0) {
        return response.data.recommendations.map(place => ({
          id: place.id,
          title: place.name,
          rating: place.rating,
          location: place.category || '알 수 없음',
          image: place.imageUrl,
          isBookmarked: false,
          distance: null,
          score: place.similarityScore,
          reasonWhy: place.explanation
        }));
      }
      return [];
    };

    const loadBookmarkStatus = async (places) => {
      if (user.isGuest || !places.length) return;

      try {
        const bookmarkPromises = places.map(async (place) => {
          try {
            const response = await bookmarkService.isBookmarked(place.id);
            place.isBookmarked = response.success ? response.data.isBookmarked : false;
          } catch (error) {
            console.warn(`Failed to check bookmark status for place ${place.id}:`, error);
            place.isBookmarked = false;
          }
        });
        
        await Promise.all(bookmarkPromises);
      } catch (error) {
        console.warn('Failed to load bookmark status:', error);
      }
    };

    if (currentLocation && user) {
      loadRecommendations();
    }

    return () => {
      isMounted = false;
    };
  }, [currentLocation, user, weather]);

  useEffect(() => {
    let isMounted = true;

    const loadPopularPlaces = async () => {
      if (!currentLocation || !isMounted) return;

      try {
        const response = await placeService.getPopularPlaces(
          currentLocation.latitude,
          currentLocation.longitude
        );

        if (response.success && isMounted) {
          setPopularPlaces(response.data.places);
        }
      } catch (error) {
        console.error('Failed to load popular places:', error);
      }
    };

    if (currentLocation) {
      loadPopularPlaces();
    }

    return () => {
      isMounted = false;
    };
  }, [currentLocation]);

  const handleProfileClick = () => {
    console.log('Profile clicked');
    navigate('/profile-settings');
  };

  const handleBookmarkToggle = withAuthCheck(
    async (placeId, isBookmarked) => {
      try {
        console.log(`Place ${placeId} bookmark toggled:`, isBookmarked);
        
        const response = await bookmarkService.toggleBookmark(placeId);
        
        if (response.success) {
          // Update local state
          setRecommendations(prevRecommendations =>
            prevRecommendations.map(place =>
              place.id === placeId 
                ? { ...place, isBookmarked: response.data.isBookmarked }
                : place
            )
          );
        } else {
          console.error('Failed to toggle bookmark:', response.message);
        }
      } catch (error) {
        console.error('Error toggling bookmark:', error);
      }
    },
    {
      onRequireAuth: () => navigate('/login', { 
        state: { from: '/home', message: '북마크 기능을 사용하려면 로그인이 필요합니다.' }
      })
    }
  );

  const handleSeeMore = () => {
    console.log('See more places clicked');
    navigate('/places');
  };

  const handlePlaceClick = (placeId) => {
    console.log('Place clicked:', placeId);
    // Pass preloaded data to place detail page
    const selectedPlace = recommendations.find(place => place.id === placeId);
    navigate(`/place/${placeId}`, { 
      state: { preloadedImage: selectedPlace?.image, preloadedData: selectedPlace } 
    });
  };

  // Get display location
  const getDisplayLocation = () => {
    if (currentLocation?.address) {
      return currentLocation.address;
    }
    if (currentLocation) {
      return `위도 ${currentLocation.latitude.toFixed(4)}, 경도 ${currentLocation.longitude.toFixed(4)}`;
    }
    return '위치 확인 중...'; // Loading state
  };

  // Retry function for error handling
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    window.location.reload(); // Simple retry by reloading
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header - Always shown immediately */}
      <header className={styles.header}>
        <h1 className={styles.logo}>MOHE</h1>
        <ProfileButton onClick={handleProfileClick} />
      </header>

      {/* Location indicator */}
      <div className={`${styles.locationSection} container-padding`}>
        <LocationPin 
          location={getDisplayLocation()} 
          size="medium"
          loading={locationLoading && !currentLocation}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="container-padding">
          <ErrorMessage 
            message={error}
            onRetry={handleRetry}
            onDismiss={() => setError(null)}
            variant="banner"
          />
        </div>
      )}

      {/* Main content - Show skeleton while loading */}
      {isLoading ? (
        <HomePageSkeleton />
      ) : (
        <div className={styles.contentContainer}>
          <div className={styles.contentWrapper}>
          {/* Personalized recommendations section */}
          <section className={styles.section}>
            <h2 className={`${styles.sectionTitle} container-padding`}>내 취향에 맞는 추천 플레이스</h2>
            {recommendations.length > 0 ? (
              <div className={styles.horizontalScroll}>
                <div className={styles.cardsContainer}>
                  {recommendations.map((place) => (
                    <div key={place.id} className={styles.cardWrapper}>
                      <div onClick={() => handlePlaceClick(place.id)} style={{ cursor: 'pointer' }}>
                        <PlaceCard
                          title={place.title}
                          rating={place.rating}
                          location={place.location}
                          image={place.image}
                          isBookmarked={place.isBookmarked}
                          avatars={place.avatars}
                          additionalCount={place.additionalCount}
                          onBookmarkToggle={(isBookmarked) => handleBookmarkToggle(place.id, isBookmarked)}
                          variant={place.id === 2 ? 'compact' : 'default'}
                          weatherSuitability={place.weatherSuitability}
                          reasonWhy={place.reasonWhy}
                          distance={place.distance}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="container-padding">
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px',
                  color: '#666',
                  border: '1px dashed #ddd',
                  borderRadius: '8px',
                  margin: '20px 0'
                }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                    {user.isGuest ? '장소 데이터를 불러오는 중입니다' : '추천 장소가 없습니다'}
                  </p>
                  <p style={{ margin: '0', fontSize: '14px' }}>
                    {user.isGuest ? '잠시만 기다려주세요' : '백엔드 서버가 실행 중인지 확인해주세요'}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Mood-based section */}
          <section className={`${styles.moodSection} container-padding`}>
            <div className={styles.moodCard} onClick={() => navigate('/age-range')} style={{ cursor: 'pointer' }}>
              <div className={styles.moodContent}>
                <h3 className={styles.moodTitle}>지금 뭐하지?</h3>
                <p className={styles.moodDescription}>
                  시간, 기분, 취향을 반영해서<br />
                  당신에게 어울리는 곳을 골라봤어요.
                </p>
              </div>
              <div className={styles.moodImage}>
                <img src={bannerLeft} alt="Mood illustration" />
              </div>
            </div>
          </section>

          {/* Popular places section - Load from backend */}
          <section className={styles.section}>
            <h2 className={`${styles.sectionTitle} container-padding`}>인기 장소</h2>
            {popularPlaces.length > 0 ? (
              <div className={styles.horizontalScroll}>
                <div className={styles.cardsContainer}>
                  {popularPlaces.map((place) => (
                    <div key={place.id} className={styles.cardWrapper}>
                      <div onClick={() => handlePlaceClick(place.id)} style={{ cursor: 'pointer' }}>
                        <PlaceCard
                          title={place.title}
                          rating={place.rating}
                          location={place.location}
                          image={place.image}
                          isBookmarked={place.isBookmarked}
                          onBookmarkToggle={(isBookmarked) => handleBookmarkToggle(place.id, isBookmarked)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="container-padding">
                <p>인기 장소가 없습니다.</p>
              </div>
            )}
            <div className={`${styles.seeMoreContainer} container-padding`}>
              <OutlineButton onClick={handleSeeMore}>
                더 많은 장소 보기
              </OutlineButton>
            </div>
          </section>

          </div>
        </div>
      )}

      {/* Footer moved outside contentWrapper */}
      <footer className={styles.footer}>
        <div className={`${styles.footerContent} container-padding`}>
          <p className={styles.footerText}>
            © 2025 MOHAE<br />
            서비스 이용약관 | 개인정보처리방침 | 문의하기<br />
            hello@mohae.app
          </p>
        </div>
      </footer>

    </div>
  );
}
