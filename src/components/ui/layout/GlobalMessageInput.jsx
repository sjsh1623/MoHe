import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { contextualRecommendationService } from '@/services/apiService';
import { useGeolocation } from '@/hooks/useGeolocation';
import styles from '@/styles/components/layout/global-message-input.module.css';

// Routes where the message input should be shown
const VISIBLE_ROUTES = [
  '/search-results'
];

export default function GlobalMessageInput() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { location: userLocation } = useGeolocation();
  
  // Show message input only on specified routes
  const shouldShow = VISIBLE_ROUTES.includes(location.pathname);

  // Show message box after page content has rendered
  useEffect(() => {
    if (shouldShow) {
      const timer = setTimeout(() => {
        setShowMessageBox(true);
      }, 800); // Wait for page to fully render
      
      return () => clearTimeout(timer);
    } else {
      setShowMessageBox(false);
    }
  }, [shouldShow]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      // Get user location for contextual search
      let latitude = 37.5665; // Default Seoul coordinates
      let longitude = 126.9780;
      
      if (userLocation) {
        latitude = userLocation.latitude;
        longitude = userLocation.longitude;
      }

      // Perform contextual search
      const response = await contextualRecommendationService.getContextualRecommendations(
        message.trim(),
        latitude,
        longitude,
        { limit: 20 }
      );

      if (response.success) {
        // Navigate to search results with the query and results
        navigate('/search-results', {
          state: {
            query: message.trim(),
            results: response.data.places,
            searchContext: response.data.searchContext,
            isContextualSearch: true
          }
        });
      } else {
        console.error('Search failed:', response.message);
        // Still navigate to show empty results with the query
        navigate('/search-results', {
          state: {
            query: message.trim(),
            results: [],
            error: response.message || '검색에 실패했습니다.'
          }
        });
      }

      setMessage('');
    } catch (error) {
      console.error('Error performing contextual search:', error);
      
      // Navigate to search results even on error to show the user's query
      navigate('/search-results', {
        state: {
          query: message.trim(),
          results: [],
          error: '검색 중 오류가 발생했습니다. 다시 시도해주세요.'
        }
      });
      
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <AnimatePresence>
      {showMessageBox && (
        <motion.div
          className={styles.messageContainer}
          initial={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            x: 187, // Center the initial circle relative to final input width
          }}
          animate={{
            width: 400,
            height: 41,
            borderRadius: '20px',
            x: 0,
          }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94], // easeOutCubic
          }}
        >
          <motion.div
            className={styles.messageInputWrapper}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="어떤 장소를 찾고 계신가요?"
              className={styles.messageInput}
            />
            <button 
              className={styles.sendButton}
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
            >
              <svg width="19" height="18" viewBox="0 0 19 18" fill="none">
                <path d="M6.07531 5.01655L12.289 2.94533C15.0774 2.01584 16.5924 3.53815 15.6703 6.32661L13.599 12.5403C12.2085 16.7193 9.925 16.7193 8.53443 12.5403L7.91965 10.6959L6.07531 10.0812C1.89628 8.69058 1.89628 6.41444 6.07531 5.01655Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.05872 10.3816L10.6788 7.75415" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}