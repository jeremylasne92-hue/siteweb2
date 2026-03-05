# Contrats API — Mouvement ECHO

## Base URL

`/api`

## Authentification

Les endpoints protégés utilisent des sessions via cookies (`session_token`) ou header `Authorization: Bearer <token>`.

---

## Auth (`/api/auth`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/auth/register` | — | Inscription utilisateur (optionnel 2FA) |
| POST | `/auth/login` | — | Connexion username/password (captcha requis) |
| POST | `/auth/verify-2fa` | — | Vérification code 2FA (4 chiffres, 5 tentatives max, expire 10 min) |
| GET | `/auth/google/login` | — | Redirection vers Google OAuth (CSRF state HMAC) |
| GET | `/auth/google/callback` | — | Callback Google → création compte + cookie session |
| GET | `/auth/me` | ✅ User | Infos utilisateur courant |
| DELETE | `/auth/user/{user_id}` | ✅ User (self) | Supprimer son propre compte |
| POST | `/auth/logout` | ✅ User | Déconnexion (invalide session) |

**Register Request:** `{ username, email, password, enable_2fa? }`
**Login Request:** `{ username, password, captcha_verified }`
**Session:** Cookie httponly `session_token`, durée 7 jours, samesite=lax

**Google OAuth Flow:**
1. Frontend redirige vers `GET /auth/google/login`
2. Backend redirige vers Google avec paramètre `state` (CSRF signé HMAC, expire 5 min)
3. Google redirige vers `GET /auth/google/callback?code=...&state=...`
4. Backend valide le `state`, échange le `code`, crée/lie l'utilisateur, pose le cookie `session_token`
5. Backend redirige vers `{FRONTEND_URL}/auth/google/success` (sans JWT dans l'URL)
6. Frontend vérifie la session via `GET /auth/me` avec `credentials: 'include'`

---

## Episodes (`/api/episodes`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/episodes` | — | Liste épisodes (filtre `?season=N`) |
| GET | `/episodes/stats` | — | Statistiques (total, publiés, non publiés) |
| GET | `/episodes/{id}` | — | Détail d'un épisode |
| POST | `/episodes` | ✅ Admin | Créer un épisode |
| PUT | `/episodes/{id}` | ✅ Admin | Modifier un épisode |
| DELETE | `/episodes/{id}` | ✅ Admin | Supprimer un épisode |

**Episode Model:** `{ id, season, episode, title, description, duration, thumbnail_url, video_url, is_published, created_at, updated_at }`

---

## Thématiques (`/api/thematics`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/thematics/episode/{episode_id}` | — | Thématiques d'un épisode (pagination skip/limit) |
| POST | `/thematics` | ✅ Admin | Créer une thématique |
| PUT | `/thematics/{id}` | ✅ Admin | Modifier une thématique |
| DELETE | `/thematics/{id}` | ✅ Admin | Supprimer une thématique |

**Types:** sociétale, sociale, existentielle, environnementale, philosophique, spirituelle

---

## Ressources (`/api/resources`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/resources/episode/{episode_id}` | — | Ressources d'un épisode |
| POST | `/resources` | ✅ Admin | Créer une ressource |
| DELETE | `/resources/{id}` | ✅ Admin | Supprimer une ressource |

**Types:** vidéo, livre, article, podcast, auteur, autre

---

## Acteurs (`/api/actors`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/actors` | — | Liste de tous les acteurs |
| POST | `/actors` | ✅ Admin | Créer un acteur |
| DELETE | `/actors/{id}` | ✅ Admin | Supprimer un acteur |

---

## Progression Vidéo (`/api/progress`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/progress/last-watched` | ✅ User | Dernier épisode visionné |
| GET | `/progress/{episode_id}` | ✅ User | Progression d'un épisode |
| POST | `/progress` | ✅ User | Sauvegarder/màj la progression |

**Logique:** Progression supprimée si < 5% ou > 95% ; sinon upsert.

---

## Vidéos (`/api/videos`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/videos/upload` | ✅ Admin | Upload vidéo (local, chunks 1MB) |
| GET | `/videos/{video_id}/stream` | — | Streaming vidéo (FileResponse) |

**Stockage:** Local (`/app/backend/uploads/videos`). Migration AWS S3 + CloudFront planifiée.

---

## Gestion Utilisateurs (`/api/users`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/users` | ✅ Admin | Liste utilisateurs (pagination skip/limit, exclut password_hash) |
| GET | `/users/count` | ✅ Admin | Nombre total d'utilisateurs |
| PUT | `/users/{id}/username` | ✅ Admin | Modifier le username |
| PUT | `/users/{id}/password` | ✅ Admin | Réinitialiser le mot de passe |
| DELETE | `/users/{id}` | ✅ Admin | Supprimer un utilisateur (cascade user_sessions, video_progress, pending_2fa) |

---

## Total : 31 endpoints API
