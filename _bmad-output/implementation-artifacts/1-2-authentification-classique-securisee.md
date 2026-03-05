# Story 1.2: Authentification Classique Sécurisée

Status: done

## Story

As a Visiteur,
I want pouvoir créer un compte et me connecter via une adresse email et un mot de passe classique,
so that garder le contrôle de mes données sans dépendre d'un compte externe.

## Acceptance Criteria

1. **Given** un visiteur sur `/login` **When** il clique sur "Inscription par email" **Then** un formulaire d'inscription s'affiche (username, email, mot de passe, confirmation mot de passe, checkbox consentement +15 ans).
2. **Given** un formulaire rempli avec un mot de passe valide (≥8 chars, 1 majuscule, 1 chiffre, 1 caractère spécial) **When** soumission **Then** le mot de passe est haché bcrypt avant insertion et le compte est créé.
3. **Given** un compte existant **When** login avec email/mot de passe corrects **Then** un cookie session httpOnly est créé (7 jours) et l'utilisateur est redirigé.
4. **Given** un mot de passe invalide **When** login **Then** le système retourne HTTP 401 avec `{"detail": "..."}`.
5. **Given** un formulaire soumis **Then** feedback visuel (loading spinner) apparaît en < 1.5s et résultat (succès/erreur) est affiché.
6. **Given** un email ou username déjà existant **When** inscription **Then** HTTP 400 avec message d'erreur spécifique.

## Tasks / Subtasks

### Backend

