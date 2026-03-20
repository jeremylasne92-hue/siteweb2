# 🧠 ECHO - Contexte Partagé

> Ce fichier est la mémoire partagée entre tous les agents. Consultez-le avant toute action et mettez-le à jour après vos modifications.

---

## 📋 État du Projet

**Dernière mise à jour** : 2026-03-20 (soir)
**Phase actuelle** : 🚀 LANCÉ — Site en production (20 mars 2026)
**Statut** : ✅ EN LIGNE — https://mouvementecho.fr accessible, HTTPS actif, Google Search Console vérifié, SendGrid DKIM/SPF authentifié, toutes variables Render configurées
**Dernier milestone** : Site lancé le 20/03/2026. HTTPS Let's Encrypt actif (expire 18/06/2026). Google Search Console vérifié + sitemap soumis. 12 bugs critiques/importants corrigés (code review). Résolution problème OVH "Site en construction" par recréation multisite. Configuration production complète (SendGrid domain auth, secrets Render, comptes admin).

### ⚠️ Rappels Pré-Lancement (20 mars 2026)
- [x] Bandeau cookies RGPD intégré + tracking conditionné au consentement
- [x] Audit sécurité : XSS fix, CSP whitelist, geo validation, deps nettoyées, npm 0 vulnérabilités
- [x] Images optimisées (144MB→6MB), fichiers renommés (kebab-case, pas d'espaces/accents)
- [x] Code mort nettoyé (Partners.tsx, Breadcrumbs.tsx, dossiers vides)
- [x] Audit SEO (og tags, twitter:image, JSON-LD, canonical) + a11y (lang, alt, responsive)
- [x] Backend déployé sur Render (echo-api-kfre.onrender.com)
- [x] MongoDB Atlas M0 configuré (echo-cluster, Paris)
- [x] **CNAME DNS** : api.mouvementecho.fr → echo-api-kfre.onrender.com ✅ (configuré OVH)
- [x] **Custom domain** dans Render Dashboard ✅ (api.mouvementecho.fr — Verified + Certificate Issued)
- [x] **GOOGLE_CLIENT_SECRET** dans Render env vars ✅
- [x] **SENDGRID_API_KEY** dans Render env vars ✅ (vérifié, emails fonctionnels)
- [x] **FRONTEND_URL** dans Render env vars ✅ (https://mouvementecho.fr)
- [x] **EMAIL_FROM** = noreply@mouvementecho.fr (domain authentifié DKIM/SPF/DMARC)
- [x] **EMAIL_REPLY_TO** = contact@mouvementecho.fr
- [x] **OAUTH_STATE_SECRET** dans Render env vars ✅
- [x] **UNSUBSCRIBE_SECRET** dans Render env vars ✅
- [x] **RECAPTCHA_SECRET_KEY** dans Render env vars ✅
- [x] **SendGrid Domain Authentication** — mouvementecho.fr vérifié (DKIM s1/s2 + SPF + DMARC)
- [x] **ENVIRONMENT** = production dans Render
- [x] Build de production (`npm run build`) + FTP upload `dist/` sur OVH ✅ (déployé 20/03/2026)
- [x] Recette manuelle endpoints (auth 11/11, partners+contact 14/15, candidatures 24/25 = 49/51 PASS)
- [x] **Comptes admin** configurés (jeremy.lasne92@gmail.com + mouvement.echo.france@gmail.com → role: admin)
- [x] **Base de données propre** — aucune donnée de test en production
- [ ] **Revoir le Dashboard Partenaire** avant la sortie officielle (UX, données, design)

### 📋 Backlog Post-Lancement (Brainstorm 20/03/2026)

**🔴 P0 — Cette semaine**
- [ ] Passer Render en tier payant ($7/mois) — supprimer le cold start 30-60s
- [ ] Email de bienvenue automatique post-inscription (SendGrid, séquence : bienvenue → présentation série → CTA candidature)
- [ ] Post prologue IA sur LinkedIn/Instagram/TikTok (texte : contre-pied IA, voix et musique authentiques)
- [ ] Messages personnels équipe (100 contacts, message personnalisé avec lien prologue)

**🟠 P1 — Semaine 2-3**
- [ ] Masquer/adapter compteurs communautaires Home si < seuil crédible (éviter effet preuve sociale inverse)
- [ ] Newsletter mensuelle via SendGrid (template + liste inscrits email_opt_out=false)
- [ ] Monitoring Render + Atlas (alertes latence > 2s, erreurs 5xx, stockage Atlas)
- [ ] Tester réception emails FAI français (Orange, Free, SFR) — réputation domaine neuf

**🟡 P2 — Mois 1**
- [ ] Dashboard Partenaire — revoir UX, données, design avant premiers partenaires
- [ ] Kit partenaire PDF téléchargeable (4 pages : concept, équipe, calendrier, participation)
- [ ] Section Actualités/Blog simple + 1er article making-of prologue IA (SEO + contenu frais)
- [ ] Tunnel de conversion post-vidéo : bande-annonce → inscription → choix du rôle
- [ ] Page /pitch épurée pour les partenaires (prologue + chiffres + calendrier)

**🟢 P3 — Mois 2+**
- [ ] Séquence email onboarding (J+1 bienvenue, J+7 coulisses, J+14 CTA candidature)
- [ ] Indicateur "Où en sommes-nous ?" sur page Mouvement (étape actuelle, objectifs)
- [ ] Soumettre manuellement les URLs clés dans Google Search Console (accélérer indexation)
- [ ] Réseaux sociaux personnages (prévu mai 2026)

**❌ Exclu**
- Pas de fonctionnalité de discussion/échange entre utilisateurs sur le site

### 🎬 Stratégie Virale — Opération Vald (Brainstorm 20/03/2026)

**Contexte** : Vald (1,82M YouTube, 1M Instagram, 1,7M Spotify) est intégré dans le plan narratif d'ECHO — rôle du psychiatre épisode 6. Convergence thématique profonde : structure dantesque (Pandémonium / ECHO), santé mentale (PROZACZOPIXAN), critique sociale (Ce monde est cruel). Vald est pro-IA et reposte régulièrement du contenu IA de lui-même.

**Messages envoyés** : DM à Echelon Records (formel, référence Pandémonium/PROZACZOPIXAN, proposition d'échange) + DM à Vald (personnel, références MAGNIFICAT, proposition rôle psychiatre épisode 6, lien santé mentale).

**Plan de production vidéos (5 contenus) :**

| # | Format | Contenu | Durée | Timing |
|---|--------|---------|-------|--------|
| 1 | Extrait mystère | Psychiatre PROZACZOPIXAN, montage rapide, hashtags #vald #rapfr #serie #ia | 12-15s | Samedi 21/03 18h |
| 2 | Side-by-side | Image IA psychiatre / photo réelle Vald — "POV : on a mis un rappeur dans notre série" | 8s | Dimanche 22/03 18h |
| 3 | Easter egg 33 | Extraits bande-annonce où "33" apparaît + sample audio *Bonus* de Vald — "33 épisodes. Coïncidence ?" | 10-15s | Lundi 23/03 18h |
| 4 | Making-of | Coulisses studio Mithra, voix originale sur images IA | 30s | Mardi 24/03 18h |
| 5 | Plan B | Compilation extraits + titre Vald (format qu'il reposte) | 30-60s | Semaine 2 si nécessaire |

**Plan d'activation :**
- [ ] Samedi matin : contacter 10 plus grosses fan pages Vald en DM (extrait + "référence cachée")
- [ ] Samedi 18h : post extrait 1 TikTok/Reels + DM message complet à @echelonrecords ET @valdsullyvan (vidéo jointe, pas lien) + bande-annonce YouTube complète avec miniature + disclaimer
- [ ] Dimanche 18h : post extrait 2 (side-by-side)
- [ ] Lundi 18h : post extrait 3 (Easter egg 33 / Bonus)
- [ ] Mardi 18h : post extrait 4 (making-of)
- [ ] Lundi soir : évaluation (> 10K vues → accélérer / < 1K → Plan B semaine 2)
- [ ] Semaine 2 si pas de réponse : vidéo virale avec extraits + titre Vald
- [ ] Semaine 3-4 si toujours rien : vidéo multi-rappeurs (élargir le spectre)

**Points clés :**
- Disclaimer YouTube : "Images générées par IA — hommage artistique. Non affilié à Vald ni Echelon Records."
- Ne jamais utiliser les termes "transition écologique" ou "documentaire" avec Vald — dire "série"
- Mettre en avant la convergence thématique (Dante, santé mentale, critique sociale), pas le fan service
- Le message à Vald cite ses textes (MAGNIFICAT, PROZACZOPIXAN) pour montrer la profondeur du lien
- Si Vald accepte → plan opérationnel nécessaire (enregistrement voix, planning, contrat)

---

## 🏗️ Architecture

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
├── tree-growth/   # 8 étapes arbre (1200px, JPEG) — ex "Image arbre en croissance"
├── team/          # 6 photos équipe (800px, JPEG) — ex "Photo équipe"
├── cognisphere/   # 6 mockups app
└── echolink/      # 3 mockups hub
```
> **Convention images** : kebab-case, pas d'espaces ni accents, JPEG optimisé ≤300KB

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
│   ├── useAnalytics.ts    # Tracking GA4 + interne (SendBeacon) — conditionné à hasAnalyticsConsent()
│   └── usePageTracking.ts # Tracking de navigation GA4 — conditionné à hasAnalyticsConsent()
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
| ~~À propos~~ | ~~`/a-propos`~~ | ❌ Supprimée (20/03/2026 — jamais demandée par le client) |
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
| AdminMembers fix projet + feedback erreurs | 🟢 HOTFIX | Ajout "Série ECHO" et "Projet ECHO" au dropdown projet + filtres. Error feedback sur boutons statut/save (catch silent → messages). 4 fichiers (models_member.py, candidatures.ts, AdminMembers.tsx). |
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
| 2026-03-20 | Configuration production complète : (1) SendGrid Domain Authentication — DKIM (s1/s2._domainkey CNAME), SPF (em9957 CNAME), DMARC (TXT v=DMARC1; p=none;) configurés chez OVH et vérifiés. Ancienne auth em8453 supprimée. (2) EMAIL_FROM changé de mouvement.echo.france@gmail.com → noreply@mouvementecho.fr. (3) Toutes variables Render vérifiées et complètes (OAUTH_STATE_SECRET, UNSUBSCRIBE_SECRET, RECAPTCHA_SECRET_KEY, GOOGLE_CLIENT_ID/SECRET, SENDGRID_API_KEY, etc.). (4) Custom domain Render api.mouvementecho.fr vérifié + certificat SSL émis. (5) Comptes admin MongoDB configurés (2 users role:admin). (6) Base de données production vérifiée propre (0 données de test). Niveau HOTFIX. | Claude Code (Opus 4.6) |
| 2026-03-20 | Ajustements post-lancement : (1) Saisons renommées partout — "L'Enfer/Le Purgatoire/Le Paradis" → "Diagnostic des crises/Solutions du terrain/Futurs souhaitables" (Serie.tsx, Mouvement.tsx). (2) Prologue : texte descriptif ajouté (storyboard IA, tournage réel, contre-pied voix/musique), crédits compacts restructurés, réseaux sociaux retirés → lien YouTube uniquement. (3) Nantes badge vert "teaser réalisé ✓". (4) Sous-nav "Rejoindre" ajoutée (Serie.tsx). (5) Profil : formatDisplayName() pour masquer suffixe hex OAuth. (6) Trailer vidéo mise à jour (R34yKJuPDWA). (7) Page À propos supprimée (AboutPage.tsx + route /a-propos + lien Footer) — jamais demandée. Niveau HOTFIX. | Claude Code (Opus 4.6) |
| 2026-03-19 | Footer réseaux sociaux : liens placeholder (#) remplacés par les vraies URLs (YouTube @MouvementECHOFrance, Instagram @mouvementecho, TikTok @mouvementecho). Facebook et Twitter retirés (pas de comptes). Icône TikTok SVG custom. target=_blank + noopener noreferrer. Niveau HOTFIX. | Claude Code (Opus 4.6) |
| 2026-03-19 | SendGrid configuré et testé : sender vérifié (mouvement.echo.france@gmail.com), clé API en local + Render, email test reçu (spams — normal en trial, domain auth à faire post-lancement). Variables Render mises à jour (SENDGRID_API_KEY, EMAIL_FROM, EMAIL_REPLY_TO, EMAIL_ALERT_TO, ENVIRONMENT=production, CORS_ORIGINS=mouvementecho.fr). Niveau HOTFIX. | Claude Code (Opus 4.6) |
| 2026-03-19 | Page Resources redesignée : hero avec image de fond (Unsplash bibliothèque), radial gradient, grid pattern, icône BookOpen, typographie large serif, animation slide-up — aligné sur le format Cognisphere/ECHOLink. Email de bienvenue ajouté à l'inscription + centralisation alertes via EMAIL_ALERT_TO. Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-18 | Page Soutenir : (1) Image de fond hero ajoutée (Unsplash mains en coupe, opacity 15%) pour cohérence avec les autres pages. (2) HelloAssoCounter refactorisé : code aligné sur l'embed officiel HelloAsso (allowtransparency, auto-resize postMessage, pas de sandbox). Iframe native en production (compteur temps réel mis à jour automatiquement avec les contributions), fallback custom en dev (HelloAsso bloque X-Frame-Options depuis localhost). Niveau HOTFIX. | Claude Code (Opus 4.6) |
| 2026-03-18 | Audit pré-déploiement complet : (1) Images optimisées 144MB→6MB (-96%, Pillow resize+JPEG), 5 inutilisées supprimées, 32 compressées. (2) Renommage dossiers/fichiers images (espaces/accents→kebab-case : "Image arbre en croissance"→tree-growth, "Photo équipe"→team). (3) Nettoyage code mort (Partners.tsx doublon, Breadcrumbs.tsx orphelin, services/ vide, Logo/ vide). (4) twitter:image ajouté index.html. (5) npm audit fix (0 vulnérabilités). (6) Audit sécurité (CORS, CSP, cookies, rate limiting, validation input — tout OK). (7) Audit SEO/a11y (og tags, JSON-LD, lang=fr, responsive, error boundary — OK). (8) Audit organisation fichiers (routes 35/35 couvertes, imports sans circulaires, nommage cohérent). 275 backend + 32 frontend tests OK, build OK. Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-18 | Fix UX validation disponibilité StudentApplicationForm + VolunteerApplicationForm : message d'erreur explicite listant les options (stage court, long, alternance, temps partiel), auto-clear erreur quand l'utilisateur sélectionne un radio ou une compétence. Test mis à jour. Niveau HOTFIX. | Claude Code (Opus 4.6) |
| 2026-03-18 | Harmonisation UX complète 10 formulaires : (1) placeholders email standardisés "votre@email.com" (RegisterForm, EmailLoginForm), (2) style erreur Contact.tsx aligné (bandeau rouge harmonisé), (3) messages succès candidatures uniformisés "avec succès" (TechApp, ScenaristApp), (4) honeypot anti-spam ajouté PartnerFormModal, (5) placeholders + "(optionnel)" ajoutés champs partenaire (contact_name, contact_role, contact_email, website_url), (6) loading text harmonisé "Envoi..." Contact.tsx. 32 tests + build OK. Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-18 | Password strength UI harmonisé sur 3 formulaires : nouveau composant PasswordRequirements.tsx (checklist temps réel 4 critères : 8 chars, majuscule, chiffre, spécial), barre de force colorée (4 niveaux), intégré sur RegisterForm, ResetPasswordForm, PartnerFormModal. PartnerFormModal enrichi : œil show/hide (Eye/EyeOff), champ confirmation password, validation isStep4Valid étendue. Backend auth.py : validate_password_strength sur change-password. Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-18 | Tests manuels endpoints pré-déploiement (3 agents parallèles) : Auth flow 11/11 PASS (register, login, /me, erreurs, forgot-password, logout, rate limiting 429). Partners+Contact 14/15 PASS (CRUD, filtres, stats, RGPD PII masqué, rate limiting contact 3/15min). Candidatures 24/25 PASS (tech+bénévole+étudiant+scénariste CRUD, transitions statut, CSV exports, validation 422, admin endpoints). 1 PARTIAL (partners/apply retourne 200 au lieu de 201), 1 WARN (pas de contrôle doublon email candidatures — by design). Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-18 | Audit code exhaustif (~120 constats, 10 cycles adversariaux) analysé et trié : 50% faux positifs identifiés (14 CRITIQUES/HAUTES déjà corrigées). 15 corrections appliquées : P0 — CORS .strip(), .to_list() borné (10000 exports, 1000 queries), asyncio.gather return_exceptions (4 endpoints), ObjectId validation mediatheque, slug collision partner edit, contact messages UUID id, analytics rate limiting (100/min), Content-Length middleware (10MB). P1 — Button CSS spinner (remplace emoji ⏳), console.error conditionnel DEV, aria-label 8 boutons sociaux, localhost centralisé (GoogleLoginButton+analytics). P2 accessibilité — skip-to-main Layout, aria-expanded FAQ, focus trap Modal. Doublon "Le 47" supprimé + 7 partenaires sans id corrigés + offset carte réduit (0.15°→0.012°). 275 backend + 32 frontend tests OK. Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-18 | CityAutocomplete international : suppression restriction `countrycodes=fr` dans Nominatim API, ajout pays + région dans le détail des suggestions (ex: "Dublin, Comté de Dublin, Irlande"), déduplication par ville+pays. Ajout SENDGRID_API_KEY et FRONTEND_URL à la checklist pré-lancement Render. Niveau HOTFIX. | Claude Code (Opus 4.6) |
| 2026-03-18 | Carte mondiale + géocodeur international : (1) AutoFitBounds Leaflet pour ajuster le zoom à tous les marqueurs (monde entier), (2) geocode_city étendu — suppression restriction country=France, fallback mondial, (3) 10 candidatures test dans 10 pays (Japon, Brésil, Sénégal, Irlande, Pologne, Italie, Maroc, Danemark, Inde, Mexique), (4) validation dates année 2024-2030 (frontend min/max + backend), (5) textes CogniSphère/ECHOLink mis à jour ("Bêta", lancement 1T2027), (6) 3×15=45 tests API (Contact+Partenaires+Admin/Exports) : 42 PASS 0 FAIL 3 SKIP. Issue backlog : GET /contact/admin/all manque champ id. Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-18 | Refonte page Soutenir (3 campagnes HelloAsso Lille/Lyon/Bordeaux), composant HelloAssoCounter iframe sécurisé, badge J-XX dynamique, config donation.ts 3 campagnes. Fix erreurs formulaires candidature (422→message précis au lieu de générique). Fix bug profil "Bénévole Invalid Date" (array vide truthy). Validateur start_date sur StudentEditUpdate. Batterie 25 tests API (12 candidatures + 13 utilisateurs) : 22 PASS, 3 FAIL (cookie session test-only). Checklist pré-lancement + design doc. Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-17 | Harmonisation dates complète : (1) datetime.utcnow()→datetime.now(UTC) dans 31 fichiers backend (models, routes, services, utils, tests), (2) helper format_date_csv (DD/MM/YYYY HH:MM) + format_date_str_fr pour CSV exports lisibles Excel, (3) start_date strict YYYY-MM-DD (suppression YYYY-MM), (4) fix timezone AdminEvents.tsx, (5) affichage start_date DD/MM/YYYY dans AdminStudents, (6) script migration MongoDB (scripts/migrate_dates_utc.py) pour dates naïves→UTC-aware. 39 fichiers, 205 tests backend + 32 frontend. Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-17 | Refonte Home hero (logo image, trailer modal YouTube, attribution Dante, lien Rejoindre→/mouvement#rejoindre), Serie.tsx timeline info saisons, sous-menus Header (Rejoindre Série + Partenaires), Modal scroll fix, AdminDashboard badges pending-only, debounce Nominatim PartnerFormModal. Niveau HOTFIX. | Claude Code (Opus 4.6) |
| 2026-03-17 | Audit #3 pré-lancement (22 findings, 23% faux positifs). 7 fixes critiques appliqués (commit 56ed9b0) : (1) admin_dashboard collections corrigées, (2) XSS html.escape emails, (3) sessions invalidées post-reset MDP, (4) logo upload fix, (5) timing attack /login DUMMY_HASH, (6) contact_messages ObjectId lookup, (7) TTL index user_sessions. 8 reportés S+1. Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-17 | Audit externe pré-lancement : 16 findings analysés, 8 confirmés, 6 faux positifs (37.5%). 4 fixes appliqués : (1) XSS innerHTML→textContent Mouvement.tsx, (2) CSP connect-src whitelist (API, Nominatim, GA4, reCAPTCHA), (3) validation bornes géo partners.py, (4) requirements.txt nettoyé (77→59 deps, dev séparé). 4 reportés S+1 (.catch silencieux, console.log, token TTL, is_active). Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-17 | Cookie consent RGPD intégré : CookieBanner monté dans App.tsx, tracking GA4+interne conditionné à hasAnalyticsConsent() dans useAnalytics et usePageTracking, révocation GA4 + suppression cookies _ga* sur refus, lien "Gérer mes cookies" dans footer déjà câblé. Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-17 | Data quality + déploiement : normalisation emails/skills/phones (normalize.py), cascade deletes (member_profiles, volunteer_applications, contact_messages), 3 index analytiques, .htaccess SPA+HTTPS+security headers, smoke test script, pages légales (Render+Atlas hébergeurs), bcrypt downgrade 4.0.1, python-slugify ajouté. Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-16 | Sécurité + CSP : (1) CSP frame-src étendu avec youtube-nocookie.com + youtube.com pour permettre l'embed bande-annonce. (2) Clé SendGrid retirée de backend/.env + fichier retiré du tracking git (git rm --cached). (3) backend/.env ajouté explicitement au .gitignore. Clé à révoquer dans dashboard SendGrid. .env.example déjà complet avec toutes les variables documentées. Niveau HOTFIX. | Claude Code (Opus 4.6) |
| 2026-03-16 | Mouvement page : (1) Plan 3 phases paragraphe simplifié ("Notre vision suit une progression en trois phases, chacune portée par une saison de la série ECHO."). (2) Tailles agrandies (titres 4xl→6xl, texte base→lg). (3) "Le Plan" ajouté au sous-menu Mouvement dans Header.tsx. (4) Conclusion mise à jour (ajout "s'informer"). Niveau HOTFIX. | Claude Code (Opus 4.6) |
| 2026-03-16 | Readiness report pré-lancement : score 78/100, GO CONDITIONNEL. 4 blocages critiques : (1) clé SendGrid exposée dans .env — révoquer immédiatement ✅ FAIT, (2) .env production non configuré (OAuth placeholders, CORS dev, ENVIRONMENT absent, secrets par défaut), (3) CSP bloque YouTube iframes ✅ FAIT, (4) données de test non nettoyées. Rapport complet : `_bmad-output/implementation-artifacts/readiness-report-20260316.md`. Niveau STANDARD. | Claude Code (Sonnet 4.6) |
| 2026-03-16 | Code review 5 agents parallèles + scoring : 3 issues critiques corrigées. (1) Suppression TLD whitelist dans isValidEmail — rejetait .ai, .re, .bzh, .eco, etc., bloquait inscription/reset. (2) CityAutocomplete : setCustomValidity ne bloque plus si API Nominatim échoue (flag hasSuggestionsLoaded). (3) Contact.tsx honeypot : tabIndex dans style→JSX prop, structure alignée sur les autres formulaires. Messages d'erreur schemas.ts mis à jour. README.md + source-tree.md réécrits. Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-16 | Audit complet validation formulaires : isValidEmail (TLD check), isValidPhone (regex + digit count), sanitizePhone, isValidPostalCode. Applied on PartnerFormModal, MyPartnerAccount, AdminVolunteers, Contact, auth schemas. Breadcrumbs supprimés (à restaurer — backlog). Accents français corrigés. 21 fichiers, 18 tests, build OK. Niveau STANDARD. | Claude Code (Opus 4.6) |
| 2026-03-15 | Fix partenaires invisibles : Partner model (models_partner.py) champs address/city/postal_code/latitude/longitude/contact_name/contact_email rendus Optional (étaient str/float requis, causaient Pydantic ValidationError 500 quand DB avait null). AddressAutocomplete (ui/AddressAutocomplete.tsx) intégré dans AdminPartners pour auto-remplir ville/CP/pays/GPS via Nominatim. Niveau HOTFIX. | Claude Code (Opus 4.6) |
| 2026-03-15 | Carte membres : fix marqueurs superposés (même ville). Ajout utilitaire markerOffsets.ts (offset circulaire 0.15° pour co-localisés). Popups enrichis (avatar, projet, skills, ville, "Voir le profil"). Auto-geocoding backend quand ville modifiée (PATCH admin/members). Re-geocoding batch des 10 membres. Niveau HOTFIX. | Claude Code (Opus 4.6) |
| 2026-03-15 | AdminMembers fix : ajout "serie_echo" et "projet_echo" au ProjectType backend (models_member.py) + PROJECT_LABELS frontend (candidatures.ts) + dropdown et filtres AdminMembers.tsx. Error feedback : handleStatusChange n'avait aucun feedback (catch vide + pas de message d'erreur API), ajout de messages verts/rouges pour statut et save. type="button" explicite sur Button save. Niveau HOTFIX. | Claude Code (Opus 4.6) |
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
| 2026-03-20 | 🟢 HOTFIX | Config production (SendGrid DKIM/SPF/DMARC, variables Render, comptes admin, vérification DB) | ~30min | Claude Code (Opus 4.6) |
| 2026-03-20 | 🟢 HOTFIX | Ajustements post-lancement (saisons, prologue, crédits, profil, trailer, suppression AboutPage) | ~45min | Claude Code (Opus 4.6) |
| 2026-03-19 | 🟢 HOTFIX | Footer réseaux sociaux (YouTube, Instagram, TikTok — vraies URLs, Facebook/Twitter retirés) | ~10min | Claude Code (Opus 4.6) |
| 2026-03-19 | 🟢 HOTFIX | SendGrid configuré (sender vérifié, email test, variables Render) | ~20min | Claude Code (Opus 4.6) |
| 2026-03-19 | 🟡 STANDARD | Page Resources redesignée (hero Cognisphere/ECHOLink style) + email bienvenue + EMAIL_ALERT_TO | ~25min | Claude Code (Opus 4.6) |
| 2026-03-18 | 🟢 HOTFIX | Page Soutenir : image fond hero + HelloAssoCounter aligné code officiel (postMessage, allowtransparency, fallback dev) | ~15min | Claude Code (Opus 4.6) |
| 2026-03-18 | 🟡 STANDARD | Audit pré-déploiement (images 144→6MB, renommage fichiers, code mort, npm audit, sécurité, SEO, organisation) | ~30min | Claude Code (Opus 4.6) |
| 2026-03-18 | 🟢 HOTFIX | Fix UX validation disponibilité (message explicite + auto-clear erreur, StudentApp + VolunteerApp) | ~10min | Claude Code (Opus 4.6) |
| 2026-03-18 | 🟡 STANDARD | Harmonisation UX 10 formulaires (placeholders, erreurs, succès, honeypot, optionnel, loading) | ~20min | Claude Code (Opus 4.6) |
| 2026-03-18 | 🟡 STANDARD | Password strength UI (PasswordRequirements.tsx, barre force, œil, confirm — 3 formulaires + backend) | ~25min | Claude Code (Opus 4.6) |
| 2026-03-18 | 🟡 STANDARD | Tests manuels endpoints (3 agents parallèles, 49/51 PASS) | ~15min | Claude Code (Opus 4.6) |
| 2026-03-17 | 🟡 STANDARD | Harmonisation dates (utcnow→now(UTC) 31 fichiers, CSV DD/MM/YYYY, start_date strict, timezone fix, migration script MongoDB) | ~20min | Claude Code (Opus 4.6) |
| 2026-03-17 | 🟢 HOTFIX | Refonte Home hero + Serie timeline + Header sous-menus Rejoindre + Modal scroll + AdminDashboard badges | ~45min | Claude Code (Opus 4.6) |
| 2026-03-17 | 🟡 STANDARD | Audit #3 vérifié (22 findings → 7 fixes critiques: collections admin, XSS email, sessions, logo, timing, ObjectId, TTL) | ~25min | Claude Code (Opus 4.6) |
| 2026-03-17 | 🟡 STANDARD | Audit externe vérifié (16 findings → 4 fixes: XSS, CSP, géo, deps) | ~30min | Claude Code (Opus 4.6) |
| 2026-03-17 | 🟡 STANDARD | Cookie consent RGPD (bandeau + guards tracking + révocation GA4) | ~20min | Claude Code (Opus 4.6) |
| 2026-03-17 | 🟡 STANDARD | Data quality (normalize.py, cascades, indexes) + déploiement infra (.htaccess, smoke test, legal pages, deps fixes) | ~45min | Claude Code (Opus 4.6) |
| 2026-03-16 | 🟡 STANDARD | Code review 5 agents + 3 fixes (TLD whitelist, CityAutocomplete, honeypot) + docs (README, source-tree) | ~30min | Claude Code (Opus 4.6) |
| 2026-03-16 | 🟡 STANDARD | Audit validation formulaires (21 fichiers, email/phone/postal, accents) | ~25min | Claude Code (Opus 4.6) |
| 2026-03-15 | 🟢 HOTFIX | Carte membres : fix marqueurs superposés (markerOffsets.ts, popups enrichis, auto-geocoding, batch re-geocoding) | ~40min | Claude Code (Opus 4.6) |
| 2026-03-15 | 🟢 HOTFIX | AdminMembers fix (ProjectType +2 options, error feedback statut/save, 4 fichiers) | ~10min | Claude Code (Opus 4.6) |
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

**🚀 Configuration Production — TERMINÉ** (20/03/2026)
- ~~SendGrid Domain Authentication (DKIM/SPF/DMARC)~~ ✅
- ~~Variables Render (toutes)~~ ✅
- ~~Custom domain API (api.mouvementecho.fr)~~ ✅
- ~~Comptes admin MongoDB~~ ✅
- ~~Base de données propre~~ ✅
- ~~Google Search Console + sitemap~~ ✅
- ~~HTTPS Let's Encrypt~~ ✅

---

## 📋 Backlog Post-Lancement (Phase 2)

**Priorité haute — Semaine 1 post-lancement :**
1. **Dashboard Partenaire** — Revoir UX, données affichées, design (existant mais à améliorer)
2. **Monitoring** — Vérifier logs Render, erreurs 500, performance API (cold start Render free tier)
3. **SEO** — Suivre indexation Google (Search Console), soumettre pages importantes
4. **Tests utilisateurs** — Recueillir retours sur inscription, navigation, formulaires

**Priorité moyenne — Mois 1 :**
5. **Réseaux sociaux personnages** — Prévu mai 2026 (cf. memory)
6. **Contenu épisodes** — Ajouter les premiers épisodes quand disponibles
7. **Événements** — Créer les premiers événements dans l'agenda
8. **Partenaires** — Onboarder les premiers partenaires via le formulaire

**Priorité basse — Trimestre 1 :**
9. **CogniSphère bêta** — Prévu juin 2026
10. **ECHOLink** — Phase 2 prévue décembre 2026
11. **Render plan payant** — Si le trafic augmente (cold start ~30s sur free tier)
12. **MongoDB Atlas upgrade** — Si > 512MB données (M0 free tier)

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
| 14 | ~~Configurer SendGrid en production~~ | Haute | ✅ Done (sender vérifié, emails test reçus, variables Render configurées) |
| 15 | ~~Liens sociaux footer~~ | Moyenne | ✅ Done (YouTube, Instagram, TikTok — Facebook/Twitter retirés, pas de comptes) |
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
| 39 | ~~Ajouter le plan en trois phases du Mouvement ECHO sur la page Mouvement~~ | Moyenne | ✅ Done (3 PhaseCards Enfer/Purgatoire/Paradis, `<details>` natif, palette terreuse rouge→ambre→vert, acronymes ECHO colorés, conclusion) |
| 40 | ~~Ajouter des sous-menus au menu principal pointant directement vers les sections de chaque page~~ | Moyenne | ✅ Done (dropdown hover desktop + accordion mobile, 4 liens avec children: Série/Mouvement/Cognisphère/ECHOLink) |
| 41 | ~~Ajouter une vue d'ensemble des différentes sections/parties de chaque page sur la page d'accueil~~ | Moyenne | ✅ Done (sous-liens → dans les 3 piliers Home: Série, ECHOSystem, Plateformes) |
| 42 | Arbre vivant interactif : arbre qui grandit avec des feuilles (membres) et branches (partenaires) qui rejoignent ECHO | Basse | À faire — idée créative, lien avec métaphore pommier Mouvement |
| 43 | Page de références culturelles (style Popcorn Garage) : films, livres, œuvres en lien avec ECHO, Dante, transition écologique | Basse | À faire — contenu éditorial riche, nécessite curation |
| 44 | ~~RGPD Audit v2 — Accents contact form~~ | Important | ✅ Done (données, traitées, conformément, confidentialité) |
| 45 | ~~RGPD Audit v2 — Accents page 404~~ | Mineur | ✅ Done (été, déplacée, à) |
| 46 | ~~RGPD Audit v2 — Délai droits 3 mois → 1 mois dans PC~~ | Mineur | ✅ Done (Art. 12 RGPD, prorogeable 2 mois) |
| 47 | ~~Scroll-to-hash : navigation anchor (#section) depuis sous-menus et liens piliers~~ | Moyenne | ✅ Done (ScrollToTop gère hash avec offset header 100px + délai lazy-load) |
| 48 | Internationalisation (i18n) : sélecteur de langue (FR/EN minimum), traduction de tout le contenu utilisateur, persistance du choix (localStorage/URL) | Moyenne | À faire — nécessite choix lib (react-i18next ou react-intl), extraction de toutes les chaînes, fichiers de traduction |

### 📋 Backlog Post-Lancement — Admin Console Improvements

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 24 | Audit log structuré en MongoDB (collection admin_audit_log) — tracer toutes les actions admin (qui, quand, quoi) pour conformité RGPD | Haute | À faire |
| 25 | Soft-delete sur candidatures et partenaires — remplacer les hard-delete par un champ deleted_at, ajouter une corbeille admin | Haute | À faire |
| 26 | Pagination serveur sur les tableaux admin — remplacer les limit=500 par skip/limit avec compteur total | Moyenne | À faire |
| 27 | Persistance des filtres admin dans l'URL — utiliser les query params pour conserver l'état des filtres au rechargement | Moyenne | À faire |
| 28 | Graphiques d'évolution sur AdminAnalytics — line charts (recharts) pour inscriptions/jour, candidatures/semaine, funnel de conversion | Moyenne | À faire |
| 29 | Gestion multi-admin — verrouillage optimiste et indicateur "en cours de traitement par X" sur les candidatures | Moyenne | À faire |
| 30 | Scoring de candidature — indicateurs objectifs (compétences, portfolio, expérience) pour prioriser le traitement | Basse | À faire |
| 31 | Relances automatiques email — candidature pending >7j → alerte admin, entretien >14j → relance candidat | Moyenne | À faire |
| 32 | Adhérents (utilisateurs inscrits) sur la carte ECHOSystem — ajouter les users avec is_member=true et coordonnées GPS à la vue carte publique, avec consentement opt-in de visibilité | Moyenne | À faire |
| 33 | Refonte complète validation formulaires — centraliser toute la validation (email, phone, URL, file upload) dans un système cohérent : créer isValidURL(), ajouter validation taille/type fichiers logo (2Mo, jpeg/png/webp) côté client, honeypot sur PartnerFormModal, maxLength/minLength cohérents sur tous les champs, indicateur force mot de passe sur PartnerFormModal, feedback erreur temps réel sur saisie (pas seulement au submit), validation URL sociale (LinkedIn/Instagram/Twitter) | Haute | À faire |
