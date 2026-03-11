# Stack Technologique — Mouvement ECHO

Ce projet est fondé sur une architecture séparée avec un monorepo contenant le client (Frontend) et le serveur (Backend).

## Frontend (Application Web)

- **Framework Principal** : React 19.2.0
- **Langage** : TypeScript 5.9.3
- **Outil de Build** : Vite 7.2.4
- **Styling** : Tailwind CSS 4.1.18 + PostCSS
- **Routage** : React Router DOM 7.11.0
- **Gestion de l'État** : Zustand 5.0.11 + React Query 5.90.21
- **Gestion des Formulaires** : React Hook Form + Zod & Hookform Resolvers
- **Composants Tiers** : Lucide React (Icônes), React Leaflet (Cartographie), React Helmet Async (SEO)
- **Tests** : Vitest 4.0.18 + Testing Library

## Backend (Serveur API)

- **Framework Principal** : FastAPI 0.110.1
- **Langage** : Python 3.11+
- **Serveur ASGI** : Uvicorn 0.25.0
- **Base de Données** : MongoDB (via Motor 3.3.1, driver asynchrone)
- **Validation & Modélisation** : Pydantic 2.12.3
- **Sécurité & Authentification** :
  - PyJWT 2.10.1 (JSON Web Tokens)
  - Passlib 1.7.4 + bcrypt 4.1.3 (Hachage)
  - PyOTP 2.9.0 (Authentification 2FA)
- **Requêtes HTTP** : HTTPX (OAuth client) + Requests
- **Traitement Fichiers** : Pillow 11.2.1 (Images) + python-multipart
- **Tests** : Pytest 8.4.2
