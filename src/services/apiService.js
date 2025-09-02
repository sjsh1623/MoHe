const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Base API service with common functionality
 */
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    // Completely remove caching to prevent refresh issues
    // this.requestCache = new Map(); // Simple request deduplication
    // this.requestTimestamps = new Map(); // Rate limiting
  }

  /**
   * Get auth token from localStorage
   */
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Handle 401 responses by attempting token refresh
   */
  async handleUnauthorized() {
    try {
      const { authService } = await import('./authService.js');
      await authService.refreshAccessToken();
      return true;
    } catch (error) {
      const { authService } = await import('./authService.js');
      authService.clearAuthData();
      // Redirect to login if we're not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return false;
    }
  }

  /**
   * Get common headers for API requests
   */
  getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Check if request should be rate limited
   */
  isRateLimited(endpoint, method = 'GET') {
    // Disable ALL rate limiting for now to prevent 429 errors
    return false;
  }

  /**
   * Create request cache key
   */
  createCacheKey(endpoint, method, body) {
    return `${method}:${endpoint}:${body ? JSON.stringify(body) : ''}`;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  async request(endpoint, options = {}) {
    const method = options.method || 'GET';
    console.log(`🚀 REFRESH-SAFE VERSION: Making request: ${method} ${endpoint} - Rate limiting DISABLED`); // Add this line
    
    // Add small delay to prevent rapid successive calls on refresh
    if (options.preventRapidRefresh !== false) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Rate limiting COMPLETELY DISABLED
    // if (this.isRateLimited(endpoint, method)) {
    //   console.warn(`Rate limited: ${method} ${endpoint}`);
    //   throw new ApiError(429, 'Too many requests, please wait a moment');
    // }

    // Request deduplication DISABLED
    // const cacheKey = this.createCacheKey(endpoint, method, options.body);
    // if (method === 'GET' && this.requestCache.has(cacheKey)) {
    //   const cachedPromise = this.requestCache.get(cacheKey);
    //   console.log(`Using cached request: ${endpoint}`);
    //   return cachedPromise;
    // }

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      method,
      headers: {
        ...this.getHeaders(options.requireAuth),
        ...options.headers,
      },
    };

    // Execute request directly without caching
    const requestPromise = this.executeRequest(url, config);
    
    // if (method === 'GET') {
    //   this.requestCache.set(cacheKey, requestPromise);
    //   // Clean up cache after 5 seconds
    //   setTimeout(() => this.requestCache.delete(cacheKey), 5000);
    // }
    
    return requestPromise;
  }

  /**
   * Execute the actual HTTP request
   */
  async executeRequest(url, config) {
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Handle 401 unauthorized
        if (response.status === 401 && config.requireAuth) {
          const refreshed = await this.handleUnauthorized();
          if (refreshed) {
            // Retry the request with new token
            const newConfig = {
              ...config,
              headers: {
                ...this.getHeaders(config.requireAuth),
                ...config.headers,
              },
            };
            const retryResponse = await fetch(url, newConfig);
            if (!retryResponse.ok) {
              const errorData = await retryResponse.json().catch(() => ({}));
              throw new ApiError(
                retryResponse.status,
                errorData.message || `HTTP Error ${retryResponse.status}`,
                errorData.code,
                errorData.path
              );
            }
            return await retryResponse.json();
          }
        }

        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.message || `HTTP Error ${response.status}`,
          errorData.code,
          errorData.path
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, error.message || 'Network error occurred');
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(status, message, code = null, path = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.path = path;
  }

  isNetworkError() {
    return this.status === 0;
  }

  isServerError() {
    return this.status >= 500;
  }

  isClientError() {
    return this.status >= 400 && this.status < 500;
  }
}

/**
 * Weather API service
 */
export class WeatherService extends ApiService {
  /**
   * Get current weather data for coordinates
   */
  async getCurrentWeather(latitude, longitude) {
    return this.get(`/api/weather/current?lat=${latitude}&lon=${longitude}`, {
      requireAuth: false
    });
  }

  /**
   * Get weather context for recommendations
   */
  async getWeatherContext(latitude, longitude) {
    return this.get(`/api/weather/context?lat=${latitude}&lon=${longitude}`, {
      requireAuth: false
    });
  }
}

/**
 * Contextual Recommendation API service
 */
