# Story 4.4: Export de la base email opt-in

Status: done

## Story

As a Administrateur,
I want pouvoir exporter la liste des emails des utilisateurs ayant souscrit aux notifications opt-in des épisodes,
so that exploiter cette base pour des communications ciblées (newsletter, annonces).

## Acceptance Criteria

1. **Given** Je suis connecté en tant qu'admin **When** J'accède à la section Exports du panel admin **Then** La carte Exports est active et mène à la page dédiée `/admin/exports`.
2. **Given** Je suis sur la page Exports **When** Je clique sur "Télécharger CSV opt-in" **Then** Un fichier CSV est téléchargé contenant les colonnes : email, saison, épisode, date d'inscription.
3. **Given** Il n'y a aucun opt-in en base **When** Je télécharge le CSV **Then** Le fichier contient uniquement la ligne d'en-tête (CSV vide).
4. **Given** Je ne suis pas admin **When** J'appelle l'endpoint d'export **Then** Je reçois une erreur 401/403.

## Tasks / Subtasks

### Backend

- [x] Task 1: Endpoint `GET /api/episodes/admin/export-optins` (AC: #2, #3, #4)
  - [x] Subtask 1.1: Ajouter l'endpoint protégé par `Depends(require_admin)`
  - [x] Subtask 1.2: Agréger `episode_optins` avec `users` pour récupérer les emails
  - [x] Subtask 1.3: Retourner un `StreamingResponse` CSV (colonnes: email, season, episode, created_at)
  - [x] Subtask 1.4: Gérer le cas vide (CSV avec headers uniquement)

### Tests Backend

- [x] Task 2: Tests unitaires endpoint export (AC: #2, #3, #4)
  - [x] Subtask 2.1: `test_export_requires_admin` — 401/403 sans auth admin
  - [x] Subtask 2.2: `test_export_csv_success` — retourne CSV avec bonnes colonnes et données
  - [x] Subtask 2.3: `test_export_csv_empty` — retourne CSV vide (headers only) si aucun opt-in

### Frontend

- [x] Task 3: Activer section Exports dans AdminDashboard (AC: #1)
  - [x] Subtask 3.1: Changer `active: false` → `active: true` et `href: '#'` → `href: '/admin/exports'`

- [x] Task 4: Page AdminExports (AC: #1, #2)
  - [x] Subtask 4.1: Créer `AdminExports.tsx` avec bouton de téléchargement CSV
  - [x] Subtask 4.2: Appel API avec Bearer token + déclenchement download navigateur
  - [x] Subtask 4.3: Ajouter route `/admin/exports` dans `App.tsx` (protégée admin)
  - [x] Subtask 4.4: Ajouter `EPISODES_API` dans `config/api.ts`

## Dev Notes

- Collection `episode_optins` : champs `user_id`, `season`, `episode`, `created_at`
- Collection `users` : champ `email` à joindre via `user_id` ↔ `id`
- Pattern admin : `Depends(require_admin)` (voir `routes/events.py`)
- Pattern test : mock db + `app.dependency_overrides` (voir `tests/routes/test_events.py`)
- CSV via `StreamingResponse` de starlette + module `csv` / `io` de Python stdlib
- Frontend auth : `localStorage.getItem('token')` en Bearer header

### Project Structure Notes

- Backend endpoint dans `backend/routes/episodes.py` (route existante épisodes)
- Frontend page dans `frontend/src/pages/AdminExports.tsx` (nouveau fichier)
- Config API dans `frontend/src/config/api.ts`
- Router dans `frontend/src/App.tsx`

### References

- [Source: backend/routes/episodes.py] — Endpoints opt-in existants (lignes 125-160)
- [Source: backend/routes/events.py] — Pattern admin CRUD (Depends(require_admin))
- [Source: backend/tests/routes/test_events.py] — Pattern tests admin
- [Source: frontend/src/pages/AdminDashboard.tsx] — Section Exports (lignes 52-57)
- [Source: frontend/src/pages/AdminEvents.tsx] — Pattern page admin existante
- [Source: frontend/src/config/api.ts] — Config API centralisée

## Dev Agent Record

### Agent Model Used

- **All tasks**: Claude Code (Opus 4.6)

### Debug Log References

- Backend tests: 40/40 passed (pytest -p no:recording -q) — dont 3 nouveaux pour export
- TypeScript: compilation OK (tsc --noEmit)
- Chrome: page /admin/exports protégée (AuthPrompt affiché si non connecté), aucune erreur console applicative

### Completion Notes List

- Endpoint `GET /api/episodes/admin/export-optins` protégé par `require_admin`
- Agrégation `episode_optins` + `users` pour récupérer les emails via user_id
- Retour CSV via `StreamingResponse` (colonnes: email, season, episode, created_at)
- Gestion du cas vide (CSV avec headers uniquement)
- 3 tests backend: auth required, CSV success, CSV empty
- Section Exports activée dans AdminDashboard (`active: true`, `href: '/admin/exports'`)
- Page AdminExports avec bouton téléchargement + feedback succès/erreur
- Route `/admin/exports` protégée admin dans App.tsx
- `EPISODES_API` ajouté dans config/api.ts

### File List

| File | Action | Description |
|------|--------|-------------|
| `backend/routes/episodes.py` | Modified | Ajout endpoint admin/export-optins (CSV StreamingResponse) |
| `backend/tests/routes/test_episodes_export.py` | Created | 3 tests (auth, success, empty) |
| `frontend/src/pages/AdminDashboard.tsx` | Modified | Activation section Exports (active: true, href: /admin/exports) |
| `frontend/src/pages/AdminExports.tsx` | Created | Page export CSV avec bouton téléchargement |
| `frontend/src/App.tsx` | Modified | Ajout route /admin/exports (protégée admin) |
| `frontend/src/config/api.ts` | Modified | Ajout EPISODES_API |
| `_bmad-output/implementation-artifacts/sprint-status.yaml` | Modified | Story 4.4: backlog → in-progress → review |
| `.agent/memory/shared-context.md` | Modified | Ajout niveau STANDARD pour Story 4.4 |
