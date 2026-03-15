# Systeme KPIs BI ECHO — Design Document

**Date** : 2026-03-15
**Approche** : B (BI-ready)
**Effort estime** : ~5-6h
**Contexte** : Lancement 20 mars 2026, 5000 visiteurs attendus (reseaux sociaux, presse, evenements, mailing list)

## Objectif

Mettre en place un systeme de 14 KPIs repartis en 4 categories (Acquisition, Engagement, Conversion, Partenaires) pour mesurer l'impact du lancement et fournir des preuves d'impact aux financeurs et partenaires.

## Architecture

### Principe

Enrichir le systeme analytics existant (`analytics_events` MongoDB + `useAnalytics` hook) sans creer de nouvelles collections. Tous les nouveaux champs sont optionnels pour la retrocompatibilite.

### Conformite RGPD

- Session ID via `sessionStorage` (PAS un cookie, pas de consentement requis)
- UTM : parametres URL, aucun enjeu RGPD
- Pas de tracking IP (deja le cas)
- GA4 cookieless confirme conforme par audit RGPD du 2026-03-15

## 1. Modele de donnees — Extension AnalyticsEventCreate

Champs ajoutes (tous optionnels) :

```python
class AnalyticsEventCreate(BaseModel):
    category: str           # existant
    action: str             # existant
    path: str               # existant
    partner_id: str | None  # existant
    # --- NOUVEAUX ---
    session_id: str | None  # sessionStorage UUID
    utm_source: str | None  # google, facebook, instagram, newsletter...
    utm_medium: str | None  # social, email, cpc, referral...
    utm_campaign: str | None # lancement-mars-2026
    referrer: str | None    # document.referrer
    label: str | None       # nom du CTA clique
```

## 2. Index MongoDB

```python
analytics_events.create_index("created_at")
analytics_events.create_index([("category", 1), ("action", 1)])
analytics_events.create_index("path")
analytics_events.create_index("session_id")
```

## 3. Frontend — useAnalytics.ts enrichi

- Premier chargement : capturer UTM de `window.location.search`, stocker en `sessionStorage`
- Generer `session_id` UUID en `sessionStorage`
- Chaque `trackEvent` inclut automatiquement `session_id`, UTM, `referrer`, `path`
- Nouveau : `trackPageView()` appele a chaque navigation (DB interne + GA4)

## 4. Events CTA a instrumenter

| Page | Bouton | category / action |
|------|--------|-------------------|
| Home | Decouvrir la Serie | `cta_click` / `home_decouvrir_serie` |
| Home | Rejoindre le Mouvement | `cta_click` / `home_rejoindre` |
| Mouvement | Rejoindre le Mouvement | `cta_click` / `mouvement_rejoindre` |
| Serie | Candidature Scenariste | `cta_click` / `serie_candidature_scenariste` |
| Soutenir | Chaque palier HelloAsso | `cta_click` / `soutenir_helloasso_{palier}` |
| ECHOSystem | Devenir Partenaire | `cta_click` / `echosystem_candidature` |
| Header | Inscription / Connexion | `cta_click` / `header_inscription` / `header_connexion` |

## 5. Backend — Endpoint admin dashboard

`GET /api/admin/analytics-dashboard?period=7` (admin only)

```json
{
  "period_days": 7,
  "acquisition": {
    "total_visits": 1234,
    "unique_sessions": 890,
    "by_source": [{"source": "instagram", "count": 450}],
    "by_landing_page": [{"path": "/", "count": 600}],
    "bounce_rate": 0.35
  },
  "engagement": {
    "avg_pages_per_session": 3.2,
    "top_pages": [{"path": "/mouvement", "views": 800}],
    "top_ctas": [{"label": "home_rejoindre", "clicks": 120}]
  },
  "conversion": {
    "registrations": 45,
    "volunteers": 8,
    "partner_applications": 3,
    "scenariste_applications": 2,
    "helloasso_clicks": 15,
    "contact_submissions": 12
  },
  "partners": {
    "total_profile_views": 230,
    "total_website_clicks": 45,
    "conversion_rate": 0.12
  }
}
```

## 6. Frontend — Page AdminAnalytics.tsx

- 4 sections de cartes (Acquisition, Engagement, Conversion, Partenaires)
- Selecteur de periode (7j / 30j / personnalise)
- Graphiques Recharts (reutilisation lib existante)
- Route admin protegee

## 14 KPIs couverts

| # | KPI | Source | Nouveau code |
|---|-----|--------|-------------|
| 1 | Visiteurs uniques/jour | analytics_events (page_view + session_id distinct) | Oui |
| 2 | Source acquisition | analytics_events.utm_source | Oui |
| 3 | Landing page entree | analytics_events (1er page_view par session) | Oui |
| 4 | Taux de rebond | Sessions avec 1 seul page_view | Oui |
| 5 | Pages/session | Moyenne page_view par session_id | Oui |
| 6 | Top pages | analytics_events groupBy path | Oui (page_view interne) |
| 7 | Clics CTA | analytics_events (category=cta_click) | Oui |
| 8 | Temps sur page | Hors scope V1 (necessite beforeunload) | Non |
| 9 | Taux inscription | users.count / unique_sessions | Existant + agreg |
| 10 | Candidatures benevoles | volunteers.count | Existant |
| 11 | Candidatures partenaires | partners.count | Existant |
| 12 | Candidatures scenaristes | tech_candidatures.count (scenariste) | Existant |
| 13 | Clics HelloAsso | analytics_events (cta_click/soutenir_helloasso) | Oui |
| 14 | Soumissions contact | contact_messages.count | Existant |
| 15 | Vues fiches partenaires | analytics_events (partner_view) | Existant |
| 16 | Clics sites partenaires | analytics_events (partner_click_website) | Existant |
| 17 | Taux conversion partenaires | partners accepted / partners total | Existant |

## Fichiers concernes

- `backend/models.py` — Extension AnalyticsEventCreate
- `backend/routes/analytics.py` — Endpoint admin dashboard + accepter nouveaux champs
- `backend/server.py` — Index MongoDB au startup
- `frontend/src/hooks/useAnalytics.ts` — UTM, session_id, trackPageView
- `frontend/src/hooks/usePageTracking.ts` — Appel trackPageView
- `frontend/src/pages/AdminAnalytics.tsx` — Nouveau composant
- `frontend/src/pages/*.tsx` — trackEvent sur les CTAs (Home, Mouvement, Serie, Soutenir, ECHOSystem)
- `frontend/src/App.tsx` — Route admin analytics
