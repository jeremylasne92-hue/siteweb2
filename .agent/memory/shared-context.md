# 🧠 ECHO - Contexte Partagé

> Ce fichier est la mémoire partagée entre tous les agents. Consultez-le avant toute action et mettez-le à jour après vos modifications.

---

## 📋 État du Projet

**Dernière mise à jour** : 2026-03-15
**Phase actuelle** : Post-Epics — Pré-lancement (lancement 20 mars 2026)
**Statut** : ✅ Opérationnel — KPI BI Analytics + Audit RGPD 14/14 corrigé
**Dernier milestone** : KPI BI Analytics (14 KPIs, UTM/session tracking, admin dashboard) + Audit RGPD complet (14 écarts corrigés)

### ⚠️ Rappels Pré-Lancement (20 mars 2026)
- [ ] **Revoir le Dashboard Partenaire** avant la sortie officielle (UX, données, design)
- [ ] Build de production (`npm run build`)
- [ ] Déploiement final

---

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)
```
frontend/src/
├── components/
│   ├── layout/    # Header, Footer
│   └── ui/        # Button, Card, Input
├── pages/         # Home, Serie, Contact, Events, ECHOsystem
├── App.tsx        # Router principal
├── main.tsx       # Point d'entrée
└── index.css      # Styles globaux + thème Nature
```

### Backend (FastAPI + MongoDB via Motor)
```
backend/
├── server.py              # Point d'entrée FastAPI (port 8000)
├── models.py              # Pydantic models (User, UserRegister, etc.) — partner_id sur AnalyticsEventCreate
├── auth_utils.py          # hash_password, verify_password (bcrypt/passlib)
├── routes/
│   ├── auth.py            # /register, /login-local, /login, /google/*, /me, /logout
│   ├── analytics.py       # /events (SendBeacon), /stats/public (cache 30min)
│   ├── episodes.py        # CRUD épisodes
│   ├── progress.py        # Suivi progression vidéo
│   ├── videos.py          # Upload/streaming vidéo
│   ├── users.py           # Gestion utilisateurs (admin)
│   ├── partners.py        # Gestion partenaires — /me/stats (agrégation analytics 30j)
│   ├── members.py         # Profils membres (public /members, auth /me, admin /admin/members + seed)
│   ├── thematics.py       # Thématiques
│   └── resources.py       # Ressources
├── models_member.py       # Pydantic models membres (ProjectType, SocialLink, VisibilityOverrides, etc.)
├── services/
│   ├── auth_service.py    # Google OAuth service
│   └── auth_local_service.py  # Register/Login local (Service Pattern)
├── core/config.py         # Settings centralisés
└── tests/routes/
    ├── test_auth_local.py    # 6 tests (register + login)
    └── test_partners_apply.py # 5 tests (candidature partenaire)
```