export class ContextualRecommendationService extends ApiService {
  /**
   * Get contextual recommendations based on query and location
   */
  async getContextualRecommendations(query, latitude, longitude, options = {}) {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      limit: (options.limit || 10).toString()
    });

    if (query) {
      params.append('query', query);
    }

    return this.get(`/api/recommendations/contextual?${params.toString()}`, {
      requireAuth: false
    });
  }

  /**
   * Search places by keywords
   */
  async searchPlaces(keywords, latitude, longitude, options = {}) {
    const requestData = {
      keywords: Array.isArray(keywords) ? keywords : [keywords],
      lat: latitude,
      lon: longitude,
      limit: options.limit || 10
    };

    return this.post('/api/recommendations/search', requestData, {
      requireAuth: true
    });
  }
}

/**
 * Traditional Recommendation API service (existing)
 */
export class RecommendationService extends ApiService {
  /**
   * Get personalized recommendations
   */
  async getPersonalizedRecommendations(options = {}) {
    const params = new URLSearchParams({
      limit: (options.limit || 10).toString(),
      excludeBookmarked: (!options.includeBookmarked).toString()
    });

    try {
      // Try enhanced recommendations for authenticated users
      return await this.get(`/api/recommendations/enhanced?${params}`, {
        requireAuth: true
      });
    } catch (error) {
      // Fallback to contextual recommendations for guest users
      console.log('Enhanced recommendations failed, falling back to contextual recommendations');
      const contextualParams = new URLSearchParams({
        lat: '37.5665', // Default Seoul coordinates
        lon: '126.9780',
        limit: (options.limit || 10).toString(),
        query: '좋은 장소'
      });
      
      return await this.get(`/api/recommendations/contextual?${contextualParams}`, {
        requireAuth: false
      });
    }
  }

  /**
   * Get enhanced recommendations
   */
  async getEnhancedRecommendations(userId, options = {}) {
    const params = new URLSearchParams({
      userId: userId.toString(),
      limit: (options.limit || 10).toString(),
      includeExplanation: (options.includeExplanation || true).toString()
    });

    return this.get(`/api/recommendations/enhanced?${params}`, {
      requireAuth: true
    });
  }
}

/**
 * Places API service
 */
export class PlaceService extends ApiService {
  /**
   * Get place details by ID
   */
  async getPlaceById(placeId) {
    return this.get(`/api/places/${placeId}`, {
      requireAuth: false
    });
  }

  /**
   * Search places (legacy endpoint)
   */
  async searchPlaces(query, options = {}) {
    const params = new URLSearchParams({
      query,
      page: (options.page || 0).toString(),
      size: (options.size || 10).toString(),
      ...(options.sort && { sort: options.sort })
    });

    return this.get(`/api/places/search?${params}`, {
      requireAuth: false
    });
  }

  /**
   * Get nearby places
   */
  async getNearbyPlaces(latitude, longitude, options = {}) {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      radius: (options.radius || 1000).toString(),
      limit: (options.limit || 10).toString(),
      ...(options.category && { category: options.category })
    });

    return this.get(`/api/places/nearby?${params}`, {
      requireAuth: false
    });
  }

  /**
   * Get popular places
   */
  async getPopularPlaces(latitude, longitude, options = {}) {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      limit: (options.limit || 10).toString(),
    });

    try {
      // Try the popular places endpoint first
      return await this.get(`/api/places/popular?${params}`, {
        requireAuth: false
      });
    } catch (error) {
      console.warn('Popular places API failed, falling back to general places list:', error);
      // Fallback to general places list (which works)
      const fallbackParams = new URLSearchParams({
        page: '1',
        limit: (options.limit || 10).toString(),
        sort: 'popularity'
      });
      
      return await this.get(`/api/places?${fallbackParams}`, {
        requireAuth: false
      });
    }
  }
  
  /**
   * Get paginated places list
   */
  async getPlacesList(options = {}) {
    const params = new URLSearchParams({
      page: (options.page || 0).toString(),
      limit: (options.limit || 10).toString(),
      sort: options.sort || 'popularity'
    });
    
    return this.get(`/api/places/list?${params}`, {
      requireAuth: false
    });
  }
  
  /**
   * Get current time recommendations
   */
  async getCurrentTimeRecommendations(latitude, longitude, options = {}) {
    const params = new URLSearchParams({
      limit: (options.limit || 10).toString()
    });
    
    if (latitude && longitude) {
      params.append('latitude', latitude.toString());
      params.append('longitude', longitude.toString());
    }
    
    return this.get(`/api/places/current-time?${params}`, {
      requireAuth: false
    });
  }
}

/**
 * Bookmarks API service
 */
export class BookmarkService extends ApiService {
  /**
   * Toggle bookmark for a place
   */
  async toggleBookmark(placeId) {
    return this.post(`/api/bookmarks/toggle/${placeId}`, null, {
      requireAuth: true
    });
  }

