import { useState, useRef, useCallback } from 'react';

/**
 * Hook to manage API call states and prevent duplicate requests
 */
export const useApiState = (initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const activeRequests = useRef(new Set());

  const execute = useCallback(async (apiCall, requestId = 'default') => {
    // Prevent duplicate requests
    if (activeRequests.current.has(requestId)) {
      console.warn(`Request ${requestId} already in progress, skipping...`);
      return data;
    }

    try {
      activeRequests.current.add(requestId);
      setLoading(true);
      setError(null);

      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      console.error(`API call failed for ${requestId}:`, err);
      setError(err.message || 'API call failed');
      throw err;
    } finally {
      activeRequests.current.delete(requestId);
      setLoading(false);
    }
  }, [data]);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
    activeRequests.current.clear();
  }, [initialData]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    isRequesting: (requestId = 'default') => activeRequests.current.has(requestId)
  };
};

export default useApiState;