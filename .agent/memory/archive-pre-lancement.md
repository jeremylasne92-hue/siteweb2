# 📦 Archive Pré-Lancement — Décisions & Historique

> Archivé le 2026-03-21. Ce fichier contient l'historique des décisions prises avant et pendant le lancement (février → 20 mars 2026).

---

## 🏗️ Architecture (référence)

### Frontend (React + TypeScript + Vite)
```
frontend/src/
├── components/
│   ├── layout/    # Header, Footer, Layout
│   ├── ui/        # Button, Card, Input, Modal, Toast, CityAutocomplete...
│   ├── forms/     # StudentApp, VolunteerApp, TechApp, ScenaristApp...
│   ├── partners/  # PartnerModal, PartnersMap, PartnerAnalytics, MemberModal...
│   └── seo/       # SEO (meta tags dynamiques)
├── features/auth/ # Login, Register, ResetPassword, store, schemas
├── pages/         # 36 pages (Home, Serie, Mouvement, admin/*, profil...)
├── hooks/         # useAnalytics, usePageTracking, useUrlFilters
├── config/        # api.ts, booking.ts, candidatures.ts, donation.ts
├── utils/         # analytics.ts, validation.ts
├── types/         # mediatheque.ts, member.ts
├── App.tsx        # Router principal (35 routes, lazy-loaded)
├── main.tsx       # Point d'entrée
└── index.css      # Styles globaux + thème Nature
```

### Images (frontend/public/images/)
```
images/
├── characters/    # 15 personnages série (800x1192px, JPEG optimisé)
├── tree-growth/   # 8 étapes arbre (1200px, JPEG)
├── team/          # 6 photos équipe (800px, JPEG)
├── cognisphere/   # 6 mockups app
└── echolink/      # 3 mockups hub
```
> **Convention images** : kebab-case, pas d'espaces ni accents, JPEG optimisé ≤300KB

### Backend (FastAPI + MongoDB via Motor)
```
backend/
├── server.py              # Point d'entrée FastAPI (port 8000)
├── models.py              # Pydantic models (User, UserRegister, etc.)
├── auth_utils.py          # hash_password, verify_password (bcrypt/passlib)
├── routes/
│   ├── auth.py            # /register, /login-local, /login, /google/*, /me, /logout
│   ├── analytics.py       # /events (SendBeacon), /stats/public (cache 30min)
│   ├── episodes.py        # CRUD épisodes
│   ├── progress.py        # Suivi progression vidéo
│   ├── videos.py          # Upload/streaming vidéo
│   ├── users.py           # Gestion utilisateurs (admin)
│   ├── partners.py        # Gestion partenaires
│   ├── members.py         # Profils membres
│   ├── thematics.py       # Thématiques
│   └── resources.py       # Ressources
├── models_member.py       # Pydantic models membres
├── services/
│   ├── auth_service.py    # Google OAuth service
│   └── auth_local_service.py  # Register/Login local
├── core/config.py         # Settings centralisés
└── tests/routes/          # Tests backend
```

### Hooks & Composants Frontend Clés
```
frontend/src/
├── hooks/
│   ├── useAnalytics.ts    # Tracking GA4 + interne (SendBeacon)
│   └── usePageTracking.ts # Tracking de navigation GA4
└── components/partners/
    ├── PartnerAnalytics.tsx  # Graphiques Recharts (vues/clics 30j)
    ├── PartnerModal.tsx      # Fiche partenaire
    ├── MemberModal.tsx       # Fiche membre
    ├── MembersSection.tsx    # Grille membres
    └── PartnersMap.tsx       # Carte
```

---

## 🎨 Thème Nature - Conventions

### Palette Active
| Nom | Variable | Hex |
|-----|----------|-----|
| Forêt Foncé | `--color-forest-dark` | #1a3a2f |
| Forêt Moyen | `--color-forest-medium` | #2d5a47 |
| Sable Clair | `--color-sand-light` | #f5f0e6 |

### Classes Réutilisables
- `.glass-card` : Effet glassmorphism
- `.nature-shadow` : Ombre douce verte
- `.organic-transition` : Animation fluide

---

## 📄 Pages Existantes

| Page | Route | Statut |
|------|-------|--------|
| Accueil | `/` | ✅ Complète + Landing Dynamique |
| La Série | `/serie` | ✅ Complète |
| Le Mouvement | `/mouvement` | ✅ Complète |
| Cognisphère | `/cognisphere` | ✅ Complète |
| ECHOLink | `/echolink` | ✅ Complète |
| ECHOsystem | `/partenaires` | ✅ Complète |
| Événements | `/agenda` | ✅ Complète |
| Ressources | `/ressources` | ✅ Complète |
| Soutenir | `/soutenir` | ✅ Complète |
| Contact | `/contact` | ✅ Complète |
| Login | `/login` | ✅ Complète |
| Inscription | `/register` | ✅ Complète |
| Admin Partenaires | `/admin/partenaires` | ✅ Complète |
| Mon Compte Partenaire | `/mon-compte/partenaire` | ✅ Complète |
| Politique de Confidentialité | `/politique-de-confidentialite` | ✅ Complète |
| Mentions Légales | `/mentions-legales` | ✅ Complète |
| CGU | `/cgu` | ✅ Complète |
| Admin Exports | `/admin/exports` | ✅ Complète |
| Admin Membres | `/admin/members` | ✅ Complète |
| ~~À propos~~ | ~~`/a-propos`~~ | ❌ Supprimée (20/03/2026) |

---

