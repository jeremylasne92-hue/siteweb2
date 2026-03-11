# Modèles d'Architecture (Architecture Patterns)

L'application Mouvement ECHO exploite un modèle classique d'architecture découplée Client / Serveur.

## 1. Architecture Globale (Multi-part Monorepo)

- **Frontend (Client)** : Single-Page Application (SPA) asynchrone fonctionnant dans le navigateur de l'utilisateur. Appelle l'API Backend pour les lectures et écritures.
- **Backend (API)** : API REST orientée services, sans état (Stateless) basée sur l'écosystème Python/FastAPI.
- **Base de données** : Document-Oriented Database (MongoDB). Stockage NoSQL des collections avec validations gérées de façon programmatique.

## 2. Frontend (React) : Architecture Basée sur les Composants (Component-Based)

Le frontend maintient une architecture réactive par composants structurée autour de dossiers dédiés :
- `/pages` pour la hiérarchisation géographique de l'application via le Routeur (Layouts de haut niveau).
- `/components` comportant des atomes réutilisables (Inputs, Boutons, Modales) et des blocs métiers (Formulaires).
- `/features` séparant la logique par domaine commercial (Ex : `auth` contenant ses propres hooks et formulaires).

### Flux de Gestion d'État (State Management)
L'état global est manipulé avec **Zustand** (store mémoire léger) et synchronisé avec des Appels Réseau grâce à **React Query** (Hooks pour fetcher, mettre en cache et synchroniser la Data distante sans re-déclaration massive).

## 3. Backend (FastAPI) : Architecture Orientée Services (Layered Architecture)

Construit avec des routeurs asynchrones, le Backend s'assure d'une séparation claire des responsabilités :
- **Routeurs (`/routes`)** : Contrôleurs REST qui exposent les Endpoints HTTP. Ils extraient les requêtes JSON, vérifient l'autorisation, et passent la charge utile aux services.
- **Couche Modèles (`/models.py`)** : Définie par Pydantic, garantissant des schemas stricts (DTOs) au lancement comme en lecture/écriture.
- **Couche Services (`/services`)** : Contient l'intelligence métier de l'application (Ex: `auth_service.py` et `auth_local_service.py`) responsable de vérifier et inscrire l'utilisateur en base.
- **Couche Données** : Assurée de bout en bout par les appels asynchrones gérés par la librairie *Motor*.
