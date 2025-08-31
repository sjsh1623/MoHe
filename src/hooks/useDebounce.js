import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value.
 *
 * @param {any} value The value to debounce
 * @param {number} delay The debounce delay in milliseconds
 * @returns {any} The debounced value
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value or delay changes, or if the component unmounts
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
