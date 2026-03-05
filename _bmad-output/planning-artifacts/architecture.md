---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - docs/index.md
  - docs/project-overview.md
  - docs/architecture.md
  - docs/api-contracts.md
  - docs/data-models.md
  - docs/component-inventory.md
  - docs/source-tree.md
  - docs/development-guide.md
  - docs/deep-dive-auth-securite.md
workflowType: 'architecture'
project_name: 'sitewebecho by emergent'
user_name: 'JeReM'
date: '2026-03-04'
lastStep: 8
status: 'complete'
completedAt: '2026-03-04'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
Le système englobe un portail public optimisé (Mouvement, Série, Cognisphère), couplé à un espace sécurisé d'acquisition et de gestion de Partenaires. Cela requiert un Frontend React réactif, un pont API solide et un Back-Office d'administration complet.

**Non-Functional Requirements:**
L'architecture sera fortement guidée par des contraintes de Performance (TTI < 3s, paquets JS < 300Ko) et de Sécurité experte (Mots de passe Hashés, Rate-limiting strict, contrôles CORS de production).

**Scale & Complexity:**
L'architecture doit soutenir des pics d'audience modérés (jusqu'à 2 000 requêtes concurrentes) tout en maintenant 99% d'uptime, avec un système de cache robuste.

- Primary domain: Web Full-Stack (SPA React & REST API FastAPI)
- Complexity level: Moyenne
- Estimated architectural components: ~12-15 Composants majeurs (Auth, Dashboards, Video Player, Forms)

### Technical Constraints & Dependencies
La base de code (Brownfield) existe déjà. L'architecture doit s'y conforter ou la refactoriser par touches successives. Le système dépend du service OAuth d'Emergent Agentic pour ses connexions Google externes.

### Cross-Cutting Concerns Identified
- Authentification & Sécurité (RBAC, Rate-Limiting, Vulnérabilités en cours d'Auth).
- Gestion d'état client-side (Sessions persistantes, 2FA workflows).
- Typage de données : Nécessité d'alignement parfait des modèles Pydantic back et TypeScript front.
- Traitement de fichiers : Architecture d'upload isolée et sanitization des logos partenaires.

## Starter Template Evaluation

### Primary Technology Domain
Web Full-Stack (Brownfield) : SPA React (Frontend) + API REST FastAPI (Backend)

### Selected Starter: Continuation Pédagogique (ECHO Base) + React Pro Patterns

**Rationale for Selection:**
Le projet d'application web de base (`sitewebecho`) représentant déjà un MVP fonctionnel avancé, repartir de zéro via un CLI Next.js ou SvelteKit ajouterait un coût de migration massif inutile pour la Phase 1. La fondation sera le code existant, avec l'injection stricte des patterns du Skill `React TypeScript Pro`.

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- Frontend : TypeScript + Node 18+
- Backend : Python 3.11+

**Styling Solution:**
- Tailwind CSS v4 avec les tokens design `echo-*` existants (`index.css`).

**Code Organization:**
- Frontend : Modèle Page/Component `feature-based`.
- Backend : FastAPI Routeur par domaine + Pydantic Models + Services isolés.

## Core Architectural Decisions

### Data Architecture
- **Base de données** : MongoDB via Motor (conservé).
- **Stockage de Fichiers (Logos Partenaires)** : Local Sécurisé (`/uploads`). Sanitization obligatoire des signatures binaires et redimensionnement via `Pillow` en Python pour interdire les exécutables.

### Authentication & Security
- **Email Transactionnel (2FA)** : Intégration de SendGrid (ou Mailjet) via API officielle Python au lieu du comportement "stub" actuel (logs consoles).
- **Protection d'accès** : Implémentation stricte d'une couche d'atténuation (Rate-Limiter backend). 

### API & Communication Patterns
- **Data Fetching (Frontend)** : Adoption de **TanStack Query v5** (React Query) pour s'interfacer avec les 30 routes d'API FastAPI (cache automatique, loading states, error boundaries optimisés).

### Frontend Architecture
- **State Management** : Utilisation de **Zustand v5.0** pour l'état persistant minimal (Ex: Session utilisateur en cours).
- **Formulaires & Validation** : **React Hook Form v7.71** couplé à **Zod v4.3** pour faire écho aux mêmes règles de validation que les schémas Pydantic du backend.

## Implementation Patterns & Consistency Rules

### Naming Patterns
- **Database (MongoDB)** : Collections en `minuscule_pluriel` (ex: `users`, `partners`).
- **Backend (Python)** : Variables et méthodes en `snake_case` (ex: `user_id`, `get_partner()`).
- **Frontend (TypeScript)** : Noms de fichiers et Composants en `PascalCase` (ex: `PartnerCard.tsx`). Variables/Stats en `camelCase` (ex: `userId`, `isPartnerActive`).
- **API Routes** : `/api/nom_pluriel` avec des tirets (kebab-case) (ex: `/api/partners/pending-validation`).

### Structure Patterns
- **Backend (Service & Injection)** : Les routes FastAPI ne contiennent plus de logique. Elles injectent les services et objets de requêtes (ex: `Depends(get_service)`). Ce pattern "Controller -> Service -> Repo" autorise le mocking lors des tests unitaires sans requérir MongoDB en dur.
- **Frontend (Feature Modules & Hooks)** : *Un composant = Un fichier*. Les logiques complexes (> 2 props persistantes ou fetchs réseaux) intègrent obligatoirement un "Custom Hook" abstrait (`useMyLogic.ts`). Les nouveaux modules (ex: Parternetaires) vivent dans `src/features/[feature_name]/` plutôt qu'à la racine des composants globaux.

### Format Patterns
- **Typage Strict Double** : Valideurs Backend (`Pydantic`) et Frontend (`Zod`) doivent strictement correspondre.
- **API Error Responses** : Les erreurs doivent restituer `{"detail": "..."}` pour une exploitation uniforme par React Query. Les exceptions backend fatales `HTTP 500` masquent la stacktrace (protection cybersécurité).
- **Format Temporel** : Date toujours traitée et renvoyée via standards ISO 8601 UTC.

### Process Patterns
- **Processus de Chargements (Loading States)** : Délégation complète des promesses HTTP au client de `React Query` (TanStack Query) pour bénéficier des rendus conditionnels UI asynchrones sans prop-drilling.

## Project Structure & Boundaries

### Complete Project Directory Structure

**📦 backend/ (FastAPI)**
```text
backend/
├── core/                   # Infrastructure
│   ├── config.py           # Configuration .env via Pydantic
│   └── database.py         # Singleton MongoDB Motor
├── main.py                 # Application FastAPI racine (Middlewares)
├── server.py               # Fichier de lancement Uvicorn
├── requirements.txt
├── .env
├── routes/                 # 🛑 CONTROLLERS HTTP UNIQUEMENT
│   ├── auth.py             # Routes /auth (Upload, 2FA)
│   └── partners.py         # Routes /partners
├── services/               # ✅ LOGIQUE MÉTIER & INJECTION (D.I.)
│   ├── auth_service.py
│   └── partner_service.py
├── utils/                  # Helpers indépendants
│   ├── auth_utils.py       # JWT Utils
│   └── email_service.py    # SendGrid wrapper
└── uploads/                # 📂 Stockage local sécurisé des médias
```

**📦 frontend/ (React / Vite)**
```text
frontend/
├── package.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx             # React Router v7
│   ├── index.css           # Tokens Design System
│   ├── lib/
│   │   └── api-client.ts   # Axios/Fetch configuré avec intercepteurs
│   ├── pages/              # 📄 Vues Routes (Pages)
│   │   ├── (public)/       # Routes ouvertes
│   │   │   └── ECHOLink.tsx
│   │   └── admin/          # 🔒 Routes protégées (Guard Global)
│   │       ├── DashboardPage.tsx
│   │       └── partners/
│   │           ├── PartnersList.tsx
│   │           └── PartnerReview.tsx
│   ├── components/         # 🧩 Composants Réutilisables Globaux
│   │   ├── ui/             # Design System (Boutons, Inputs, Modals)
│   │   └── layout/         # Header, Footer
│   └── features/           # ✅ MODULES MÉTIERS ISOLÉS
│       ├── auth/           # Flux Login & 2FA
│       │   ├── api/        # Hooks React Query (useLogin)
│       │   ├── components/ # LoginForm, 2FAForm
│       │   └── store.ts    # Zustand Session Store
│       └── partners/       # Gestion des partenaires
│           ├── api/        # Hooks (usePartners, useApprovePartner)
│           ├── components/ # PartnerMap, PartnerCard, PartnerDetail
│           └── schemas.ts  # Zod validations
```

### Architectural Boundaries & Integration Points

**API Boundaries (Frontend -> Backend):**
- Le Frontend ne communique avec le serveur qu'au travers des API Hooks situés dans `src/features/[name]/api/`. Ces hooks pilotent React Query et valident les Payloads via Zod.
- Les endpoints backend (Dossier `routes/`) sont la seule interface de réception REST et répondent toujours par un objet JSON prédictible contenant `data` ou `detail` (Erreur standardisée).

**Service Boundaries (Backend):**
- Les fichiers dans `routes/` ne manipulent aucun accès de base de données natif. Ils injectent obligatoirement des instances de la couche métier via `Depends(get_service)`.
- La connexion à la Base de données est centralisée de manière unique dans `core/database.py` pour éliminer le parasitage global.

**Data & Asset Boundaries:**
- Les fichiers uploadés sont contenus informatiquement et restreints géographiquement à `backend/uploads/`.
- Leur accès public HTTP requiert des routes de parsing pour vérifier l'intégrité avant re-distribution.

## Architecture Validation Results

### Coherence Validation ✅
- **Decision Compatibility**: React v19, Tailwind v4, Zustand v5, React-Query v5 + FastAPI Motor. Alignement parfait des versions en stack "Brownfield".
- **Pattern Consistency**: "Service Pattern" en Back imposant `Depends()` pour la Dependency Injection match avec "Feature Pattern" en Front via architecture par modules verticaux.
- **Structure Alignment**: L'arborescence soutient nativement les limites établies.

### Requirements Coverage Validation ✅
- **Epic/Feature Coverage**: Les Epics "Gestion Partenaire" et "Administration" sont adossables aux routes `src/pages/admin/partners/` par React Router.
- **Functional Requirements Coverage**: NFR-Sec-3 couvert par traitement `Pillow`. NFR-Perf (TTI < 3s) couverte par hydratation et cache React Query.

### Gap Analysis Results
📌 **DETTE TECHNIQUE ACCEPTÉE (PHASE 2)**
- **Stockage**: Reporter l'implémentation de la politique S3 distante pour le gain de Time-to-Market de la modération locale.
- **Mailing**: La gratuité SandBox de SendGrid forcera possiblement la transition vers AWS SES avant dépassement du palier gratuit.

### Architecture Readiness Assessment
- **Overall Status:** READY FOR IMPLEMENTATION
- **Confidence Level:** HIGH (Projet basé sur du code existant et éprouvé, consolidé selon des standards de pointe).

### Implementation Handoff
- L'équipe technique entière doit appliquer scrupuleusement les contraintes de "Implementation Patterns & Consistency Rules" du document présent lors des sessions Sprint.
