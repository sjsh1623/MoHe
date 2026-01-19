import i18n from '@/i18n';
import { Capacitor } from '@capacitor/core';

// Determine API base URL based on platform (same logic as apiService.js)
const getApiBaseUrl = () => {
  // For native platforms, always use absolute URL
  if (Capacitor.isNativePlatform()) {
    return 'https://mohe.today';
  }

  // For web, use environment variable or empty string for relative paths
  return import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : '';
};

const API_BASE_URL = getApiBaseUrl();

// Debug: Log the API base URL being used
console.log('🔐 Auth API Base URL:', API_BASE_URL || '(empty - using relative paths)',
  '| Platform:', Capacitor.getPlatform());

const getLocalizedAuthError = (type, originalMessage = '') => {
  if (!originalMessage) {
    return type === 'login'
      ? i18n.t('auth.login.errors.invalidCredentials')
      : i18n.t('auth.signup.errors.signupFailed');
  }

  const normalized = originalMessage.toLowerCase();

  // Handle all login-related errors with a unified message
  if (
    normalized.includes('login failed') ||
    normalized.includes('login error') ||
    normalized.includes('invalid credentials') ||
    normalized.includes('bad credentials') ||
    normalized.includes('사용자를 찾을 수 없습니다') ||
    normalized.includes('사용자') ||
    normalized.includes('비밀번호') ||
    normalized.includes('인증')
  ) {
    return i18n.t('auth.login.errors.invalidCredentials');
  }

  if (
    normalized.includes('signup failed') ||
    normalized.includes('signup error') ||
    normalized.includes('registration failed')
  ) {
    return i18n.t('auth.signup.errors.signupFailed');
  }

  // Default to unified login error message for any unhandled auth errors
  if (type === 'login') {
    return i18n.t('auth.login.errors.invalidCredentials');
  }

  return originalMessage;
};

/**
 * Authentication service for handling login, signup, and token management
 */
