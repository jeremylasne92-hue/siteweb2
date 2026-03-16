import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from './useAnalytics';
import { hasAnalyticsConsent } from '../components/ui/CookieBanner';

/**
 * Track page views on every route change.
 * Sends to both GA4 and internal analytics DB.
 * Respects RGPD consent — no tracking until user accepts.
 */
export function usePageTracking() {
  const location = useLocation();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    // RGPD: no tracking without explicit consent
    if (!hasAnalyticsConsent()) return;

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
