const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
        throw new Error(data.message || 'Login failed');
      }

      if (data.success) {
        this.setAuthData(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      throw error;
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
      throw new Error(data.message || 'Signup failed');
    }

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Signup failed');
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
      body: JSON.stringify({ refreshToken }),
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
    
    if (token) {
      try {
        await fetch(`${this.baseURL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
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
    try {
      // Try to create a guest session with backend for place access
      const response = await fetch(`${this.baseURL}/api/auth/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Backend provided guest token
          const guestUser = {
            ...data.data,
            isGuest: true
          };
          localStorage.setItem(this.userKey, JSON.stringify(guestUser));
          return guestUser;
        }
      }
    } catch (error) {
      console.warn('Failed to create backend guest session:', error);
      throw error;
    }
    
    // If we reach here, backend didn't provide proper guest session
    throw new Error('Guest session creation failed');
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