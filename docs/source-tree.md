# Arborescence Source — Mouvement ECHO

```
sitewebecho by emergent/
│
├── README.md                           # Documentation de déploiement
│
├── frontend/                           # ▼ APPLICATION REACT SPA
│   ├── package.json                    # Dépendances Node.js
│   ├── tsconfig.json                   # Configuration TypeScript
│   ├── vite.config.ts                  # Configuration Vite
│   ├── postcss.config.js               # PostCSS (Tailwind)
│   ├── index.html                      # HTML entry point
│   ├── public/                         # Assets statiques publics
│   │   └── images/characters/          # Images des personnages
│   └── src/
│       ├── main.tsx                    # Entry point React (StrictMode)
│       ├── App.tsx                     # Routing (9 routes)
│       ├── App.css                     # CSS legacy Vite (non utilisé)
│       ├── index.css                   # Design system Tailwind + thème ECHO
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Layout.tsx          # Wrapper page (Header+main+Footer)
│       │   │   ├── Header.tsx          # Navigation sticky + mobile menu
│       │   │   └── Footer.tsx          # Pied de page multi-colonnes
│       │   │
│       │   └── ui/
│       │       ├── Button.tsx          # 4 variants, 3 tailles, forwardRef
│       │       ├── Card.tsx            # 3 variants (default/glass/solid)
│       │       ├── Input.tsx           # Label + error + focus ring
│       │       └── Modal.tsx           # Overlay blur + scroll lock
│       │
│       ├── pages/
│       │   ├── Home.tsx               # 150 lignes — Hero, 3 piliers, stats
│       │   ├── Serie.tsx              # 734 lignes — Épisodes, personnages, vidéo
│       │   ├── Mouvement.tsx          # 268 lignes — Timeline arbre, phases, équipe
│       │   ├── ECHOLink.tsx           # 123 lignes — Plateforme interactive (à venir)
│       │   ├── ECHOsystem.tsx         # 98 lignes  — Partenaires par catégorie
│       │   ├── Events.tsx             # 146 lignes — Événements avec filtres
│       │   ├── Resources.tsx          # 161 lignes — Médiathèque avec recherche
│       │   ├── Support.tsx            # 137 lignes — Dons (3 paliers) + FAQ
│       │   └── Contact.tsx            # 92 lignes  — Formulaire + réseaux
│       │
│       ├── hooks/                     # Custom hooks React
│       │   └── (vide — à développer)
│       │
│       ├── services/                  # API clients / fetch wrappers
│       │   └── (vide — à développer)
│       │
│       └── assets/                    # Assets importés
│
├── backend/                            # ▼ API FASTAPI
│   ├── server.py                      # Entry point FastAPI + CORS + Motor
│   ├── models.py                      # User, Episode, VideoProgress, Pending2FA
│   ├── models_extended.py             # Thematic, Resource, Actor
│   ├── auth_utils.py                  # bcrypt, sessions, 2FA (pyotp)
│   ├── email_service.py               # Service email (stub, log only)
│   ├── requirements.txt               # Dépendances Python (75 lignes)
│   ├── .env                           # Variables d'environnement (non versionné)
│   │
│   └── routes/
│       ├── auth.py                    # 400 lignes — Register, Login, OAuth, 2FA, Logout
│       ├── episodes.py                # 121 lignes — CRUD épisodes (admin)
│       ├── progress.py                # 103 lignes — Progression vidéo
│       ├── videos.py                  # 80 lignes  — Upload + streaming
│       ├── users.py                   # 123 lignes — Gestion utilisateurs (admin)
│       ├── thematics.py               # 79 lignes  — CRUD thématiques (admin)
│       └── resources.py               # 95 lignes  — CRUD ressources + acteurs
│
└── docs/                               # ▼ DOCUMENTATION PROJET
    ├── index.md                       # Index de tous les documents
    ├── project-overview.md            # Vue d'ensemble du projet
    ├── architecture.md                # Architecture frontend + backend
    ├── api-contracts.md               # 30 endpoints API documentés
    ├── data-models.md                 # Modèles Pydantic + relations
    ├── component-inventory.md         # Inventaire des composants UI
    ├── source-tree.md                 # Cette arborescence
    └── development-guide.md           # Guide de développement
```

## Statistiques

| Métrique | Frontend | Backend | Total |
|----------|----------|---------|-------|
| **Fichiers source** | 16 | 11 | 27 |
| **Lignes de code** | ~2 100 | ~1 200 | ~3 300 |
| **Composants** | 12 | — | 12 |
| **Pages** | 9 | — | 9 |
| **Endpoints API** | — | 30 | 30 |
| **Collections DB** | — | 8 | 8 |