## 🔄 Workflows Disponibles

- `/orchestration` : Méthodologie obligatoire (v4 avec niveaux)
- `/orchestration-levels` : Guide des 3 niveaux de workflow
- `/start-dev` : Lance frontend + backend
- `/build` : Build production
- `/deploy` : Déploiement complet
- `/git-push` : Commit et push rapide

---

## 🚦 Historique des Niveaux

| Tâche | Niveau | Justification |
|-------|--------|---------------|
| AdminMembers fix projet + feedback erreurs | 🟢 HOTFIX | Ajout "Série ECHO" et "Projet ECHO" au dropdown projet + filtres. |
| Logo ECHO série transparent | 🟢 HOTFIX | Remplacement logo JPEG fond noir par PNG transparent. |
| Proposition 4 (SEO OpenGraph) | 🟡 STANDARD | Injection dynamique de meta tags react-helmet-async. |
| Proposition 3 (Micro-Analytique) | 🟡 STANDARD | Endpoint Custom Event Tracking (MongoDB) + Hook Frontend. |
| Proposition 1 (UX Onboarding Gamification) | 🟡 STANDARD | Refonte formulaires en multi-étapes. |
| Nettoyage Fin de Chantier (urllib3, pytest) | 🟢 HOTFIX | Retrait mock HTTP + up-version doc. |
| Story 4.4 Export Email Opt-In | 🟡 STANDARD | Backend endpoint CSV + frontend page admin + tests |
| Story 4.1 Panel Administration Securise | 🟡 STANDARD | Frontend dashboard hub + fix ProtectedRoute |
| Story 3.4 Prise de RDV Google Calendar | 🟢 HOTFIX | Frontend uniquement, bouton + lien externe |
| Story 3.1 Formulaire Candidature Partenaire | 🟡 STANDARD | Backend sécurité (Pillow + rate limit + emails) |
| Story 2.4 Passerelle Soutien/Dons | 🟡 STANDARD | Frontend uniquement, liens HelloAsso + CTAs |
| Story 2.3 Candidatures Anti-Spam | 🟡 STANDARD | Frontend + backend, formulaires + honeypot + rate limit |
| Story 2.2 Exploration & Opt-in | 🟡 STANDARD | Frontend + backend, synopsis + opt-in |
| Story 2.1 Vitrine Vidéo | 🟢 HOTFIX | Ajout badge uniquement |

---

## 📝 Décisions Pré-Lancement (chronologique)

| Date | Décision | Agent |
|------|----------|-------|
| 2026-02-07 | Workflow v4 avec 3 niveaux (Hotfix/Standard/Majeur) | Architect |
| 2026-02-08 | Ajout mode SPIKE, QA détaillé, règle anti-boucle | Architect |
| 2026-03-05 | Story 1.2 backend complété (service pattern, models, routes, 6 tests OK) | Antigravity (Gemini) |
| 2026-03-05 | Story 1.2 frontend complété (RegisterForm, EmailLoginForm, Login tabs) | Claude Code (Opus 4.6) |
| 2026-03-05 | Correction shared-context : Backend = FastAPI (pas Flask), port 8000 | Claude Code (Opus 4.6) |
| 2026-03-06 | Stories 1.3–1.4 → Epic 1 DONE. Stories 2.1–2.4 → Epic 2 DONE. Stories 3.1–3.5 → Epic 3 DONE. Stories 4.1–4.4 → Epic 4 DONE. | Claude Code + Antigravity |
| 2026-03-07 | Consolidation MVP: cookie-only auth, reCAPTCHA v3, secure cookies, 2FA, ErrorBoundary, 404 page | Claude Code (Opus 4.6) |
| 2026-03-08 | Sécurité tokens: 2FA 6 chiffres + secrets.choice, session/reset tokens secrets.token_urlsafe(32), rate limit /verify-2fa | Claude Code (Opus 4.6) |
| 2026-03-11 | RGPD compliance complète + Admin CSV exports + SEO OpenGraph + Micro-Analytique + UX Onboarding | Claude Code + Antigravity |
| 2026-03-12 | Dashboard Partenaire + Landing Page Dynamique + Brainstorming Features | Antigravity (Gemini) |
| 2026-03-13 | Refonte pages (Mouvement, CogniSphère, ECHOLink) + Candidatures scénaristes + Contact backend + Workflow candidatures | Claude Code (Opus 4.6) |
| 2026-03-14 | Profils membres + Notifications candidatures + Refonte événements + Images personnages + Logo transparent | Claude Code (Opus 4.6) |
| 2026-03-15 | Audit RGPD complet (14 écarts) + Système KPIs BI Analytics + Carte membres/partenaires + AdminMembers | Claude Code (Opus 4.6) |
| 2026-03-16 | Code review 5 agents + Audit validation formulaires + Readiness report 78/100 GO CONDITIONNEL + Sécurité CSP/SendGrid | Claude Code (Opus 4.6 + Sonnet 4.6) |
| 2026-03-17 | Cookie consent RGPD + Harmonisation dates + Refonte Home hero + Audit #3 pré-lancement + Audit externe + Data quality + déploiement | Claude Code (Opus 4.6) |
| 2026-03-18 | Audit code exhaustif (~120 constats) + Harmonisation UX 10 formulaires + Password strength UI + Carte mondiale + Refonte Soutenir + Tests manuels 49/51 PASS | Claude Code (Opus 4.6) |
| 2026-03-19 | SendGrid configuré + Footer réseaux sociaux + Page Resources redesignée | Claude Code (Opus 4.6) |