- [x] Task 1: Refactorer le register/login existant vers le Service Pattern (AC: #2, #3, #4)
  - [x] 1.1: Créer `services/auth_local_service.py` avec `register_user()` et `login_user()`
  - [x] 1.2: Ajouter validation mot de passe (≥8, 1 maj, 1 chiffre, 1 spécial) dans le service
  - [x] 1.3: Refactorer `routes/auth.py` pour déléguer au service via `Depends()`
  - [x] 1.4: Supporter le login par **email** en plus du username

- [x] Task 2: Améliorer les modèles Pydantic (AC: #1, #6)
  - [x] 2.1: Ajouter `UserRegister` (username, email, password, password_confirm, age_consent)
  - [x] 2.2: Enrichir `UserLogin` pour accepter `email` comme alternative au `username` → créé `UserLoginLocal` avec champ `identifier`

- [x] Task 3: Écrire les tests pytest (AC: #2, #3, #4, #6)
  - [x] 3.1: `test_register_success`, `test_register_duplicate_email`, `test_register_weak_password`
  - [x] 3.2: `test_login_success`, `test_login_wrong_password`, `test_login_unknown_user`

### Frontend

- [x] Task 4: Créer le formulaire d'inscription (AC: #1, #5)
  - [x] 4.1: `features/auth/schemas.ts` — schema Zod inscription (miroir Pydantic)
  - [x] 4.2: `features/auth/components/RegisterForm.tsx` — React Hook Form + Zod
  - [x] 4.3: Indicateur de force du mot de passe (barre de progression 4 niveaux + label)

- [x] Task 5: Créer le formulaire de connexion email (AC: #3, #5)
  - [x] 5.1: `features/auth/components/EmailLoginForm.tsx` — React Hook Form + Zod
  - [x] 5.2: Intégrer dans `Login.tsx` (tabs Google / Email)

- [x] Task 6: Hooks API et store (AC: #3, #5)
  - [x] 6.1: `features/auth/api/useRegister.ts` — mutation TanStack Query
  - [x] 6.2: `features/auth/api/useLogin.ts` — mutation TanStack Query + setToken/setUser on success
  - [x] 6.3: Enrichir `store.ts` avec `user` object (AuthUser interface) + `setUser()`

- [x] Task 7: Route et navigation
  - [x] 7.1: Ajouter route `/register` dans `App.tsx`
  - [x] 7.2: Page `pages/auth/Register.tsx`

## Dev Notes

### Architecture obligatoire

- **Service Pattern** : `routes/auth.py` ne contient AUCUNE logique. Inject `auth_local_service` via `Depends()`.
- **Validation double** : Schema Zod frontend ↔ Pydantic backend identiques.
- **Hashing** : Utiliser `auth_utils.py` existant (`hash_password`, `verify_password` avec bcrypt via `passlib`).
- **Session** : Cookie `session_token` httpOnly, SameSite=Lax, max_age=7j (pattern établi par Story 1.1).
- **Réponses erreur** : Toujours `{"detail": "..."}` (standard FastAPI existant).

### Fichiers existants à réutiliser

| Fichier | Rôle | Action |
|---------|------|--------|
| `backend/auth_utils.py` | `hash_password()`, `verify_password()` bcrypt | **Réutiliser** tel quel |
| `backend/models.py` | `User`, `UserCreate`, `UserLogin` | **Enrichir** (ajouter `UserRegister`) |
| `backend/routes/auth.py` | Routes `/register`, `/login` — logique inline | **Refactorer** vers Service |
| `backend/email_service.py` | Stub email (logger) | **Réutiliser** |
| `frontend/src/features/auth/store.ts` | Zustand auth store | **Enrichir** |
| `frontend/src/pages/auth/Login.tsx` | Google OAuth uniquement | **Enrichir** (ajouter onglet Email) |
| `frontend/src/config/api.ts` | `API_URL` centralisé | **Réutiliser** |

### Librairies installées (ne PAS en ajouter)

- **Backend** : `passlib[bcrypt]`, `pydantic[email]`, `motor`, `fastapi`
- **Frontend** : `react-hook-form`, `@hookform/resolvers`, `zod`, `zustand`

### Conventions

- Collections MongoDB : `users`, `user_sessions`
- Python : `snake_case`
- Composants React : `PascalCase`
- API endpoints : `/api/auth/...`

### Project Structure Notes

- Nouveau service → `backend/services/auth_local_service.py`
- Nouveaux composants → `frontend/src/features/auth/components/`
- Nouveaux hooks API → `frontend/src/features/auth/api/`
- Nouveau schema → `frontend/src/features/auth/schemas.ts`
- Nouvelle page → `frontend/src/pages/auth/Register.tsx`

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2]
- [Source: backend/auth_utils.py] — bcrypt existant
- [Source: backend/routes/auth.py] — routes register/login existantes (à refactorer)
- [Source: frontend/src/features/auth/store.ts] — Zustand store existant

## Dev Agent Record

### Agent Model Used

- **Backend Tasks 1-3**: Antigravity (Gemini) — service pattern, models, tests
- **Frontend Tasks 4-7**: Claude Code (Opus 4.6) — composants UI, store, routing

### Debug Log References

- Backend tests: 6/6 passed (`python -m pytest tests/routes/test_auth_local.py -v -p no:recording`)
- Frontend build: OK (`vite build` — 676 kB bundle, warning chunk size > 500 kB, code splitting recommandé)
- Note: plugin `pytest-recording` (vcrpy) incompatible avec urllib3 actuel, contourné avec `-p no:recording`

### Completion Notes List

- Store Zustand enrichi avec `AuthUser` interface + `user` state + `setUser()` + `logout()` reset user
- RegisterForm: React Hook Form + Zod validation + password strength indicator (4 niveaux avec couleurs)
- EmailLoginForm: login par email ou username, toggle show/hide password, lien vers `/register`
- Login.tsx: tabs Google/Email, banner succès après inscription (`?registered=true`)
- Register.tsx: page wrapper avec même style glassmorphism que Login, lien retour vers `/login`
- Route `/register` ajoutée dans App.tsx

### File List

| File | Action | Description |
|------|--------|-------------|
| `backend/services/auth_local_service.py` | Created (Antigravity) | Service register_user + login_user |
| `backend/models.py` | Modified (Antigravity) | Added UserRegister, UserLoginLocal |
| `backend/routes/auth.py` | Modified (Antigravity) | Refactored /register + /login-local via service |
| `backend/tests/routes/test_auth_local.py` | Created (Antigravity) | 6 tests (3 register + 3 login) |
| `frontend/src/features/auth/schemas.ts` | Created (Antigravity) | Zod schemas + password strength util |
| `frontend/src/features/auth/api/useRegister.ts` | Created (Antigravity) | TanStack Query mutation |
| `frontend/src/features/auth/api/useLogin.ts` | Created (Antigravity) | TanStack Query mutation + store update |
| `frontend/src/features/auth/store.ts` | Modified (Claude Code) | Added AuthUser, user state, setUser() |
| `frontend/src/features/auth/components/RegisterForm.tsx` | Created (Claude Code) | Registration form + password strength bar |
| `frontend/src/features/auth/components/EmailLoginForm.tsx` | Created (Claude Code) | Email/username login form |
| `frontend/src/pages/auth/Login.tsx` | Modified (Claude Code) | Added tabs Google/Email + registration banner |
| `frontend/src/pages/auth/Register.tsx` | Created (Claude Code) | Registration page |
| `frontend/src/App.tsx` | Modified (Claude Code) | Added /register route |
