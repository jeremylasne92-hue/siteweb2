# 🧠 ECHO - Contexte Partagé

> Ce fichier est la mémoire partagée entre tous les agents. Consultez-le avant toute action et mettez-le à jour après vos modifications.

---

## 📋 État du Projet

**Dernière mise à jour** : 2026-03-13
**Phase actuelle** : Post-Epics — Pré-lancement (lancement 20 mars 2026)
**Statut** : ✅ Opérationnel — Logo ECHO transparent + Contact form backend
**Dernier milestone** : Remplacement logo ECHO série (fond noir → PNG transparent) sur Header, Serie, SEO

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
│   ├── thematics.py       # Thématiques
│   └── resources.py       # Ressources
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
- Routes protégées : `/admin` (admin), `/admin/partenaires` (admin), `/admin/events` (admin), `/admin/exports` (admin), `/mon-compte/partenaire`
- Routes publiques (anciennement protégées) : `/cognisphere`, `/echolink`
- Auth : cookie-only (httpOnly), pas de localStorage — `credentials: 'include'` sur tous les fetch
- RGPD : bannière cookies (localStorage `echo-cookie-consent` + gtag consent API), consentement formulaires, export/suppression données, désinscription emails
- Vite proxy : `/api` → `localhost:8000` en dev (vite.config.ts)

---

## 📋 Backlog Pré-Lancement

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 1 | ~~RGPD compliance~~ | Critique | ✅ Done |
| 2 | ~~Vue admin candidatures techniques~~ | Haute | ✅ Done (déjà implémenté : AdminCandidatures.tsx + 4 endpoints + route admin + export CSV) |
| 3 | Admin événements : drag & drop image + autocomplétion adresse | Moyenne | À faire |
| 4 | ~~Vérifier tous les parcours utilisateurs et boutons~~ | Haute | ✅ Done (27 routes vérifiées, 0 bouton cassé, contact form connecté) |
| 5 | ~~Design responsive mobile~~ | Haute | ✅ Done (375px+ toutes pages, commit 41044de) |
| 6 | Formulaire d'adhésion membre | Moyenne | À faire |
| 7 | Page profil utilisateur | Moyenne | À faire |
| 8 | Page Soutenir avec nouveaux niveaux | Basse | À faire |
| 9 | Modifier pages contenu (Ressources, ~~Mouvement~~, ~~CogniSphère~~, ~~ECHOLink~~) | Moyenne | 🔄 CogniSphère + ECHOLink + Mouvement done, Ressources restant |
| 10 | Modifier formulaires candidature | Moyenne | À faire |
| 11 | Modifier images personnages | Basse | À faire |
| 12 | Corriger logo ECHO série | Basse | À faire |
| 13 | Nouvelle charte graphique | Basse | À faire |
| 14 | Configurer SendGrid en production | Haute | À faire |
| 15 | Liens sociaux (12 href="#") — URLs à fournir | Moyenne | À faire |
| 16 | Vérifier la barre en bas (footer) avec les liens | Moyenne | À faire |
| 17 | Rédiger et compléter la FAQ | Moyenne | À faire |
| 18 | Dashboard partenaire avec métriques (clics site, etc.) | Moyenne | À faire |
