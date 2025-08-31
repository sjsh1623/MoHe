import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for handling geolocation with permission management
 */
export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState(null);

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000, // 5 minutes
    ...options
  };

  // Check geolocation permission status
  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) {
      return 'unsupported';
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setPermission(result.state);
      
      // Listen for permission changes
      result.onchange = () => {
        setPermission(result.state);
      };
      
      return result.state;
    } catch (err) {
      console.warn('Permission API not supported:', err);
      return 'unsupported';
    }
  }, []);

  // Get current position
  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      const err = {
        code: 'GEOLOCATION_NOT_SUPPORTED',
        message: '이 브라우저에서는 위치 서비스가 지원되지 않습니다.'
      };
      setError(err);
      return Promise.reject(err);
    }

    // Prevent multiple simultaneous requests
    if (loading) {
      return Promise.reject(new Error('Location request already in progress'));
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            address: null // Will be populated by address service
          };
          
          setLocation(locationData);
          setLoading(false);
          resolve(locationData);
        },
        (err) => {
          const errorInfo = {
            code: err.code,
            message: getGeolocationErrorMessage(err.code)
          };
          setError(errorInfo);
          setLoading(false);
          reject(errorInfo);
        },
        defaultOptions
      );
    });
  }, [defaultOptions]);

  // Request location permission and get position
  const requestLocation = useCallback(async () => {
    try {
      // Check permission first
      const permissionState = await checkPermission();
      
      if (permissionState === 'denied') {
        throw {
          code: 'PERMISSION_DENIED',
          message: '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.'
        };
      }

      // Get current position
      return await getCurrentPosition();
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [checkPermission, getCurrentPosition]);

  // Watch position changes
  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError({
        code: 'GEOLOCATION_NOT_SUPPORTED',
        message: '이 브라우저에서는 위치 서비스가 지원되지 않습니다.'
      });
      return null;
    }

    setLoading(true);
    setError(null);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          address: null
        };
        
        setLocation(locationData);
        setLoading(false);
      },
      (err) => {
        const errorInfo = {
          code: err.code,
          message: getGeolocationErrorMessage(err.code)
        };
        setError(errorInfo);
        setLoading(false);
      },
      defaultOptions
    );

    return watchId;
  }, [defaultOptions]);

  // Clear watch
  const clearWatch = useCallback((watchId) => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Initialize permission check on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    location,
    error,
    loading,
    permission,
    getCurrentPosition,
    requestLocation,
    watchPosition,
    clearWatch,
    checkPermission
  };
};

/**
 * Get human-readable error message for geolocation errors
 */
function getGeolocationErrorMessage(errorCode) {
  switch (errorCode) {
    case 1: // PERMISSION_DENIED
      return '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
    case 2: // POSITION_UNAVAILABLE
      return '현재 위치를 찾을 수 없습니다. 네트워크 연결을 확인해주세요.';
    case 3: // TIMEOUT
      return '위치 정보를 가져오는데 시간이 초과되었습니다. 다시 시도해주세요.';
    default:
      return '위치 정보를 가져오는 중 오류가 발생했습니다.';
  }
}

/**
 * Hook for reverse geocoding (address from coordinates)
 */
export const useReverseGeocoding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAddressFromCoordinates = useCallback(async (latitude, longitude) => {
    setLoading(true);
    setError(null);

    try {
      // Using browser's built-in reverse geocoding (if available)
      // In production, you might want to use a more reliable service
      if ('geolocation' in navigator && 'reverseGeocode' in navigator.geolocation) {
        // This is a hypothetical API, browsers don't typically have this
        // You would use a service like Google Maps Geocoding API or Kakao Maps API
        const response = await navigator.geolocation.reverseGeocode(latitude, longitude);
        setLoading(false);
        return response.address;
      }

      // Fallback: Use a free geocoding service or return formatted coordinates
      setLoading(false);
      return `위도 ${latitude.toFixed(4)}, 경도 ${longitude.toFixed(4)}`;
      
    } catch (err) {
      setError({
        code: 'REVERSE_GEOCODING_FAILED',
        message: '주소를 가져오는데 실패했습니다.'
      });
      setLoading(false);
      return null;
    }
  }, []);

  return {
    getAddressFromCoordinates,
    loading,
    error
  };
};

/**
 * Hook for location persistence in localStorage
 */
export const useLocationStorage = () => {
  const STORAGE_KEY = 'mohe_user_location';

  const saveLocation = useCallback((location) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...location,
        savedAt: Date.now()
      }));
    } catch (err) {
      console.warn('Failed to save location to localStorage:', err);
    }
  }, []);

  const getStoredLocation = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      const maxAge = 30 * 60 * 1000; // 30 minutes

      if (Date.now() - parsed.savedAt > maxAge) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return parsed;
    } catch (err) {
      console.warn('Failed to get stored location:', err);
      return null;
    }
  }, []);

  const clearStoredLocation = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear stored location:', err);
    }
  }, []);

  return {
    saveLocation,
    getStoredLocation,
    clearStoredLocation
  };
};

export default useGeolocation;