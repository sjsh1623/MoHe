/**
 * WebView optimization utilities
 * These functions help ensure smooth performance in WebView environments
 */

// Prevent default WebView behaviors that might interfere with SPA
export const initializeWebViewOptimizations = () => {
  // Set initial body styles to prevent white flashes
  document.body.style.backgroundColor = 'white';
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.height = '100%';
  
  // Set html styles
  document.documentElement.style.backgroundColor = 'white';
  document.documentElement.style.height = '100%';
  
  // Disable context menu on long press (optional)
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG' || e.target.tagName === 'A') {
      e.preventDefault();
    }
  });

  // Prevent zoom on double tap for input elements
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  // Optimize scroll restoration
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  // Disable overscroll behavior
  document.body.style.overscrollBehavior = 'none';
  document.body.style.webkitOverflowScrolling = 'touch';
  
  // Prevent white flashes during navigation
  document.body.style.webkitBackfaceVisibility = 'hidden';
  document.body.style.backfaceVisibility = 'hidden';
  
  // Force GPU acceleration
  document.body.style.webkitTransform = 'translate3d(0,0,0)';
  document.body.style.transform = 'translate3d(0,0,0)';
};

// Preload critical routes for faster navigation
export const preloadRoute = async (routePath) => {
  try {
    // This would be where you could implement route-based code splitting preloading
    // For now, we'll just use a simple prefetch
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = routePath;
    document.head.appendChild(link);
  } catch (error) {
    console.warn('Route preload failed:', error);
  }
};

// Enhanced error boundary for WebView
export const handleWebViewError = (error, errorInfo) => {
  console.error('WebView Error:', error, errorInfo);
  
  // You could send analytics or crash reports here
  // For WebView, you might want to communicate back to the native app
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'error',
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo?.componentStack
    }));
  }
};

// Memory optimization - clean up unused resources
export const optimizeMemoryUsage = () => {
  // Force garbage collection if available (development only)
  if (window.gc && process.env.NODE_ENV === 'development') {
    window.gc();
  }
  
  // Clear any cached images that aren't currently visible
  const images = document.querySelectorAll('img[src]');
  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (!isVisible && img.dataset.originalSrc) {
      // This could be used with lazy loading implementation
      img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E';
    }
  });
};