class AuthService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.tokenKey = 'authToken';
    this.refreshTokenKey = 'refreshToken';
    this.userKey = 'currentUser';
    this.isRefreshing = false; // Prevent multiple refresh attempts
    this.refreshPromise = null; // Store ongoing refresh promise
    this.TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // Refresh 5 minutes before expiry
  }

  /**
   * Decode JWT token without verification (client-side only)
   */
  decodeToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.error('[AuthService] Token decode error:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token) {
    if (!token) return true;

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();

    return now >= expiryTime;
  }

  /**
   * Check if token will expire soon (within threshold)
   */
  isTokenExpiringSoon(token) {
    if (!token) return true;

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const expiryTime = decoded.exp * 1000;
    const now = Date.now();

    return (expiryTime - now) <= this.TOKEN_REFRESH_THRESHOLD;
  }

  /**
   * Get token expiry time in milliseconds
   */
  getTokenExpiryTime(token) {
    if (!token) return null;

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return null;

    return decoded.exp * 1000;
  }

  /**
   * Get stored auth token
   */
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Get current user data
   */
  getCurrentUser() {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Store authentication data
   */
  setAuthData(authResponse) {
    if (authResponse.accessToken) {
      localStorage.setItem(this.tokenKey, authResponse.accessToken);
    }
    if (authResponse.refreshToken) {
      localStorage.setItem(this.refreshTokenKey, authResponse.refreshToken);
    }
    if (authResponse.user) {
      localStorage.setItem(this.userKey, JSON.stringify(authResponse.user));
    }
  }

  /**
   * Clear all auth data
   */
  clearAuthData() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  /**
   * Check if user is authenticated (token exists and not expired)
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();

    if (!token || !user) {
      return false;
    }

    // Check if token is expired
    if (this.isTokenExpired(token)) {
      console.log('[AuthService] Token is expired');
      return false;
    }

    return true;
  }

  /**
   * Ensure we have a valid token, refreshing if necessary
   * Returns true if we have a valid token, false otherwise
   */
  async ensureValidToken() {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    // No tokens at all
    if (!token && !refreshToken) {
      console.log('[AuthService] No tokens available');
      return false;
    }

    // Token exists and is valid
    if (token && !this.isTokenExpired(token)) {
      // Proactively refresh if expiring soon
      if (this.isTokenExpiringSoon(token) && refreshToken) {
        console.log('[AuthService] Token expiring soon, refreshing proactively');
        try {
          await this.refreshAccessToken();
        } catch (error) {
          console.warn('[AuthService] Proactive refresh failed:', error.message);
          // Continue with existing token if refresh fails but token is still valid
        }
      }
      return true;
    }

    // Token expired but we have refresh token
    if (refreshToken) {
      console.log('[AuthService] Token expired, attempting refresh');
      try {
        await this.refreshAccessToken();
        return true;
      } catch (error) {
        console.error('[AuthService] Token refresh failed:', error.message);
        this.clearAuthData();
        return false;
      }
    }

    // No valid authentication
    this.clearAuthData();
    return false;
  }

  /**
   * Login with email or id and password
   */
  async login(id, password) {
    console.log('[AuthService] Login attempt to:', `${this.baseURL}/api/auth/login`);
    console.log('[AuthService] Request payload:', { email: id, password: '***' });

    try {
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: id, password }),
      });

      console.log('[AuthService] Response status:', response.status);
      const data = await response.json();
      console.log('[AuthService] Response data:', data);

      if (!response.ok) {
        console.error('[AuthService] Login failed - response not ok:', data);
        throw new Error(getLocalizedAuthError('login', data.message));
      }

      if (data.success) {
        console.log('[AuthService] Login successful');
        this.setAuthData(data.data);
        return data.data;
      } else {
        console.error('[AuthService] Login failed - success=false:', data.message);
        throw new Error(getLocalizedAuthError('login', data.message));
      }
    } catch (error) {
      console.error('[AuthService] Login error caught:', error);
      throw new Error(getLocalizedAuthError('login', error.message));
    }
  }

  /**
   * Sign up with email
   */
  async signup(email) {
    const response = await fetch(`${this.baseURL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(getLocalizedAuthError('signup', data.message));
    }

    if (data.success) {
      return data.data;
    } else {
      throw new Error(getLocalizedAuthError('signup', data.message));
    }
  }

  /**
   * Verify email with OTP
   */
  async verifyEmail(tempUserId, otpCode) {
    const response = await fetch(`${this.baseURL}/api/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tempUserId, otpCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Email verification failed');
    }

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Email verification failed');
    }
  }

  /**
   * Check nickname availability
   */
  async checkNickname(nickname) {
    const response = await fetch(`${this.baseURL}/api/auth/check-nickname`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nickname }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Nickname check failed');
    }

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Nickname check failed');
    }
  }

  /**
   * Set up nickname and password
   */
  async setupProfile(tempUserId, nickname, password, termsAgreed = true) {
    const response = await fetch(`${this.baseURL}/api/auth/setup-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tempUserId, nickname, password, termsAgreed }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Profile setup failed');
    }

    if (data.success) {
      this.setAuthData(data.data);
      return data.data;
    } else {
      throw new Error(data.message || 'Profile setup failed');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken() {
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh(refreshToken);

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  async performTokenRefresh(refreshToken) {
    const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      this.clearAuthData();
      throw new Error(data.message || 'Token refresh failed');
    }

    if (data.success) {
      // Convert snake_case response to camelCase for setAuthData
      const tokenData = {
        accessToken: data.data.access_token || data.data.accessToken,
        refreshToken: data.data.refresh_token || data.data.refreshToken,
        expiresIn: data.data.expires_in || data.data.expiresIn,
      };
      this.setAuthData(tokenData);
      console.log('[AuthService] Token refresh successful');
      return tokenData;
    } else {
      this.clearAuthData();
      throw new Error(data.message || 'Token refresh failed');
    }
  }

  /**
   * Logout
   */
  async logout() {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (token && refreshToken) {
      try {
        await fetch(`${this.baseURL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: refreshToken }),
        });
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }
    }

    this.clearAuthData();
  }

  /**
   * Try to restore session using refresh token
   * Returns true if session restored successfully
   */
  async tryRestoreSession() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      console.log('[AuthService] Attempting to restore session with refresh token');
      await this.refreshAccessToken();

      // Get fresh user profile after token refresh
      const user = await this.getUserProfile();
      console.log('[AuthService] Session restored successfully:', user);
      return true;
    } catch (error) {
      console.log('[AuthService] Session restoration failed:', error.message);
      this.clearAuthData();
      return false;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile() {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${this.baseURL}/api/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token
        try {
          await this.refreshAccessToken();
          return this.getUserProfile(); // Retry with new token
        } catch (refreshError) {
          this.clearAuthData();
          throw new Error('Authentication expired');
        }
      }
      throw new Error(data.message || 'Failed to get user profile');
    }

    if (data.success) {
      // Update stored user data
      localStorage.setItem(this.userKey, JSON.stringify(data.data));
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to get user profile');
    }
  }

  /**
   * Create a guest session for unauthenticated users
   * Try to get a guest token from backend for limited access
   */
  async createGuestSession() {
    const guestUser = {
      id: 'guest',
      isGuest: true,
      roles: [],
    };
    localStorage.setItem(this.userKey, JSON.stringify(guestUser));
    return guestUser;
  }

  async forgotPassword(email) {
    const response = await fetch(`${this.baseURL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '비밀번호 재설정 요청에 실패했습니다');
    }

    if (!data.success) {
      throw new Error(data.message || '비밀번호 재설정 요청에 실패했습니다');
    }

    return data.data;
  }

  async resetPassword(token, password) {
    const response = await fetch(`${this.baseURL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || '비밀번호 재설정에 실패했습니다');
    }

    return data.data;
  }

  /**
   * Get user ID for API calls (handles both authenticated and guest users)
   */
  getUserId() {
    const user = this.getCurrentUser();
    return user ? user.id : 'guest';
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
