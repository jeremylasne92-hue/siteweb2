# Projet Mouvement ECHO — Vue d'ensemble (Overview)

## Résumé du Projet
**Mouvement ECHO** est une plateforme web citoyenne destinée à fédérer un écosystème d'acteurs de la transition autour d'une websérie documentaire (ECHO).
Le lancement officiel est planifié pour le **20 mars 2026**.
La plateforme permet de visionner des documentaires interactifs (Cogniphère), de soutenir financièrement le mouvement, et de rejoindre un incubateur idéologique et partenarial (ECHOsystem).

## Classification Technique
- **Type d'Application** : Web Application Full-Stack Asynchrone
- **Type de Dépôt** : Monorepo (Multi-Parties Frontend / Backend)
- **Modèle de Navigation** : Single Path Application (SPA)

## Matrice Technologique (Stack Summary)
| Couche | Technologie Principale | Fonction |
|--------|------------------------|----------|
| **Frontend** | React 19 + TypeScript | Interface Utilisateur réactive et typée |
| **Styling** | Tailwind CSS 4 | Système de Design et Tokens "Nature" |
| **Backend API** | FastAPI 0.110 (Python) | Serveur REST Haute-Efficacité asynchrone |
| **Base de Données** | MongoDB (NoSQL) | Stockage Documentaire Flexible (via Motor) |
| **Authentication** | Passlib / JWT / PyOTP | Gestion sécurisée et cookies HttpOnly |
| **Bundler** | Vite 7 | Outil de Build Haute-Vitesse |

## Navigation dans la Documentation (Index Relatif)

Voici la carte des documents techniques générés pour encadrer ce projet :

- 📐 **[Architecture Globale](architecture.md)** : Vue systémique de l'application et de sa sécurité.
- 📦 **[Architecture Patterns](architecture-patterns.md)** : Modèles de flux de données (MVC, DTO...).
- 🔗 **[Architecture d'Intégration](integration-architecture.md)** : Les contrats entre le proxy Vite et l'API Python.
- 🛠️ **[Guide de Développement](development-guide.md)** : Prérequis Node, Python et commandes de lancement.
- 📝 **[Stack Technologique Complexe](technology-stack.md)** : Versions de l'ensemble des dépendances.
- 🌳 **[Arbre des Sources](source-tree-analysis.md)** : Carte des dossiers vitaux `src/` et `routes/`.
- 🔌 **[Contrats API REST](api-contracts.md)** : Documentation des 36 requêtes réseaux du Backend.
- 🗄️ **[Modèles de Données](data-models.md)** : Schémas Pydantic / Entités MongoDB de la base NoSQL.
- 🎨 **[Inventaire UI](component-inventory.md)** : Registre des 17 blocs visuels (Génération, SEO, Layouts).
