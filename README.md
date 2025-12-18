# 🌳 Mouvement ECHO - Plateforme Complète

Plateforme web pour la série ECHO avec gestion d'épisodes, authentification, progression vidéo et panel administrateur complet.

## 🏗️ Stack Technique

- **Frontend**: React 19 + React Router + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI + Python 3.11
- **Base de données**: MongoDB
- **Authentification**: Google OAuth (Emergent) + Login classique + 2FA

## 📦 Déploiement sur Webstrator

### 1. Frontend

```bash
cd frontend
yarn install
yarn build
```

Upload le dossier `frontend/build/` sur Webstrator.

### 2. Backend

Upload tous les fichiers du dossier `backend/` :
- server.py
- models.py, models_extended.py
- auth_utils.py, email_service.py
- routes/ (tout le dossier)
- requirements.txt

### 3. Variables d'Environnement

**Backend (.env)**:
```
MONGO_URL=mongodb://votre-url-mongodb:27017
DB_NAME=echo_database
CORS_ORIGINS=https://votre-domaine.com
```

**Frontend (.env)**:
```
REACT_APP_BACKEND_URL=https://api.votre-domaine.com
```

### 4. Installation Backend

```bash
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001
```

### 5. MongoDB

Créer une base de données MongoDB et configurer MONGO_URL.
Les collections seront créées automatiquement :
- users, episodes, thematics, resources, actors
- video_progress, user_sessions, pending_2fa

## 🔑 Compte Admin

**Username**: darkthony
**Password**: ProjetEchoAdmin123!
**Email**: Admin@projet-echo.link

## 📡 Endpoints API

### Authentification
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/google-oauth
- GET /api/auth/me
- POST /api/auth/logout

### Épisodes
- GET /api/episodes
- GET /api/episodes/stats
- POST /api/episodes (admin)
- PUT /api/episodes/{id} (admin)
- DELETE /api/episodes/{id} (admin)

### Thématiques
- GET /api/thematics/episode/{episode_id}
- POST /api/thematics (admin)
- PUT /api/thematics/{id} (admin)
- DELETE /api/thematics/{id} (admin)

### Ressources
- GET /api/resources/episode/{episode_id}
- POST /api/resources (admin)
- DELETE /api/resources/{id} (admin)

### Acteurs
- GET /api/actors
- POST /api/actors (admin)
- DELETE /api/actors/{id} (admin)

### Utilisateurs (Admin)
- GET /api/users
- GET /api/users/count
- PUT /api/users/{id}/username
- PUT /api/users/{id}/password
- DELETE /api/users/{id}

## 🎨 Pages Publiques

- `/` - Accueil
- `/serie` - Présentation série
- `/watch` - Visionnage épisodes avec thématiques et ressources
- `/mouvement` - Design arbre avec équipe
- `/partenaires` - ECHOSystem
- `/echolink` - Plateforme (en construction)
- `/auth` - Connexion/Inscription

## 🔐 Pages Admin

- `/admin` - Dashboard
- `/admin/create` - Créer épisode
- `/admin/episodes` - Liste épisodes
- `/admin/episodes/:id` - Modifier épisode
- `/admin/episodes/:id/manage` - Gérer thématiques et ressources
- `/admin/users` - Gérer utilisateurs

## ✨ Fonctionnalités

### Utilisateurs
- Inscription/Connexion
- Google OAuth
- 2FA (mode démo)
- Profil utilisateur
- Progression vidéo

### Admin
- Dashboard avec stats temps réel
- CRUD épisodes complets
- Gestion thématiques par épisode (pagination)
- Gestion ressources par épisode
- Gestion utilisateurs
- Upload vidéos local

### Lecteur
- YouTube embed
- Panneau latéral thématiques (repliable)
- Panneau latéral ressources (repliable)
- Lecteur réduit automatiquement quand panel ouvert
- Progression sauvegardée

## 🎯 Pour Aller Plus Loin

### Migration AWS S3
Pour héberger les vidéos sur AWS S3 + CloudFront, remplacer `/backend/routes/videos.py` et ajouter les clés AWS.

### Emails Réels
Pour activer l'envoi d'emails (2FA, etc.), configurer SendGrid ou AWS SES dans `/backend/email_service.py`.

## 📞 Support

Documentation complète dans `/app/contracts.md`
