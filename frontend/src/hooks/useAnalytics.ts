import { useCallback } from 'react';
import { API_URL } from '../config/api';

/**
 * Hook for custom event tracking (GA4 + Internal DB).
 * Used for partner dashboard metrics and general user behavior.
 */
export function useAnalytics() {
  const trackEvent = useCallback(async (category: string, action: string, partnerId?: string) => {
    // 1. Google Analytics (if configured)
    if (typeof window.gtag === 'function') {
      window.gtag('event', action, {
        event_category: category,
        partner_id: partnerId,
        page_path: window.location.pathname
      });
    }

    // 2. Internal Analytics for Partner Dashboard (FR15)
    try {
      const payload = {
        category,
        action,
        path: window.location.pathname,
        partner_id: partnerId
      };
      
      const url = `${API_URL}/analytics/events`;
      
      // Use sendBeacon for better reliability on page unload
      if (typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } else {
        // Fallback to fetch
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(err => console.warn('Internal analytics fetch failed', err));
      }
    } catch (e) {
      console.warn('Analytics tracking failed', e);
    }
  }, []);

  return { trackEvent };
}
