import React, { createContext, useContext, useState, useEffect } from 'react';

const UserPreferencesContext = createContext();

const STORAGE_KEYS = {
  MBTI: 'mohe_user_mbti',
  SPACE_PREFERENCES: 'mohe_user_space_preferences',
  AGE_RANGE: 'mohe_user_age_range',
  TRANSPORTATION: 'mohe_user_transportation'
};

export function UserPreferencesProvider({ children }) {
  // MBTI state (individual letters)
  const [mbtiState, setMbtiState] = useState({
    extroversion: '', // E or I
    sensing: '',      // S or N
    thinking: '',     // T or F
    judging: ''       // J or P
  });

  // Space preferences state
  const [spacePreferences, setSpacePreferences] = useState(new Set());

  // Age range state
  const [ageRange, setAgeRange] = useState('');

  // Transportation method state
  const [transportationMethod, setTransportationMethod] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      // Load MBTI
      const savedMBTI = localStorage.getItem(STORAGE_KEYS.MBTI);
      if (savedMBTI) {
        const parsed = JSON.parse(savedMBTI);
        setMbtiState(parsed);
      }

      // Load Space Preferences
      const savedSpaces = localStorage.getItem(STORAGE_KEYS.SPACE_PREFERENCES);
      if (savedSpaces) {
        const parsed = JSON.parse(savedSpaces);
        setSpacePreferences(new Set(parsed));
      }

      // Load Age Range
      const savedAge = localStorage.getItem(STORAGE_KEYS.AGE_RANGE);
      if (savedAge) {
        setAgeRange(savedAge);
      }

      // Load Transportation
      const savedTransportation = localStorage.getItem(STORAGE_KEYS.TRANSPORTATION);
      if (savedTransportation) {
        setTransportationMethod(savedTransportation);
      }
    } catch (error) {
      console.warn('Failed to load user preferences from localStorage:', error);
    }
  }, []);

  // Save MBTI to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MBTI, JSON.stringify(mbtiState));
    } catch (error) {
      console.warn('Failed to save MBTI to localStorage:', error);
    }
  }, [mbtiState]);

  // Save Space Preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SPACE_PREFERENCES, JSON.stringify(Array.from(spacePreferences)));
    } catch (error) {
      console.warn('Failed to save space preferences to localStorage:', error);
    }
  }, [spacePreferences]);

  // Save Age Range to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AGE_RANGE, ageRange);
    } catch (error) {
      console.warn('Failed to save age range to localStorage:', error);
    }
  }, [ageRange]);

  // Save Transportation to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSPORTATION, transportationMethod);
    } catch (error) {
      console.warn('Failed to save transportation to localStorage:', error);
    }
  }, [transportationMethod]);

  // MBTI helper functions
  const updateMBTILetter = (category, letter) => {
    setMbtiState(prev => {
      const newState = { ...prev };
      switch (category) {
        case 'EI':
          newState.extroversion = letter;
          break;
        case 'SN':
          newState.sensing = letter;
          break;
        case 'TF':
          newState.thinking = letter;
          break;
        case 'JP':
          newState.judging = letter;
          break;
      }
      return newState;
    });
  };

  const getMBTIString = () => {
    return mbtiState.extroversion + mbtiState.sensing + mbtiState.thinking + mbtiState.judging;
  };

  const isMBTIComplete = () => {
    return mbtiState.extroversion && mbtiState.sensing && mbtiState.thinking && mbtiState.judging;
  };

  // Space preferences helper functions
  const toggleSpacePreference = (spaceId) => {
    setSpacePreferences(prev => {
      const newSet = new Set(prev);
      if (newSet.has(spaceId)) {
        newSet.delete(spaceId);
      } else {
        newSet.add(spaceId);
      }
      return newSet;
    });
  };

  // Clear all preferences (useful for logout or reset)
  const clearPreferences = () => {
    setMbtiState({
      extroversion: '',
      sensing: '',
      thinking: '',
      judging: ''
    });
    setSpacePreferences(new Set());
    setAgeRange('');
    setTransportationMethod('');
    
    try {
      localStorage.removeItem(STORAGE_KEYS.MBTI);
      localStorage.removeItem(STORAGE_KEYS.SPACE_PREFERENCES);
      localStorage.removeItem(STORAGE_KEYS.AGE_RANGE);
      localStorage.removeItem(STORAGE_KEYS.TRANSPORTATION);
    } catch (error) {
      console.warn('Failed to clear preferences from localStorage:', error);
    }
  };

  const value = {
    // MBTI
    mbtiState,
    updateMBTILetter,
    getMBTIString,
    isMBTIComplete,

    // Space Preferences
    spacePreferences,
    toggleSpacePreference,
    setSpacePreferences,

    // Age Range
    ageRange,
    setAgeRange,

    // Transportation
    transportationMethod,
    setTransportationMethod,

    // Utility
    clearPreferences
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}