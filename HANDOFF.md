# HANDOFF — Mouvement ECHO

> Document de passation exhaustif pour reprise du projet.
> Derniere mise a jour : 2026-03-06

---

## 1. Presentation du Projet

**Mouvement ECHO** est une plateforme web pour un mouvement citoyen lie a une serie documentaire. Le site presente la serie, federe une communaute de partenaires (ECHOSystem), propose des evenements publics, et offre un espace d'administration securise.

- **Repo** : `sitewebecho by emergent` (branche principale : `main`)
- **Methodologie** : BMAD (multi-agents), sprints avec Epics/Stories
- **Etat** : 19 commits sur main, 4 Epics dont 3 terminees

---

## 2. Stack Technique

### Frontend
| Technologie | Version | Role |
|-------------|---------|------|
| React | 19.2 | UI library |
| TypeScript | ~5.9.3 | Typage statique |
| Vite | 7.2.4 | Build tool + dev server |
| Tailwind CSS | 4.1.18 | Styling utility-first |
| React Router DOM | 7.11 | Routing SPA |
| Zustand | 5.0.11 | State management (auth store) |
| React Hook Form + Zod | 7.71 / 4.3 | Formulaires + validation |
| Framer Motion | 12.23 | Animations |
| Lucide React | 0.562 | Icones |
| Leaflet + React Leaflet | 1.9 / 5.0 | Cartographie partenaires |
| TanStack React Query | 5.90 | Data fetching (utilise dans auth) |
| Vitest | 4.0.18 | Tests unitaires |
| Testing Library | 16.3 | Tests composants React |

### Backend
| Technologie | Version | Role |
|-------------|---------|------|
| Python | 3.11 | Runtime |
| FastAPI | 0.110.1 | Framework API |
| Uvicorn | 0.25.0 | Serveur ASGI |
| Motor | 3.3.1 | Driver async MongoDB |
| PyMongo | 4.5.0 | Driver MongoDB (utilise par Motor) |
| Pydantic | 2.12.3 | Validation de donnees |
| Passlib + bcrypt | 1.7.4 / 4.1.3 | Hash des mots de passe |
| python-jose + PyJWT | 3.5.0 / 2.10.1 | JWT (sessions) |
| httpx | 0.28.1 | Client HTTP async (Google OAuth) |
| Pillow | 11.2.1 | Validation images (uploads logos) |
| python-dotenv | 1.2.1 | Variables d'environnement |
| pytest | 8.4.2 | Tests backend |

### Base de donnees
- **MongoDB** (local via `mongodb://localhost:27017`)
- Base : `test_database` (nom configurable via `.env`)
- Driver async : Motor (AsyncIOMotorClient)

---

## 3. Arborescence du Projet

