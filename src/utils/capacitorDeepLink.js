/**
 * Capacitor Deep Link Handler
 * Handles OAuth callbacks and other deep links in native apps
 */

import { Capacitor } from '@capacitor/core';

let appListenerRegistered = false;
let navigationCallback = null;

/**
 * Parse deep link URL and extract path and query parameters
 * @param {string} url - The deep link URL (e.g., com.mohe.app://oauth/kakao/callback?code=xxx)
 * @returns {Object} Parsed URL info
 */
function parseDeepLink(url) {
  try {
    // Handle custom scheme URLs (com.mohe.app://path)
    const customSchemeMatch = url.match(/^com\.mohe\.app:\/\/(.+)$/);
    if (customSchemeMatch) {
      const pathWithQuery = customSchemeMatch[1];
      const [path, queryString] = pathWithQuery.split('?');
      const searchParams = new URLSearchParams(queryString || '');

      return {
        path: '/' + path,
        searchParams,
        fullPath: '/' + pathWithQuery
      };
    }

    // Handle https URLs (Universal Links / App Links)
    const httpsUrl = new URL(url);
    return {
      path: httpsUrl.pathname,
      searchParams: httpsUrl.searchParams,
      fullPath: httpsUrl.pathname + httpsUrl.search
    };
  } catch (e) {
    console.error('Failed to parse deep link:', url, e);
    return null;
  }
}

/**
 * Check if URL is an OAuth callback
 * @param {string} path - The URL path
 * @returns {boolean}
 */
function isOAuthCallback(path) {
  return path.startsWith('/oauth/') && path.includes('/callback');
}

/**
 * Initialize deep link listener for Capacitor
 * @param {Function} navigate - React Router navigate function
 */
export async function initializeDeepLinkListener(navigate) {
  // Only run on native platforms
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  // Prevent duplicate registration
  if (appListenerRegistered) {
    navigationCallback = navigate;
    return;
  }

  navigationCallback = navigate;

  try {
    const { App } = await import('@capacitor/app');

    // Handle app opened via deep link (app was closed)
    const launchUrl = await App.getLaunchUrl();
    if (launchUrl?.url) {
      handleDeepLink(launchUrl.url);
    }

    // Handle deep links while app is running
    App.addListener('appUrlOpen', (event) => {
      console.log('Deep link received:', event.url);
      handleDeepLink(event.url);
    });

    appListenerRegistered = true;
    console.log('Deep link listener initialized');
  } catch (err) {
    console.error('Failed to initialize deep link listener:', err);
  }
}

/**
 * Handle incoming deep link
 * @param {string} url - The deep link URL
 */
async function handleDeepLink(url) {
  const parsed = parseDeepLink(url);
  if (!parsed) return;

  console.log('Handling deep link:', parsed);

  // Handle OAuth callbacks
  if (isOAuthCallback(parsed.path)) {
    // Close the browser first
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.close();
    } catch (e) {
      // Browser might already be closed
    }

    // Navigate to the OAuth callback route
    if (navigationCallback) {
      // Build the full path with query string
      const fullPath = parsed.path + '?' + parsed.searchParams.toString();
      navigationCallback(fullPath, { replace: true });
    }
    return;
  }

  // Handle other deep links
  if (navigationCallback) {
    navigationCallback(parsed.path, { replace: true });
  }
}

/**
 * Handle back button on Android
 * @param {Function} onBackPress - Callback for back button
 * @returns {Function} Cleanup function
 */
export async function setupAndroidBackButton(onBackPress) {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
    return () => {};
  }

  try {
    const { App } = await import('@capacitor/app');

    const listener = await App.addListener('backButton', ({ canGoBack }) => {
      onBackPress(canGoBack);
    });

    return () => {
      listener.remove();
    };
  } catch (e) {
    console.error('Failed to setup Android back button:', e);
    return () => {};
  }
}

export default {
  initializeDeepLinkListener,
  setupAndroidBackButton
};
