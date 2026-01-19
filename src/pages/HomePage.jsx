import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/home-page.module.css';

import PlaceCard from '@/components/ui/cards/PlaceCard';
import LocationPin from '@/components/ui/indicators/LocationPin';
import ProfileButton from '@/components/ui/buttons/ProfileButton';
import OutlineButton from '@/components/ui/buttons/OutlineButton';
import SearchBar from '@/components/ui/inputs/SearchBar';
import SearchModal from '@/components/ui/modals/SearchModal';
import HomePageSkeleton from '@/components/ui/skeletons/HomePageSkeleton';
import ErrorMessage from '@/components/ui/alerts/ErrorMessage';
import { useGeolocation, useLocationStorage } from '@/hooks/useGeolocation';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { weatherService, contextualRecommendationService, bookmarkService, addressService, guestRecommendationService, placeService, homeService, categoryService } from '@/services/apiService';
import { authService } from '@/services/authService';
import bannerLeft from '@/assets/image/banner_left.png';
import logoHeader from '@/assets/image/logo-header.svg';
import { buildImageUrl, normalizePlaceImages } from '@/utils/image';
import { HomeSection, HomeHorizontalScroller, HomeBanner } from '@/components/ui/home';

/**
 * Format address to show district + detailed address
 * If outside current region, show only district
 * @param {string} fullAddress - Full address string
 * @returns {string} Formatted address
 */
const formatPlaceAddress = (fullAddress) => {
  if (!fullAddress || typeof fullAddress !== 'string') {
    return '위치 정보 없음';
  }

  // Extract district (구/군) and detailed address
  // Korean address format: 시도 시군구 구 도로명 번지
  const addressParts = fullAddress.split(' ');

  // Find the index of district (구 or 군)
  const districtIndex = addressParts.findIndex(part =>
    part.endsWith('구') || part.endsWith('군')
  );

  if (districtIndex === -1) {
    // No district found, return city or full address
    return addressParts.slice(0, 2).join(' ') || fullAddress;
  }

  // Get district + detailed address (road name and number)
  const district = addressParts[districtIndex];
  const detailedParts = addressParts.slice(districtIndex + 1);

  // If there's detailed address, show "구 + 도로명 번지"
  if (detailedParts.length > 0) {
    // Limit to district + road name (max 2 parts after district)
    return `${district} ${detailedParts.slice(0, 2).join(' ')}`;
  }

  // Only district available
  return district;
};

