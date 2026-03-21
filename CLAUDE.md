# ECHO — Plateforme citoyenne pour la série documentaire ECHO

Mouvement ECHO est une plateforme web full-stack connectant le public
à une série documentaire sur la transition écologique. Lancement : 20 mars 2026.

## Stack
- **Frontend**: React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4
- **Backend**: FastAPI 0.110 + MongoDB (Motor 3.3 async)
- **Tests**: Vitest (frontend) + Pytest (backend)
- **Déploiement**: OVH mutualisé (frontend) + Render (backend API) + MongoDB Atlas (DB)

## Structure
```
frontend/src/
  pages/          # Pages routées (Home, Serie, Mouvement, Contact, etc.)
  components/     # Composants réutilisables (layout/, ui/, forms/, partners/)
  features/       # Modules métier (auth/)
  config/         # Configuration (api.ts, booking.ts, donation.ts)
backend/
  routes/         # Endpoints FastAPI (auth, events, partners, episodes, etc.)
  models.py       # Pydantic schemas (+ models_extended, models_partner)
  core/config.py  # Settings centralisé (env vars)
  services/       # Auth, password reset, email (SendGrid)
  utils/          # Rate limiting, helpers
  server.py       # Point d'entrée FastAPI
```

## Déploiement — RAPPEL OBLIGATOIRE
**Après chaque modification, rappeler à l'utilisateur de déployer :**

| Étape | Commande / Action | Automatique ? |
|-------|-------------------|---------------|
| 1. Build frontend | `cd frontend && npm run build` | ❌ Manuel |
| 2. Git push | `git add . && git commit && git push` | ❌ Manuel |
| 3. Backend Render | Render auto-deploy après git push | ✅ Auto |
| 4. Frontend OVH | FileZilla : `dist/` → `/www/` sur `ftp.cluster121.hosting.ovh.net` (login: `mouvemd`) | ❌ Manuel |

**Script tout-en-un : `scripts/deploy.bat`** (build + push + FTP)
- Nécessite : `setx FTP_PASSWORD "mot_de_passe"` une fois

⚠️ **RÈGLE** : À la fin de chaque session avec des modifications de code, TOUJOURS demander :
> "Veux-tu déployer les changements ? (`scripts/deploy.bat` ou manuellement)"

## Commandes
- Backend tests: `cd backend && python -m pytest -p no:recording -q`
  Le flag `-p no:recording` est OBLIGATOIRE (désactive plugin recording)
- Frontend tests: `cd frontend && npx vitest run`
- Build prod: `cd frontend && npm run build`
- Lint: `cd frontend && npx eslint .`
- Dev servers: définis dans `.claude/launch.json`

## Workflow qualité
Après chaque modification, vérifier dans cet ordre :
1. `cd frontend && npx eslint .` — corriger les erreurs lint
2. `cd frontend && npx vitest run` — corriger les tests cassés
3. `cd backend && python -m pytest -p no:recording -q` — tests backend
4. `cd frontend && npm run build` — vérifier compilation TS + Vite

## Architecture — Décisions clés
- Auth: cookie-only httpOnly — JAMAIS de token en localStorage
- CAPTCHA: reCAPTCHA v3 server-side, skip si RECAPTCHA_SECRET_KEY absent
- 2FA: 6 digits, secrets.choice (CSPRNG), jamais loggé en clair
- Rate limiting: IP-based via utils/rate_limit.py (5 tentatives/15min sur /verify-2fa)
- Emails: SendGrid HTTP API (actif si SENDGRID_API_KEY + ENVIRONMENT=production)
- API prefix: /api sur toutes les routes
- Config centralisée: backend/core/config.py (classe Settings)
- Auth flow: cookie check d'abord, puis Bearer header (fallback legacy)

## Conventions
- Commits: conventional commits (feat:, fix:, sec:, chore:, refactor:)
- Ne JAMAIS commiter de secrets (.env, clés API, tokens)
- Français pour le contenu utilisateur, anglais pour le code et variables
- Composants React: fonctionnels uniquement, pas de classes
- Tailwind: utilitaires directs, pas de CSS custom sauf nécessité
- Éviter le sur-engineering : pas d'abstraction prématurée
- Route handlers async par défaut (backend)

## Méthodologie BMAD (multi-agents)
Ce projet suit la méthodologie BMAD avec mémoire partagée et coordination.

