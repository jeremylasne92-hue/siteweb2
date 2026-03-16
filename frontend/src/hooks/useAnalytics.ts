import { useCallback } from 'react';
import { API_URL } from '../config/api';
import { hasAnalyticsConsent } from '../components/ui/CookieBanner';

// Generate or retrieve session ID from sessionStorage
function getSessionId(): string {
  let sid = sessionStorage.getItem('echo_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('echo_session_id', sid);
  }
  return sid;
}

// Capture UTM params from URL on first load and store in sessionStorage
function captureUtmParams(): void {
  if (sessionStorage.getItem('echo_utm_captured')) return;
  const params = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign'] as const;
  for (const key of utmKeys) {
    const val = params.get(key);
    if (val) sessionStorage.setItem(`echo_${key}`, val);
  }
  // Capture referrer on first load
  if (document.referrer && !document.referrer.includes(window.location.hostname)) {
    sessionStorage.setItem('echo_referrer', document.referrer);
  }
  sessionStorage.setItem('echo_utm_captured', '1');
}

// Initialize on module load
captureUtmParams();

function getTrackingContext() {
  return {
    session_id: getSessionId(),
    utm_source: sessionStorage.getItem('echo_utm_source') || undefined,
    utm_medium: sessionStorage.getItem('echo_utm_medium') || undefined,
    utm_campaign: sessionStorage.getItem('echo_utm_campaign') || undefined,
    referrer: sessionStorage.getItem('echo_referrer') || undefined,
  };
}

function sendEvent(payload: Record<string, unknown>) {
  const url = `${API_URL}/analytics/events`;
  try {
    if (typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Silent fail — analytics must never break the app
  }
}

/**
 * Hook for event tracking (GA4 + Internal DB).
 * Automatically includes session_id, UTM params, and referrer.
 */
export function useAnalytics() {
  const trackEvent = useCallback(
    (category: string, action: string, partnerId?: string, label?: string) => {
      // RGPD: no tracking without explicit consent
      if (!hasAnalyticsConsent()) return;

      // GA4
      if (typeof window.gtag === 'function') {
        window.gtag('event', action, {
          event_category: category,
          partner_id: partnerId,
          page_path: window.location.pathname,
        });
      }

      // Internal DB
      const ctx = getTrackingContext();
      sendEvent({
        category,
        action,
        path: window.location.pathname,
        partner_id: partnerId || undefined,
        label: label || undefined,
        ...ctx,
      });
    },
    []
  );

  const trackPageView = useCallback(() => {
    // RGPD: no tracking without explicit consent
    if (!hasAnalyticsConsent()) return;

    const ctx = getTrackingContext();
    sendEvent({
      category: 'page_view',
      action: 'view',
      path: window.location.pathname,
      ...ctx,
    });
  }, []);

  return { trackEvent, trackPageView };
}
