# Mouvement ECHO — Vue d'ensemble du Projet

## Résumé

**Mouvement ECHO** est une plateforme web complète dédiée à la websérie sociale, éducative et interactive **ECHO**, inspirée de La Divine Comédie de Dante. Le projet comprend un **frontend React** et un **backend FastAPI** connecté à **MongoDB**.

La plateforme permet aux utilisateurs de découvrir la série (3 saisons, 33 épisodes), de visionner des épisodes avec suivi de progression, de gérer leur compte (authentification classique, Google OAuth, 2FA), et d'explorer un écosystème de partenaires et ressources. Un panel administrateur complet permet la gestion des contenus.

## Stack Technique

| Catégorie | Technologie | Version | Justification |
|-----------|------------|---------|---------------|
| **Frontend Framework** | React | 19.2.0 | SPA moderne avec composants fonctionnels |
| **Langage Frontend** | TypeScript | 5.9.3 | Typage statique pour la robustesse |
| **Build Tool** | Vite | 7.2.4 | Build rapide et HMR instantané |
| **CSS Framework** | Tailwind CSS | 4.1.18 | Design system utility-first |
| **Routing** | React Router DOM | 7.11.0 | Navigation SPA |
| **Animations** | Framer Motion | 12.23.26 | Animations fluides |
| **Icônes** | Lucide React | 0.562.0 | Icônes SVG modulaires |
| **Backend Framework** | FastAPI | 0.110.1 | API REST asynchrone performante |
| **Langage Backend** | Python | 3.11+ | Asyncio natif |
| **Base de données** | MongoDB | — | NoSQL flexible via Motor (async) |
| **Driver DB** | Motor | 3.3.1 | Driver MongoDB asynchrone |
| **Auth** | PyJWT + Passlib + bcrypt | — | Sessions + hachage sécurisé |
| **OAuth** | httpx + Emergent | — | Google OAuth via Emergent |
| **2FA** | pyotp | 2.9.0 | TOTP pour authentification à deux facteurs |
| **Validation** | Pydantic | 2.12.3 | Validation des données et sérialisation |

## Architecture

- **Type de repository** : Multi-part (frontend + backend séparés)
- **Pattern architectural** : Client-serveur REST avec SPA
- **Frontend** : Application React SPA avec composant-based architecture
- **Backend** : API REST FastAPI avec routeurs modulaires
- **Base de données** : MongoDB NoSQL (collections auto-créées)
- **Communication** : API REST JSON via `/api/*`

## Structure du Repository

```
sitewebecho by emergent/
├── frontend/          # Application React SPA
│   ├── src/
│   │   ├── components/   # Composants réutilisables (layout + ui)
│   │   ├── pages/        # Pages de l'application (9 pages)
│   │   ├── hooks/        # Custom hooks React
│   │   ├── services/     # Services/API clients
│   │   └── assets/       # Assets statiques
│   ├── package.json
│   └── vite.config.ts
├── backend/           # API FastAPI
│   ├── routes/           # Routeurs API modulaires (7 modules)
│   ├── models.py         # Modèles Pydantic principaux
│   ├── models_extended.py # Modèles étendus (Thematic, Resource, Actor)
│   ├── auth_utils.py     # Utilitaires d'authentification
│   ├── email_service.py  # Service email (stub)
│   ├── server.py         # Point d'entrée FastAPI
│   └── requirements.txt
├── docs/              # Documentation projet (cette documentation)
└── _bmad/             # Configuration BMAD
```

## Pages Publiques

| Route | Page | Description |
|-------|------|-------------|
| `/` | Accueil | Hero, 3 piliers (Informer/Fédérer/Agir), statistiques |
| `/serie` | La Série | Synopsis, prologue vidéo, 3 saisons avec épisodes, 14 personnages |
| `/mouvement` | Le Mouvement | Timeline en arbre, 3 phases, équipe ECHO |
| `/echolink` | ECHOLink | Plateforme interactive (en développement), vision |
| `/partenaires` | ECHOSystem | Partenaires par catégorie (Experts, Finance, Éducation, ONG) |
| `/agenda` | Événements | Listing événements avec filtres, réservation |
| `/ressources` | Ressources | Médiathèque avec filtres et recherche |
| `/soutenir` | Soutenir | 3 paliers de dons, barre de progression, FAQ |
| `/contact` | Contact | Formulaire de contact, coordonnées, réseaux sociaux |

## Collections MongoDB

| Collection | Description |
|-----------|-------------|
| `users` | Comptes utilisateurs (id, username, email, role, 2FA) |
| `episodes` | Épisodes de la série (saison, numéro, titre, vidéo) |
| `thematics` | Thématiques par épisode (6 types) |
| `resources` | Ressources par épisode (vidéo, livre, article, podcast) |
| `actors` | Acteurs de la série |
| `video_progress` | Progression de visionnage par utilisateur |
| `user_sessions` | Sessions de connexion |
| `pending_2fa` | Codes 2FA en attente de vérification |

## Pour commencer

### Frontend
```bash
cd frontend
npm install
npm run dev    # → http://localhost:5173
```

### Backend
```bash
cd backend
pip install -r requirements.txt
# Configurer .env (MONGO_URL, DB_NAME, CORS_ORIGINS)
uvicorn server:app --host 0.0.0.0 --port 8001
```