export default function HomePage() {
  const navigate = useNavigate();
  console.log('HomePage component loaded');

  // Location and weather state
  const { requestLocation, loading: locationLoading } = useGeolocation();
  const { saveLocation, getStoredLocation } = useLocationStorage();
  const [weather, setWeather] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(() => getStoredLocation());
  const [locationPermissionRequested, setLocationPermissionRequested] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Only for first load
  const [error, setError] = useState(null);
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [homeImages, setHomeImages] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [addressLoading, setAddressLoading] = useState(!getStoredLocation()?.address);
  const [categories, setCategories] = useState([]);
  const [categoriesPlaces, setCategoriesPlaces] = useState({});
  const [dynamicMessage, setDynamicMessage] = useState('지금 가기 좋은 플레이스');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { recentlyViewed, addRecentlyViewed } = useRecentlyViewed();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Prevent back navigation to login page
  useEffect(() => {
    const preventBackToLogin = (e) => {
      // Push current state to prevent going back
      window.history.pushState(null, '', window.location.pathname);
    };

    // Add state to history to block back navigation
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', preventBackToLogin);

    return () => {
      window.removeEventListener('popstate', preventBackToLogin);
    };
  }, []);

  // Initialize app only once on mount
  useEffect(() => {
    let isMounted = true; // Cleanup flag

    const initializeApp = async () => {
      if (!isMounted) return;

      try {
        // Don't reset state if we already have data (coming back from detail page)
        setError(null);

        // Initialize user (authenticated or guest)
        let currentUser = authService.getCurrentUser();
        if (!currentUser) {
          if (authService.isAuthenticated()) {
            try {
              currentUser = await authService.getUserProfile();
            } catch (error) {
              console.warn('Failed to get user profile:', error);
              currentUser = await authService.createGuestSession();
            }
          } else {
            currentUser = await authService.createGuestSession();
          }
        }

        if (!isMounted) return;
        setUser(currentUser);

        // Initialize location only if not already set
        if (!currentLocation) {
          await initializeLocationData();
        } else {
          // Location already exists, just load weather if needed
          if (!weather) {
            loadWeatherData(currentLocation.latitude, currentLocation.longitude);
          }
        }

      } catch (error) {
        if (isMounted) {
          console.error('Failed to initialize app:', error);
          setError('앱 초기화 중 오류가 발생했습니다.');
          setIsInitialLoading(false);
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

          if (storedLocation.address) {
            setAddressLoading(false);
          } else if (storedLocation.latitude && storedLocation.longitude) {
            await resolveAddress(storedLocation.latitude, storedLocation.longitude);
          }

          await loadWeatherData(storedLocation.latitude, storedLocation.longitude);
        }
        return;
      }

      // Request location only once
      if (!locationPermissionRequested) {
        setLocationPermissionRequested(true);
        setAddressLoading(true);
        try {
          const locationData = await requestLocation();

          // Validate location data before using
          if (locationData &&
              typeof locationData.latitude === 'number' &&
              typeof locationData.longitude === 'number' &&
              isMounted) {
            setCurrentLocation(locationData);
            // Resolve address for the location
            await resolveAddress(locationData.latitude, locationData.longitude);
            await loadWeatherData(locationData.latitude, locationData.longitude);
          } else if (isMounted) {
            throw new Error('Invalid location data received');
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
    // Validate latitude and longitude are valid numbers
    if (typeof latitude !== 'number' || typeof longitude !== 'number' ||
        isNaN(latitude) || isNaN(longitude) ||
        latitude < -90 || latitude > 90 ||
        longitude < -180 || longitude > 180) {
      setAddressLoading(false);
      return null;
    }

    setAddressLoading(true);
    try {
      const addressResponse = await addressService.reverseGeocode(Number(latitude), Number(longitude));
      if (addressResponse.success) {
        const formattedAddress = formatDisplayAddress(addressResponse.data);
        setCurrentLocation(prev => {
          const nextLocation = {
            ...(prev || {}),
            latitude,
            longitude,
            address: formattedAddress
          };
          saveLocation(nextLocation);
          return nextLocation;
        });
        return addressResponse.data;
      }
      throw new Error('주소를 불러오지 못했습니다.');
    } catch (error) {
      console.warn('Failed to resolve address:', error);
      setCurrentLocation(prev => {
        const nextLocation = {
          ...(prev || {}),
          latitude,
          longitude,
          address: null
        };
        saveLocation(nextLocation);
        return nextLocation;
      });
      return null;
    } finally {
      setAddressLoading(false);
    }
  };

  // Load weather data for location
  const loadWeatherData = async (latitude, longitude) => {
    // Validate latitude and longitude before API call
    if (typeof latitude !== 'number' || typeof longitude !== 'number' ||
        isNaN(latitude) || isNaN(longitude)) {
      return;
    }

    try {
      const weatherResponse = await weatherService.getWeatherContext(Number(latitude), Number(longitude));
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

            // Update dynamic message from guest response
            if (guestResponse.dynamicMessage && isMounted) {
              setDynamicMessage(guestResponse.dynamicMessage);
              console.log('🎨 Guest dynamic message set:', guestResponse.dynamicMessage);
            }

            if (guestResponse.success && guestResponse.data.length > 0) {
              console.log('HomePage: Processing guest recommendations, count:', guestResponse.data.length);

              recommendationsData = guestResponse.data.map(place => {
                // Use shortAddress field from backend
                // Backend sends: shortAddress = formatted address, address = full address
                const addressStr = place.shortAddress || place.address || '';

                // Format the address to show district + detailed address
                const formattedLocation = formatPlaceAddress(addressStr);

                return normalizePlaceImages({
                  id: place.id,
                  title: place.name,
                  rating: place.rating,
                  location: formattedLocation,
                  image: place.image,
                  imageUrl: place.imageUrl,
                  images: place.images,
                  isBookmarked: place.isBookmarked,
                  distance: 0,
                  weatherSuitability: place.weatherSuitability,
                  reasonWhy: place.description
                });
              });

              console.log('HomePage: Mapped recommendations data:', recommendationsData);
            } else {
              console.log('HomePage: Guest recommendations failed or empty');
            }
          } catch (error) {
            console.warn('Guest recommendations failed:', error);
          }
        } else {
          // For authenticated users, use good-to-visit recommendations
          if (isMounted) {
            try {
              const goodToVisitData = await loadGoodToVisitRecommendations();
              if (goodToVisitData.length > 0 && isMounted) {
                recommendationsData = goodToVisitData;
              }
            } catch (error) {
              console.warn('Good-to-visit recommendations failed:', error);
            }
          }

          // Fallback to general recommendations if good-to-visit fails
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
          recommendationsData = await loadBookmarkStatus(recommendationsData);
        }

        if (isMounted) {
          console.log('HomePage: About to set recommendations with data:', recommendationsData);
          console.log('HomePage: Recommendations data length:', recommendationsData.length);
          setRecommendations(recommendationsData);
          setIsInitialLoading(false);
          setHasLoadedOnce(true);
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

          setIsInitialLoading(false);
          setHasLoadedOnce(true);
        }
      }
    };

    const loadGoodToVisitRecommendations = async () => {
      if (!currentLocation) return [];

      // Use good-to-visit API with user's current location
      console.log('🎯 Calling good-to-visit API with location:', {
        lat: currentLocation.latitude,
        lon: currentLocation.longitude
      });

      const response = await contextualRecommendationService.getGoodToVisitRecommendations(
        currentLocation.latitude,
        currentLocation.longitude,
        { limit: 10 }
      );

      console.log('✅ Good-to-visit API response:', response);

      // Parse the response to extract dynamic message and places
      const parsed = contextualRecommendationService.parseGoodToVisitResponse(response);
      console.log('📝 Parsed response:', parsed);

      // Update dynamic message state
      if (parsed.dynamicMessage) {
        setDynamicMessage(parsed.dynamicMessage);
        console.log('🎨 Dynamic message set:', parsed.dynamicMessage);
      }

      if (parsed.places && parsed.places.length > 0) {
        return parsed.places.map(place => {
          // Use shortAddress field from backend
          const addressStr = place.shortAddress || place.address || '';
          const formattedLocation = formatPlaceAddress(addressStr);

          return normalizePlaceImages({
            id: place.id,
            title: place.name,
            rating: place.rating,
            location: formattedLocation,
            image: place.imageUrl || place.images?.[0],
            images: place.images,
            isBookmarked: false,
            distance: place.distance || 0,
            weatherSuitability: place.weatherSuitability,
            reasonWhy: place.reasonWhy
          });
        });
      }
      return [];
    };

    const loadGeneralRecommendations = async () => {
      // Use general recommendations API that works for both guest and authenticated users
      const response = await placeService.getRecommendations();

      if (response.success && response.data.recommendations && response.data.recommendations.length > 0) {
        return response.data.recommendations.map(place => {
          // Use shortAddress field from backend
          const addressStr = place.shortAddress || place.address || '';
          const formattedLocation = formatPlaceAddress(addressStr);

          return normalizePlaceImages({
            id: place.id,
            title: place.name,
            rating: place.rating,
            location: formattedLocation,
            image: place.imageUrl || place.image,
            images: place.images,
            isBookmarked: false,
            distance: null,
            score: place.score || null,
            reasonWhy: place.reasonWhy || null
          });
        });
      }
      return [];
    };

    const loadBookmarkStatus = async (places) => {
      // Skip bookmark status loading for guest users and when no authentication
      if (user.isGuest || !places.length || !authService.isAuthenticated()) {
        console.log('Skipping bookmark status checks for guest user or unauthenticated state');
        return places.map(place => ({ ...place, isBookmarked: false }));
      }

      try {
        console.log('Loading bookmark status for', places.length, 'places');
        // Use efficient bulk bookmark status check
        return await bookmarkService.applyBookmarkStatus(places);
      } catch (error) {
        console.warn('Failed to load bookmark status:', error);
        return places;
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
          let transformedPlaces = response.data.map(place => {
            // Use shortAddress field from backend
            // Backend sends: shortAddress = formatted address, address = full address
            const addressStr = place.shortAddress || place.address || '';

            // Format the address to show district + detailed address
            const formattedLocation = formatPlaceAddress(addressStr);

            return normalizePlaceImages({
              id: place.id,
              name: place.name || place.title,
              title: place.title || place.name,
              rating: place.rating,
              location: formattedLocation,
              image: place.imageUrl || place.image,
              images: place.images || [],
              isBookmarked: place.isBookmarked || false
            });
          });

          // Apply bookmark status for authenticated users
          if (authService.isAuthenticated()) {
            transformedPlaces = await bookmarkService.applyBookmarkStatus(transformedPlaces);
          }

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

  // Load nearby places
  useEffect(() => {
    let isMounted = true;

    const loadNearbyPlaces = async () => {
      if (!currentLocation || !isMounted) return;

      try {
        console.log('Loading nearby places for location:', currentLocation);
        const response = await placeService.getNearbyPlaces(
          currentLocation.latitude,
          currentLocation.longitude,
          { radius: 3000, limit: 10 } // 3km radius
        );

        if (response.success && isMounted && response.data?.length > 0) {
          console.log('✅ Nearby places loaded:', response.data.length);
          let transformedPlaces = response.data.map(place => {
            const addressStr = place.shortAddress || place.address || '';
            const formattedLocation = formatPlaceAddress(addressStr);

            return normalizePlaceImages({
              id: place.id,
              name: place.name || place.title,
              title: place.title || place.name,
              rating: place.rating,
              location: formattedLocation,
              image: place.imageUrl || place.image,
              images: place.images || [],
              isBookmarked: place.isBookmarked || false,
              distance: place.distance
            });
          });

          // Apply bookmark status for authenticated users
          if (authService.isAuthenticated()) {
            transformedPlaces = await bookmarkService.applyBookmarkStatus(transformedPlaces);
          }

          setNearbyPlaces(transformedPlaces);
        } else if (isMounted) {
          setNearbyPlaces([]);
        }
      } catch (error) {
        console.warn('⚠️ Failed to load nearby places:', error);
        if (isMounted) {
          setNearbyPlaces([]);
        }
      }
    };

    if (currentLocation) {
      loadNearbyPlaces();
    }

    return () => {
      isMounted = false;
    };
  }, [currentLocation]);

  // Large category pool - shuffled on each render
  // Mixed styles: questions, statements, creative phrases
  const allCategories = [
    // 카페 (cafe)
    { key: 'cafe', title: '오늘의 카페' },
    { key: 'cafe', title: '커피 한 잔 어때요?' },
    { key: 'cafe', title: '카페 가고 싶은 날' },
    { key: 'cafe', title: '조용한 카페가 필요해' },
    { key: 'cafe', title: '작업하기 좋은 카페' },
    { key: 'cafe', title: '뷰 맛집 카페' },
    { key: 'cafe', title: '힙한 카페 투어' },

    // 음식점 (restaurant)
    { key: 'restaurant', title: '오늘 뭐 먹지?' },
    { key: 'restaurant', title: '맛집 탐방' },
    { key: 'restaurant', title: '점심 메뉴 고민 중' },
    { key: 'restaurant', title: '저녁 어디서 먹을까?' },
    { key: 'restaurant', title: '혼밥하기 좋은 곳' },
    { key: 'restaurant', title: '회식 장소 찾아요' },
    { key: 'restaurant', title: '데이트 맛집' },

    // 바/술집 (bar)
    { key: 'bar', title: '오늘 한 잔 어때요?' },
    { key: 'bar', title: '분위기 좋은 바' },
    { key: 'bar', title: '퇴근 후 한 잔' },
    { key: 'bar', title: '칵테일이 땡겨요' },
    { key: 'bar', title: '2차는 여기로' },
    { key: 'bar', title: '조용히 마시기 좋은 곳' },

    // 베이커리 (bakery)
    { key: 'bakery', title: '빵지순례' },
    { key: 'bakery', title: '갓 구운 빵 냄새' },
    { key: 'bakery', title: '빵 먹고 싶은 날' },
    { key: 'bakery', title: '크루아상 맛집' },
    { key: 'bakery', title: '소금빵이 땡겨요' },

    // 브런치 (brunch_cafe)
    { key: 'brunch_cafe', title: '여유로운 브런치' },
    { key: 'brunch_cafe', title: '늦은 아침 어때요?' },
    { key: 'brunch_cafe', title: '주말 브런치' },
    { key: 'brunch_cafe', title: '에그 베네딕트 먹고 싶어' },

    // 디저트 (dessert_cafe)
    { key: 'dessert_cafe', title: '디저트가 땡길 때' },
    { key: 'dessert_cafe', title: '달콤한 유혹' },
    { key: 'dessert_cafe', title: '오늘의 당 충전' },
    { key: 'dessert_cafe', title: '케이크 한 조각' },
    { key: 'dessert_cafe', title: '마카롱 맛집' },
    { key: 'dessert_cafe', title: '아이스크림 먹으러' },

    // 와인바 (wine_bar)
    { key: 'wine_bar', title: '오늘은 와인 기분' },
    { key: 'wine_bar', title: '와인 한 잔 할까요?' },
    { key: 'wine_bar', title: '분위기 있는 와인바' },

    // 수제맥주 (craft_beer)
    { key: 'craft_beer', title: '시원한 맥주 한 잔' },
    { key: 'craft_beer', title: '맥주가 땡기는 날' },
    { key: 'craft_beer', title: '수제맥주 투어' },

    // 갤러리 (gallery)
    { key: 'gallery', title: '갤러리 나들이' },
    { key: 'gallery', title: '예술이 필요한 날' },
    { key: 'gallery', title: '감성 충전 갤러리' },

    // 박물관 (museum)
    { key: 'museum', title: '박물관 탐방' },
    { key: 'museum', title: '역사 속으로' },
    { key: 'museum', title: '문화 나들이' },

    // 전시 (exhibition)
    { key: 'exhibition', title: '오늘의 전시' },
    { key: 'exhibition', title: '전시 보러 갈까요?' },
    { key: 'exhibition', title: '팝업 전시 탐방' },

    // 공방 (workshop)
    { key: 'workshop', title: '뭔가 만들어볼까?' },
    { key: 'workshop', title: '원데이 클래스' },
    { key: 'workshop', title: '손으로 만드는 시간' },
    { key: 'workshop', title: '나만의 향수 만들기' },

    // 공원 (park)
    { key: 'park', title: '산책하기 좋은 날' },
    { key: 'park', title: '바람 쐬러 갈까?' },
    { key: 'park', title: '피크닉 명소' },
    { key: 'park', title: '자연 속 힐링' },

    // 쇼핑몰 (shopping_mall)
    { key: 'shopping_mall', title: '쇼핑 가고 싶어' },
    { key: 'shopping_mall', title: '윈도우 쇼핑' },
    { key: 'shopping_mall', title: '오늘은 쇼핑 데이' },

    // 영화관 (cinema)
    { key: 'cinema', title: '영화 한 편 어때요?' },
    { key: 'cinema', title: '팝콘과 영화' },
    { key: 'cinema', title: '오늘의 영화관' },

    // 서점 (bookstore)
    { key: 'bookstore', title: '책방 나들이' },
    { key: 'bookstore', title: '책 향기 가득한 곳' },
    { key: 'bookstore', title: '독립서점 투어' },

    // 북카페 (library_cafe)
    { key: 'library_cafe', title: '책과 커피' },
    { key: 'library_cafe', title: '조용히 책 읽고 싶어' },

    // 한식 (korean_food)
    { key: 'korean_food', title: '한식이 땡길 때' },
    { key: 'korean_food', title: '집밥 같은 맛' },
    { key: 'korean_food', title: '뜨끈한 국밥' },
    { key: 'korean_food', title: '삼겹살 구워요' },
    { key: 'korean_food', title: '정갈한 백반' },

    // 일식 (japanese_food)
    { key: 'japanese_food', title: '오늘은 일식 기분' },
    { key: 'japanese_food', title: '스시 먹으러 갈까?' },
    { key: 'japanese_food', title: '라멘이 땡겨' },
    { key: 'japanese_food', title: '오마카세 도전' },
    { key: 'japanese_food', title: '바삭한 돈카츠' },

    // 중식 (chinese_food)
    { key: 'chinese_food', title: '짜장면이 땡길 때' },
    { key: 'chinese_food', title: '오늘은 중식' },
    { key: 'chinese_food', title: '마라탕 먹을 사람?' },
    { key: 'chinese_food', title: '딤섬 파티' },

    // 양식 (western_food)
    { key: 'western_food', title: '파스타가 먹고 싶어' },
    { key: 'western_food', title: '스테이크 나잇' },
    { key: 'western_food', title: '피자 한 판' },
    { key: 'western_food', title: '버거 먹으러' },
    { key: 'western_food', title: '리조또 어때요?' },

    // 아시안 (asian_food)
    { key: 'asian_food', title: '이국적인 맛 여행' },
    { key: 'asian_food', title: '쌀국수 먹을래?' },
    { key: 'asian_food', title: '태국 음식 탐방' },
    { key: 'asian_food', title: '향신료 가득 커리' },

    // 펍 (pub)
    { key: 'pub', title: '동네 펍에서 한 잔' },
    { key: 'pub', title: '아늑한 펍' },

    // 라운지바 (lounge_bar)
    { key: 'lounge_bar', title: '라운지에서 여유롭게' },
    { key: 'lounge_bar', title: '호텔 라운지 바' },

    // 루프탑 (rooftop)
    { key: 'rooftop', title: '루프탑에서 야경을' },
    { key: 'rooftop', title: '하늘 아래 한 잔' },
    { key: 'rooftop', title: '노을 보러 갈까?' },

    // 스파 (spa)
    { key: 'spa', title: '힐링이 필요해' },
    { key: 'spa', title: '마사지 받고 싶은 날' },
    { key: 'spa', title: '스파에서 휴식을' },

    // 피트니스 (fitness)
    { key: 'fitness', title: '오늘은 운동하는 날' },
    { key: 'fitness', title: '클라이밍 도전' },

    // 요가 (yoga)
    { key: 'yoga', title: '요가로 시작하는 하루' },
    { key: 'yoga', title: '필라테스 어때요?' },

    // 플라워카페 (flower_cafe)
    { key: 'flower_cafe', title: '꽃과 함께하는 시간' },
    { key: 'flower_cafe', title: '플라워 카페' },

    // 펫프렌들리 (pet_friendly)
    { key: 'pet_friendly', title: '반려동물과 함께' },
    { key: 'pet_friendly', title: '펫 프렌들리' },
    { key: 'pet_friendly', title: '고양이 카페' },

    // 사진 (photo_studio)
    { key: 'photo_studio', title: '인생샷 명소' },
    { key: 'photo_studio', title: '사진 찍기 좋은 곳' },

    // 치킨 (chicken)
    { key: 'chicken', title: '치킨이 땡겨요' },
    { key: 'chicken', title: '치맥 하자' },
    { key: 'chicken', title: '바삭한 치킨' },

    // 해산물 (seafood)
    { key: 'seafood', title: '회 먹으러 갈까?' },
    { key: 'seafood', title: '조개구이 파티' },
    { key: 'seafood', title: '신선한 해산물' },

    // 고기 (meat)
    { key: 'meat', title: '고기 굽는 날' },
    { key: 'meat', title: '소고기가 땡겨' },
    { key: 'meat', title: 'BBQ 타임' },

    // 면 요리 (noodle)
    { key: 'noodle', title: '면 요리가 땡길 때' },
    { key: 'noodle', title: '칼국수 먹으러' },
    { key: 'noodle', title: '시원한 냉면' },
    { key: 'noodle', title: '우동 한 그릇' },

    // 분식 (snack_bar)
    { key: 'snack_bar', title: '분식 먹고 싶어' },
    { key: 'snack_bar', title: '떡볶이 땡기는 날' },
    { key: 'snack_bar', title: '김밥 한 줄' },

    // 죽/국밥 (porridge)
    { key: 'porridge', title: '해장이 필요해' },
    { key: 'porridge', title: '따뜻한 국물 생각나' },
    { key: 'porridge', title: '뜨끈한 죽 한 그릇' },

    // 샐러드 (salad)
    { key: 'salad', title: '건강한 한 끼' },
    { key: 'salad', title: '오늘은 샐러드' },
    { key: 'salad', title: '비건 식당' },

    // 이자카야 (izakaya)
    { key: 'izakaya', title: '이자카야 가자' },
    { key: 'izakaya', title: '사케 한 잔' },

    // 노포 (pojangmacha)
    { key: 'pojangmacha', title: '추억의 맛집' },
    { key: 'pojangmacha', title: '오래된 그 집' },

    // 테라스 (terrace)
    { key: 'terrace', title: '테라스에서 먹자' },
    { key: 'terrace', title: '야외에서 식사' },

    // 심야 (late_night)
    { key: 'late_night', title: '늦은 밤 갈 곳' },
    { key: 'late_night', title: '야식 먹으러' },

    // 키즈 (kids_friendly)
    { key: 'kids_friendly', title: '아이와 함께' },
    { key: 'kids_friendly', title: '키즈 카페' },
    { key: 'kids_friendly', title: '가족 식사' },

    // 뷰 (view)
    { key: 'view', title: '뷰 맛집' },
    { key: 'view', title: '야경 보러 갈까?' },
    { key: 'view', title: '한강뷰 카페' },

    // 족발/보쌈 (jokbal)
    { key: 'jokbal', title: '족발이 땡겨' },
    { key: 'jokbal', title: '보쌈 먹을 사람?' },
    { key: 'jokbal', title: '야식은 역시 족발' },

    // 곱창 (gopchang)
    { key: 'gopchang', title: '곱창 먹으러' },
    { key: 'gopchang', title: '막창 구워요' },

    // 탕/찌개 (stew)
    { key: 'stew', title: '뜨끈한 찌개' },
    { key: 'stew', title: '탕이 생각나' },
    { key: 'stew', title: '김치찌개 먹자' },
    { key: 'stew', title: '순두부찌개 맛집' },

    // 샤브샤브 (shabu)
    { key: 'shabu', title: '샤브샤브 어때?' },
    { key: 'shabu', title: '훠궈 먹으러' },

    // 뷔페 (buffet)
    { key: 'buffet', title: '오늘은 뷔페' },
    { key: 'buffet', title: '맘껏 먹는 날' },
    { key: 'buffet', title: '호텔 뷔페' },

    // 호프 (hof)
    { key: 'hof', title: '호프집 가자' },
    { key: 'hof', title: '맥주 한 잔 하러' },

    // 막걸리 (makgeolli)
    { key: 'makgeolli', title: '막걸리 한 잔' },
    { key: 'makgeolli', title: '파전에 막걸리' },
    { key: 'makgeolli', title: '전통주 바' },

    // 한옥 (hanok)
    { key: 'hanok', title: '한옥에서 쉬어가요' },
    { key: 'hanok', title: '한옥 카페' },

    // 레트로 (retro)
    { key: 'retro', title: '레트로 감성' },
    { key: 'retro', title: '복고풍 카페' },
    { key: 'retro', title: '뉴트로 핫플' },

    // 대형카페 (large_cafe)
    { key: 'large_cafe', title: '넓은 카페' },
    { key: 'large_cafe', title: '단체로 갈 카페' },

    // 프라이빗 (private)
    { key: 'private', title: '조용히 얘기할 곳' },
    { key: 'private', title: '룸 있는 식당' },
    { key: 'private', title: '단체 모임 장소' },

    // 인스타감성 (instagrammable)
    { key: 'instagrammable', title: '인스타 감성' },
    { key: 'instagrammable', title: '요즘 핫플' },
    { key: 'instagrammable', title: '사진 맛집' },

    // 신상 (new_place)
    { key: 'new_place', title: '새로 생긴 곳' },
    { key: 'new_place', title: '요즘 뜨는 곳' },
    { key: 'new_place', title: '신상 맛집' },

    // 가성비 (value)
    { key: 'value', title: '가성비 맛집' },
    { key: 'value', title: '가격 대비 최고' },

    // 파인다이닝 (fine_dining)
    { key: 'fine_dining', title: '특별한 날에' },
    { key: 'fine_dining', title: '파인다이닝' },
    { key: 'fine_dining', title: '기념일 레스토랑' },

    // 오므라이스 (omurice)
    { key: 'omurice', title: '폭신한 오므라이스' },
    { key: 'omurice', title: '오므라이스 먹으러' },

    // 카레 (curry)
    { key: 'curry', title: '카레가 먹고 싶어' },
    { key: 'curry', title: '일본식 카레' },

    // 멕시칸 (mexican)
    { key: 'mexican', title: '타코 파티' },
    { key: 'mexican', title: '부리또 먹으러' },

    // 지중해 (mediterranean)
    { key: 'mediterranean', title: '지중해 음식' },
    { key: 'mediterranean', title: '건강하게 지중해식' },

    // 이탈리안 (italian)
    { key: 'italian', title: '정통 이탈리안' },
    { key: 'italian', title: '트라토리아' },

    // 프렌치 (french)
    { key: 'french', title: '프렌치 레스토랑' },
    { key: 'french', title: '비스트로에서' },

    // 보드게임 (board_game)
    { key: 'board_game', title: '보드게임 하자' },
    { key: 'board_game', title: '게임하며 놀기' },

    // 방탈출 (escape_room)
    { key: 'escape_room', title: '방탈출 도전' },
    { key: 'escape_room', title: '스릴 즐기러' },

    // 노래방 (karaoke)
    { key: 'karaoke', title: '노래 부르러' },
    { key: 'karaoke', title: '노래방 가자' },

    // 볼링 (bowling)
    { key: 'bowling', title: '볼링 치러' },

    // 당구 (billiards)
    { key: 'billiards', title: '당구 한 게임' },

    // 골프 (golf)
    { key: 'golf', title: '스크린 골프' },
    { key: 'golf', title: '골프 연습하러' },

    // 수영 (swimming)
    { key: 'swimming', title: '수영하러 갈까?' },

    // 테니스 (tennis)
    { key: 'tennis', title: '테니스 치러' },

    // 캠핑 (camping)
    { key: 'camping', title: '캠핑 가자' },
    { key: 'camping', title: '글램핑 어때?' },
    { key: 'camping', title: '자연에서 하룻밤' },

    // 펜션 (pension)
    { key: 'pension', title: '펜션에서 쉬자' },
    { key: 'pension', title: '조용히 쉬러' },

    // 호텔 (hotel)
    { key: 'hotel', title: '호캉스 가자' },
    { key: 'hotel', title: '호텔에서 하룻밤' },

    // 워터파크 (waterpark)
    { key: 'waterpark', title: '물놀이 하러' },

    // 놀이공원 (amusement_park)
    { key: 'amusement_park', title: '놀이공원 가자' },

    // 동물원 (zoo)
    { key: 'zoo', title: '동물원 나들이' },

    // 아쿠아리움 (aquarium)
    { key: 'aquarium', title: '아쿠아리움' },

    // 식물원 (botanical_garden)
    { key: 'botanical_garden', title: '식물원 산책' },
    { key: 'botanical_garden', title: '수목원에서 힐링' },

    // 등산 (hiking)
    { key: 'hiking', title: '등산 가자' },
    { key: 'hiking', title: '가벼운 트레킹' },

    // 드라이브 (drive)
    { key: 'drive', title: '드라이브 코스' },
    { key: 'drive', title: '야경 드라이브' },

    // 계절명소 (seasonal)
    { key: 'seasonal', title: '꽃 구경 가자' },
    { key: 'seasonal', title: '단풍 보러' },

    // 전통시장 (traditional_market)
    { key: 'traditional_market', title: '시장 구경' },
    { key: 'traditional_market', title: '시장 먹거리' },

    // 백화점 (department)
    { key: 'department', title: '백화점 쇼핑' },
    { key: 'department', title: '아울렛 가자' },

    // 빈티지 (vintage)
    { key: 'vintage', title: '빈티지샵 투어' },
    { key: 'vintage', title: '구제 쇼핑' },

    // 네일 (nail)
    { key: 'nail', title: '네일 받으러' },

    // 헤어 (hair)
    { key: 'hair', title: '머리 하러' },
    { key: 'hair', title: '바버샵' },

    // 피부관리 (skincare)
    { key: 'skincare', title: '피부 관리 받으러' },

    // 타투 (tattoo)
    { key: 'tattoo', title: '타투샵 탐방' },

    // 사우나 (sauna)
    { key: 'sauna', title: '찜질방 가자' },
    { key: 'sauna', title: '사우나 하러' },

    // 만화카페 (manga_cafe)
    { key: 'manga_cafe', title: '만화책 읽으러' },

    // PC방 (pc_room)
    { key: 'pc_room', title: '게임하러' },

    // VR (vr)
    { key: 'vr', title: 'VR 체험' },

    // 포차 (indoor_pocha)
    { key: 'indoor_pocha', title: '포차에서 한 잔' },
    { key: 'indoor_pocha', title: '포차 감성' },

    // 생선구이 (grilled_fish)
    { key: 'grilled_fish', title: '생선구이 먹으러' },
    { key: 'grilled_fish', title: '고등어 구워요' },

    // 장어 (eel)
    { key: 'eel', title: '장어 먹으러' },
    { key: 'eel', title: '보양식 먹자' },

    // 닭요리 (chicken_dish)
    { key: 'chicken_dish', title: '닭볶음탕 먹자' },
    { key: 'chicken_dish', title: '찜닭 어때?' },
    { key: 'chicken_dish', title: '삼계탕 먹으러' },
    { key: 'chicken_dish', title: '닭갈비 가자' },

    // 오리 (duck)
    { key: 'duck', title: '오리고기 먹으러' },
    { key: 'duck', title: '훈제오리 맛집' },

    // 양꼬치 (lamb_skewer)
    { key: 'lamb_skewer', title: '양꼬치 먹자' },
    { key: 'lamb_skewer', title: '양꼬치에 칭따오' },

    // 대창 (beef_tripe)
    { key: 'beef_tripe', title: '대창 구워요' },

    // 순대 (sundae)
    { key: 'sundae', title: '순대 먹으러' },
    { key: 'sundae', title: '뜨끈한 순대국' },

    // 야식 (late_night_food)
    { key: 'late_night_food', title: '야식 시킬까?' },
    { key: 'late_night_food', title: '늦은 밤 뭐 먹지?' },

    // 샌드위치 (sandwich)
    { key: 'sandwich', title: '샌드위치 한 입' },
    { key: 'sandwich', title: '간단하게 샌드위치' },

    // 핫도그 (hotdog)
    { key: 'hotdog', title: '핫도그 먹으러' },

    // 토스트 (toast)
    { key: 'toast', title: '토스트 맛집' },

    // 만두 (dumpling)
    { key: 'dumpling', title: '만두 먹자' },
    { key: 'dumpling', title: '군만두가 땡겨' },

    // 떡 (rice_cake)
    { key: 'rice_cake', title: '떡 사러' },

    // 주스 (juice)
    { key: 'juice', title: '생과일 주스' },
    { key: 'juice', title: '스무디 마시러' },

    // 차 (tea)
    { key: 'tea', title: '차 한 잔' },
    { key: 'tea', title: '찻집 가자' },

    // 빙수 (bingsu)
    { key: 'bingsu', title: '빙수 먹자' },
    { key: 'bingsu', title: '시원한 거 먹고 싶어' },

    // 와플 (waffle)
    { key: 'waffle', title: '와플 먹으러' },
    { key: 'waffle', title: '크로플 맛집' },

    // 도넛 (donut)
    { key: 'donut', title: '도넛 먹자' },

    // 타르트 (tart)
    { key: 'tart', title: '타르트 먹으러' },
    { key: 'tart', title: '에그타르트 맛집' },

    // 초콜릿 (chocolate)
    { key: 'chocolate', title: '핫초코 마시러' },
    { key: 'chocolate', title: '달달한 초콜릿' },

    // 쿠키 (cookie)
    { key: 'cookie', title: '쿠키 먹자' },

    // 스콘 (scone)
    { key: 'scone', title: '스콘 맛집' },
  ];

  // Shuffle and select categories for display
  const getShuffledCategories = () => {
    const shuffled = [...allCategories].sort(() => Math.random() - 0.5);
    // Remove duplicates by key (keep only first occurrence of each key)
    const seen = new Set();
    const unique = shuffled.filter(cat => {
      if (seen.has(cat.key)) return false;
      seen.add(cat.key);
      return true;
    });
    return unique;
  };

  const [fixedCategories] = useState(() => getShuffledCategories());

  // Lazy loading state for categories
  const INITIAL_CATEGORIES_COUNT = 10; // Load 10 categories initially for better UX
  const CATEGORIES_BATCH_SIZE = 5; // Load 5 more categories when scrolling
  const [loadedCategoryCount, setLoadedCategoryCount] = useState(INITIAL_CATEGORIES_COUNT);
  const [isLoadingMoreCategories, setIsLoadingMoreCategories] = useState(false);
  const categoryLoaderRef = useRef(null);

  // Load a single category's places
  const loadCategoryPlaces = async (category, latitude, longitude) => {
    try {
      const placesResponse = await categoryService.getPlacesByCategory(
        category.key,
        latitude,
        longitude,
        { limit: 10 }
      );

      if (placesResponse.success && placesResponse.data.length > 0) {
        const transformedPlaces = placesResponse.data.map(place => {
          const addressStr = place.shortAddress || place.address || '';
          const formattedLocation = formatPlaceAddress(addressStr);

          return normalizePlaceImages({
            id: place.id,
            name: place.name || place.title,
            title: place.title || place.name,
            rating: place.rating,
            location: formattedLocation,
            image: place.imageUrl || place.image,
            images: place.images || [],
            isBookmarked: place.isBookmarked || false
          });
        });

        return { ...category, places: transformedPlaces };
      }
      return { ...category, places: [] };
    } catch (error) {
      console.warn(`Failed to load places for category ${category.key}:`, error);
      return { ...category, places: [] };
    }
  };

  // Load initial categories (first 5 only)
  useEffect(() => {
    let isMounted = true;

    const loadInitialCategories = async () => {
      if (!currentLocation || !isMounted) return;

      try {
        console.log('Loading initial categories for location:', currentLocation);

        // Only load the first few categories initially
        const initialCategories = fixedCategories.slice(0, INITIAL_CATEGORIES_COUNT);
        const placesPromises = initialCategories.map(category =>
          loadCategoryPlaces(category, currentLocation.latitude, currentLocation.longitude)
        );

        const placesResults = await Promise.all(placesPromises);

        if (isMounted) {
          // Filter categories that have places
          const categoriesWithPlaces = placesResults.filter(r => r.places.length > 0);
          setCategories(categoriesWithPlaces);

          const placesMap = {};

          // Apply bookmark status for authenticated users
          if (authService.isAuthenticated()) {
            const allPlaces = categoriesWithPlaces.flatMap(r => r.places);
            if (allPlaces.length > 0) {
              const placesWithBookmarks = await bookmarkService.applyBookmarkStatus(allPlaces);
              const bookmarkMap = new Map(placesWithBookmarks.map(p => [p.id, p.isBookmarked]));

              categoriesWithPlaces.forEach(result => {
                placesMap[result.key] = {
                  title: result.title,
                  places: result.places.map(place => ({
                    ...place,
                    isBookmarked: bookmarkMap.get(place.id) || false
                  }))
                };
              });
            } else {
              categoriesWithPlaces.forEach(result => {
                placesMap[result.key] = {
                  title: result.title,
                  places: result.places
                };
              });
            }
          } else {
            categoriesWithPlaces.forEach(result => {
              placesMap[result.key] = {
                title: result.title,
                places: result.places
              };
            });
          }

          setCategoriesPlaces(placesMap);
          console.log('Initial categories loaded:', categoriesWithPlaces.length);
        }
      } catch (error) {
        console.warn('Failed to load initial category recommendations:', error);
        if (isMounted) {
          setCategories([]);
          setCategoriesPlaces({});
        }
      }
    };

    if (currentLocation) {
      loadInitialCategories();
    }

    return () => {
      isMounted = false;
    };
  }, [currentLocation]);

  // Load more categories when user scrolls down (IntersectionObserver)
  useEffect(() => {
    if (!categoryLoaderRef.current || !currentLocation) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingMoreCategories && loadedCategoryCount < fixedCategories.length) {
          setIsLoadingMoreCategories(true);

          const nextBatch = fixedCategories.slice(loadedCategoryCount, loadedCategoryCount + CATEGORIES_BATCH_SIZE);
          if (nextBatch.length === 0) {
            setIsLoadingMoreCategories(false);
            return;
          }

          console.log(`Loading more categories: ${loadedCategoryCount} to ${loadedCategoryCount + nextBatch.length}`);

          try {
            const placesPromises = nextBatch.map(category =>
              loadCategoryPlaces(category, currentLocation.latitude, currentLocation.longitude)
            );

            const placesResults = await Promise.all(placesPromises);
            const newCategoriesWithPlaces = placesResults.filter(r => r.places.length > 0);

            if (newCategoriesWithPlaces.length > 0) {
              // Apply bookmark status
              let updatedPlacesMap = { ...categoriesPlaces };

              if (authService.isAuthenticated()) {
                const allPlaces = newCategoriesWithPlaces.flatMap(r => r.places);
                if (allPlaces.length > 0) {
                  const placesWithBookmarks = await bookmarkService.applyBookmarkStatus(allPlaces);
                  const bookmarkMap = new Map(placesWithBookmarks.map(p => [p.id, p.isBookmarked]));

                  newCategoriesWithPlaces.forEach(result => {
                    updatedPlacesMap[result.key] = {
                      title: result.title,
                      places: result.places.map(place => ({
                        ...place,
                        isBookmarked: bookmarkMap.get(place.id) || false
                      }))
                    };
                  });
                }
              } else {
                newCategoriesWithPlaces.forEach(result => {
                  updatedPlacesMap[result.key] = {
                    title: result.title,
                    places: result.places
                  };
                });
              }

              setCategories(prev => [...prev, ...newCategoriesWithPlaces]);
              setCategoriesPlaces(updatedPlacesMap);
            }

            setLoadedCategoryCount(prev => prev + CATEGORIES_BATCH_SIZE);
          } catch (error) {
            console.warn('Failed to load more categories:', error);
          } finally {
            setIsLoadingMoreCategories(false);
          }
        }
      },
      { rootMargin: '200px' } // Start loading before the element is visible
    );

    observer.observe(categoryLoaderRef.current);

    return () => observer.disconnect();
  }, [currentLocation, loadedCategoryCount, isLoadingMoreCategories, fixedCategories, categoriesPlaces]);

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
        let transformedPlaces = response.data.map(place => {
          // Use shortAddress field from backend
          const addressStr = place.shortAddress || place.address || '';
          const formattedLocation = formatPlaceAddress(addressStr);

          return normalizePlaceImages({
            ...place,
            location: formattedLocation
          });
        });

        // Apply bookmark status for authenticated users
        if (authService.isAuthenticated()) {
          transformedPlaces = await bookmarkService.applyBookmarkStatus(transformedPlaces);
        }

        setHomeImages(transformedPlaces);
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

  const handleBookmarkToggle = async (placeId, isBookmarked) => {
    try {
      // Check if user is guest
      if (!user || user.isGuest) {
        console.log('Guest user redirected to login for bookmarking');
        navigate('/login', {
          state: {
            from: '/home',
            message: '북마크 기능을 사용하려면 로그인이 필요합니다.'
          }
        });
        return;
      }

      console.log(`Place ${placeId} bookmark toggled:`, isBookmarked);

      let response;
      if (isBookmarked) {
        response = await bookmarkService.addBookmark(placeId);
      } else {
        response = await bookmarkService.removeBookmark(placeId);
      }

      if (response.success) {
        setRecommendations(prevRecommendations =>
          prevRecommendations.map(place =>
            place.id === placeId
              ? { ...place, isBookmarked }
              : place
          )
        );
      } else {
        console.error('Failed to toggle bookmark:', response.message);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleSeeMore = () => {
    console.log('See more places clicked');
    navigate('/places');
  };

  const handleBannerClick = () => {
    console.log('Banner clicked');
    // Check if user is logged in
    if (!user || user.isGuest) {
      // Not logged in - redirect to login page
      navigate('/login', {
        state: {
          from: '/home',
          message: '이 기능을 사용하려면 로그인이 필요합니다.'
        }
      });
      return;
    }

    // Check if user has completed preference survey
    const hasCompletedSurvey = user.mbti && user.ageRange && user.spacePreferences;
    if (hasCompletedSurvey) {
      navigate('/search-results');
    } else {
      navigate('/age-range');
    }
  };

  const handlePlaceClick = (placeId) => {
    console.log('Place clicked:', placeId);

    // Find place in database arrays only - no fallback data
    let selectedPlace = recommendations.find(place => place.id === placeId) ||
                       homeImages.find(place => place.id === placeId) ||
                       popularPlaces.find(place => place.id === placeId) ||
                       nearbyPlaces.find(place => place.id === placeId) ||
                       recentlyViewed.find(place => place.id === placeId);

    // Also check category places
    if (!selectedPlace) {
      for (const categoryData of Object.values(categoriesPlaces)) {
        if (categoryData.places) {
          selectedPlace = categoryData.places.find(place => place.id === placeId);
          if (selectedPlace) break;
        }
      }
    }

    // If not found in any array, navigate without preloaded data
    if (!selectedPlace) {
      navigate(`/place/${placeId}`);
      return;
    }

    // Add to recently viewed
    addRecentlyViewed(selectedPlace);

    console.log('Selected place data:', selectedPlace);
    const preloadedImage = buildImageUrl(
      selectedPlace.image || selectedPlace.imageUrl || selectedPlace.images?.[0]
    );
    navigate(`/place/${placeId}`, {
      state: {
        preloadedImage,
        preloadedData: selectedPlace
      }
    });
  };

  // Get display location
  const getDisplayLocation = () => {
    if (currentLocation?.address) {
      return currentLocation.address;
    }

    if (addressLoading || locationLoading) {
      return '';
    }

    if (currentLocation) {
      return '주소를 불러올 수 없습니다';
    }

    return '위치 정보를 확인할 수 없습니다';
  };

  // Retry function for error handling
  const handleRetry = () => {
    setError(null);
    setIsInitialLoading(true);
    setHasLoadedOnce(false);
    window.location.reload(); // Simple retry by reloading
  };

  const handleCardKeyDown = (event, placeId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handlePlaceClick(placeId);
    }
  };

  const renderPlacesSection = (title, places, {
    description,
    emptyMessage,
    footer,
    bookmarkable = true,
    sectionKey,
  } = {}) => {
    const key = sectionKey || title;

    if (!places || places.length === 0) {
      if (!emptyMessage) {
        return null;
      }

      return (
        <HomeSection key={`${key}-empty`} title={title} description={description}>
          <div className={`${styles.placeholderMessage} ${styles.placeholderMessageDense}`}>
            {emptyMessage}
          </div>
        </HomeSection>
      );
    }

    return (
      <HomeSection
        key={key}
        title={title}
        description={description}
        paddedBody={false}
        footer={footer}
      >
        <HomeHorizontalScroller>
          {places.map((place) => (
            <div
              key={place.id}
              className={styles.cardLink}
              role="button"
              tabIndex={0}
              onClick={() => handlePlaceClick(place.id)}
              onKeyDown={(event) => handleCardKeyDown(event, place.id)}
            >
              <PlaceCard
                title={place.title || place.name}
                rating={place.rating}
                location={place.location || place.category}
                image={place.image || place.imageUrl}
                images={place.images || []}
                isBookmarked={place.isBookmarked || false}
                onBookmarkToggle={bookmarkable ? ((isBookmarked) => handleBookmarkToggle(place.id, isBookmarked)) : undefined}
              />
            </div>
          ))}
        </HomeHorizontalScroller>
      </HomeSection>
    );
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header - Always shown immediately */}
      <header className={styles.header}>
        <img src={logoHeader} alt="MOHE" className={styles.logo} />
        <div className={styles.headerSpacer} />
        <SearchBar onClick={() => setIsSearchModalOpen(true)} />
        <ProfileButton onClick={handleProfileClick} />
      </header>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      {/* Location indicator */}
      <div className={styles.locationSection}>
        <LocationPin 
          location={getDisplayLocation()} 
          size="medium"
          loading={addressLoading || locationLoading}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className={styles.errorWrapper}>
          <ErrorMessage 
            message={error}
            onRetry={handleRetry}
            onDismiss={() => setError(null)}
            variant="banner"
          />
        </div>
      )}

      {/* Main content - Show skeleton only on initial load when no data exists */}
      {isInitialLoading && !hasLoadedOnce && recommendations.length === 0 ? (
        <HomePageSkeleton />
      ) : (
        <div className={styles.contentContainer}>
          <div className={styles.content}>
            {/* Recently Viewed Places */}
            {recentlyViewed.length > 0 && renderPlacesSection('최근 본 장소', recentlyViewed, {
              sectionKey: 'recently-viewed'
            })}

            {renderPlacesSection(dynamicMessage, recommendations, {
              emptyMessage: '현재 추천 장소를 불러오고 있습니다.',
              sectionKey: 'primary-recommendations'
            })}

            <div className={styles.bannerWrapper}>
              <HomeBanner
                title="지금 뭐하지?"
                description={`시간, 기분, 취향을 반영해서
당신에게 어울리는 곳을 골라봤어요.`}
                image={bannerLeft}
                onClick={handleBannerClick}
              />
            </div>

            {/* Nearby Places Section */}
            {nearbyPlaces.length > 0 && renderPlacesSection('내 주변 장소', nearbyPlaces, {
              description: '가까운 거리에 있는 장소들이에요',
              sectionKey: 'nearby-places'
            })}

            {homeImages.length > 0
              ? renderPlacesSection(
                  user && user.id && user.id !== 'guest' ? '당신을 위한 추천' : '지금 이 시간 추천',
                  homeImages,
                  { sectionKey: 'time-recommendations' }
                )
              : null}

            {/* Category-based Sections */}
            {categories.length > 0 && categories.map((category) => {
              const categoryData = categoriesPlaces[category.key];
              if (!categoryData || !categoryData.places || categoryData.places.length === 0) {
                return null;
              }
              return renderPlacesSection(
                categoryData.title || category.title,
                categoryData.places,
                {
                  sectionKey: `category-${category.key}`,
                }
              );
            })}

            {/* Lazy load trigger for more categories */}
            {loadedCategoryCount < fixedCategories.length && (
              <div
                ref={categoryLoaderRef}
                className={styles.categoryLoader}
                style={{ height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                {isLoadingMoreCategories && (
                  <span style={{ color: '#7D848D', fontSize: '13px' }}>더 많은 카테고리 로딩 중...</span>
                )}
              </div>
            )}

            {/* Fallback if no category sections loaded */}
            {categories.length === 0 && popularPlaces.length > 0 &&
              renderPlacesSection('오늘은 이런 곳 어떠세요?', popularPlaces, {
                footer: (
                  <OutlineButton onClick={handleSeeMore}>
                    더 많은 장소 보기
                  </OutlineButton>
                ),
                sectionKey: 'popular-places',
              })}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <span className={styles.footerLogo}>MOHE</span>

          <div className={styles.footerLinks}>
            <a href="#" className={styles.footerLink}>서비스 이용약관</a>
            <a href="#" className={styles.footerLink}>개인정보처리방침</a>
            <a href="#" className={styles.footerLink}>문의하기</a>
          </div>

          <div className={styles.footerDivider} />

          <div className={styles.footerBottom}>
            <p className={styles.footerText}>© 2025 MOHE. All rights reserved.</p>
            <a href="mailto:hello@mohe.app" className={styles.footerEmail}>hello@mohe.app</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

const formatDisplayAddress = (addressData = {}) => {
  if (!addressData) return '';

  if (addressData.shortAddress) {
    return addressData.shortAddress;
  }

  if (addressData.fullAddress) {
    return addressData.fullAddress;
  }

  const hierarchy = [addressData.sido, addressData.sigungu, addressData.dong, addressData.eupMyeon, addressData.ri]
    .filter(Boolean)
    .join(' ');

  return hierarchy || '';
};
