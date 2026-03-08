import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Track page views in Google Analytics (GA4) on every route change.
 * Must be used inside a <Router> context.
 *
 * The gtag script is loaded in index.html with `send_page_view: false`
 * so that this hook controls all page_view events for the SPA.
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
    }
  }, [location]);
}
