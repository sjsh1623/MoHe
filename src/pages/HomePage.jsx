import React, { useState, useEffect } from 'react';
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
import logoHeader from '@/assets/image/logo-header.png';
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
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationPermissionRequested, setLocationPermissionRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [homeImages, setHomeImages] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesPlaces, setCategoriesPlaces] = useState({});
  const [dynamicMessage, setDynamicMessage] = useState('지금 가기 좋은 플레이스');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { recentlyViewed, addRecentlyViewed } = useRecentlyViewed();

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
              currentUser = await authService.createGuestSession();
            }
          } else {
            currentUser = await authService.createGuestSession();
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
          if (locationData && isMounted) {
            console.log('📍 Setting location from geolocation:', locationData);
            setCurrentLocation(locationData);
            console.log('🏠 Geolocation set, should trigger popular places loading');
            // Resolve address for the location
            await resolveAddress(locationData.latitude, locationData.longitude);
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
    if (!latitude || !longitude) {
      setAddressLoading(false);
      return null;
    }

    setAddressLoading(true);
    try {
      const addressResponse = await addressService.reverseGeocode(latitude, longitude);
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

  // Large category pool (~60 entries) - shuffled on each render
  // API uses English keys (cafe, restaurant, bar, etc.)
  // Multiple titles can use the same API key for variety
  const allCategories = [
    // 카페 관련 (cafe)
    { key: 'cafe', title: '오늘의 카페' },
    { key: 'cafe', title: '커피 한 잔 어때요' },
    { key: 'cafe', title: '분위기 좋은 카페' },
    { key: 'cafe', title: '여유로운 카페 타임' },
    { key: 'cafe', title: '감성 카페 추천' },
    { key: 'cafe', title: '조용한 카페 찾기' },

    // 음식점 관련 (restaurant)
    { key: 'restaurant', title: '맛집 탐방' },
    { key: 'restaurant', title: '오늘 뭐 먹지' },
    { key: 'restaurant', title: '점심 메뉴 추천' },
    { key: 'restaurant', title: '저녁 식사 어디서' },
    { key: 'restaurant', title: '숨은 맛집 발견' },
    { key: 'restaurant', title: '입소문 맛집' },

    // 바/술집 관련 (bar)
    { key: 'bar', title: '분위기 좋은 바' },
    { key: 'bar', title: '오늘 밤 한 잔' },
    { key: 'bar', title: '퇴근 후 한 잔' },
    { key: 'bar', title: '칵테일 한 잔 어때요' },
    { key: 'bar', title: '분위기 있는 술집' },

    // 베이커리 (bakery)
    { key: 'bakery', title: '빵지순례' },
    { key: 'bakery', title: '갓 구운 빵 냄새' },
    { key: 'bakery', title: '오늘의 빵집' },
    { key: 'bakery', title: '동네 베이커리' },
    { key: 'bakery', title: '빵순이 빵돌이 모여라' },

    // 브런치 (brunch_cafe)
    { key: 'brunch_cafe', title: '브런치 맛집' },
    { key: 'brunch_cafe', title: '늦은 아침 브런치' },
    { key: 'brunch_cafe', title: '주말 브런치 어때요' },
    { key: 'brunch_cafe', title: '여유로운 브런치' },

    // 디저트 (dessert_cafe)
    { key: 'dessert_cafe', title: '달콤한 디저트' },
    { key: 'dessert_cafe', title: '디저트가 땡길 때' },
    { key: 'dessert_cafe', title: '오늘의 당충전' },
    { key: 'dessert_cafe', title: '케이크 맛집' },
    { key: 'dessert_cafe', title: '달달한 휴식' },

    // 와인바 (wine_bar)
    { key: 'wine_bar', title: '와인 한 잔 어때요' },
    { key: 'wine_bar', title: '오늘은 와인 기분' },
    { key: 'wine_bar', title: '분위기 있는 와인바' },
    { key: 'wine_bar', title: '로맨틱 와인 타임' },

    // 수제맥주 (craft_beer)
    { key: 'craft_beer', title: '수제맥주 한 잔' },
    { key: 'craft_beer', title: '맥주 한 잔 하실래요' },
    { key: 'craft_beer', title: '크래프트 비어 투어' },
    { key: 'craft_beer', title: '시원한 맥주가 필요해' },

    // 갤러리 (gallery)
    { key: 'gallery', title: '갤러리 나들이' },
    { key: 'gallery', title: '예술이 필요한 날' },
    { key: 'gallery', title: '감성 충전 갤러리' },
    { key: 'gallery', title: '오늘은 갤러리 데이트' },

    // 박물관 (museum)
    { key: 'museum', title: '박물관 탐방' },
    { key: 'museum', title: '역사 속으로' },
    { key: 'museum', title: '박물관에서의 하루' },
    { key: 'museum', title: '문화 나들이' },

    // 전시 (exhibition)
    { key: 'exhibition', title: '전시 관람' },
    { key: 'exhibition', title: '오늘의 전시회' },
    { key: 'exhibition', title: '전시 보러 갈까요' },
    { key: 'exhibition', title: '특별 전시 추천' },

    // 공방 (workshop)
    { key: 'workshop', title: '오늘은 뭘 만들어볼까요' },
    { key: 'workshop', title: '손으로 만드는 시간' },
    { key: 'workshop', title: '공방 체험 추천' },
    { key: 'workshop', title: '원데이 클래스' },
    { key: 'workshop', title: '창작의 즐거움' },

    // 공원 (park)
    { key: 'park', title: '산책하기 좋은 곳' },
    { key: 'park', title: '자연 속 힐링' },
    { key: 'park', title: '공원에서 여유롭게' },
    { key: 'park', title: '피크닉 명소' },
    { key: 'park', title: '바람 쐬러 갈까요' },

    // 쇼핑몰 (shopping_mall)
    { key: 'shopping_mall', title: '쇼핑하기 좋은 곳' },
    { key: 'shopping_mall', title: '쇼핑 나들이' },
    { key: 'shopping_mall', title: '윈도우 쇼핑 어때요' },
    { key: 'shopping_mall', title: '오늘은 쇼핑 데이' },

    // 영화관 (cinema)
    { key: 'cinema', title: '영화 보러 갈까요' },
    { key: 'cinema', title: '오늘의 영화관' },
    { key: 'cinema', title: '팝콘과 영화' },
    { key: 'cinema', title: '영화 한 편 어때요' },

    // 서점 (bookstore)
    { key: 'bookstore', title: '서점 나들이' },
    { key: 'bookstore', title: '책 향기 가득한 곳' },
    { key: 'bookstore', title: '독서의 계절' },
    { key: 'bookstore', title: '동네 책방 탐방' },

    // 북카페 (library_cafe)
    { key: 'library_cafe', title: '책과 함께하는 시간' },
    { key: 'library_cafe', title: '책 읽기 좋은 카페' },
    { key: 'library_cafe', title: '북카페 추천' },

    // 한식 (korean_food)
    { key: 'korean_food', title: '한식이 땡길 때' },
    { key: 'korean_food', title: '정갈한 한식 한 상' },
    { key: 'korean_food', title: '엄마 손맛이 그리울 때' },

    // 일식 (japanese_food)
    { key: 'japanese_food', title: '일식 맛집' },
    { key: 'japanese_food', title: '오늘은 일식 기분' },
    { key: 'japanese_food', title: '스시가 먹고 싶을 때' },

    // 중식 (chinese_food)
    { key: 'chinese_food', title: '중식 맛집' },
    { key: 'chinese_food', title: '짜장면이 땡길 때' },
    { key: 'chinese_food', title: '오늘은 중국 요리' },

    // 양식 (western_food)
    { key: 'western_food', title: '양식 맛집' },
    { key: 'western_food', title: '파스타가 먹고 싶을 때' },
    { key: 'western_food', title: '스테이크 맛집' },

    // 아시안 (asian_food)
    { key: 'asian_food', title: '아시안 푸드' },
    { key: 'asian_food', title: '이국적인 맛 여행' },
    { key: 'asian_food', title: '동남아 음식 탐방' },

    // 펍 (pub)
    { key: 'pub', title: '동네 펍 추천' },
    { key: 'pub', title: '아늑한 펍에서' },

    // 라운지바 (lounge_bar)
    { key: 'lounge_bar', title: '라운지에서 여유롭게' },
    { key: 'lounge_bar', title: '도심 속 라운지' },

    // 루프탑 (rooftop)
    { key: 'rooftop', title: '루프탑에서 야경을' },
    { key: 'rooftop', title: '하늘 아래 루프탑' },

    // 스파/웰니스 (spa)
    { key: 'spa', title: '힐링이 필요할 때' },
    { key: 'spa', title: '스파에서 휴식을' },

    // 헬스/피트니스 (fitness)
    { key: 'fitness', title: '운동하기 좋은 곳' },
    { key: 'fitness', title: '건강한 하루' },

    // 요가/필라테스 (yoga)
    { key: 'yoga', title: '요가로 시작하는 아침' },
    { key: 'yoga', title: '필라테스 스튜디오' },

    // 플라워카페 (flower_cafe)
    { key: 'flower_cafe', title: '꽃과 함께하는 시간' },
    { key: 'flower_cafe', title: '플라워 카페 추천' },

    // 펫프렌들리 (pet_friendly)
    { key: 'pet_friendly', title: '반려동물과 함께' },
    { key: 'pet_friendly', title: '펫 프렌들리 장소' },

    // 사진관/스튜디오 (photo_studio)
    { key: 'photo_studio', title: '인생샷 명소' },
    { key: 'photo_studio', title: '사진 찍기 좋은 곳' },
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

  // Load category-based recommendations
  useEffect(() => {
    let isMounted = true;

    const loadCategoryRecommendations = async () => {
      if (!currentLocation || !isMounted) return;

      try {
        console.log('Loading categories for location:', currentLocation);

        // Load places for each fixed category
        const placesPromises = fixedCategories.map(async (category) => {
          try {
            const placesResponse = await categoryService.getPlacesByCategory(
              category.key,
              currentLocation.latitude,
              currentLocation.longitude,
              { limit: 10 }
            );

            if (placesResponse.success && placesResponse.data.length > 0) {
              console.log(`Places loaded for category ${category.key}:`, placesResponse.data.length);

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
        });

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
          console.log('Categories loaded:', categoriesWithPlaces.length);
        }
      } catch (error) {
        console.warn('Failed to load category recommendations:', error);
        if (isMounted) {
          setCategories([]);
          setCategoriesPlaces({});
        }
      }
    };

    if (currentLocation) {
      loadCategoryRecommendations();
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
    setIsLoading(true);
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

      {/* Main content - Show skeleton while loading */}
      {isLoading ? (
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
