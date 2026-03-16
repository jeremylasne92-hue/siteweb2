# Arborescence Source — Mouvement ECHO

> Dernière mise à jour : 2026-03-16

```
Site web ECHO/
│
├── CLAUDE.md                              # Instructions projet (Claude Code)
├── README.md                              # Documentation déploiement et structure
│
├── frontend/                              # ▼ APPLICATION REACT SPA
│   ├── package.json                       # Dépendances Node.js (npm)
│   ├── tsconfig.json                      # Configuration TypeScript 5.9
│   ├── vite.config.ts                     # Configuration Vite 7 + proxy API
│   ├── postcss.config.js                  # PostCSS (Tailwind CSS 4)
│   ├── index.html                         # HTML entry point
│   ├── public/
│   │   └── images/
│   │       ├── characters/                # Images personnages série (15)
│   │       ├── equipe/                    # Photos équipe ECHO
│   │       └── arbre/                     # Images 7 étapes arbre (Mouvement)
│   └── src/
│       ├── main.tsx                       # Entry point React (StrictMode)
│       ├── App.tsx                        # Router (React.lazy, code splitting)
│       ├── index.css                      # Design system Tailwind + thème ECHO
│       │
│       ├── pages/                         # 29 pages routées
│       │   ├── Home.tsx                   # Accueil (hero, 3 piliers, stats dynamiques)
│       │   ├── Serie.tsx                  # Série (épisodes, personnages, candidature scénariste)
│       │   ├── Mouvement.tsx              # Mouvement (7 étapes arbre, équipe)
│       │   ├── Cognisphere.tsx            # CogniSphère (mockups, roadmap)
│       │   ├── ECHOLink.tsx               # ECHOLink (3 fonctionnalités, valeurs)
│       │   ├── PartnersPage.tsx           # ECHOSystem (carte, grille, membres)
│       │   ├── Events.tsx                 # Agenda (upcoming/past, réservation)
│       │   ├── Resources.tsx              # Ressources (médiathèque)
│       │   ├── Support.tsx                # Soutenir (3 paliers HelloAsso)
│       │   ├── Contact.tsx                # Contact (formulaire + honeypot)
│       │   ├── FAQ.tsx                    # FAQ (accordéon)
│       │   ├── AboutPage.tsx              # À propos
│       │   ├── Profile.tsx                # Profil utilisateur (bio, candidatures)
│       │   ├── MyData.tsx                 # Mes données RGPD (export/suppression)
│       │   ├── MyPartnerAccount.tsx        # Espace partenaire (infos + analytics)
│       │   ├── Partners.tsx               # (legacy, redirige vers PartnersPage)
│       │   ├── NotFound.tsx               # Page 404
│       │   ├── PrivacyPolicy.tsx          # Politique de confidentialité
│       │   ├── LegalNotice.tsx            # Mentions légales
│       │   ├── TermsOfService.tsx         # Conditions d'utilisation
│       │   ├── AdminDashboard.tsx         # Admin — hub central
│       │   ├── AdminPartners.tsx          # Admin — gestion partenaires
│       │   ├── AdminCandidatures.tsx      # Admin — candidatures (tech, scénariste)
│       │   ├── AdminVolunteers.tsx        # Admin — bénévoles
│       │   ├── AdminMembers.tsx           # Admin — membres (profils, geocoding)
│       │   ├── AdminEvents.tsx            # Admin — événements (CRUD, images)
│       │   ├── AdminMessages.tsx          # Admin — messages contact
│       │   ├── AdminAnalytics.tsx         # Admin — KPIs BI (14 métriques)
│       │   └── AdminExports.tsx           # Admin — exports CSV
│       │
│       ├── components/
│       │   ├── ErrorBoundary.tsx          # Error boundary React
│       │   │
│       │   ├── layout/
│       │   │   ├── Layout.tsx             # Wrapper (Header + main + Footer)
│       │   │   ├── Header.tsx             # Nav sticky + sous-menus + mobile
│       │   │   └── Footer.tsx             # Pied de page multi-colonnes
│       │   │
│       │   ├── ui/
│       │   │   ├── Button.tsx             # 4 variants, 3 tailles, forwardRef
│       │   │   ├── Card.tsx               # 3 variants (default/glass/solid)
│       │   │   ├── Input.tsx              # Label + error + focus ring
│       │   │   ├── Modal.tsx              # Overlay blur + scroll lock
│       │   │   ├── Toast.tsx              # Notifications toast
│       │   │   ├── StepProgress.tsx       # Jauge multi-étapes (formulaires)
│       │   │   ├── CookieBanner.tsx       # Bannière RGPD cookies
│       │   │   ├── YouTubeEmbed.tsx       # Façade YouTube (RGPD, lazy)
│       │   │   ├── CityAutocomplete.tsx   # Autocomplétion ville (Nominatim)
│       │   │   └── AddressAutocomplete.tsx # Autocomplétion adresse (admin)
│       │   │
│       │   ├── forms/
│       │   │   ├── TechApplicationForm.tsx      # Candidature technique (4 étapes)
│       │   │   ├── ScenaristApplicationForm.tsx  # Candidature scénariste (4 étapes)
│       │   │   ├── VolunteerApplicationForm.tsx  # Adhésion bénévole (4 étapes)
│       │   │   └── ApplicationSuccessCTA.tsx     # CTA post-soumission
│       │   │
│       │   ├── partners/
│       │   │   ├── PartnersHero.tsx       # Hero ECHOSystem
│       │   │   ├── PartnersGrid.tsx       # Grille partenaires
│       │   │   ├── PartnersMap.tsx         # Carte Leaflet (partenaires + membres)
│       │   │   ├── PartnersFilters.tsx    # Filtres recherche
│       │   │   ├── PartnersStats.tsx      # Compteurs
│       │   │   ├── PartnerCard.tsx         # Carte partenaire
│       │   │   ├── PartnerModal.tsx        # Fiche détail partenaire
│       │   │   ├── PartnerFormModal.tsx    # Formulaire candidature partenaire
│       │   │   ├── PartnerAnalytics.tsx   # Dashboard analytics (Recharts)
│       │   │   ├── MemberModal.tsx         # Fiche membre
│       │   │   ├── MembersSection.tsx     # Grille membres
│       │   │   └── ThematicTag.tsx         # Badge thématique
│       │   │
│       │   └── seo/
│       │       ├── SEO.tsx                # Meta tags (react-helmet-async)
│       │       └── Breadcrumbs.tsx        # Breadcrumbs JSON-LD
│       │
│       ├── features/
│       │   └── auth/
│       │       ├── schemas.ts             # Zod schemas (register, login, reset)
│       │       ├── store.ts               # Auth store (Zustand)
│       │       ├── api/
│       │       │   ├── useLogin.ts        # Hook login
│       │       │   ├── useRegister.ts     # Hook register
│       │       │   ├── useForgotPassword.ts
│       │       │   └── useResetPassword.ts
│       │       └── components/
│       │           ├── AuthPrompt.tsx      # Modale prompt connexion
│       │           ├── EmailLoginForm.tsx  # Formulaire email/password
│       │           ├── GoogleLoginButton.tsx
│       │           ├── RegisterForm.tsx    # Inscription multi-étapes
│       │           ├── ForgotPasswordForm.tsx
│       │           ├── ResetPasswordForm.tsx
│       │           └── ProtectedRoute.tsx  # Guard admin/auth
│       │
│       ├── hooks/
│       │   ├── useAnalytics.ts            # Tracking GA4 + interne (sendBeacon)
│       │   ├── usePageTracking.ts         # Page view tracking
│       │   └── useUrlFilters.ts           # Filtres URL (query params)
│       │
│       ├── config/
│       │   ├── api.ts                     # URLs API centralisées
│       │   ├── booking.ts                 # Config Google Calendar
│       │   ├── candidatures.ts            # Labels projets, compétences
│       │   └── donation.ts                # Config HelloAsso
│       │
│       ├── utils/
│       │   ├── validation.ts              # isValidEmail, isValidPhone, sanitizePhone
│       │   └── analytics.ts               # Helpers analytics
│       │
│       └── types/
│           └── member.ts                  # Types membres
│
├── backend/                               # ▼ API FASTAPI
│   ├── server.py                          # Entry point FastAPI + CORS + Motor
│   ├── models.py                          # User, Episode, VideoProgress, Pending2FA, ContactMessage
│   ├── models_extended.py                 # Thematic, Resource, Actor
│   ├── models_partner.py                  # Partner, PartnerApplication
│   ├── models_member.py                   # MemberProfile, ProjectType, SocialLink
│   ├── auth_utils.py                      # bcrypt, sessions, 2FA (secrets.choice)
│   ├── requirements.txt                   # Dépendances Python
│   │
│   ├── routes/
│   │   ├── auth.py                        # Register, login, OAuth Google, 2FA, logout, me
│   │   ├── partners.py                    # CRUD partenaires + candidatures + stats
│   │   ├── members.py                     # Profils membres (public, auth, admin, seed)
│   │   ├── candidatures.py                # Candidatures tech/scénariste (CRUD + batch + email)
│   │   ├── volunteers.py                  # Adhésion bénévole (CRUD + admin)
│   │   ├── events.py                      # Événements (CRUD + images)
│   │   ├── contact.py                     # Messages contact (rate limit + honeypot)
│   │   ├── analytics.py                   # Events tracking + stats publiques
│   │   ├── admin_dashboard.py             # Dashboard KPI admin (14 métriques)
│   │   ├── episodes.py                    # CRUD épisodes
│   │   ├── progress.py                    # Progression vidéo
│   │   ├── videos.py                      # Upload + streaming vidéo
│   │   ├── users.py                       # Gestion utilisateurs (admin)
│   │   ├── thematics.py                   # CRUD thématiques
│   │   └── resources.py                   # CRUD ressources
│   │
│   ├── services/
│   │   ├── auth_service.py                # Google OAuth service
│   │   ├── auth_local_service.py          # Register/Login local (Service Pattern)
│   │   └── password_reset_service.py      # Reset mot de passe (token + email)
│   │
│   ├── utils/
│   │   ├── rate_limit.py                  # Rate limiting IP-based (Redis-like)
│   │   ├── geocode.py                     # Geocoding Nominatim
│   │   ├── audit.py                       # Audit trail helpers
│   │   └── logging_config.py              # Configuration logging
│   │
│   ├── core/
│   │   └── config.py                      # Settings centralisé (env vars)
│   │
│   └── tests/
│       └── routes/
│           ├── test_auth_local.py          # Tests auth local
│           ├── test_partners_apply.py      # Tests candidature partenaire
│           ├── test_contact.py             # Tests contact
│           ├── test_admin_dashboard.py     # Tests dashboard admin
│           └── ...                         # Autres tests
│
├── docs/                                  # ▼ DOCUMENTATION
│   ├── index.md                           # Index documentation
│   ├── project-overview.md                # Vue d'ensemble
│   ├── architecture.md                    # Architecture détaillée
│   ├── api-contracts.md                   # 50+ endpoints API
│   ├── data-models.md                     # Modèles Pydantic
│   ├── component-inventory.md             # Inventaire composants UI
│   ├── source-tree.md                     # Cette arborescence
│   ├── technology-stack.md                # Versions dépendances
│   ├── development-guide.md               # Guide développement
│   ├── integration-architecture.md        # Intégration Vite/API
│   ├── deep-dive-auth-securite.md         # Auth & sécurité détail
│   ├── echo-strategy-seo-geo.md           # Stratégie SEO/GEO
│   ├── plans/                             # 29 plans d'implémentation
│   └── rgpd/
│       ├── registre-traitements-ropa.md   # Registre traitements (Art. 30)
│       └── procedure-violation-donnees.md # Procédure violation données
│
├── _bmad-output/                          # ▼ BMAD — Artefacts
│   ├── project-context.md                 # Contexte projet (38 règles)
│   ├── planning-artifacts/                # PRD, architecture, epics
│   ├── implementation-artifacts/          # Specs fonctionnelles (9 features)
│   └── brainstorming/                     # Sessions brainstorming
│
├── .agent/                                # ▼ BMAD — Multi-agents
│   ├── memory/shared-context.md           # Mémoire partagée (état, locks, décisions)
│   ├── agents/                            # Définitions agents (architect, frontend, etc.)
│   ├── skills/                            # Skills agents
│   └── workflows/                         # Workflows orchestrés
│
└── .gemini/
    └── GEMINI.md                          # Instructions Antigravity (Google Gemini)
```

## Statistiques

| Métrique | Frontend | Backend | Total |
|----------|----------|---------|-------|
| **Fichiers source** | 98 | 54 | 152 |
| **Lignes de code** | ~17 250 | ~7 050 | ~24 300 |
| **Pages** | 29 | — | 29 |
| **Composants** | 32 | — | 32 |
| **Routes API** | — | 16 routers | 50+ endpoints |
| **Collections DB** | — | ~15 | ~15 |
| **Tests** | 18 | 128+ | 146+ |
