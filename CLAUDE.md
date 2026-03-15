# ECHO — Plateforme citoyenne pour la série documentaire ECHO

Mouvement ECHO est une plateforme web full-stack connectant le public
à une série documentaire sur la transition écologique. Lancement : 20 mars 2026.

## Stack
- **Frontend**: React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4
- **Backend**: FastAPI 0.110 + MongoDB (Motor 3.3 async)
- **Tests**: Vitest (frontend) + Pytest (backend)
- **Déploiement**: Webstrator (static + API)

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

## Docs de référence
- Architecture détaillée: `docs/architecture.md`
- Contrats API (30 endpoints): `docs/api-contracts.md`
- Modèles de données: `docs/data-models.md`
- Guide développement: `docs/development-guide.md`
- Inventaire composants: `docs/component-inventory.md`
- PRD Phase 2: `_bmad-output/planning-artifacts/prd.md`
- Mémoire partagée BMAD: `.agent/memory/shared-context.md`
- Stratégie SEO/GEO: `docs/echo-strategy-seo-geo.md`