```
sitewebecho by emergent/
|
|-- backend/
|   |-- server.py                    # Point d'entree FastAPI (port 8000)
|   |-- models.py                    # Pydantic models (User, Episode, Event, etc.)
|   |-- models_partner.py            # Modeles Partner, PartnerCategory, PartnerStatus
|   |-- models_extended.py           # (legacy, peu utilise)
|   |-- auth_utils.py                # hash_password, verify_password, 2FA helpers
|   |-- email_service.py             # Stub email (logs en console, pas d'envoi reel)
|   |-- seed_partners.py             # Script de seed pour partenaires de demo
|   |-- core/
|   |   |-- config.py                # Settings centralises (env vars)
|   |-- services/
|   |   |-- auth_service.py          # Google OAuth service
|   |   |-- auth_local_service.py    # Register/Login local (Service Pattern)
|   |   |-- password_reset_service.py # Reset mot de passe
|   |-- routes/
|   |   |-- __init__.py
|   |   |-- auth.py                  # /auth/* (register, login, google, logout, me, reset)
|   |   |-- episodes.py              # /episodes/* (CRUD + opt-in)
|   |   |-- events.py                # /events/* (CRUD admin + liste publique)
|   |   |-- partners.py              # /partners/* (CRUD + apply + admin moderation)
|   |   |-- candidatures.py          # /candidatures/tech (soumission anti-spam)
|   |   |-- progress.py              # /progress/* (suivi video)
|   |   |-- videos.py                # /videos/* (upload/streaming)
|   |   |-- users.py                 # /users/* (admin)
|   |   |-- thematics.py             # /thematics/*
|   |   |-- resources.py             # /resources/* + /actors/*
|   |-- tests/
|   |   |-- routes/
|   |       |-- test_auth_local.py       # 6 tests (register + login)
|   |       |-- test_auth_google.py      # Tests Google OAuth
|   |       |-- test_password_reset.py   # Tests reset mot de passe
|   |       |-- test_partners_apply.py   # 5 tests (candidature partenaire)
|   |       |-- test_candidatures.py     # Tests candidatures tech
|   |       |-- test_episodes_optin.py   # Tests opt-in episodes
|   |       |-- test_events.py           # 5 tests (CRUD events)
|   |-- requirements.txt
|   |-- .env                         # Variables d'environnement (NE PAS COMMITER)
|   |-- uploads/                     # Fichiers uploades (logos partenaires)
|
|-- frontend/
|   |-- package.json
|   |-- vite.config.ts               # Config Vite + Vitest
|   |-- tsconfig.json
|   |-- src/
|   |   |-- main.tsx                 # Point d'entree React
|   |   |-- App.tsx                  # Router principal (toutes les routes)
|   |   |-- index.css                # Styles globaux + theme Nature
|   |   |-- config/
|   |   |   |-- api.ts              # API_URL, PARTNERS_API, EVENTS_API
|   |   |   |-- booking.ts          # Config Google Calendar (RDV partenaire)
|   |   |   |-- donation.ts         # Config HelloAsso (dons)
|   |   |-- features/
|   |   |   |-- auth/
|   |   |       |-- store.ts        # Zustand auth store (token, user, session)
|   |   |       |-- schemas.ts      # Schemas Zod (validation formulaires)
|   |   |       |-- api/
|   |   |       |   |-- useLogin.ts
|   |   |       |   |-- useRegister.ts
|   |   |       |   |-- useForgotPassword.ts
|   |   |       |   |-- useResetPassword.ts
|   |   |       |-- components/
|   |   |           |-- ProtectedRoute.tsx    # Guard auth + role check
|   |   |           |-- AuthPrompt.tsx        # Prompt de connexion
|   |   |           |-- GoogleLoginButton.tsx
|   |   |           |-- EmailLoginForm.tsx
|   |   |           |-- RegisterForm.tsx
|   |   |           |-- ForgotPasswordForm.tsx
|   |   |           |-- ResetPasswordForm.tsx
|   |   |-- components/
|   |   |   |-- layout/
|   |   |   |   |-- Header.tsx      # Navigation principale (+ lien admin conditionnel)
|   |   |   |   |-- Footer.tsx
|   |   |   |   |-- Layout.tsx      # Wrapper Header + Footer
|   |   |   |-- ui/
|   |   |   |   |-- Button.tsx      # Composant + cn() utility
|   |   |   |   |-- Card.tsx
|   |   |   |   |-- Input.tsx
|   |   |   |   |-- Modal.tsx
|   |   |   |-- forms/
|   |   |   |   |-- TechApplicationForm.tsx  # Formulaire candidature technique
|   |   |   |-- partners/
|   |   |       |-- PartnerCard.tsx
|   |   |       |-- PartnerModal.tsx         # Modale detail partenaire
|   |   |       |-- PartnerFormModal.tsx      # Formulaire candidature
|   |   |       |-- PartnersFilters.tsx
|   |   |       |-- PartnersGrid.tsx
|   |   |       |-- PartnersHero.tsx
|   |   |       |-- PartnersMap.tsx          # Carte Leaflet
|   |   |       |-- PartnersStats.tsx
|   |   |       |-- ThematicTag.tsx
|   |   |-- pages/
|   |       |-- Home.tsx             # Page d'accueil
|   |       |-- Serie.tsx            # La Serie (episodes avec badges "Bientot dispo")
|   |       |-- Mouvement.tsx        # Le Mouvement (+ CTAs HelloAsso)
|   |       |-- Cognisphere.tsx      # CogniSphere (protegee, + formulaire candidature)
|   |       |-- ECHOLink.tsx         # ECHOLink (protegee, + formulaire candidature)
|   |       |-- PartnersPage.tsx     # ECHOSystem (liste publique partenaires)
|   |       |-- Events.tsx           # Agenda (fetch API dynamique)
|   |       |-- Resources.tsx        # Ressources
|   |       |-- Support.tsx          # Soutenir (liens HelloAsso)
|   |       |-- Contact.tsx          # Contact
|   |       |-- MyPartnerAccount.tsx # Espace partenaire (profil + RDV)
|   |       |-- AdminDashboard.tsx   # Hub admin (/admin)
|   |       |-- AdminPartners.tsx    # Admin partenaires (CRUD + moderation)
|   |       |-- AdminEvents.tsx      # Admin evenements (CRUD)
|   |       |-- auth/
|   |           |-- Login.tsx        # Page login (tabs Google + Email)
|   |           |-- Register.tsx     # Page inscription
|   |           |-- ForgotPassword.tsx
|   |           |-- ResetPassword.tsx
|   |           |-- GoogleCallback.tsx
|   |   |-- test/
|   |       |-- setup.ts            # Setup Vitest
|   |   |-- assets/
|   |       |-- logo-echo.jpg
|   |       |-- logo-mouvement.png
|
|-- .agent/                          # Config BMAD (multi-agents)
|   |-- agents/                      # Definitions des 7 agents
|   |-- memory/shared-context.md     # Memoire partagee (etat projet, decisions)
|   |-- skills/                      # Skills reutilisables
|   |-- workflows/                   # Workflows BMAD
|
|-- _bmad-output/                    # Artefacts BMAD
|   |-- implementation-artifacts/
|       |-- sprint-status.yaml       # Suivi des stories/epics
|       |-- stories/                 # Fichiers stories individuels
|       |-- epics/                   # Fichiers epics
|
|-- .gitignore
|-- README.md
```

