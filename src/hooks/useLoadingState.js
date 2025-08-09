import { useState, useEffect } from 'react';

/**
 * Custom hook for managing loading states with minimum display duration
 * @param {boolean} isDataLoading - Whether data is still loading
 * @param {number} minLoadingTime - Minimum time to show skeleton (in ms)
 * @returns {boolean} - Whether to show skeleton loader
 */
export function useLoadingState(isDataLoading = true, minLoadingTime = 800) {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    if (!isDataLoading) {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      const timeoutId = setTimeout(() => {
        setShowSkeleton(false);
      }, remainingTime);

      return () => clearTimeout(timeoutId);
    }
  }, [isDataLoading, minLoadingTime, startTime]);

  return showSkeleton;
}

/**
 * Hook for simulating API loading states (for development)
 * @param {number} duration - Mock loading duration in ms
 * @returns {boolean} - Loading state
 */
export function useMockLoading(duration = 2000) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return isLoading;
}