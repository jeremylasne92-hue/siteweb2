# 🌳 Mouvement ECHO — Plateforme Citoyenne

Plateforme web full-stack connectant le public à une série documentaire sur la transition écologique.
Lancement : **20 mars 2026**.

## Stack Technique

| Couche | Technologies |
|--------|-------------|
| **Frontend** | React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4 |
| **Backend** | FastAPI 0.110 + Python 3.11 + Motor 3.3 (async MongoDB) |
| **Base de données** | MongoDB |
| **Auth** | Cookie httpOnly + Google OAuth + 2FA |
| **Tests** | Vitest (frontend) + Pytest (backend) |
| **Déploiement** | Webstrator (static + API) |

## Installation

### Frontend

```bash
cd frontend
npm install
npm run dev        # Dev server (port 5173)
npm run build      # Build production
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### Variables d'environnement

**Backend** (`.env`) :
```env
MONGO_URL=mongodb://...
DB_NAME=echo_database
CORS_ORIGINS=https://mouvementecho.fr
SECRET_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SENDGRID_API_KEY=...
RECAPTCHA_SECRET_KEY=...
ENVIRONMENT=production
```

**Frontend** (`.env`) :
```env
VITE_API_URL=https://api.mouvementecho.fr
VITE_RECAPTCHA_SITE_KEY=...
```

## Commandes

```bash
# Tests frontend
cd frontend && npx vitest run

# Tests backend (flag -p no:recording OBLIGATOIRE)
cd backend && python -m pytest -p no:recording -q

# Lint
cd frontend && npx eslint .

# Build production
cd frontend && npm run build
```

## Structure du Projet

```
frontend/src/
├── pages/            # 29 pages (publiques + admin)
├── components/
│   ├── layout/       # Header, Footer, Layout
│   ├── ui/           # Button, Card, Input, Modal, CookieBanner, YouTubeEmbed...
│   ├── forms/        # Formulaires candidature (Tech, Scénariste, Bénévole)
│   ├── partners/     # Cartes, carte, filtres, analytics partenaires/membres
│   └── seo/          # SEO (meta), Breadcrumbs (JSON-LD)
├── features/auth/    # Auth complet (login, register, OAuth, 2FA, reset)
├── hooks/            # useAnalytics, usePageTracking, useUrlFilters
├── config/           # api.ts, booking.ts, donation.ts, candidatures.ts
├── utils/            # validation.ts, analytics.ts
└── types/            # member.ts

backend/
├── server.py         # Entry point FastAPI
├── models.py         # Pydantic models principaux
├── models_extended.py
├── models_partner.py
├── models_member.py
├── auth_utils.py
├── routes/           # 16 routers (auth, partners, members, events, analytics...)
├── services/         # Auth, password reset
├── utils/            # Rate limiting, geocoding, audit log
├── core/config.py    # Settings centralisé
└── tests/            # Pytest
```

## Pages Publiques

| Page | Route |
|------|-------|
| Accueil | `/` |
| La Série | `/serie` |
| Le Mouvement | `/mouvement` |
| CogniSphère | `/cognisphere` |
| ECHOLink | `/echolink` |
| ECHOSystem (Partenaires) | `/partenaires` |
| Événements | `/agenda` |
| Ressources | `/ressources` |
| Soutenir | `/soutenir` |
| Contact | `/contact` |
| FAQ | `/faq` |
| À propos | `/a-propos` |

## Pages Auth & Profil

| Page | Route |
|------|-------|
| Connexion | `/login` |
| Inscription | `/register` |
| Mot de passe oublié | `/forgot-password` |
| Reset mot de passe | `/reset-password` |
| Profil | `/profil` |
| Mes données (RGPD) | `/mes-donnees` |
| Mon compte partenaire | `/mon-compte/partenaire` |

## Pages Admin

| Page | Route |
|------|-------|
| Dashboard | `/admin` |
| Partenaires | `/admin/partenaires` |
| Candidatures | `/admin/candidatures` |
| Bénévoles | `/admin/benevoles` |
| Membres | `/admin/members` |
| Événements | `/admin/events` |
| Messages | `/admin/messages` |
| Analytics | `/admin/analytics` |
| Exports | `/admin/exports` |

## Architecture & Sécurité

- **Auth** : Cookie httpOnly uniquement — jamais de token en localStorage
- **CAPTCHA** : reCAPTCHA v3 server-side (skip si clé absente)
- **2FA** : 6 digits, CSPRNG (`secrets.choice`)
- **Rate limiting** : IP-based (5 tentatives/15min sur /verify-2fa)
- **RGPD** : Bannière cookies, consentement formulaires, export/suppression données, RoPA
- **Anti-spam** : Honeypot + rate limiting sur tous les formulaires publics

## Documentation

| Document | Chemin |
|----------|--------|
| Architecture | `docs/architecture.md` |
| Contrats API (50+ endpoints) | `docs/api-contracts.md` |
| Modèles de données | `docs/data-models.md` |
| Guide développement | `docs/development-guide.md` |
| Inventaire composants | `docs/component-inventory.md` |
| Arborescence source | `docs/source-tree.md` |
| Stratégie SEO/GEO | `docs/echo-strategy-seo-geo.md` |
| RGPD — Registre traitements | `docs/rgpd/registre-traitements-ropa.md` |
| RGPD — Procédure violations | `docs/rgpd/procedure-violation-donnees.md` |
| PRD Phase 2 | `_bmad-output/planning-artifacts/prd.md` |
| Mémoire partagée BMAD | `.agent/memory/shared-context.md` |

## Méthodologie

Ce projet suit la **méthodologie BMAD** (multi-agents) avec mémoire partagée.
Développé en parallèle avec **Claude Code** (Anthropic) et **Antigravity** (Google Gemini).

Voir `CLAUDE.md` et `.gemini/GEMINI.md` pour les conventions détaillées.
