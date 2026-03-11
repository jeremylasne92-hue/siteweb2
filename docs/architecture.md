# Architecture — Mouvement ECHO

Ce document détaille l'architecture logicielle globale du projet Mouvement ECHO.

## 1. Topologie Matérielle et Réseau

L'application suit une structure **Client-Serveur asynchrone** avec un déploiement découpé :
- Une **Single Page Application (SPA)** React livrée sous forme de fichiers statiques optimisés via un CDN web (Webstrator ou Vercel/Netlify).
- Un **Serveur d'API REST** hébergé sur une instance conteneurisée ou VPS, exécutant FastAPI (Python) via Gunicorn/Uvicorn.
- Une **Base de Données MongoDB** orientée document NoSQL, sécurisée hors des accès web frontaux.

## 2. Découpage du Monorepo

```mermaid
graph TD
    A[Dépôt GitHub Monorepo ECHO]
    A --> B[Dossier /frontend]
    A --> C[Dossier /backend]
    
    B --> B1[React 19 / Vite]
    B --> B2[Zustand / React Query]
    B --> B3[Tailwind CSS v4]
    
    C --> C1[FastAPI Routes]
    C --> C2[Services & Mails (Oauth, 2FA)]
    C --> C3[Pydantic Models]
    
    C1 --> D[(MongoDB via Motor Asynchrone)]
    C3 --> D
```

## 3. Flux et États (Frontend)

L'architecture React est centralisée autour de la notion de **Features Indépendantes**.
- Contrairement aux approches Redux monolithiques, l'état serveur (données de l'API) est géré localement par `React Query`, qui gère seul le cache, le refetching et le stale-time.
- L'état UI global (Modal ouverte, thème sombre, step formulaire) est géré très légèrement par `Zustand`.
- **Routage :** Les composants React sont mappés via `react-router-dom` v7 dans un fichier Layout maître, permettant une navigation sans rechargement de page.

## 4. Architecture de la Donnée (Backend)

La persistance des actions utilise trois couches logiques sur FastAPI :
1. **Pydantic (DTO)** : Les requêtes HTTP POST/PUT sont nativement castées et validées par Pydantic. Si le JSON de la requête est malformé (ex: `email` invalide, `age_consent` manquant), l'exécution échoue en erreur HTTP 422 immédiatement.
2. **Couche Métier (Services)** : Les requêtes validées passent dans le dossier `/services` qui exécute la logique métier pure (Ex: Hashage Bcrypt via Passlib, Génération CSRF pour Google).
3. **Couche Base de données** : Appel à la librairie Motor (`db.users.insert_one(payload)`) pour écrire de manière non-bloquante dans la DB.

## 5. Mécanismes de Sécurité Déployés

- **Authentification Hybride** : Système JWT/Cookies HttpOnly. Interdiction absolue d'exposer ou de stocker le token dans le LocalStorage Front.
- **Double Facteur (2FA)** : Intégré aux workflows de création de compte pour contrer les mots de passe compromis (Code 6 chiffres par email via `secrets.choice`).
- **Rate-Limiting Memcached/Redis** : Sur les point névralgiques (`/auth/login`, `/auth/verify-2fa`) pour prévenir le Bruteforce.
- **Micro-Analytique RGPD** : Remplacement des cookies tiers par des envois événementiels en background `navigator.sendBeacon` sur le composant `<Analytics>`.
