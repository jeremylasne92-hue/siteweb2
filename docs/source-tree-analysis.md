# Analyse de l'Arbre des Sources (Source Tree)

L'application ECHO correspond à un *Monorepo Multi-Parties*. Voici l'arborescence centrale détaillée avec l'annotation des dossiers critiques et leurs responsabilités fonctionnelles.

## Arborescence Principale

```markdown
sitewebecho by emergent/
├── _bmad/                  # Système expert IA : Configuration BMAD, workflows et agents résidents.
├── docs/                   # Registre de documentation (le lieu du présent scan exhaustif).
├── frontend/               # L'application Web Interactive (SPA React 19).
│   ├── public/             # Assets statiques exposés n'ayant pas besoin de build.
│   ├── src/                # Code source transpéré par ViteJS.
│   │   ├── components/     # Composants d'UI indépendants (Layout, SEO, Buttons, etc).
│   │   ├── config/         # Fichiers de configuration spécifiques métiers (Donation/GoogleMap).
│   │   ├── features/       # Modules isolés verticalement, ex: module d'Authentification (auth/).
│   │   ├── pages/          # Layouts finaux répondant au Routeur DOM.
│   │   ├── services/       # Fichiers d'appels API vers le serveur Backend.
│   │   ├── utils/          # Méthodes Helper transversales (formatters).
│   │   ├── index.css       # Token CSS maîtres Tailwind V4.
│   │   └── main.tsx        # Point d'Entrée React : Injection DOM et Wrappers (Providers).
│   └── package.json        # Inventaire des librairies Node, scripts d'exécution frontend.
│
└── backend/                # Serveur API asynchrone (FastAPI).
    ├── routes/             # Contrôleurs HTTP de l'API REST (Ex: episodes.py, analytics.py).
    ├── services/           # Logique technique, communication S3, Password Reset, Oauth Google.
    ├── tests/              # Suite de Tests unitaires d'intégration (Pytest).
    ├── utils/              # Dépendances annexes de logique métier (Limiteur de Taux /rate_limit.py).
    ├── models.py           # Déclarations des DTOs centraux Pydantic.
    ├── models_extended.py  # Déclarations des schémas d'entités volumineuses.
    ├── server.py           # Point d'Entrée Uvicorn : Initialisation de l'App FastAPI et middleware.
    └── requirements.txt    # Index des librairies Python requises.
```

## Points de Connectivité (Integration Flow)

Les requêtes du `frontend` adressent leurs requêtes via `/api` en usant des clients fetch ou `React Query`. L'adresse HTTP du proxy est mappée (en local) par `vite.config.ts`, et les appels en production passent par le sous-domaine API direct (ou reverse proxy).

- Les requêtes aboutissent majoritairement sur le script `server.py` du backend.
- Les routeurs inclus dans `routes/` interceptent et désérialisent les arguments HTTP.
- Ces modules interrogent souvent `models.py` (Validation Pydantic).
- Ils s'adossent aux fonctions asynchrones de `motor` pour lire/écrire sur MongoDB.
- Si nécessaire (ex. Mail, Oauth Google), il y a un relai vers les scripts du dossier `services/`.