---

## 4. Variables d'Environnement

### Backend (`backend/.env`)

```env
# MongoDB
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"

# CORS
CORS_ORIGINS="http://localhost:5173"

# Google OAuth
GOOGLE_CLIENT_ID="<votre_client_id>"
GOOGLE_CLIENT_SECRET="<votre_client_secret>"
GOOGLE_REDIRECT_URI="http://localhost:8000/api/auth/google/callback"

# Frontend URL (pour redirections OAuth + reset password)
FRONTEND_URL="http://localhost:5173"

# Security (optionnel, a changer en production)
OAUTH_STATE_SECRET="change-me-in-production"
```

### Frontend

Pas de `.env` requis en dev (l'API pointe par defaut sur `http://127.0.0.1:8000/api`).

En production, creer un `.env` avec :
```env
VITE_API_URL="https://votre-domaine.com/api"
```

---

## 5. Commandes pour Lancer le Projet

### Prerequis
- **Node.js** >= 18
- **Python** 3.11+
- **MongoDB** en cours d'execution sur `localhost:27017`

### Backend

```bash
cd backend

# Installer les dependances
pip install -r requirements.txt

# Lancer le serveur (port 8000)
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Installer les dependances
npm install

# Lancer le dev server (port 5173)
npm run dev
```

### Tests

```bash
# Backend (depuis backend/)
python -m pytest -p no:recording -q
# Note: le flag -p no:recording est OBLIGATOIRE (incompatibilite vcrpy/urllib3)

# Frontend (depuis frontend/)
npm run test
# ou: npx vitest run

# Build production (depuis frontend/)
npm run build
```

### Seed des donnees (optionnel)

```bash
cd backend
python seed_partners.py   # Insere des partenaires de demo dans MongoDB
```

---

## 6. Architecture Backend — Endpoints API

Tous les endpoints sont prefixes par `/api`.

### Auth (`/api/auth`)
| Methode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/auth/register` | Public | Inscription email/password |
| POST | `/auth/login-local` | Public | Connexion email ou username |
| POST | `/auth/login` | Public | Connexion legacy (avec CAPTCHA) |
| POST | `/auth/verify-2fa` | Public | Verification code 2FA |
| GET | `/auth/google/login` | Public | Redirection vers Google OAuth |
| GET | `/auth/google/callback` | Public | Callback OAuth Google |
| GET | `/auth/me` | Auth | Infos utilisateur courant |
| POST | `/auth/logout` | Auth | Deconnexion |
| DELETE | `/auth/user/{user_id}` | Auth | Suppression de compte |
| POST | `/auth/forgot-password` | Public | Demande reset mot de passe |
| GET | `/auth/reset-password/{token}` | Public | Verifier validite du token |
| POST | `/auth/reset-password/{token}` | Public | Reset effectif du mot de passe |

### Episodes (`/api/episodes`)
| Methode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/episodes` | Public | Liste episodes (filtre par saison) |
| GET | `/episodes/{id}` | Public | Detail episode |
| GET | `/episodes/stats` | Public | Statistiques episodes |
| POST | `/episodes` | Admin | Creer episode |
| PUT | `/episodes/{id}` | Admin | Modifier episode |
| DELETE | `/episodes/{id}` | Admin | Supprimer episode |
| POST | `/episodes/opt-in` | Auth | S'abonner a une notification episode |
| GET | `/episodes/opt-in/me` | Auth | Mes abonnements opt-in |

### Events (`/api/events`)
| Methode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/events` | Public | Liste evenements publies (tri par date) |
| GET | `/events/{id}` | Public | Detail evenement |
| POST | `/events` | Admin | Creer evenement |
| PUT | `/events/{id}` | Admin | Modifier evenement |
| DELETE | `/events/{id}` | Admin | Supprimer evenement |

### Partners (`/api/partners`)
| Methode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/partners` | Public | Liste partenaires approuves (filtres, pagination) |
| GET | `/partners/thematics` | Public | Reference des thematiques |
| GET | `/partners/stats` | Public | Statistiques partenaires |
| GET | `/partners/{slug}` | Public | Detail partenaire par slug |
| POST | `/partners/apply` | Public | Candidature partenaire (multipart/form-data) |
| GET | `/partners/me/account` | Partner/Admin | Mon profil partenaire |
| PUT | `/partners/me/account` | Partner/Admin | Modifier mon profil |
| GET | `/partners/admin/all` | Admin | Tous les partenaires (moderation) |
| PUT | `/partners/admin/{id}/approve` | Admin | Approuver candidature |
| PUT | `/partners/admin/{id}/reject` | Admin | Rejeter candidature |
| PUT | `/partners/admin/{id}/feature` | Admin | Toggle mise en avant |

### Candidatures (`/api/candidatures`)
| Methode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/candidatures/tech` | Public | Candidature technique Cognisphere/ECHOLink |

### Autres
- `/api/progress/*` — Suivi progression video
- `/api/videos/*` — Upload/streaming video
- `/api/users/*` — Gestion utilisateurs (admin)
- `/api/thematics/*` — Thematiques
- `/api/resources/*` — Ressources

---

## 7. Architecture Frontend — Routes

| Route | Page | Protection | Description |
|-------|------|-----------|-------------|
| `/` | Home | Public | Page d'accueil |
| `/serie` | Serie | Public | Presentation serie + episodes |
| `/mouvement` | Mouvement | Public | Le mouvement + CTAs soutien |
| `/cognisphere` | Cognisphere | Auth requise | Plateforme participative |
| `/echolink` | ECHOLink | Auth requise | Plateforme collaborative |
| `/partenaires` | PartnersPage | Public | ECHOSystem (carte + grille) |
| `/agenda` | Events | Public | Evenements (fetch API dynamique) |
| `/ressources` | Resources | Public | Ressources |
| `/soutenir` | Support | Public | Dons HelloAsso |
| `/contact` | Contact | Public | Formulaire contact |
| `/login` | Login | Public | Connexion (Google + Email) |
| `/register` | Register | Public | Inscription |
| `/forgot-password` | ForgotPassword | Public | Mot de passe oublie |
| `/reset-password/:token` | ResetPassword | Public | Reset mot de passe |
| `/auth/google/success` | GoogleCallback | Public | Callback Google OAuth |
| `/admin` | AdminDashboard | Admin | Hub administration |
| `/admin/partenaires` | AdminPartners | Admin | CRUD partenaires + moderation |
| `/admin/events` | AdminEvents | Admin | CRUD evenements |
| `/mon-compte/partenaire` | MyPartnerAccount | Auth | Espace partenaire |

---

## 8. Systeme d'Authentification

### Roles (`UserRole` enum)
- `user` — Utilisateur standard (acces Cognisphere, ECHOLink)
- `partner` — Partenaire (acces espace partenaire)
- `admin` — Administrateur (acces panel admin complet)

### Mecanismes
1. **Google OAuth** : Redirection vers Google → callback → creation compte + session cookie httpOnly
2. **Email/Password** : Inscription avec validation (username unique, email unique, confirmation password, age_consent) → login via email ou username
3. **Session** : Token UUID stocke dans cookie httpOnly (`session_token`) + localStorage cote client pour le Bearer header
4. **2FA optionnel** : Code 4 chiffres envoye par email (stub en dev), 5 tentatives max, expire en 10 min
5. **Reset password** : Token UUID envoye par email, expire en 1h

### Guards Frontend
- `ProtectedRoute` : Verifie `isAuthenticated` et optionnellement `requiredRole`
- Si non connecte : affiche `AuthPrompt` (invitation a se connecter)
- Si connecte mais mauvais role : affiche "Acces refuse" avec Shield icon

### Middlewares Backend
- `get_current_user` : Dependency qui verifie le session_token (cookie ou Bearer)
- `require_admin` : Dependency qui verifie role === admin (HTTP 403 si non)

---

## 9. Collections MongoDB

| Collection | Modele | Description |
|------------|--------|-------------|
| `users` | User | Comptes utilisateurs (tous roles) |
| `user_sessions` | UserSession | Sessions actives (token + expiration 7j) |
| `pending_2fa` | Pending2FA | Codes 2FA en attente de verification |
| `password_reset_tokens` | PasswordResetToken | Tokens de reset mot de passe |
| `episodes` | Episode | Episodes de la serie |
| `episode_optins` | EpisodeOptIn | Abonnements opt-in par episode |
| `events` | Event | Evenements publics |
| `partners` | Partner | Partenaires (pending/approved/rejected) |
| `tech_candidatures` | TechCandidature | Candidatures techniques |
| `thematics_ref` | ThematicRef | Reference thematiques (seed auto) |
| `video_progress` | VideoProgress | Progression video par utilisateur |

---

## 10. Email Service

L'email est un **stub** en developpement : tous les emails sont logues dans la console du backend (`logger.info`), aucun email n'est reellement envoye.

Fonctions disponibles dans `email_service.py` :
- `send_2fa_code(email, code)` — Code 2FA
- `send_password_reset(email, reset_link)` — Lien de reset
- `send_email(email, subject, message)` — Email generique

En production, remplacer par SendGrid, AWS SES ou equivalent.

---

## 11. Anti-Spam

Deux mecanismes appliques sur les formulaires publics :

1. **Honeypot** : Champ `website` invisible, si rempli = bot → rejet silencieux
2. **Rate Limiting IP** : Max 3 soumissions par heure par IP (configurable)

Applique sur :
- Candidatures partenaires (`POST /partners/apply`)
- Candidatures techniques (`POST /candidatures/tech`)

---

## 12. Etat d'Avancement — Stories & Epics

### Epic 1 — Identite & Securite ✅ TERMINE
| Story | Description | Statut |
|-------|-------------|--------|
| 1.1 | Google OAuth | Done |
| 1.2 | Auth classique email/password | Done |
| 1.3 | Reinitialisation mot de passe | Done |
| 1.4 | Isolation vues privees (guard auth) | Done |

### Epic 2 — Contenu & Engagement Visiteur ✅ TERMINE
| Story | Description | Statut |
|-------|-------------|--------|
| 2.1 | Badge "Bientot disponible" sur episodes S1 | Done |
| 2.2 | Synopsis modale + opt-in episode | Done |
| 2.3 | Candidatures techniques anti-spam (Cognisphere/ECHOLink) | Done |
| 2.4 | Passerelle soutien/dons HelloAsso | Done |

### Epic 3 — Partenaires & ECHOSystem ✅ TERMINE
| Story | Description | Statut |
|-------|-------------|--------|
| 3.1 | Formulaire candidature partenaire (Pillow + rate limit + emails) | Done |
| 3.2 | Notifications transactionnelles | Done |
| 3.3 | Tableau de bord partenaire | Done |
| 3.4 | Bouton RDV Google Calendar | Done |
| 3.5 | Bouton "Visiter le site" dans modale partenaire | Done |

### Epic 4 — Back-Office Administration 🔄 EN COURS (3/4)
| Story | Description | Statut |
|-------|-------------|--------|
| 4.1 | Panel admin securise (dashboard hub + lien Header) | Done |
| 4.2 | Moderation candidatures partenaires | Done (deja dans AdminPartners) |
| 4.3 | Gestion agenda evenements (CRUD complet) | Done |
| **4.4** | **Export de la base email opt-in** | **BACKLOG — A FAIRE** |

---

## 13. Prochaine Tache : Story 4.4 — Export Email Opt-In

### Ce qui est demande
Permettre aux administrateurs d'exporter la liste des emails opt-in depuis le panel admin.

### Ce qui existe deja
- Collection `episode_optins` en MongoDB (contient `user_id`, `season`, `episode`, `created_at`)
- Section "Exports" dans `AdminDashboard.tsx` avec `active: false` et `href: '#'`
- L'endpoint `GET /episodes/opt-in/me` retourne les opt-ins de l'utilisateur courant

### Ce qu'il faut implementer
- **Backend** : Endpoint admin `GET /api/episodes/opt-in/export` qui :
  - Joint `episode_optins` avec `users` pour recuperer les emails
  - Retourne un fichier CSV ou JSON telechargeable
- **Frontend** : Activer la section "Exports" dans AdminDashboard, soit :
  - Un lien direct vers le download CSV
  - Ou une page dediee `/admin/exports` avec bouton de telechargement

### Apres Story 4.4
L'Epic 4 sera terminee. Consulter le PRD pour la suite du backlog.

---

## 14. Notes Techniques Importantes

### Tests
```bash
# IMPORTANT : toujours utiliser -p no:recording pour eviter une incompatibilite vcrpy/urllib3
python -m pytest -p no:recording -q
```

### Pattern de test backend
Les tests utilisent `FastAPI TestClient` + mock DB via `app.dependency_overrides` :
```python
app.dependency_overrides[get_db] = lambda: mock_db
app.dependency_overrides[require_admin] = lambda: admin_user
# ... test ...
app.dependency_overrides.clear()
```

### Config API frontend
Toutes les URLs API sont centralisees dans `frontend/src/config/api.ts` :
```typescript
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
export const PARTNERS_API = `${API_URL}/partners`;
export const EVENTS_API = `${API_URL}/events`;
```

### Auth header pattern
Le frontend utilise un Bearer token depuis `localStorage` :
```typescript
headers: { 'Authorization': `Bearer ${localStorage.getItem('session_token')}` }
```
Le backend accepte aussi le cookie `session_token` (httpOnly, set par les endpoints login).

### Pydantic v2
Le projet utilise Pydantic v2. Utiliser `model_dump()` au lieu de `.dict()`.

### Build frontend
Le bundle depasse 500kB — du code splitting est recommande pour la production.

---

## 15. Fichiers BMAD (Contexte Methodologique)

Le projet suit la methodologie BMAD avec 7 agents definis dans `.agent/agents/` :
- `architect.md`, `backend.md`, `frontend.md`, `designer.md`, `qa-tester.md`, `code-reviewer.md`, `documentation.md`

Le fichier de memoire partagee est `.agent/memory/shared-context.md` — il contient :
- L'etat du projet, les decisions recentes, les locks actifs
- La palette CSS du theme Nature
- Les pages et routes existantes
- L'historique des niveaux de workflow

Le suivi des stories est dans `_bmad-output/implementation-artifacts/sprint-status.yaml`.

### Workflow BMAD (3 niveaux)
- **HOTFIX** : Changement trivial (badge, typo, config) — pas de planning formel
- **STANDARD** : Feature moyenne (backend + frontend + tests) — scoping + plan + QA
- **MAJEUR** : Module complet — tous les agents impliques

---

## 16. Historique Git

```
b30ea53 feat(events): Story 4.3 - Gestion de l'agenda evenements CRUD
d5d885b feat(admin): Story 4.1 - Panel administration securise avec dashboard hub
2a69d52 fix(partners): retrait du badge En vedette des cartes partenaires
16cf081 feat(partners): Story 3.5 - Bouton Visiter le site dans modale partenaire
638b3b0 feat(partners): Story 3.4 - Bouton prise de RDV Google Calendar
3ba5783 fix(config): email association corrige vers mouvement.echo.france@gmail.com
2f85bdb feat(partners): Story 3.1 - Formulaire candidature partenaire securise
ae6655b fix(support): URL HelloAsso reelle pour les dons
8b1013e feat(support): Story 2.4 - Passerelle de soutien et dons HelloAsso
2f1a2b8 feat(candidatures): Story 2.3 - Candidatures techniques anti-spam
a9643ff feat(serie): Story 2.2 - Exploration des episodes et opt-in
66ef90c feat(serie): Story 2.1 - Badge Bientot disponible sur episodes S1
fc1c74e fix(auth): bouton fermer sur Login/Register + infra test Vitest
c9b1528 fix(auth): restaurer session au demarrage + bouton fermer AuthPrompt
e16494a feat(auth): Story 1.4 - Isolation des vues privees (guard auth)
3e5c976 feat(auth): Story 1.3 - Reinitialisation de mot de passe
70db668 fix(auth): Story 1.2 Code Review - 5 correctifs securite et qualite
258745b feat(auth): Story 1.2 - Authentification classique securisee
98cd82c feat(auth): Story 1.1 - Google OAuth avec corrections Code Review
1f54d28 docs: generate technical documentation and setup PRD and BMAD Architecture
```

---

## 17. Points d'Attention

1. **Emails = stubs** : Aucun email n'est reellement envoye. Tout est logue en console.
2. **Securite CAPTCHA** : Le login legacy (`/auth/login`) a un `TODO SECURITY` — la verification CAPTCHA est client-side uniquement, non validee serveur.
3. **CORS** : Configure via `.env` (`CORS_ORIGINS`), en dev accepte `http://localhost:5173`.
4. **Pas de HTTPS en dev** : Les cookies `session_token` n'ont pas le flag `secure` (a activer en production).
5. **Logo path** : Le Header reference le logo via `/src/assets/logo-echo.jpg` (chemin Vite dev), a adapter pour la production.
6. **MongoDB sans auth** : Pas de credentials MongoDB en dev local.
7. **Google OAuth** : Les credentials dans `.env` sont liees a un projet Google Cloud specifique. Configurer les votres si besoin.
8. **19 commits locaux non pushes** : La branche `main` est en avance de 19 commits sur `origin/main`.
