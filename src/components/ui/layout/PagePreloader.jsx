import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function PagePreloader({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      background: 'white'
    }}>
      {children}
    </div>
  );
}