  /**
   * Get user bookmarks
   */
  async getUserBookmarks(options = {}) {
    const params = new URLSearchParams({
      page: (options.page || 0).toString(),
      size: (options.size || 10).toString()
    });

    return this.get(`/api/bookmarks?${params}`, {
      requireAuth: true
    });
  }

  /**
   * Check if place is bookmarked
   */
  async isBookmarked(placeId) {
    return this.get(`/api/bookmarks/check/${placeId}`, {
      requireAuth: true
    });
  }
}

// Export service instances
export const weatherService = new WeatherService();
export const contextualRecommendationService = new ContextualRecommendationService();
export const recommendationService = new RecommendationService();
export const placeService = new PlaceService();
/**
 * Address API service for reverse geocoding
 */
export class AddressService extends ApiService {
  /**
   * Convert coordinates to address
   */
  async reverseGeocode(latitude, longitude) {
    return this.get(`/api/address/reverse?lat=${latitude}&lon=${longitude}`, {
      requireAuth: false
    });
  }
}

// Guest recommendation service for anonymous users
class GuestRecommendationService extends ApiService {
  constructor() {
    super();
  }

  /**
   * Get contextual recommendations for guest users
   */
  async getGuestRecommendations(latitude, longitude, options = {}) {
    const { limit = 10 } = options;
    
    console.log('GuestRecommendationService: Starting guest recommendations', { latitude, longitude, limit });
    
    try {
      // Get current time and weather context for better recommendations
      const hour = new Date().getHours();
      let query = '내 주변 좋은 곳';
      
      // Contextual query based on time
      if (hour >= 7 && hour < 11) {
        query = '아침에 좋은 카페나 브런치 맛집';
      } else if (hour >= 11 && hour < 14) {
        query = '점심 시간에 좋은 맛집이나 휴식공간';
      } else if (hour >= 14 && hour < 18) {
        query = '오후에 갈만한 카페나 공원';
      } else if (hour >= 18 && hour < 22) {
        query = '저녁에 즐길 수 있는 분위기 좋은 곳';
      } else {
        query = '밤에 갈 만한 늦은 시간까지 하는 곳';
      }

      console.log('GuestRecommendationService: Using query:', query);

      // Use contextual recommendations API (now public)
      console.log('GuestRecommendationService: Making API call with query:', query);
      const response = await contextualRecommendationService.getContextualRecommendations(query, latitude, longitude, options);
      
      console.log('GuestRecommendationService: API response success:', response.success);
      console.log('GuestRecommendationService: API response data type:', typeof response.data);
      console.log('GuestRecommendationService: API response:', response);
      
      if (response.success && response.data.places && response.data.places.length > 0) {
        console.log('GuestRecommendationService: Processing places data, count:', response.data.places.length);
        console.log('GuestRecommendationService: Sample place:', response.data.places[0]);
        
        const mappedPlaces = response.data.places.map(place => ({
          id: place.id,
          name: place.name,
          rating: place.rating || 4.0,
          location: place.category || place.location,
          image: place.imageUrl || place.images?.[0],
          isBookmarked: false,
          category: place.category,
          description: place.reasonWhy || `${place.category}`,
          distance: place.distanceM,
          weatherSuitability: place.weatherSuitability,
          reasonWhy: place.reasonWhy
        }));
        
        console.log('GuestRecommendationService: Mapped places count:', mappedPlaces.length);
        console.log('GuestRecommendationService: Sample mapped place:', mappedPlaces[0]);
        
        return {
          success: true,
          data: mappedPlaces, // Return array directly for HomePage compatibility
          message: `${mappedPlaces.length}개의 추천 장소를 찾았습니다`
        };
      } else {
        console.log('GuestRecommendationService: No places in response or invalid response');
        console.log('GuestRecommendationService: Response success:', response.success);
        console.log('GuestRecommendationService: Response data structure:', response.data);
      }
      
      return {
        success: true,
        data: [],
        message: '현재 추천 가능한 장소가 없습니다'
      };
      
    } catch (error) {
      console.error('Guest recommendations failed:', error);
      console.error('Error details:', error.message, error.status);
      
      return {
        success: false,
        data: [],
        message: `API 오류: ${error.message || 'Unknown error'}`
      };
    }
  }
}

// Export service instances
export const addressService = new AddressService();
export const bookmarkService = new BookmarkService();
export const guestRecommendationService = new GuestRecommendationService();

export default ApiService;