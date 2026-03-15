# KPI BI Analytics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 14 KPIs (UTM tracking, session tracking, CTA events, admin dashboard) to measure launch impact starting March 20.

**Architecture:** Extend existing `analytics_events` collection with optional fields (session_id, utm_source/medium/campaign, referrer, label). Enrich `useAnalytics` hook with automatic session + UTM capture. Add admin aggregation endpoint and React dashboard page.

**Tech Stack:** FastAPI + MongoDB (Motor) backend, React + TypeScript + Recharts frontend, Vitest + Pytest tests.

---

### Task 1: Extend AnalyticsEventCreate model (backend)

**Files:**
- Modify: `backend/models.py` (AnalyticsEventCreate class, around line 283)

**Step 1: Add optional fields to AnalyticsEventCreate**

In `backend/models.py`, find:

```python
class AnalyticsEventCreate(BaseModel):
    category: str = Field(min_length=1, max_length=50)
    action: str = Field(min_length=1, max_length=50)
    path: str = Field(min_length=1, max_length=200)
    partner_id: Optional[str] = None
```

Replace with:

```python
class AnalyticsEventCreate(BaseModel):
    category: str = Field(min_length=1, max_length=50)
    action: str = Field(min_length=1, max_length=50)
    path: str = Field(min_length=1, max_length=200)
    partner_id: Optional[str] = None
    session_id: Optional[str] = Field(None, max_length=36)
    utm_source: Optional[str] = Field(None, max_length=100)
    utm_medium: Optional[str] = Field(None, max_length=100)
    utm_campaign: Optional[str] = Field(None, max_length=200)
    referrer: Optional[str] = Field(None, max_length=500)
    label: Optional[str] = Field(None, max_length=100)
```

**Step 2: Run backend tests to verify no regression**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All existing tests PASS (model is backward-compatible, all new fields are Optional)

**Step 3: Commit**

```bash
git add backend/models.py
git commit -m "feat: extend AnalyticsEventCreate with session_id, UTM, referrer, label fields"
```

---

### Task 2: Add MongoDB indexes for analytics queries (backend)

**Files:**
- Modify: `backend/server.py` (startup_indexes function)

**Step 1: Add analytics indexes in startup_indexes**

In `backend/server.py`, find the member profiles indexes block and add AFTER it (before the final logger.info):

```python
    # Analytics query indexes
    try:
        await db.analytics_events.create_index([("category", 1), ("action", 1)])
        await db.analytics_events.create_index("path")
        await db.analytics_events.create_index("session_id")
    except Exception as e:
        logger.warning(f"Analytics index creation: {e}")
```

Note: `created_at` index already exists (TTL index).

**Step 2: Run backend tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add backend/server.py
git commit -m "feat: add MongoDB indexes for analytics queries (category+action, path, session_id)"
```

---

### Task 3: Admin analytics dashboard endpoint (backend)

**Files:**
- Modify: `backend/routes/analytics.py`
- Test: `backend/tests/routes/test_analytics_dashboard.py` (create)

**Step 1: Write failing tests**

Create `backend/tests/routes/test_analytics_dashboard.py`:

```python
import pytest
from httpx import AsyncClient, ASGITransport
from server import app


@pytest.fixture
def admin_headers():
    """Headers for admin user (cookie-based auth mock)."""
    return {}


@pytest.mark.asyncio
async def test_analytics_dashboard_returns_structure():
    """Dashboard endpoint returns the expected JSON structure."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login as admin first
        await client.post("/api/auth/register", json={
            "email": "admin-analytics@test.com",
            "username": "admin_analytics",
            "password": "Test1234!",
        })
        # Set admin role directly
        await app.db.users.update_one(
            {"email": "admin-analytics@test.com"},
            {"$set": {"role": "admin"}}
        )
        login_resp = await client.post("/api/auth/login-local", json={
            "email": "admin-analytics@test.com",
            "password": "Test1234!",
        })

        resp = await client.get("/api/analytics/admin/dashboard?period=7")
        assert resp.status_code == 200
        data = resp.json()

        # Verify top-level structure
        assert "period_days" in data
        assert "acquisition" in data
        assert "engagement" in data
        assert "conversion" in data
        assert "partners" in data

        # Verify acquisition sub-keys
        acq = data["acquisition"]
        assert "total_visits" in acq
        assert "unique_sessions" in acq
        assert "by_source" in acq
        assert "by_landing_page" in acq
        assert "bounce_rate" in acq

        # Verify conversion sub-keys
        conv = data["conversion"]
        assert "registrations" in conv
        assert "volunteers" in conv
        assert "partner_applications" in conv
        assert "contact_submissions" in conv


@pytest.mark.asyncio
async def test_analytics_dashboard_requires_admin():
    """Dashboard endpoint rejects non-admin users."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/analytics/admin/dashboard?period=7")
        assert resp.status_code in [401, 403]
