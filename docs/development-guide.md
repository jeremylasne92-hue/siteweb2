# Guide de Développement & Déploiement — Mouvement ECHO

Ce guide détaille les prérequis et les étapes matérielles pour faire fonctionner le projet Mouvement ECHO en local ou en production.

## Prérequis
- **Node.js** (v20+ recommandé) pour le frontend.
- **Python** (v3.11+) pour le serveur Backend.
- **MongoDB** (Server local ou instance de test Atlas).
- Gestionnaire Node : `npm` (ou `pnpm`).

## Instructions Frontend (Client React)
Le projet est packagé via `Vite` en ESM.

```bash
cd frontend
# Installation de tous les paquets du package.json (lucide-react, echarts, leaflet...)
npm install

# Démarrage du serveur de dev local avec Hot-Reload (HMRA)
npm run dev
# URL (par défaut) : http://localhost:5173

# Lancer la suite de test Vitest
npm run test

# Analyse Lint
npm run lint

# Créer un Build optimisé pour la production dans /dist
npm run build
```

## Instructions Backend (API FastAPI)
L'API REST tourne de façon asynchrone avec Uvicorn.

```bash
cd backend
# Il est recommandé d'utiliser un venv (python -m venv venv && source venv/bin/activate)

# Installation des dépendances (FastAPI, Motor, Pydantic, etc)
pip install -r requirements.txt

# Configurer les identifiants en environnement variables ou .env (.env racine idéalement)
# MONGO_URL=mongodb://localhost:27017
# ENVIRONMENT=local

# Lancer en dev (Hot reload Python)
uvicorn server:app --reload
# L'API répondra par défaut sur : http://localhost:8000

# Lancer la suite de tests (Pytest) IMPORTANT : ne pas enregistrer
python -m pytest -p no:recording -q
```

## Déploiement et Configuration (CI/CD)
Pour la production (déploiement sur AWS, Webstrator ou VPS classique), l'application peut se builder en mode Single Page app.

### Stratégie de Déploiement Frontend
1. Exécuter `npm run build`.
2. Le dossier `/dist` contenant les assets optimisés est généré.
3. Configurer un serveur Nginx/Apache pour renvoyer `index.html` sur l'ensemble des requêtes statiques (SPA Fallback de React Router).

### Stratégie de Déploiement Backend
1. Déployer les scripts dans l'instance.
2. Passer la variable `ENVIRONMENT` définie dans Pydantic BaseSettings en mode "production".
3. Utiliser un gestionnaire ASGI product-ready comme `Gunicorn` mappé sur les workers Uvicorn.
```bash
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker
```

*(Conformément au process du monorepo, des workflows Github actions existent ou l'automation PM2 est conseillée).*
