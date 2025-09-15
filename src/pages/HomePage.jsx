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
import { weatherService, contextualRecommendationService, recommendationService, bookmarkService, addressService, guestRecommendationService, placeService, homeService } from '@/services/apiService';
import { authService } from '@/services/authService';
import { withAuthCheck } from '@/hooks/useAuthGuard';
import bannerLeft from '@/assets/image/banner_left.png';

export default function HomePage() {
  const navigate = useNavigate();
  console.log('HomePage component loaded');

  // Location and weather state
  const { requestLocation, loading: locationLoading } = useGeolocation();
  const { saveLocation, getStoredLocation } = useLocationStorage();
  const [weather, setWeather] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationPermissionRequested, setLocationPermissionRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [homeImages, setHomeImages] = useState([]);

  // Initialize app only once on mount
  useEffect(() => {
    let isMounted = true; // Cleanup flag
    
    const initializeApp = async () => {
      if (!isMounted) return;
      
      try {
        // Reset state on each initialization
        setError(null);
        setRecommendations([]);
        setPopularPlaces([]);
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
          console.log('📍 Setting location from storage:', storedLocation);
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
            console.log('📍 Setting location from geolocation:', locationData);
            setCurrentLocation(locationData);
            console.log('🏠 Geolocation set, should trigger popular places loading');
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
            console.log('📍 Setting default location (Seoul):', defaultLocation);
            setCurrentLocation(defaultLocation);
            console.log('🏠 Default location set, should trigger popular places loading');
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

      try {
        let recommendationsData = [];

        if (user.isGuest && isMounted) {
          try {
            const guestResponse = await guestRecommendationService.getGuestRecommendations(
              currentLocation.latitude,
              currentLocation.longitude,
              { limit: 10, maxDistance: 55000 } // 15km in meters
            );
            
            console.log('HomePage: Guest response received:', guestResponse);
            console.log('HomePage: Guest response success:', guestResponse.success);
            console.log('HomePage: Guest response data length:', guestResponse.data?.length);
            
            if (guestResponse.success && guestResponse.data.length > 0) {
              console.log('HomePage: Processing guest recommendations, count:', guestResponse.data.length);
              
              recommendationsData = guestResponse.data.map(place => ({
                id: place.id,
                title: place.name,
                rating: place.rating,
                location: place.location,
                image: place.image,
                isBookmarked: place.isBookmarked,
                distance: 0,
                weatherSuitability: place.weatherSuitability,
                reasonWhy: place.description
              }));
              
              console.log('HomePage: Mapped recommendations data:', recommendationsData);
            } else {
              console.log('HomePage: Guest recommendations failed or empty');
            }
          } catch (error) {
            console.warn('Guest recommendations failed:', error);
          }
        } else {
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

          // Load general recommendations for all users (guest and authenticated)
          if (recommendationsData.length === 0 && isMounted) {
            try {
              const generalData = await loadGeneralRecommendations();
              if (generalData.length > 0 && isMounted) {
                recommendationsData = generalData;
              }
            } catch (error) {
              console.warn('General recommendations failed:', error);
            }
          }
        }

        if (!isMounted) return;

        if (!user.isGuest && recommendationsData.length > 0) {
          await loadBookmarkStatus(recommendationsData);
        }
        
        if (isMounted) {
          console.log('HomePage: About to set recommendations with data:', recommendationsData);
          console.log('HomePage: Recommendations data length:', recommendationsData.length);
          setRecommendations(recommendationsData);
          setIsLoading(false);
          console.log('HomePage: Successfully set recommendations and loading to false');
        }

      } catch (error) {
        if (isMounted) {
          console.error('Failed to load recommendations:', error);
          setRecommendations([]);
          
          if (!user.isGuest) {
            if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
              setError('인증이 필요합니다. 다시 로그인해주세요.');
            } else {
              setError('추천 장소를 불러오는데 실패했습니다.');
            }
          }
          
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
        { limit: 10, maxDistance: 55000 } // 15km in meters
      );

      if (response.success && response.data.places.length > 0) {
        return response.data.places.map(place => ({
          id: place.id,
          title: place.name,
          rating: place.rating,
          location: place.category || '알 수 없음',
          image: place.imageUrl || place.images?.[0],
          isBookmarked: false,
          distance: 0, // Distance disabled as per requirements
          weatherSuitability: place.weatherSuitability,
          reasonWhy: place.reasonWhy
        }));
      }
      return [];
    };

    const loadGeneralRecommendations = async () => {
      // Use general recommendations API that works for both guest and authenticated users
      const response = await placeService.getRecommendations();

      if (response.success && response.data.recommendations && response.data.recommendations.length > 0) {
        return response.data.recommendations.map(place => ({
          id: place.id,
          title: place.name,
          rating: place.rating,
          location: place.category || '알 수 없음',
          image: place.imageUrl || place.image,
          isBookmarked: false,
          distance: null,
          score: place.score || null,
          reasonWhy: place.reasonWhy || null
        }));
      }
      return [];
    };

    const loadBookmarkStatus = async (places) => {
      // Skip bookmark status loading for guest users and when no authentication
      if (user.isGuest || !places.length || !authService.isAuthenticated()) {
        console.log('Skipping bookmark status checks for guest user or unauthenticated state');
        places.forEach(place => place.isBookmarked = false);
        return;
      }

      try {
        console.log('Loading bookmark status for', places.length, 'places');
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
  }, [currentLocation, user]);

  useEffect(() => {
    let isMounted = true;

    const loadBookmarkBasedPlaces = async () => {
      if (!currentLocation || !isMounted) return;

      try {
        console.log('Loading bookmark-based places for location:', currentLocation);
        const response = await placeService.getBookmarkBasedRecommendations(
          currentLocation.latitude,
          currentLocation.longitude,
          { limit: 15, distance: 50.0 } // 15 items, 20km radius
        );

        if (response.success && isMounted) {
          console.log('✅ Bookmark-based places loaded:', response.data.length);
          // Transform the data to match the expected format
          const transformedPlaces = response.data.map(place => ({
            id: place.id,
            name: place.name || place.title,
            title: place.title || place.name,
            rating: place.rating,
            location: place.location || place.address,
            image: place.imageUrl || place.image,
            images: place.images || [],
            isBookmarked: place.isBookmarked || false
          }));
          setPopularPlaces(transformedPlaces);
        } else if (isMounted) {
          console.warn('⚠️ Bookmark-based places API returned no success:', response);
          setPopularPlaces([]);
        }
      } catch (error) {
        console.warn('⚠️ Bookmark-based places failed, continuing without them:', error);
        if (isMounted) {
          setPopularPlaces([]);
        }
      }
    };

    if (currentLocation) {
      loadBookmarkBasedPlaces();
    }

    return () => {
      isMounted = false;
    };
  }, [currentLocation]);

  // Load recommendations based on login status
  useEffect(() => {
    let isMounted = true;

    const loadRecommendations = async () => {
      try {
        console.log('Loading recommendations based on user status...');
        
        // Check if user is logged in
        const isLoggedIn = user && user.id && user.id !== 'guest';
        
        if (isLoggedIn) {
          console.log('👤 User is logged in, loading MBTI-based recommendations');
          // MBTI-based recommendations for logged-in users
          await loadMBTIRecommendations(isMounted);
        } else {
          console.log('🌍 Guest user, loading weather/time-based recommendations');
          // Weather/time-based recommendations for guests
          await loadWeatherTimeRecommendations(isMounted);
        }
        
      } catch (error) {
        console.warn('⚠️ Failed to load recommendations:', error);
        if (isMounted) {
          // No fallback - keep empty array to show only real database data
          setHomeImages([]);
        }
      }
    };

    loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, [user]); // Reload when user changes

  const loadMBTIRecommendations = async (isMounted) => {
    try {
      // Try backend MBTI recommendations first
      const response = await homeService.getHomeImages();
      
      if (response.success && response.data.length > 0 && isMounted) {
        console.log('✅ MBTI recommendations loaded from database:', response.data.length);
        setHomeImages(response.data);
      } else if (isMounted) {
        // No fallback - keep empty array to show only real database data
        console.log('🎯 No backend data available, showing empty state');
        setHomeImages([]);
      }
    } catch {
      if (isMounted) {
        console.log('🎯 Backend unavailable, showing empty state');
        setHomeImages([]);
      }
    }
  };

  const loadWeatherTimeRecommendations = async (isMounted) => {
    try {
      // Weather/time recommendations should come from backend API
      console.log('🌤️ Weather recommendations unavailable, showing empty state');
      if (isMounted) {
        setHomeImages([]);
      }
    } catch {
      if (isMounted) {
        console.log('🌤️ Weather recommendations unavailable, showing empty state');
        setHomeImages([]);
      }
    }
  };



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
  
  const handleBannerClick = () => {
    console.log('Banner clicked');
    // Check if user is logged in and has completed survey
    if (user && !user.isGuest) {
      // Check if user has completed preference survey
      const hasCompletedSurvey = user.mbti && user.ageRange && user.spacePreferences;
      if (hasCompletedSurvey) {
        navigate('/search-results');
      } else {
        navigate('/age-range');
      }
    } else {
      // Guest user - start survey
      navigate('/age-range');
    }
  };

  const handlePlaceClick = (placeId) => {
    console.log('Place clicked:', placeId);
    
    // Find place in database arrays only - no fallback data
    let selectedPlace = recommendations.find(place => place.id === placeId) ||
                       homeImages.find(place => place.id === placeId) ||
                       popularPlaces.find(place => place.id === placeId);
    
    // If not found in any array, navigate without preloaded data
    if (!selectedPlace) {
      navigate(`/place/${placeId}`);
      return;
    }
    
    console.log('Selected place data:', selectedPlace);
    navigate(`/place/${placeId}`, { 
      state: { 
        preloadedImage: selectedPlace.imageUrl || selectedPlace.image, 
        preloadedData: selectedPlace 
      } 
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
          {/* Recommendations section - different for logged in vs guest users */}
          <section className={styles.section}>
            <h2 className={`${styles.sectionTitle} container-padding`}>
              지금 가기 좋은 플레이스
            </h2>
            {(() => {
              // Only show recommendations from backend - no fallback data
              const displayData = recommendations;
              
              if (displayData.length === 0) {
                return (
                  <div className="container-padding">
                    <p style={{ textAlign: 'center', color: '#666', padding: '20px 0' }}>
                      현재 추천 장소를 불러오고 있습니다.
                    </p>
                  </div>
                );
              }
              
              return (
                <div className={styles.horizontalScroll}>
                  <div className={styles.cardsContainer}>
                    {displayData.map((place) => (
                      <div key={place.id} className={styles.cardWrapper}>
                        <div onClick={() => handlePlaceClick(place.id)} style={{ cursor: 'pointer' }}>
                          <PlaceCard
                            title={place.title || place.name}
                            rating={place.rating}
                            location={place.location}
                            image={place.image || place.imageUrl}
                            images={place.images || []} // Pass the 5 images array
                            isBookmarked={place.isBookmarked || false}
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
              );
            })()}
          </section>

          {/* Mood-based section */}
          <section className={`${styles.moodSection} container-padding`}>
            <div className={styles.moodCard} onClick={handleBannerClick} style={{ cursor: 'pointer' }}>
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

          
          {/* Recommendations section - Based on login status */}
          {homeImages.length > 0 && (
            <section className={styles.section}>
              <h2 className={`${styles.sectionTitle} container-padding`}>
                {user && user.id && user.id !== 'guest' ? '당신을 위한 추천' : '지금 이 시간 추천'}
              </h2>
              <div className={styles.horizontalScroll}>
                <div className={styles.cardsContainer}>
                  {homeImages.map((place) => (
                    <div key={place.id} className={styles.cardWrapper}>
                      <div onClick={() => handlePlaceClick(place.id)} style={{ cursor: 'pointer' }}>
                        <PlaceCard
                          title={place.title || place.name}
                          rating={place.rating}
                          location={place.location || place.category}
                          image={place.imageUrl || place.image}
                          images={place.images || []} // Pass the 5 images array
                          isBookmarked={false}
                          distance={place.distance || 0}
                          onBookmarkToggle={(isBookmarked) => handleBookmarkToggle(place.id, isBookmarked)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Popular places section - Load from backend */}
          <section className={styles.section}>
            <h2 className={`${styles.sectionTitle} container-padding`}>오늘은 이런 곳 어떠세요?</h2>
            {(() => {
              // Only show popular places from backend - no fallback data
              const displayData = popularPlaces;
              
              if (displayData.length === 0) {
                return (
                  <div className="container-padding">
                    <p style={{ textAlign: 'center', color: '#666', padding: '20px 0' }}>
                      현재 인기 장소를 불러오고 있습니다.
                    </p>
                  </div>
                );
              }
              
              return (
                <div className={styles.horizontalScroll}>
                  <div className={styles.cardsContainer}>
                    {displayData.map((place) => (
                      <div key={place.id} className={styles.cardWrapper}>
                        <div onClick={() => handlePlaceClick(place.id)} style={{ cursor: 'pointer' }}>
                          <PlaceCard
                            title={place.title || place.name}
                            rating={place.rating}
                            location={place.location}
                            image={place.image || place.imageUrl}
                            images={place.images || []} // Pass the 5 images array
                            isBookmarked={place.isBookmarked || false}
                            onBookmarkToggle={(isBookmarked) => handleBookmarkToggle(place.id, isBookmarked)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
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