```

**Step 2: Run tests to verify they fail**

Run: `cd backend && python -m pytest tests/routes/test_analytics_dashboard.py -p no:recording -v`
Expected: FAIL (endpoint does not exist)

**Step 3: Implement the admin dashboard endpoint**

Add to `backend/routes/analytics.py`, after the `get_public_stats` function:

```python
from datetime import datetime, timedelta
import asyncio


@router.get("/admin/dashboard")
async def get_admin_dashboard(request: Request, period: int = 7):
    """
    Admin-only analytics dashboard with KPIs.
    Returns acquisition, engagement, conversion, and partner metrics.
    """
    # Auth check
    from routes.auth import get_current_user_optional
    token = request.cookies.get("session_token")
    if not token:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = await request.app.db.users.find_one({"session_token": token})
    if not user or user.get("role") != "admin":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admin access required")

    db = request.app.db
    cutoff = datetime.utcnow() - timedelta(days=period)

    # Run all queries in parallel
    (
        page_views,
        cta_clicks,
        utm_sources,
        landing_pages,
        session_data,
        users_count,
        volunteers_count,
        partners_count,
        scenaristes_count,
        helloasso_clicks,
        contact_count,
        partner_views,
        partner_clicks,
        partners_total,
        partners_approved,
    ) = await asyncio.gather(
        # Page views (total)
        db.analytics_events.count_documents({
            "category": "page_view", "created_at": {"$gte": cutoff}
        }),
        # CTA clicks
        db.analytics_events.find(
            {"category": "cta_click", "created_at": {"$gte": cutoff}}
        ).to_list(None),
        # UTM sources
        db.analytics_events.aggregate([
            {"$match": {"utm_source": {"$ne": None}, "created_at": {"$gte": cutoff}}},
            {"$group": {"_id": "$utm_source", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10},
        ]).to_list(None),
        # Landing pages (first page_view per session)
        db.analytics_events.aggregate([
            {"$match": {"category": "page_view", "session_id": {"$ne": None}, "created_at": {"$gte": cutoff}}},
            {"$sort": {"created_at": 1}},
            {"$group": {"_id": "$session_id", "path": {"$first": "$path"}}},
            {"$group": {"_id": "$path", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10},
        ]).to_list(None),
        # Session data (for bounce rate + pages/session)
        db.analytics_events.aggregate([
            {"$match": {"category": "page_view", "session_id": {"$ne": None}, "created_at": {"$gte": cutoff}}},
            {"$group": {"_id": "$session_id", "page_count": {"$sum": 1}}},
        ]).to_list(None),
        # Conversion: registrations in period
        db.users.count_documents({"created_at": {"$gte": cutoff}, "role": {"$ne": "admin"}}),
        # Conversion: volunteers
        db.volunteers.count_documents({"created_at": {"$gte": cutoff}}),
        # Conversion: partner applications
        db.partners.count_documents({"created_at": {"$gte": cutoff}}),
        # Conversion: scenariste candidatures
        db.tech_candidatures.count_documents({"project": "scenariste", "created_at": {"$gte": cutoff}}),
        # Conversion: HelloAsso clicks
        db.analytics_events.count_documents({
            "category": "cta_click",
            "action": {"$regex": "^soutenir_helloasso"},
            "created_at": {"$gte": cutoff},
        }),
        # Conversion: contact submissions
        db.contact_messages.count_documents({"created_at": {"$gte": cutoff}}),
        # Partner: profile views
        db.analytics_events.count_documents({
            "action": "partner_view", "created_at": {"$gte": cutoff}
        }),
        # Partner: website clicks
        db.analytics_events.count_documents({
            "action": "partner_click_website", "created_at": {"$gte": cutoff}
        }),
        # Partner totals
        db.partners.count_documents({}),
        db.partners.count_documents({"status": "approved"}),
    )

    # Compute session metrics
    unique_sessions = len(session_data)
    bounce_sessions = sum(1 for s in session_data if s["page_count"] == 1)
    bounce_rate = round(bounce_sessions / unique_sessions, 2) if unique_sessions > 0 else 0
    avg_pages = round(sum(s["page_count"] for s in session_data) / unique_sessions, 1) if unique_sessions > 0 else 0

    # Top pages
    top_pages_agg = await db.analytics_events.aggregate([
        {"$match": {"category": "page_view", "created_at": {"$gte": cutoff}}},
        {"$group": {"_id": "$path", "views": {"$sum": 1}}},
        {"$sort": {"views": -1}},
        {"$limit": 10},
    ]).to_list(None)

    # Top CTAs
    cta_summary = {}
    for click in cta_clicks:
        lbl = click.get("label") or click.get("action", "unknown")
        cta_summary[lbl] = cta_summary.get(lbl, 0) + 1
    top_ctas = sorted(
        [{"label": k, "clicks": v} for k, v in cta_summary.items()],
        key=lambda x: x["clicks"], reverse=True
    )[:10]

    return {
        "period_days": period,
        "acquisition": {
            "total_visits": page_views,
            "unique_sessions": unique_sessions,
            "by_source": [{"source": s["_id"], "count": s["count"]} for s in utm_sources],
            "by_landing_page": [{"path": lp["_id"], "count": lp["count"]} for lp in landing_pages],
            "bounce_rate": bounce_rate,
        },
        "engagement": {
            "avg_pages_per_session": avg_pages,
            "top_pages": [{"path": p["_id"], "views": p["views"]} for p in top_pages_agg],
            "top_ctas": top_ctas,
        },
        "conversion": {
            "registrations": users_count,
            "volunteers": volunteers_count,
            "partner_applications": partners_count,
            "scenariste_applications": scenaristes_count,
            "helloasso_clicks": helloasso_clicks,
            "contact_submissions": contact_count,
        },
        "partners": {
            "total_profile_views": partner_views,
            "total_website_clicks": partner_clicks,
            "conversion_rate": round(partners_approved / partners_total, 2) if partners_total > 0 else 0,
        },
    }
```

**Step 4: Run tests to verify they pass**

Run: `cd backend && python -m pytest tests/routes/test_analytics_dashboard.py -p no:recording -v`
Expected: PASS

**Step 5: Run all backend tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests PASS

**Step 6: Commit**

```bash
git add backend/routes/analytics.py backend/tests/routes/test_analytics_dashboard.py
git commit -m "feat: add admin analytics dashboard endpoint with 14 KPIs"
```

---

### Task 4: Enrich useAnalytics hook (frontend)

**Files:**
- Modify: `frontend/src/hooks/useAnalytics.ts`
- Modify: `frontend/src/hooks/usePageTracking.ts`

**Step 1: Rewrite useAnalytics.ts with UTM + session_id + trackPageView**

Replace the entire contents of `frontend/src/hooks/useAnalytics.ts` with:

```typescript
import { useCallback } from 'react';
import { API_URL } from '../config/api';

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
```

**Step 2: Update usePageTracking.ts to also track page views internally**

Replace the entire contents of `frontend/src/hooks/usePageTracking.ts` with:

```typescript
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
```

**Step 3: Run frontend lint**

Run: `cd frontend && npx eslint src/hooks/useAnalytics.ts src/hooks/usePageTracking.ts`
Expected: No errors

**Step 4: Run frontend tests**

Run: `cd frontend && npx vitest run`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add frontend/src/hooks/useAnalytics.ts frontend/src/hooks/usePageTracking.ts
git commit -m "feat: enrich useAnalytics with session_id, UTM tracking, and internal page_view"
```

---

### Task 5: Instrument CTA events across pages (frontend)

**Files:**
- Modify: `frontend/src/pages/Home.tsx`
- Modify: `frontend/src/pages/Mouvement.tsx`
- Modify: `frontend/src/pages/Serie.tsx`
- Modify: `frontend/src/pages/Soutenir.tsx` (or Support.tsx)
- Modify: `frontend/src/pages/ECHOSystem.tsx` (or PartnersPage.tsx)

**Step 1: Add trackEvent calls to CTA buttons**

For each page, import `useAnalytics` and add `trackEvent('cta_click', 'action_name')` to onClick handlers.

**Home.tsx** — Find each CTA `<Link>` or `<Button>` and wrap/add:
```typescript
const { trackEvent } = useAnalytics();

// On "Découvrir la Série" button:
onClick={() => trackEvent('cta_click', 'home_decouvrir_serie')}

// On "Rejoindre le Mouvement" button:
onClick={() => trackEvent('cta_click', 'home_rejoindre')}
```

**Mouvement.tsx** — On "Rejoindre le Mouvement" CTA:
```typescript
const { trackEvent } = useAnalytics();

// On the CTA button (already has onClick for volunteer form):
onClick={() => { trackEvent('cta_click', 'mouvement_rejoindre'); setShowVolunteerForm(true); }}
```

**Serie.tsx** — On scenariste candidature CTA:
```typescript
const { trackEvent } = useAnalytics();

// On scenariste button:
onClick={() => { trackEvent('cta_click', 'serie_candidature_scenariste'); /* existing handler */ }}
```

**Soutenir page** — On each HelloAsso link:
```typescript
const { trackEvent } = useAnalytics();

// On each donation tier link:
onClick={() => trackEvent('cta_click', 'soutenir_helloasso_graine')}
onClick={() => trackEvent('cta_click', 'soutenir_helloasso_racine')}
onClick={() => trackEvent('cta_click', 'soutenir_helloasso_canopee')}
```

**ECHOSystem/PartnersPage** — On "Devenir Partenaire" CTA:
```typescript
const { trackEvent } = useAnalytics();

// On partner application button:
onClick={() => trackEvent('cta_click', 'echosystem_candidature')}
```

**Step 2: Run frontend lint**

Run: `cd frontend && npx eslint .`
Expected: No errors

**Step 3: Run frontend tests**

Run: `cd frontend && npx vitest run`
Expected: All tests PASS

**Step 4: Commit**

```bash
git add frontend/src/pages/Home.tsx frontend/src/pages/Mouvement.tsx frontend/src/pages/Serie.tsx frontend/src/pages/Soutenir.tsx frontend/src/pages/ECHOSystem.tsx
git commit -m "feat: instrument CTA click tracking across all main pages"
```

Note: Adapt file names to actual files in the project (some may be named differently like `Support.tsx` or `PartnersPage.tsx`). Check with `ls frontend/src/pages/`.

---

### Task 6: Admin Analytics Dashboard page (frontend)

**Files:**
- Create: `frontend/src/pages/AdminAnalytics.tsx`
- Modify: `frontend/src/App.tsx` (add route)
- Modify: `frontend/src/config/api.ts` (add ANALYTICS_API)

**Step 1: Add API constant**

In `frontend/src/config/api.ts`, add:
```typescript
export const ANALYTICS_API = `${API_URL}/analytics`;
```

**Step 2: Create AdminAnalytics.tsx**

Create `frontend/src/pages/AdminAnalytics.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { ANALYTICS_API } from '../config/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardData {
  period_days: number;
  acquisition: {
    total_visits: number;
    unique_sessions: number;
    by_source: { source: string; count: number }[];
    by_landing_page: { path: string; count: number }[];
    bounce_rate: number;
  };
  engagement: {
    avg_pages_per_session: number;
    top_pages: { path: string; views: number }[];
    top_ctas: { label: string; clicks: number }[];
  };
  conversion: {
    registrations: number;
    volunteers: number;
    partner_applications: number;
    scenariste_applications: number;
    helloasso_clicks: number;
    contact_submissions: number;
  };
  partners: {
    total_profile_views: number;
    total_website_clicks: number;
    conversion_rate: number;
  };
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-stone-900 border border-white/10 rounded-xl p-4 sm:p-6">
      <p className="text-stone-400 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-stone-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export function AdminAnalytics() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${ANALYTICS_API}/admin/dashboard?period=${period}`, { credentials: 'include' })
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div className="p-8 text-stone-400">Chargement...</div>;
  if (!data) return <div className="p-8 text-red-400">Erreur de chargement</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <div className="flex gap-2">
          {[7, 14, 30].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-sm ${
                period === p
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
              }`}
            >
              {p}j
            </button>
          ))}
        </div>
      </div>

      {/* Acquisition */}
      <h2 className="text-lg font-semibold text-amber-500 mb-4">Acquisition</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Visites totales" value={data.acquisition.total_visits} />
        <StatCard label="Sessions uniques" value={data.acquisition.unique_sessions} />
        <StatCard label="Taux de rebond" value={`${Math.round(data.acquisition.bounce_rate * 100)}%`} />
        <StatCard label="Pages/session" value={data.engagement.avg_pages_per_session} />
      </div>

      {/* Sources */}
      {data.acquisition.by_source.length > 0 && (
        <div className="bg-stone-900 border border-white/10 rounded-xl p-4 sm:p-6 mb-8">
          <h3 className="text-white font-semibold mb-3">Sources d'acquisition</h3>
          <div className="space-y-2">
            {data.acquisition.by_source.map(s => (
              <div key={s.source} className="flex justify-between text-sm">
                <span className="text-stone-300">{s.source}</span>
                <span className="text-amber-500 font-mono">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement */}
      <h2 className="text-lg font-semibold text-amber-500 mb-4">Engagement</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Top pages */}
        <div className="bg-stone-900 border border-white/10 rounded-xl p-4 sm:p-6">
          <h3 className="text-white font-semibold mb-3">Top pages</h3>
          <div className="space-y-2">
            {data.engagement.top_pages.slice(0, 8).map(p => (
              <div key={p.path} className="flex justify-between text-sm">
                <span className="text-stone-300 truncate mr-4">{p.path}</span>
                <span className="text-amber-500 font-mono shrink-0">{p.views}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Top CTAs */}
        <div className="bg-stone-900 border border-white/10 rounded-xl p-4 sm:p-6">
          <h3 className="text-white font-semibold mb-3">Top CTAs</h3>
          <div className="space-y-2">
            {data.engagement.top_ctas.slice(0, 8).map(c => (
              <div key={c.label} className="flex justify-between text-sm">
                <span className="text-stone-300 truncate mr-4">{c.label}</span>
                <span className="text-amber-500 font-mono shrink-0">{c.clicks}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion */}
      <h2 className="text-lg font-semibold text-amber-500 mb-4">Conversion</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Inscriptions" value={data.conversion.registrations} />
        <StatCard label="Bénévoles" value={data.conversion.volunteers} />
        <StatCard label="Partenaires" value={data.conversion.partner_applications} />
        <StatCard label="Scénaristes" value={data.conversion.scenariste_applications} />
        <StatCard label="Clics HelloAsso" value={data.conversion.helloasso_clicks} />
        <StatCard label="Messages contact" value={data.conversion.contact_submissions} />
      </div>

      {/* Partners */}
      <h2 className="text-lg font-semibold text-amber-500 mb-4">Partenaires</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Vues profils" value={data.partners.total_profile_views} />
        <StatCard label="Clics sites" value={data.partners.total_website_clicks} />
        <StatCard label="Taux conversion" value={`${Math.round(data.partners.conversion_rate * 100)}%`} />
      </div>
    </div>
  );
}
```

**Step 3: Add route in App.tsx**

In `frontend/src/App.tsx`, add the import at the top:
```typescript
import { AdminAnalytics } from './pages/AdminAnalytics';
```

Add the route alongside other admin routes:
```typescript
<Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>} />
```

**Step 4: Run frontend lint**

Run: `cd frontend && npx eslint .`
Expected: No errors

**Step 5: Run frontend build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add frontend/src/pages/AdminAnalytics.tsx frontend/src/config/api.ts frontend/src/App.tsx
git commit -m "feat: add admin analytics dashboard page with KPI cards and period selector"
```

---

### Task 7: Final verification

**Step 1: Run full backend test suite**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests PASS

**Step 2: Run full frontend test suite**

Run: `cd frontend && npx vitest run`
Expected: All tests PASS

**Step 3: Run frontend build**

Run: `cd frontend && npm run build`
Expected: Build succeeds with no TS errors

**Step 4: Commit any remaining fixes**

If any fixes were needed, commit them.

**Step 5: Final commit with all changes**

```bash
git add -A
git commit -m "chore: final verification — KPI BI analytics system complete"
```
