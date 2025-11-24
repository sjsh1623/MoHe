const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const AUTH_ERROR_MESSAGES = {
  login: '이메일 또는 비밀번호가 일치하지 않습니다.',
  accountNotFound: '존재하지 않는 계정입니다.',
  signup: '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.',
};

const getLocalizedAuthError = (type, originalMessage = '') => {
  const fallback = AUTH_ERROR_MESSAGES[type] || AUTH_ERROR_MESSAGES.login;
  if (!originalMessage) return fallback;

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
    return AUTH_ERROR_MESSAGES.login;
  }

  if (
    normalized.includes('signup failed') ||
    normalized.includes('signup error') ||
    normalized.includes('registration failed')
  ) {
    return AUTH_ERROR_MESSAGES.signup;
  }

  // Default to unified login error message for any unhandled auth errors
  if (type === 'login') {
    return AUTH_ERROR_MESSAGES.login;
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
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Login with email or id and password
   */
  async login(id, password) {

    try {
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: id, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getLocalizedAuthError('login', data.message));
      }

      if (data.success) {
        this.setAuthData(data.data);
        return data.data;
      } else {
        throw new Error(getLocalizedAuthError('login', data.message));
      }
    } catch (error) {
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
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      this.clearAuthData();
      throw new Error(data.message || 'Token refresh failed');
    }

    if (data.success) {
      this.setAuthData(data.data);
      return data.data;
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
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }
    }

    this.clearAuthData();
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
