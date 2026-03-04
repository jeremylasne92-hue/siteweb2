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
│       ├── App.tsx                     # Routing (10 routes)
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
│       │   ├── Cognisphere.tsx        # 220 lignes — Outil apprentissage IA (NEW)
│       │   ├── ECHOLink.tsx           # 123 lignes — Plateforme interactive (à venir)
│       │   ├── ECHOsystem.tsx         # 98 lignes  — Catégories partenaires + badges
│       │   ├── Events.tsx             # 144 lignes — Événements avec filtres
│       │   ├── Resources.tsx          # 159 lignes — Médiathèque avec recherche
│       │   ├── Support.tsx            # 136 lignes — Dons (3 paliers) + FAQ
│       │   └── Contact.tsx            # 105 lignes — Formulaire + confirmation
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
| **Fichiers source** | 17 | 11 | 28 |
| **Lignes de code** | ~2 300 | ~1 200 | ~3 500 |
| **Composants** | 12 | — | 12 |
| **Pages** | 10 | — | 10 |
| **Endpoints API** | — | 30 | 30 |
| **Collections DB** | — | 8 | 8 |
