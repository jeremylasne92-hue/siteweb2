# Architecture — Frontend (React/TypeScript)

## Vue d'ensemble

Application monopage (SPA) React 19 avec Vite 7 comme build tool. L'architecture est basée sur une séparation pages/composants avec un design system Tailwind CSS 4 personnalisé.

## Pattern Architectural

**Component-Based Architecture** avec routage déclaratif React Router DOM v7.

```
main.tsx (entry point)
  └─ App.tsx (Router + Routes)
       └─ Layout (Header + main + Footer)
            └─ Pages (10 pages)
                 └─ Components (UI + Layout)
```

## Design System ECHO

### Palette de couleurs (`index.css` @theme)

| Token | Valeur | Usage |
|-------|--------|-------|
| `echo-dark` | `#0A0A0A` | Background principal |
| `echo-darker` | `#121212` | Backgrounds secondaires |
| `echo-gold` | `#D4AF37` | Accent principal, CTA |
| `echo-goldLight` | `#FFD700` | Hover accents dorés |
| `echo-red` | `#8B0000` | Saison 1 (L'Enfer) |
| `echo-redLight` | `#DC143C` | Accent rouge clair |
| `echo-blue` | `#1E3A8A` | Saison 3 (Le Paradis) |
| `echo-blueLight` | `#3B82F6` | ECHOLink, tech |
| `echo-green` | `#065F46` | Saison 2 (Le Purgatoire) |
| `echo-greenLight` | `#10B981` | ECHOSystem, nature |
| `echo-text` | `#FFFFFF` | Texte principal |
| `echo-textMuted` | `#9CA3AF` | Texte secondaire |

### Typographie

- **Serif** : Cinzel, Playfair Display → titres (h1-h6)
- **Sans-serif** : Inter, Poppins → corps de texte

### Classes utilitaires

- `.glass-panel` : Effet glassmorphism (backdrop-blur, border semi-transparent)
- `.text-shadow` / `.text-glow` : Ombres textuelles
- Animations : `fadeIn` (1s), `slideUp` (0.8s)

## Composants

### Layout (3)
- **Layout** : Wrapper flex-col min-h-screen (Header + main + Footer)
- **Header** : Barre fixe avec scroll detection, nav desktop/mobile, logo, actions (search, login, soutenir)
- **Footer** : 5 colonnes (brand + navigation + ressources + légal), réseaux sociaux

### UI (4)
- **Button** : 4 variants (primary/secondary/outline/ghost), 3 tailles, forwardRef, loading state
- **Card** : 3 variants (default/glass/solid), hover effects
- **Input** : Label + error support, focus ring
- **Modal** : Overlay backdrop-blur, body scroll lock, fermeture par clic extérieur

## Dépendances clés

- `clsx` + `tailwind-merge` : Composition de classes CSS
- `framer-motion` : Animations (utilisé dans certaines pages)
- `lucide-react` : Bibliothèque d'icônes (20+ icônes utilisées)

## État & Navigation

- **Pas de state management global** (pas de Redux/Context)
- **État local** : `useState` au niveau des pages (filtres, tabs, modals)
- **Navigation** : React Router DOM avec `Link` et `useLocation`
- **SEO** : Meta tags dynamiques dans Serie.tsx via `useEffect`

---

# Architecture — Backend (FastAPI/Python)

## Vue d'ensemble

API REST asynchrone FastAPI avec MongoDB via Motor (driver async). Architecture modulaire avec routeurs séparés par domaine.

## Structure

```
server.py                  # Point d'entrée FastAPI + CORS + DB
├── models.py              # Modèles Pydantic (User, Episode, VideoProgress, Pending2FA)
├── models_extended.py     # Modèles étendus (Thematic, Resource, Actor)
├── auth_utils.py          # bcrypt, session tokens, 2FA (pyotp)
├── email_service.py       # Service email (stub/démo)
└── routes/
    ├── auth.py            # Authentification (register, login, OAuth, 2FA, logout)
    ├── episodes.py        # CRUD épisodes
    ├── progress.py        # Progression vidéo
    ├── videos.py          # Upload et streaming vidéo
    ├── users.py           # Gestion utilisateurs (admin)
    ├── thematics.py       # CRUD thématiques
    └── resources.py       # CRUD ressources + acteurs
```

## Authentification

### Mécanismes supportés
1. **Login classique** : Username + password (bcrypt) + captcha
2. **Google OAuth** : Via Emergent Platform (`demobackend.emergentagent.com`)
3. **2FA optionnel** : Code 4 chiffres par email (pyotp), 5 tentatives, expire 10 min

### Sessions
- Token aléatoire (`secrets.token_urlsafe(32)`)
- Stocké en cookie HttpOnly (`session_token`, 7 jours, samesite=lax)
- Fallback : header `Authorization: Bearer <token>`
- Middleware RBAC : `get_current_user` (User) et `require_admin` (Admin)

## Base de données

**MongoDB** via **Motor** (driver asynchrone).

### Collections (8)
| Collection | Index | Clé primaire |
|-----------|-------|-------------|
| `users` | `username`, `email` | `id` (UUID) |
| `episodes` | `season + episode` | `id` (UUID) |
| `thematics` | `episode_id + order` | `id` (UUID) |
| `resources` | `episode_id + order` | `id` (UUID) |
| `actors` | `order` | `id` (UUID) |
| `video_progress` | `user_id + episode_id` | `id` (UUID) |
| `user_sessions` | `session_token` | auto |
| `pending_2fa` | `user_id` | auto |

### Rôles
- `user` : Accès lecture + progression vidéo
- `admin` : CRUD complet sur tous les contenus + gestion utilisateurs

## Middleware
- **CORS** : Origins configurables via `.env` (CORS_ORIGINS)
- **Logging** : Python standard logging (INFO)

## Configuration

Variables d'environnement (`.env`) :
- `MONGO_URL` : URL de connexion MongoDB
- `DB_NAME` : Nom de la base de données
- `CORS_ORIGINS` : Origines CORS autorisées (séparées par virgules)