### Source de vérité
- **État projet + locks + décisions** : `.agent/memory/shared-context.md`
- LIRE ce fichier AVANT toute tâche, le METTRE À JOUR après chaque modification

### Niveaux de workflow
| Niveau | Quand | Étapes |
|--------|-------|--------|
| HOTFIX | Fix trivial, 1 fichier | Code → Test → Commit |
| STANDARD | Feature classique, multi-fichiers | Scope → Code → Test → Code Review → Commit |
| MAJEUR | Changement architectural | Scope → Design → Code → QA → Code Review → Commit |

### Système de locks
Avant de modifier un fichier, vérifier les locks dans `shared-context.md`.
Si le fichier est locké par un autre agent, NE PAS le modifier. Max 2h par lock.

### Après chaque tâche
1. Mettre à jour la section "Décisions Récentes" dans `shared-context.md`
2. Mettre à jour "Historique des Niveaux" avec durée réelle
3. Libérer les locks

### Agents disponibles
- Agents : `.agent/agents/` (architect, backend, frontend, designer, qa-tester, code-reviewer, documentation)
- Skills : `.agent/skills/` (code-review, component-generator, css-design-system, react-typescript)
- Workflows : `.agent/workflows/` (master, dev, QA, PM, architect, quick-flow-solo-dev)

## Collaboration Claude Code + Antigravity
Ce projet est développé avec Claude Code ET Google Antigravity en parallèle.
Les règles Antigravity sont dans `.gemini/GEMINI.md`.
- RÈGLE CRITIQUE : vérifier les locks dans `shared-context.md` avant d'éditer
- Toujours vérifier `git status` avant de commencer
- Git est la source de vérité — commiter fréquemment
- En cas de conflit, le dernier commit testé et buildé gagne
- Après chaque tâche : mettre à jour `shared-context.md` avec l'agent utilisé

## Mémoire persistante et décisions
Ce projet utilise un système de mémoire persistante dans `memory/`.

### Fichiers mémoire
- **`memory/decisions.csv`** — Journal de toutes les décisions projet (CSV)
- **`memory/changelog.md`** — Log chronologique des modifications par session
- **`memory/backlog-history.md`** — Archive des tâches complétées
- **`scripts/review.sh`** — Script de vérification des décisions à réviser

### Règles de session
1. **Début de session** : lire `memory/decisions.csv`, `memory/changelog.md` et `docs/backlog.md`
2. **Pendant la session** : enregistrer chaque décision significative dans `decisions.csv` avec `revision_date` = date du jour + 30 jours
3. **Après chaque tâche complétée** : mettre à jour `docs/backlog.md` (déplacer la tâche dans "Complétées", mettre à jour le résumé en en-tête)
4. **Fin de session** : mettre à jour `memory/changelog.md` + `docs/backlog.md` + `.agent/memory/shared-context.md`
5. **Révision** : vérifier les décisions dont la `revision_date` est dépassée (status = actif) et proposer de les confirmer, modifier ou archiver

### Format backlog (docs/backlog.md)
Le backlog utilise un format à 6 colonnes compréhensible par un novice :
- **ID** : identifiant unique (T-001, T-002...)
- **Cat.** : Tech, Marketing, Contenu, Légal, Infra
- **Tâche** : nom court
- **Description** : verbe d'action + ce qui est fait concrètement
- **Pourquoi** : impact business en une phrase (commencer par "Pour que..." ou "Sinon...")
- **Qui** : 🤖 Claude / 👤 Toi / 🤖+👤
- Maximum 20 tâches actives, le reste en Icebox
- Revue hebdomadaire obligatoire

### Format decisions.csv
```
date,decision,raisonnement,resultat_attendu,revision_date,status
```
- `status` : actif | confirmé | révisé | archivé
- Guillemets obligatoires pour les champs contenant des virgules
- `revision_date` : date du jour + 30 jours par défaut

## Docs de référence
- Backlog complet: `docs/backlog.md`
- Architecture détaillée: `docs/architecture.md`
- Contrats API (30 endpoints): `docs/api-contracts.md`
- Modèles de données: `docs/data-models.md`
- Guide développement: `docs/development-guide.md`
- Inventaire composants: `docs/component-inventory.md`
- PRD Phase 2: `_bmad-output/planning-artifacts/prd.md`
- Mémoire partagée BMAD: `.agent/memory/shared-context.md`
- Stratégie SEO/GEO: `docs/echo-strategy-seo-geo.md`