### Hooks & Composants Frontend Clés
```
frontend/src/
├── hooks/
│   ├── useAnalytics.ts    # Tracking GA4 + interne (SendBeacon)
│   └── usePageTracking.ts # Tracking de navigation GA4
└── components/partners/
    ├── PartnerAnalytics.tsx  # Graphiques Recharts (vues/clics 30j)
    ├── PartnerModal.tsx      # Fiche partenaire — tracking vues + clics site
    ├── MemberModal.tsx       # Fiche membre — avatar, bio, skills, social links
    ├── MembersSection.tsx    # Grille membres (fetch MEMBERS_API, clickable, a11y)
    └── PartnersMap.tsx      # Carte — tracking clics marker
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
| Accueil | `/` | ✅ Complète + Landing Dynamique (compteurs + mode Mon ECHO) |
| La Série | `/serie` | ✅ Complète |
| Le Mouvement | `/mouvement` | ✅ Complète (refonte 2026-03-13 : 7 étapes Graine→Fructification, photos équipe, ScrollToTop) |
| Cognisphère | `/cognisphere` | ✅ Complète (refonte 2026-03-13 : mockups interactifs, texte candidature Émergence, roadmap bêta Juin 2026) |
| ECHOLink | `/echolink` | ✅ Complète (refonte 2026-03-13 : 3 fonctionnalités détaillées, section valeurs, origine ECHO, exemples concrets) |
| ECHOsystem | `/partenaires` | ✅ Complète |
| Événements | `/agenda` | ✅ Complète |
| Ressources | `/ressources` | ✅ Complète |
| Soutenir | `/soutenir` | ✅ Complète |
| Contact | `/contact` | ✅ Complète |
| Login | `/login` | ✅ Complète (tabs Google + Email) |
| Inscription | `/register` | ✅ Complète (Story 1.2) |
| Google Callback | `/auth/google/success` | ✅ Complète |
| Admin Partenaires | `/admin/partenaires` | ✅ Complète |
| Mon Compte Partenaire | `/mon-compte/partenaire` | ✅ Complète + Dashboard Analytics (onglet) |
| Politique de Confidentialité | `/politique-de-confidentialite` | ✅ Complète (RGPD) |
| Mentions Légales | `/mentions-legales` | ✅ Complète (RGPD) |
| CGU | `/cgu` | ✅ Complète (RGPD) |
| Admin Exports | `/admin/exports` | ✅ Complète |
| Admin Membres | `/admin/members` | ✅ Complète (édition profils, geocoding backfill) |

---

## 🔄 Workflows Disponibles

- `/orchestration` : **Méthodologie obligatoire** (v4 avec niveaux)
- `/orchestration-levels` : Guide des 3 niveaux de workflow
- `/start-dev` : Lance frontend + backend
- `/build` : Build production
- `/deploy` : Déploiement complet
- `/git-push` : Commit et push rapide

---

## 🚦 Niveau Actif

> L'Architect note ici le niveau choisi pour la tâche en cours.

| Tâche | Niveau | Justification |
|-------|--------|---------------|
| Logo ECHO série transparent | 🟢 HOTFIX | Remplacement logo JPEG fond noir par PNG transparent. 3 fichiers (Header, Serie, SEO). |
| Proposition 4 (SEO OpenGraph) | 🟡 STANDARD | Injection dynamique de meta tags react-helmet-async dans le routeur et les pages. |
| Proposition 3 (Micro-Analytique) | 🟡 STANDARD | Endpoint Custom Event Tracking (MongoDB) + Hook Frontend (sendBeacon). |
| Proposition 1 (UX Onboarding Gamification) | 🟡 STANDARD | Refonte des formulaires d'inscription et de candidature en multi-étapes. |
| Nettoyage Fin de Chantier (urllib3, pytest) | 🟢 HOTFIX | Retrait d'un mock HTTP de test et up-version d'une doc. Aucune complexité. |
| Story 4.4 Export Email Opt-In | 🟡 STANDARD | Backend endpoint CSV + frontend page admin + tests |
| Story 4.1 Panel Administration Securise | 🟡 STANDARD | Frontend : dashboard hub + fix ProtectedRoute + lien Header |
| Story 3.4 Prise de RDV Google Calendar | 🟢 HOTFIX | Frontend uniquement, bouton + lien externe |
| Story 3.1 Formulaire Candidature Partenaire | 🟡 STANDARD | Backend sécurité (Pillow + rate limit + emails) |
| Story 2.4 Passerelle Soutien/Dons | 🟡 STANDARD | Frontend uniquement, liens HelloAsso + CTAs |
| Story 2.3 Candidatures Anti-Spam | 🟡 STANDARD | Frontend + backend, formulaires + honeypot + rate limit |
| Story 2.2 Exploration & Opt-in | 🟡 STANDARD | Frontend + backend, synopsis + opt-in |
| Story 2.1 Vitrine Vidéo | 🟢 HOTFIX | Ajout badge uniquement, page existante |

---

## 📝 Décisions Récentes

| Date | Décision | Agent |
|------|----------|---------|
| 2026-03-15 | Carte partenaires/membres : pins SVG bleu de Klein (#002FA7) pour membres (même style que partenaires), fond Dark Matter avec labels, légende 5 catégories (Membres/Experts/Financiers/Audiovisuel/Éducation). CityAutocomplete fix (addressdetails+countrycodes au lieu de featuretype). Photos équipe Mouvement objectPosition par membre. Admin members page + PATCH endpoint + backfill geocoding. Niveau HOTFIX. | Claude Code (Opus 4.6) |
| 2026-03-15 | Audit RGPD complet : 14 écarts corrigés en 7 groupes parallèles. #25 YouTubeEmbed façade + useCookieConsent hook. #26 openCookiePanel via custom event (sans reload). #27 Notice reCAPTCHA v3 login+register. #28 Checkbox CGU/PC obligatoire register avec liens. #29 Emails/phones partenaires supprimés des vues publiques + API sanitized. #30+32+34+38 PC complétée (15 sections : reCAPTCHA, HelloAsso, APD, durées conservation, sécurité). #33 Mentions légales corrigées (directeur unique + téléphone). #37 Clause mineurs CGU (15 ans+). #35 Page MyData.tsx (export JSON + suppression compte). #31 RoPA (10 traitements). #36 Procédure violation données. #38 Notice HelloAsso /soutenir. Niveau MAJEUR. | Claude Code (Opus 4.6) |
| 2026-03-15 | Système KPIs BI Analytics : 14 KPIs en 4 catégories (Acquisition, Engagement, Conversion, Partenaires). Extension AnalyticsEventCreate (+6 champs optionnels). 3 index MongoDB. Endpoint admin dashboard GET /api/analytics/admin/dashboard (15 requêtes parallèles asyncio.gather). useAnalytics enrichi (session_id UUID sessionStorage, UTM capture, referrer, trackPageView). usePageTracking → page_view interne. 8 CTAs instrumentés sur 5 pages. AdminAnalytics.tsx (StatCards, sélecteur période 7/14/30j). 5 tests dashboard + 128 backend total. Subagent-Driven Development (7 tasks). Niveau MAJEUR. | Claude Code (Opus 4.6) |
| 2026-03-14 | Refonte section L'Émergence (Mouvement) : layout vertical custom EmergenceSection (pousse + encadré ambition + tronc). Image Tronc.png ajoutée. Texte ambition restructuré en accroche serif + développement avec mots-clés colorés (coopération, respect du vivant, absolument nécessaire, croissance pérenne, alliance robuste, nouveau récit sociétal, nouveau contrat social). Bordure ambre gauche + fond glassmorphism. Suppression OrganicArrow SVG + keyframes CSS inutilisés (grow-vine, draw-line). Composants réordonnés avant export pour compatibilité Vite HMR. Niveau HOTFIX. | Claude Code (Opus 4.6) |
| 2026-03-14 | Profils membres : collection member_profiles (MongoDB, 4 index), modèles Pydantic (models_member.py : ProjectType, ExperienceLevel, Availability, SocialLink, VisibilityOverrides, MemberProfile), routes publiques (GET / avec re.escape search, GET /{slug}), auth (GET/PATCH /me, PATCH /me/visibility), admin (GET /, GET /analytics avec asyncio.gather, PATCH /{id}/status, POST /seed/{candidature_id} avec vérif statut accepted + slug collision). Frontend : MemberModal.tsx (avatar, bio, skills, social links 11 plateformes), MembersSection.tsx (fetch MEMBERS_API, keyboard a11y), PartnersPage.tsx (membre clickable + compteur). Types TypeScript (member.ts). Config partagée candidatures.ts. 8 tests modèles + 13 tests routes. Subagent-Driven Development (9 tasks, 2-stage review). Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-14 | Notifications candidatures : 4 emails transactionnels (confirmation soumission, convocation entretien avec lien booking Google Calendar, acceptation, rejet avec motif optionnel) via BackgroundTasks dans routes candidatures. BOOKING_URL centralisé dans config. Profile.tsx étendu : support projet Scénariste (badge amber), bouton "Réserver un créneau" si statut entretien, section candidatures toujours visible avec état vide. 6 tests email + 81 tests backend total. Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-14 | Refonte système événements : modèle Event étendu (images[] jusqu'à 10, date_end, booking_enabled, booking_url, organizer), endpoint upload-image (MIME+5Mo), drag & drop images admin, toggle réservation, séparation past/upcoming sur page publique Agenda, compteur "X à venir · Y passés", organizer personnalisable, error feedback admin. Fix select dropdown global (CSS). Fix bouton masquer partenaires (stopPropagation). Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-14 | Images personnages série ECHO : remplacement des 15 photos Unsplash par les vraies images des personnages (dossier "images personnages série ECHO"). Noms normalisés en minuscules dans /images/characters/. Nettoyage anciens fichiers "Personnage ..." et dossier source. Niveau HOTFIX. | Claude Code (Opus 4.6) |
| 2026-03-14 | Logo ECHO série : remplacement du logo JPEG (fond noir) par un PNG transparent (removebg). Suppression du hack CSS mix-blend-lighten. Agrandissement taille logo (Header h-12/14/16, Serie h-28/40/56). Ajustement espacement vertical Serie hero (-mb-6). Mise à jour référence OG image dans SEO.tsx. Niveau HOTFIX. | Claude Code (Opus 4.6) |
| 2026-03-13 | Images page Mouvement : remplacement des thumbnails Unsplash ronds par des images locales rectangulaires du dossier "Image arbre en croissance" (7 étapes). Layout redesigné : texte + image côte à côte alternés (gauche/droite). Responsive mobile (empilé). Niveau HOTFIX. | Claude Code (Opus 4.6) |
| 2026-03-13 | Formulaire contact backend : POST /api/contact avec rate limit 3/h/IP, honeypot, anonymisation IP, stockage MongoDB (contact_messages), double email (confirmation expéditeur + alerte équipe via SendGrid). Modèles Pydantic (ContactMessageRequest + ContactMessage). Frontend Contact.tsx converti en controlled inputs avec états idle/loading/success/error. 7 tests backend. TTL 6 mois RGPD. Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-13 | Candidatures scénaristes : extension du système candidatures tech pour le projet "scenariste". Nouveau formulaire 4 étapes (Identité/Compétences/Intérêts/Motivation) sur page Série via modal, portfolio_url validé (http/https), creative_interests tags, admin console étendue (filtre, badge PenTool, affichage portfolio/intérêts). 3 tests backend ajoutés (71 total). Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-13 | Refonte page Mouvement : 7 étapes (Graine→Fructification), photos équipe réelles (5 membres), suppression PhaseCard, CTA → /register. Ajout ScrollToTop dans App.tsx. Design responsive mobile 375px+ sur toutes les pages (26 fichiers). Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-13 | Workflow candidatures techniques : ajout status (pending/entretien/accepted/rejected), status_note, updated_at au modèle TechCandidature. 3 nouveaux endpoints (PUT admin/{id}/status, PUT admin/batch-status, GET /me). Admin : badges statut, sélection batch avec checkbox, actions groupées, filtres par statut, note admin dans modale. Profil utilisateur : section "Mes candidatures" (match par email, badges statut colorés, note admin). 4 nouveaux tests backend. Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-13 | Refonte page ECHOLink : 8 sections (hero, constat, 3 piliers overview, 3 fonctionnalités détaillées avec exemples concrets, valeurs, origine ECHO, candidature). Contenu aligné avec document de référence ECHOLink (énigmes/QR codes, hubs collaboratifs/Kanban/matching, économie alternative/monnaie numérique). Ajustements : suppression section Stack/Contribuer/GitHub, correction "documentaire" → "série", exemple concret quête mythologique urbaine + ECHOSystem, "pour le bien commun". 3 mockups Hub intégrés. Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-13 | Refonte page CogniSphère : mockups interactifs desktop/mobile (5 écrans switchables), suppression section pricing, roadmap mise à jour (bêta Juin 2026, Phase 2 Déc 2026, Phase 3+ 2027), texte aligné avec candidature Émergence IDF, section Origine ECHO enrichie (lien série, parcours thématiques, hiver 2025), image mobile dédiée. Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-12 | Dashboard Partenaire : tracking vues/clics (partner_id dans AnalyticsEvent), endpoint /partners/me/stats (MongoDB Aggregate 30j), composant PartnerAnalytics.tsx (Recharts), hook useAnalytics.ts (SendBeacon). Onglet Dashboard dans MyPartnerAccount avec export CSV. | Antigravity (Gemini) |
| 2026-03-12 | Landing Page Dynamique : endpoint /analytics/stats/public (cache mémoire 30min), compteurs communautaires dynamiques (membres, partenaires, événements), mode "Mon ECHO" pour les utilisateurs connectés dans Home.tsx. | Antigravity (Gemini) |
| 2026-03-12 | Brainstorming Features Site Web : 20 idées générées (S-C-A-M-P-E-R + Cross-Pollination). 7 idées critiques bonifiées via Role Playing (9 personas). Focus : Navigation Informer/Fédérer/Agir, Dashboard Partenaire, Expérience Post-Épisode, La Fabrique ECHO. | Antigravity (Gemini) |
| 2026-03-11 | RGPD compliance complète : 3 pages légales (confidentialité, mentions légales, CGU) + bannière cookies (localStorage + gtag consent) + checkboxes consentement sur 3 formulaires + endpoint export données GET /me/export + UI suppression/export sur MyPartnerAccount + champ email_opt_out + endpoint unsubscribe + lien désinscription emails. 51 tests backend OK, build frontend OK. | Claude Code (Opus 4.6) |
| 2026-03-11 | Admin CSV exports : 2 nouveaux endpoints (GET /auth/admin/export-users, GET /partners/admin/export) + refonte AdminExports.tsx avec 3 cartes export. | Claude Code (Opus 4.6) |
| 2026-03-11 | Fix logo partenaire admin : ajout proxy Vite /api → localhost:8000 pour résoudre les URLs relatives des uploads en dev. | Claude Code (Opus 4.6) |
| 2026-03-11 | Workflow `/document-project` (Niveau 3: Exhaustive Scan) exécuté. Recréation indexée de 10 fichiers techniques d'architecture, intégration, et modèles. | Antigravity (Gemini) |
| 2026-03-11 | SEO OpenGraph: Installation React Helmet Async, injection dynamique du composant `<SEO>` sur Home, Serie, Mouvement, Partners, Support et Contact. | Antigravity (Gemini) |
| 2026-03-11 | Micro-Analytique RGPD: Tracking cookieless en `navigator.sendBeacon` sur le FE. API `202 Accepted` MongoDB. | Antigravity (Gemini) |
| 2026-03-11 | Admin: édition partenaire (tous champs) + masquer/réactiver (suspend) + bouton logout Header (menu déroulant utilisateur) | Claude Code (Opus 4.6) |
| 2026-03-11 | UX Onboarding: Refonte totale de `RegisterForm.tsx` et `TechApplicationForm.tsx` en formulaires multi-étapes avec composant de jauge `<StepProgress />`. Gamification. | Antigravity (Gemini) |
| 2026-03-11 | Optimisation MVP: Code-Splitting sur App.tsx (React.lazy) pour les routes publiques + extraction des manualChunks (lucide-react, react-hook-form) sur Vite. Bundle index allégé. | Antigravity (Gemini) |
| 2026-03-08 | Sécurité tokens: 2FA 6 chiffres + secrets.choice, session/reset tokens secrets.token_urlsafe(32), rate limit /verify-2fa, pages CogniSphere/ECHOLink publiques | Claude Code (Opus 4.6) |
| 2026-03-07 | Consolidation MVP: cookie-only auth, reCAPTCHA v3 server-side, secure cookies, 2FA logs nettoyés, ErrorBoundary, 404 page, SEO meta | Claude Code (Opus 4.6) |
| 2026-03-07 | Story 4.4 done — Export CSV opt-in + code review (5 fixes: BOM UTF-8, to_list(None), ISO date, lien retour, test orphelin) — **Epic 4 DONE** | Claude Code (Opus 4.6) |
| 2026-03-06 | Story 4.3 complétée — CRUD événements backend (5 endpoints + 5 tests) + AdminEvents.tsx + Events.tsx dynamique | Claude Code (Opus 4.6) |
| 2026-03-06 | Stories 4.1 + 4.2 complétées — Dashboard admin hub + fix Accès Refusé + lien Header + 4.2 déjà implémentée | Claude Code (Opus 4.6) |
| 2026-03-06 | Story 3.5 complétée — Bouton "Visiter le site" dans modale partenaire — **Epic 3 DONE** | Claude Code (Opus 4.6) |
| 2026-03-06 | Story 3.4 complétée — Bouton RDV Google Calendar sur espace partenaire | Claude Code (Opus 4.6) |
| 2026-03-06 | Stories 3.2 + 3.3 marquées done — déjà couvertes par implémentation existante | Claude Code (Opus 4.6) |
| 2026-03-06 | Story 3.1 complétée — Pillow MIME validation + 2Mo limit + email équipe + rate limit 3/h/IP + 5 tests (FR11/FR12/FR13/FR18) | Claude Code (Opus 4.6) |
| 2026-03-06 | Story 2.4 complétée — Boutons HelloAsso + CTAs Mouvement — **Epic 2 DONE** (FR19) | Claude Code (Opus 4.6) |
| 2026-03-06 | Story 2.3 complétée — Formulaires candidature tech Cognisphere/ECHOLink + anti-spam (FR17/FR18) | Claude Code (Opus 4.6) |
| 2026-03-06 | Story 2.2 complétée — Synopsis modale + opt-in + fix routeur episodes (FR8/FR9) | Claude Code (Opus 4.6) |
| 2026-03-06 | Story 2.1 complétée — Badge "Bientôt disponible" sur cartes S1 (FR7) | Claude Code (Opus 4.6) |
| 2026-03-06 | Story 1.4 complétée — Epic 1 (Identité & Sécurité) DONE, 4/4 stories | Claude Code (Opus 4.6) |
| 2026-03-06 | Story 1.3 complétée — Reset mot de passe (backend + frontend + code review) | Antigravity (Gemini) |
| 2026-03-05 | Story 1.2 frontend complété (RegisterForm, EmailLoginForm, Login tabs, Register page, store enrichi) | Claude Code (Opus 4.6) |
| 2026-03-05 | Story 1.2 backend complété (service pattern, models, routes, 6 tests OK) | Antigravity (Gemini) |
| 2026-03-05 | Correction shared-context : Backend = FastAPI (pas Flask), port 8000 | Claude Code (Opus 4.6) |
| 2026-02-08 | Ajout mode SPIKE, QA détaillé, règle anti-boucle | Architect |
| 2026-02-07 | Workflow v4 avec 3 niveaux (Hotfix/Standard/Majeur) | Architect |
| 2026-02-07 | Designer repositionné AVANT Frontend | Architect |
| 2026-02-07 | Mise en place architecture multi-agents | Architect |

---

## 📊 Historique des Niveaux

> Pour analyse rétrospective : calibrer les estimations de niveau.

| Date | Niveau | Feature | Durée réelle | Agent(s) |
|------|--------|---------|--------------|----------|
| 2026-03-15 | 🟢 HOTFIX | Carte membres (pins Klein blue, légende 5 catégories, Dark Matter, CityAutocomplete fix, photos équipe) | ~30min | Claude Code (Opus 4.6) |
| 2026-03-15 | 🔴 MAJEUR | Audit RGPD complet (14 écarts, 25 fichiers, 7 groupes agents parallèles) | ~30min | Claude Code (Opus 4.6) |
| 2026-03-15 | 🔴 MAJEUR | KPI BI Analytics (14 KPIs, 15 fichiers, 7 tasks subagent-driven) | ~25min | Claude Code (Opus 4.6) |
| 2026-03-14 | 🟢 HOTFIX | Refonte L'Émergence Mouvement (layout vertical, encadré ambition, Tronc.png, suppression SVG arrows) | ~20min | Claude Code (Opus 4.6) |
| 2026-03-14 | 🟡 STANDARD | Profils membres (models, 10 endpoints, MemberModal, MembersSection, seed, 21 tests) | ~1h30 | Claude Code (Opus 4.6) |
| 2026-03-14 | 🟡 STANDARD | Notifications candidatures (4 emails, config booking, Profile.tsx Scénariste + bouton entretien) | ~30min | Claude Code (Opus 4.6) |
| 2026-03-14 | 🟡 STANDARD | Refonte événements (modèle, upload, drag&drop, réservation, past/upcoming, organizer, error feedback, select fix, suspend fix) | ~1h30 | Claude Code (Opus 4.6) |
| 2026-03-13 | 🟢 HOTFIX | Images Mouvement (remplacement Unsplash → images locales, layout rectangulaire) | ~10min | Claude Code (Opus 4.6) |
| 2026-03-13 | 🟡 STANDARD | Formulaire contact backend (endpoint, modèles, frontend, 7 tests) | ~20min | Claude Code (Opus 4.6) |
| 2026-03-13 | 🟡 STANDARD | Candidatures scénaristes (modèles, API, formulaire 4 étapes, admin, 3 tests) | ~40min | Claude Code (Opus 4.6) |
| 2026-03-13 | 🟡 STANDARD | Workflow candidatures techniques (statut, batch, suivi profil, 4 tests) | ~30min | Claude Code (Opus 4.6) |
| 2026-03-13 | 🟡 STANDARD | Refonte page ECHOLink (8 sections, 3 fonctionnalités détaillées, exemples concrets) | ~30min | Claude Code (Opus 4.6) |
| 2026-03-13 | 🟡 STANDARD | Refonte page CogniSphère (mockups, texte, roadmap, mobile) | ~1h | Claude Code (Opus 4.6) |
| 2026-03-12 | 🔴 MAJEUR | Dashboard Partenaire (analytics, Recharts, hook tracking, onglet) | ~1h30 | Antigravity (Gemini) |
| 2026-03-12 | 🟡 STANDARD | Landing Page Dynamique (API stats/public + personnalisation) | ~30min | Antigravity (Gemini) |
| 2026-03-11 | 🔴 MAJEUR | RGPD Compliance (12 tâches, 5 blocs) | ~2h (Frontend + Backend) | Claude Code (Opus 4.6) |
| 2026-03-11 | 🟡 STANDARD | Admin CSV Exports (users + partners) | ~20min (Backend + Frontend) | Claude Code (Opus 4.6) |
| 2026-03-11 | 🟢 HOTFIX | Fix logo partenaire (Vite proxy) | ~10min | Claude Code (Opus 4.6) |
| 2026-03-11 | 🔴 MAJEUR | Scan Documentaire Exhaustif (\`/document-project\`) | ~45min (Docs & Archs) | Antigravity (Gemini) |
| 2026-03-11 | 🟡 STANDARD | Proposition 4 (SEO OpenGraph) | ~30min (Frontend Vite) | Antigravity (Gemini) |
| 2026-03-11 | 🟡 STANDARD | Proposition 3 (Micro-Analytique RGPD) | ~40min (Backend ASYNC + Frontend CTA hooks) | Antigravity (Gemini) |
| 2026-03-11 | 🟡 STANDARD | Admin Edit/Hide Partner + Logout | ~30min (Backend + Frontend) | Claude Code (Opus 4.6) |
| 2026-03-11 | 🟡 STANDARD | Proposition 1 (UX Onboarding Gamification) | ~1h (Frontend UI) | Antigravity (Gemini) |
| 2026-03-11 | 🟡 STANDARD | Optimisation Bundle (Code-Splitting) | ~20min (Frontend Vite + Router) | Antigravity (Gemini) |
| 2026-03-06 | 🟡 STANDARD | Story 3.1 Formulaire Candidature Partenaire | ~20min (backend sécurité + tests) | Claude Code (Opus 4.6) |
| 2026-03-06 | 🟡 STANDARD | Story 2.4 Passerelle Soutien/Dons | ~10min (frontend uniquement) | Claude Code (Opus 4.6) |
| 2026-03-06 | 🟡 STANDARD | Story 2.3 Candidatures Anti-Spam | ~25min (backend + frontend + composant partagé) | Claude Code (Opus 4.6) |
| 2026-03-06 | 🟡 STANDARD | Story 2.2 Exploration & Opt-in | ~20min (backend + frontend) | Claude Code (Opus 4.6) |
| 2026-03-06 | 🟢 HOTFIX | Story 2.1 Vitrine Vidéo | ~5min (badge uniquement) | Frontend |
| 2026-03-05 | 🟡 STANDARD | Story 1.2 Auth Classique | Backend: ~1h (Antigravity), Frontend: ~30min (Claude Code) | Backend, Frontend |
| _Exemple_ | 🟢 HOTFIX | Fix typo Contact | 10 min | Frontend |
| _Exemple_ | 🟡 STANDARD | Page Partenaires | 2h | Frontend, Designer |
| _Exemple_ | 🔴 MAJEUR | Module Echolink | 5h | Tous |

---

## 🔒 Locks Actifs

> Les agents doivent vérifier cette section AVANT de modifier un fichier.
> **Durée max : 2h** - Après expiration, le lock est considéré libéré.

| Fichier | Agent | Depuis | Expiration |
|---------|-------|--------|------------|
| _Aucun lock actif_ | - | - | - |

---

## 🚧 Blocages Actifs

> Les agents peuvent marquer ici leurs tâches bloquées par des dépendances externes.

| Agent | Tâche | Bloqué par | Date | Action requise |
|-------|-------|------------|------|----------------|
| _Aucun blocage_ | - | - | - | - |

---

## 📐 Design Specs

> Section remplie par le Designer AVANT le Frontend.

_Aucune spec en cours._

<!--
### Exemple de format :
### [Nom Composant/Page]
- **Couleur fond** : `--color-sand-light`
- **Couleur texte** : `--color-forest-dark`
- **Espacement** : padding 24px, gap 16px
- **Effets** : `.glass-card`, `.nature-shadow`
- **Animation** : fade-in 0.3s, hover scale 1.02
- **Responsive** : stack vertical < 768px
-->

---

## ⚠️ Points d'Attention

- Toujours utiliser les variables CSS du thème Nature
- Tester sur mobile avant de valider
- Mettre à jour ce fichier après chaque modification majeure
- **Vérifier les locks avant de modifier un fichier**
- **QA et Code Review sont obligatoires avant push**
- **Designer intervient AVANT Frontend**
- **Phase de Scoping obligatoire avant planification**

---

## 🚀 Prochaines Tâches

**Epic 1 (Identité & Sécurité) — TERMINÉ** (4/4 stories done)

**Epic 2 (Contenu & Engagement Visiteur) — TERMINÉ** (4/4 stories done)

**Epic 3 (Partenaires & ECHOSystem) — TERMINE** (5/5 stories done)

**Epic 4 (Back-Office Administration) — TERMINÉ** (4/4 stories done)
1. ~~**Story 4.1** — Panel d'administration sécurisé~~ ✅ done
2. ~~**Story 4.2** — Modération des candidatures partenaires~~ ✅ done
3. ~~**Story 4.3** — Gestion de l'agenda événements~~ ✅ done
4. ~~**Story 4.4** — Export de la base email opt-in~~ ✅ done (endpoint CSV + AdminExports + 4 tests + code review)

### Notes techniques

- Frontend bundle : Code Splitting (React.lazy) en place pour différer le chargement des routes. L'index est à ~230kB `(gzip ~72kB)`.
- Routes protégées : `/admin` (admin), `/admin/partenaires` (admin), `/admin/events` (admin), `/admin/exports` (admin), `/admin/members` (admin), `/admin/analytics` (admin), `/mon-compte/partenaire`, `/mes-donnees`
- API membres : GET /api/members (public), GET /api/members/{slug} (public), GET/PATCH /api/members/me (auth), PATCH /api/members/me/visibility (auth), GET/PATCH /api/admin/members (admin), POST /api/admin/members/seed/{id} (admin)
- Routes publiques (anciennement protégées) : `/cognisphere`, `/echolink`
- Auth : cookie-only (httpOnly), pas de localStorage — `credentials: 'include'` sur tous les fetch
- RGPD : bannière cookies (localStorage `echo-cookie-consent` + gtag consent API + openCookiePanel custom event), consentement formulaires (checkbox CGU/PC register), export/suppression données (MyData.tsx + GET /auth/my-data/export + DELETE /auth/my-data), désinscription emails, YouTubeEmbed façade, notice reCAPTCHA, notice HelloAsso, clause mineurs CGU, RoPA + procédure violation (docs/rgpd/)
- Analytics KPI : session_id (sessionStorage UUID), UTM capture (utm_source/medium/campaign), referrer, trackPageView interne, 8 CTAs instrumentés, admin dashboard GET /api/analytics/admin/dashboard
- Vite proxy : `/api` → `localhost:8000` en dev (vite.config.ts)

---

## 📋 Backlog Pré-Lancement

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 1 | ~~RGPD compliance~~ | Critique | ✅ Done |
| 2 | ~~Vue admin candidatures techniques~~ | Haute | ✅ Done (déjà implémenté : AdminCandidatures.tsx + 4 endpoints + route admin + export CSV) |
| 3 | ~~Admin événements : drag & drop image + autocomplétion adresse~~ | Moyenne | ✅ Done (drag & drop images, upload endpoint, pas d'autocomplétion adresse) |
| 4 | ~~Vérifier tous les parcours utilisateurs et boutons~~ | Haute | ✅ Done (27 routes vérifiées, 0 bouton cassé, contact form connecté) |
| 5 | ~~Design responsive mobile~~ | Haute | ✅ Done (375px+ toutes pages, commit 41044de) |
| 6 | ~~Formulaire d'adhésion membre~~ | Moyenne | ✅ Done (4 étapes, 7 endpoints, admin /admin/benevoles, export CSV, 4 emails, profil) |
| 7 | ~~Page profil utilisateur~~ | Moyenne | ✅ Done (Profile.tsx complet : infos, bio, intérêts, candidatures, RGPD) |
| 8 | ~~Page Soutenir avec nouveaux niveaux~~ | Basse | ✅ Done (3 paliers Graine/Racine/Canopée, FAQ, HelloAsso) |
| 9 | Modifier pages contenu (Ressources, ~~Mouvement~~, ~~CogniSphère~~, ~~ECHOLink~~) | Moyenne | 🔄 CogniSphère + ECHOLink + Mouvement done, Ressources restant |
| 10 | ~~Modifier formulaires candidature~~ | Moyenne | ✅ Done (TechForm compétences structurées + expérience, ScenaristForm genres/expérience + endpoint dédié, AdminCandidatures enrichi) |
| 11 | ~~Modifier images personnages~~ | Basse | ✅ Done (15 personnages remplacés, noms normalisés) |
| 12 | ~~Corriger logo ECHO série~~ | Basse | ✅ Done (PNG transparent, mix-blend supprimé) |
| 13 | Nouvelle charte graphique | Basse | À faire |
| 14 | Configurer SendGrid en production | Haute | À faire |
| 15 | Liens sociaux (12 href="#") — URLs à fournir | Moyenne | À faire |
| 16 | ~~Vérifier la barre en bas (footer) avec les liens~~ | Moyenne | ✅ Done (footer OK, seuls liens sociaux restent = #15) |
| 17 | ~~Rédiger et compléter la FAQ~~ | Moyenne | ✅ Done |
| 18 | ~~Dashboard partenaire avec métriques (clics site, etc.)~~ | Moyenne | ✅ Done (PartnerAnalytics.tsx, Recharts, 3 métriques, 30j) |
| 19 | ~~Rédiger les emails définitifs pour les 4 notifications candidature~~ | Moyenne | ✅ Done |
| 20 | Audit backend MongoDB + brainstorming améliorations (inclut review routes/members.py, optimisation requêtes, indexes) | Moyenne | À faire — utiliser skill `superpowers:brainstorming` puis `superpowers:systematic-debugging` |
| 21 | Modifier crédits série + vidéo prologue → bande-annonce (prévue terminée le 18 mars 2026) | Haute | À faire |
| 22 | ~~Refonte section "L'Émergence" page Mouvement~~ | Moyenne | ✅ Done (layout vertical : pousse + encadré ambition bordure ambre avec accroche serif + tronc, mots-clés colorés, OrganicArrow supprimé) |
| 23 | Nettoyer les données de test avant publication (événements, comptes partenaires, bénévoles, candidatures, profils membres de test) | Haute | À faire avant le 20 mars 2026 |
| 24 | ~~Système KPIs BI : UTM tracking, session ID (sessionStorage), page_view interne, events CTA, index MongoDB, endpoint admin dashboard, page AdminAnalytics.tsx~~ | Haute | ✅ Done (7 commits, 15 fichiers, 128 tests backend + 17 frontend, branche feat/kpi-bi-analytics mergée) |
| 25 | ~~🔴 RGPD Audit — Écart 1 : Blocage iframe YouTube avant consentement CMP (façade vidéo)~~ | Critique | ✅ Done (YouTubeEmbed + façade, useCookieConsent hook) |
| 26 | ~~🔴 RGPD Audit — Écart 2 : "Gérer mes cookies" dans le footer rouvre le panneau CMP~~ | Critique | ✅ Done (openCookiePanel via custom event) |
| 27 | ~~🔴 RGPD Audit — Écart 3 : Mention reCAPTCHA v3 visible sous bouton connexion~~ | Critique | ✅ Done (notice login + register forms) |
| 28 | ~~🟠 RGPD Audit — Écart 4 : Case CGU/PC obligatoire non pré-cochée + liens cliquables~~ | Important | ✅ Done (checkbox register avec liens /cgu et /politique-de-confidentialite) |
| 29 | ~~🟠 RGPD Audit — Écart 5 : Masquer emails directs partenaires~~ | Important | ✅ Done (emails/phones supprimés des vues publiques, API sanitized) |
| 30 | ~~🟠 RGPD Audit — Écart 6 : Compléter Politique de confidentialité~~ | Important | ✅ Done (reCAPTCHA, HelloAsso, APD belge, délai 3 mois, 15 sections) |
| 31 | ~~🟠 RGPD Audit — Écart 7 : Registre des traitements RoPA~~ | Important | ✅ Done (docs/rgpd/registre-traitements-ropa.md, 10 traitements) |
| 32 | ~~🟠 RGPD Audit — Écart 8 : Durée conservation données contact dans la PC~~ | Important | ✅ Done (5 durées dans section PC) |
| 33 | ~~🟡 RGPD Audit — Écart 9 : Corriger mentions légales~~ | Recommandé | ✅ Done (directeur publication unique + téléphone placeholder) |
| 34 | ~~🟡 RGPD Audit — Écart 10 : Section Sécurité des données dans la PC~~ | Recommandé | ✅ Done (7 mesures techniques) |
| 35 | ~~🟡 RGPD Audit — Écart 11 : Page "Mes données" espace membre~~ | Recommandé | ✅ Done (MyData.tsx + export JSON + suppression compte) |
| 36 | ~~🟡 RGPD Audit — Écart 12 : Procédure violation de données~~ | Recommandé | ✅ Done (docs/rgpd/procedure-violation-donnees.md) |
| 37 | ~~🟡 RGPD Audit — Écart 13 : Clause mineurs dans CGU~~ | Recommandé | ✅ Done (section Protection des mineurs, 15 ans+) |
| 38 | ~~🟡 RGPD Audit — Écart 14 : Mention HelloAsso dans PC + notice sur /soutenir~~ | Recommandé | ✅ Done (PC + notice redirect Support.tsx) |
| 39 | Ajouter le plan en trois phases du Mouvement ECHO sur la page Mouvement | Moyenne | À faire |
| 40 | ~~Ajouter des sous-menus au menu principal pointant directement vers les sections de chaque page~~ | Moyenne | ✅ Done (dropdown hover desktop + accordion mobile, 4 liens avec children: Série/Mouvement/Cognisphère/ECHOLink) |
| 41 | ~~Ajouter une vue d'ensemble des différentes sections/parties de chaque page sur la page d'accueil~~ | Moyenne | ✅ Done (sous-liens → dans les 3 piliers Home: Série, ECHOSystem, Plateformes) |
| 42 | Arbre vivant interactif : arbre qui grandit avec des feuilles (membres) et branches (partenaires) qui rejoignent ECHO | Basse | À faire — idée créative, lien avec métaphore pommier Mouvement |
| 43 | Page de références culturelles (style Popcorn Garage) : films, livres, œuvres en lien avec ECHO, Dante, transition écologique | Basse | À faire — contenu éditorial riche, nécessite curation |
| 44 | ~~RGPD Audit v2 — Accents contact form~~ | Important | ✅ Done (données, traitées, conformément, confidentialité) |
| 45 | ~~RGPD Audit v2 — Accents page 404~~ | Mineur | ✅ Done (été, déplacée, à) |
| 46 | ~~RGPD Audit v2 — Délai droits 3 mois → 1 mois dans PC~~ | Mineur | ✅ Done (Art. 12 RGPD, prorogeable 2 mois) |
| 47 | ~~Scroll-to-hash : navigation anchor (#section) depuis sous-menus et liens piliers~~ | Moyenne | ✅ Done (ScrollToTop gère hash avec offset header 100px + délai lazy-load) |
