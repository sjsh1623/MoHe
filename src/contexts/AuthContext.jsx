import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '@/services/authService';

const AuthContext = createContext(null);

/**
 * AuthProvider handles authentication state and automatic token refresh
 */
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const refreshTimerRef = useRef(null);
  const isRefreshingRef = useRef(false);

  /**
   * Schedule token refresh before expiry
   */
  const scheduleTokenRefresh = useCallback(() => {
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    const token = authService.getToken();
    if (!token) return;

    const expiryTime = authService.getTokenExpiryTime(token);
    if (!expiryTime) return;

    // Calculate time until refresh (5 minutes before expiry)
    const now = Date.now();
    const refreshTime = expiryTime - (5 * 60 * 1000); // 5 minutes before expiry
    const delay = refreshTime - now;

    if (delay > 0) {
      console.log(`[AuthContext] Scheduling token refresh in ${Math.round(delay / 1000 / 60)} minutes`);
      refreshTimerRef.current = setTimeout(async () => {
        console.log('[AuthContext] Executing scheduled token refresh');
        if (isRefreshingRef.current) {
          console.log('[AuthContext] Already refreshing, skipping');
          return;
        }
        isRefreshingRef.current = true;
        try {
          await authService.refreshAccessToken();
          setUser(authService.getCurrentUser());
          scheduleTokenRefresh(); // Schedule next refresh
        } catch (error) {
          console.error('[AuthContext] Scheduled refresh failed:', error);
          // Don't immediately log out - retry after delay
          setTimeout(() => {
            if (!isRefreshingRef.current) {
              scheduleTokenRefresh();
            }
          }, 30000); // Retry after 30 seconds
        } finally {
          isRefreshingRef.current = false;
        }
      }, delay);
    } else {
      // Token already needs refresh - do it once, not in a loop
      if (isRefreshingRef.current) {
        console.log('[AuthContext] Already refreshing, skipping immediate refresh');
        return;
      }

      console.log('[AuthContext] Token needs immediate refresh');
      isRefreshingRef.current = true;

      authService.refreshAccessToken()
        .then(() => {
          setUser(authService.getCurrentUser());
          // Schedule next refresh with a minimum delay to prevent loops
          const newToken = authService.getToken();
          const newExpiryTime = authService.getTokenExpiryTime(newToken);
          if (newExpiryTime && (newExpiryTime - Date.now()) > 60000) {
            scheduleTokenRefresh();
          } else {
            console.warn('[AuthContext] New token still expiring soon, not rescheduling');
          }
        })
        .catch((error) => {
          console.error('[AuthContext] Immediate refresh failed:', error);
          // Don't immediately log out - let user continue until API calls fail
          // Only schedule a retry after some delay
          setTimeout(() => {
            if (!isRefreshingRef.current) {
              scheduleTokenRefresh();
            }
          }, 30000); // Retry after 30 seconds
        })
        .finally(() => {
          isRefreshingRef.current = false;
        });
    }
  }, []);

  /**
   * Initialize authentication state on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[AuthContext] Initializing authentication...');
      setIsLoading(true);

      try {
        const isValid = await authService.ensureValidToken();

        if (isValid) {
          console.log('[AuthContext] Valid token found');
          setIsAuthenticated(true);
          setUser(authService.getCurrentUser());
          scheduleTokenRefresh();
        } else {
          console.log('[AuthContext] No valid authentication');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('[AuthContext] Auth initialization error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Cleanup timer on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [scheduleTokenRefresh]);

  /**
   * Login handler
   */
  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password);
    setIsAuthenticated(true);
    setUser(authService.getCurrentUser());
    scheduleTokenRefresh();
    return result;
  }, [scheduleTokenRefresh]);

  /**
   * Logout handler
   */
  const logout = useCallback(async () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  /**
   * Refresh user data from server
   */
  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getUserProfile();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('[AuthContext] Failed to refresh user:', error);
      throw error;
    }
  }, []);

  /**
   * Update auth state after profile setup
   */
  const updateAuthState = useCallback(() => {
    setIsAuthenticated(authService.isAuthenticated());
    setUser(authService.getCurrentUser());
    scheduleTokenRefresh();
  }, [scheduleTokenRefresh]);

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    refreshUser,
    updateAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
