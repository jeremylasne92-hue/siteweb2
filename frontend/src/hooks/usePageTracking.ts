import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from './useAnalytics';

/**
 * Track page views on every route change.
 * Sends to both GA4 and internal analytics DB.
 */
export function usePageTracking() {
  const location = useLocation();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    // GA4
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
    }

    // Internal DB
    trackPageView();
  }, [location, trackPageView]);
}
