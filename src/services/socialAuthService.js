/**
 * Social Authentication Service
 * Handles OAuth 2.0 flow for Kakao and Google login
 * Works in both web browser and Capacitor mobile app
 */

import { Capacitor } from '@capacitor/core';

// Dynamically import Browser to avoid build errors when not available
let Browser = null;
const loadBrowser = async () => {
  if (!Browser && Capacitor.isNativePlatform()) {
    try {
      const module = await import('@capacitor/browser');
      Browser = module.Browser;
    } catch (e) {
      console.warn('Capacitor Browser plugin not available');
    }
  }
  return Browser;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// OAuth configuration
const OAUTH_CONFIG = {
  kakao: {
    clientId: import.meta.env.VITE_KAKAO_CLIENT_ID || '',
    authUrl: 'https://kauth.kakao.com/oauth/authorize',
    scope: 'profile_nickname account_email',
  },
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'email profile',
  },
};

/**
 * Get the redirect URI based on platform
 */
const getRedirectUri = (provider) => {
  if (Capacitor.isNativePlatform()) {
    // For native apps, use the app scheme
    return `com.mohe.app://oauth/${provider}/callback`;
  }
  // For web, use the current origin
  return `${window.location.origin}/oauth/${provider}/callback`;
};

/**
 * Generate a random state for CSRF protection
 */
const generateState = () => {
  const array = new Uint32Array(2);
  crypto.getRandomValues(array);
  return array.join('');
};

/**
 * Store OAuth state for verification
 * Uses localStorage for Capacitor native apps (sessionStorage doesn't persist across browser switches)
 */
const storeOAuthState = (state, provider) => {
  const storage = Capacitor.isNativePlatform() ? localStorage : sessionStorage;
  storage.setItem('oauth_state', state);
  storage.setItem('oauth_provider', provider);
  storage.setItem('oauth_timestamp', Date.now().toString());
};

/**
 * Verify OAuth state
 * Includes timestamp check to prevent replay attacks (5 minute expiry)
 */
const verifyOAuthState = (state) => {
  const storage = Capacitor.isNativePlatform() ? localStorage : sessionStorage;
  const storedState = storage.getItem('oauth_state');
  const timestamp = storage.getItem('oauth_timestamp');

  // Check if state matches
  if (state !== storedState) {
    return false;
  }

  // Check if not expired (5 minutes)
  if (timestamp) {
    const elapsed = Date.now() - parseInt(timestamp, 10);
    if (elapsed > 5 * 60 * 1000) {
      return false;
    }
  }

  return true;
};

/**
 * Clear OAuth state
 */
const clearOAuthState = () => {
  // Clear from both storages to be safe
  sessionStorage.removeItem('oauth_state');
  sessionStorage.removeItem('oauth_provider');
  sessionStorage.removeItem('oauth_timestamp');
  localStorage.removeItem('oauth_state');
  localStorage.removeItem('oauth_provider');
  localStorage.removeItem('oauth_timestamp');
};

/**
 * Social Auth Service
 */
class SocialAuthService {
  /**
   * Initiate Kakao OAuth login
   */
  async loginWithKakao() {
    const config = OAUTH_CONFIG.kakao;
    if (!config.clientId) {
      throw new Error('Kakao Client ID is not configured');
    }

    const state = generateState();
    const redirectUri = getRedirectUri('kakao');
    storeOAuthState(state, 'kakao');

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scope,
      state: state,
    });

    const authUrl = `${config.authUrl}?${params.toString()}`;

    if (Capacitor.isNativePlatform()) {
      // Use Capacitor Browser for native platforms
      const browser = await loadBrowser();
      if (browser) {
        await browser.open({ url: authUrl });
      } else {
        window.location.href = authUrl;
      }
    } else {
      // For web, redirect in same window
      window.location.href = authUrl;
    }
  }

  /**
   * Initiate Google OAuth login
   */
  async loginWithGoogle() {
    const config = OAUTH_CONFIG.google;
    if (!config.clientId) {
      throw new Error('Google Client ID is not configured');
    }

    const state = generateState();
    const redirectUri = getRedirectUri('google');
    storeOAuthState(state, 'google');

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scope,
      state: state,
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `${config.authUrl}?${params.toString()}`;

    if (Capacitor.isNativePlatform()) {
      const browser = await loadBrowser();
      if (browser) {
        await browser.open({ url: authUrl });
      } else {
        window.location.href = authUrl;
      }
    } else {
      window.location.href = authUrl;
    }
  }

  /**
   * Handle OAuth callback
   * Called when user is redirected back from OAuth provider
   */
  async handleOAuthCallback(provider, code, state) {
    // Verify state to prevent CSRF
    if (!verifyOAuthState(state)) {
      clearOAuthState();
      throw new Error('Invalid OAuth state');
    }

    clearOAuthState();

    // Close the browser if on native platform
    if (Capacitor.isNativePlatform()) {
      try {
        const browser = await loadBrowser();
        if (browser) {
          await browser.close();
        }
      } catch (e) {
        // Browser might already be closed
      }
    }

    // Exchange code for tokens via backend
    const response = await fetch(`${API_BASE_URL}/api/auth/social/${provider}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        redirectUri: getRedirectUri(provider),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || `${provider} 로그인에 실패했습니다`);
    }

    return data.data;
  }

  /**
   * Link social account to existing user
   */
  async linkSocialAccount(provider, code, state) {
    if (!verifyOAuthState(state)) {
      clearOAuthState();
      throw new Error('Invalid OAuth state');
    }

    clearOAuthState();

    const { authService } = await import('./authService.js');
    const token = authService.getToken();

    if (!token) {
      throw new Error('로그인이 필요합니다');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/social/${provider}/link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        code,
        redirectUri: getRedirectUri(provider),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || '계정 연동에 실패했습니다');
    }

    return data.data;
  }

  /**
   * Unlink social account from existing user
   */
  async unlinkSocialAccount(provider) {
    const { authService } = await import('./authService.js');
    const token = authService.getToken();

    if (!token) {
      throw new Error('로그인이 필요합니다');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/social/${provider}/unlink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || '계정 연동 해제에 실패했습니다');
    }

    return data.data;
  }

  /**
   * Get linked social accounts for current user
   */
  async getLinkedAccounts() {
    const { authService } = await import('./authService.js');
    const token = authService.getToken();

    if (!token) {
      throw new Error('로그인이 필요합니다');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/social/linked`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || '연동된 계정 조회에 실패했습니다');
    }

    return data.data;
  }
}

export const socialAuthService = new SocialAuthService();
export default socialAuthService;
