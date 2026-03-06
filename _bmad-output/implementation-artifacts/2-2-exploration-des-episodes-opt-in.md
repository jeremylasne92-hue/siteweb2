# Story 2.2: Exploration des Épisodes & Opt-in

Status: done

## Story

As a Visiteur,
I want pouvoir lire le synopsis d'un épisode et m'abonner aux alertes de sortie,
So that suivre les épisodes qui m'intéressent sans effort.

## Acceptance Criteria

1. **Given** Je clique sur une carte épisode "Bientôt disponible" **When** La modale s'ouvre **Then** Je peux lire le titre, le synopsis et les thématiques (FR8).
2. **And** Si je suis connecté, je dispose d'un bouton opt-in pour m'abonner aux notifications email de sortie (FR9).

## Tasks / Subtasks

### Backend

- [x] Task 1: Enregistrer le routeur episodes dans server.py (fix bug préexistant)
- [x] Task 2: Ajouter modèle EpisodeOptIn + EpisodeOptInRequest (models.py)
- [x] Task 3: Routes opt-in (POST /episodes/opt-in, GET /episodes/opt-in/me)

### Frontend

- [x] Task 4: Ajouter champ `synopsis` au type Episode + données placeholder
- [x] Task 5: Afficher le synopsis dans la modale épisode (entre titre et thèmes)
- [x] Task 6: Bouton opt-in "M'alerter à la sortie" (visible si connecté, feedback visuel)
- [x] Task 7: Fetch des opt-ins existants au mount (GET /episodes/opt-in/me)

### Tests

- [x] Task 8: 4 tests backend (auth required, success, idempotent, get my optins)
- [x] Task 9: 3 tests frontend (synopsis affiché, thématiques, bouton masqué si non connecté)

## Dev Notes

### Analyse

La modale épisode existait déjà (titre + 3 catégories de thèmes). Les ajouts :
- Synopsis placeholder "Synopsis à venir" (le user fournira les vrais textes plus tard)
- Bouton opt-in conditionnel à l'authentification
- Backend opt-in avec collection MongoDB `episode_optins`

### Bug fix

Le routeur `episodes.py` était importé dans `server.py` (ligne 11) mais **jamais enregistré** dans `api_router`. Corrigé en ajoutant `api_router.include_router(episodes.router)`.

### Conventions

- Synopsis : bloc italique avec fond `bg-white/5`, border `border-white/10`
- Bouton opt-in : style doré cohérent (`text-[#D4AF37]`, `bg-[#D4AF37]/10`)
- Feedback : icone `BellRing` + texte "Alerte activée" après opt-in
- Backend : opt-in idempotent (doublon ignoré, retourne `already_subscribed: true`)

## Dev Agent Record

### Agent Model Used

- **All tasks**: Claude Code (Opus 4.6)

### Debug Log References

- Backend tests: 4/4 passed (pytest)
- Frontend tests: 11/11 passed (vitest) — 5 AuthPrompt + 6 Serie
- Frontend build: OK (vite build)

### Completion Notes List

- Synopsis placeholder ajouté aux 11 épisodes S1
- Synopsis affiché dans la modale entre titre et thèmes
- Bouton "M'alerter à la sortie" visible uniquement si connecté
- Feedback "Alerte activée" après opt-in réussi
- Backend : routeur episodes enregistré (fix bug), 2 routes opt-in (POST + GET)
- 4 tests backend + 3 tests frontend ajoutés

### File List

| File | Action | Description |
|------|--------|-------------|
| `backend/server.py` | Modified | Enregistrer routeur episodes (fix bug) |
| `backend/models.py` | Modified | Ajouter EpisodeOptIn + EpisodeOptInRequest |
| `backend/routes/episodes.py` | Modified | Routes opt-in POST + GET |
| `frontend/src/pages/Serie.tsx` | Modified | Synopsis + bouton opt-in modale |
| `frontend/src/pages/Serie.test.tsx` | Modified | 3 tests Story 2.2 |
| `backend/tests/routes/test_episodes_optin.py` | Created | 4 tests backend opt-in |
