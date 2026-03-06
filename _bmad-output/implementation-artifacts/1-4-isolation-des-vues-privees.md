# Story 1.4: Isolation des Vues Privées

Status: done

## Story

As a Système,
I want bloquer l'accès aux formulaires et tableaux de bord si l'utilisateur n'est pas authentifié,
So that protéger l'espace membre et forcer la conversion (Lead Gen).

## Acceptance Criteria

1. **Given** un visiteur non authentifié **When** il tente d'accéder à une route protégée (`/admin/partenaires`, `/mon-compte/partenaire`, `/echolink`, `/cognisphere`) **Then** l'accès est bloqué et un message incitatif s'affiche.
2. **Given** un visiteur non authentifié sur une route protégée **Then** l'interface affiche "Rejoignez le Mouvement pour accéder à cette section" avec un bouton vers `/login`.
3. **Given** un utilisateur authentifié **When** il accède à une route protégée **Then** le contenu s'affiche normalement.
4. **Given** un utilisateur non-admin **When** il accède à `/admin/partenaires` **Then** l'accès est bloqué (guard admin).
5. **Given** un utilisateur authentifié avec un token expiré **When** il accède à une route protégée **Then** `checkSession()` détecte l'expiration et affiche le message incitatif.

## Tasks / Subtasks

### Frontend

- [x] Task 1: Créer le composant ProtectedRoute (AC: #1, #3, #5)
  - [x] 1.1: `features/auth/components/ProtectedRoute.tsx` — wrapper qui vérifie `isAuthenticated` via le store
  - [x] 1.2: Appeler `checkSession()` au mount pour valider le token côté serveur
  - [x] 1.3: Supporter un prop `requiredRole` pour le guard admin (AC: #4)

- [x] Task 2: Créer le composant AuthPrompt (AC: #2)
  - [x] 2.1: `features/auth/components/AuthPrompt.tsx` — message incitatif avec bouton login/register
  - [x] 2.2: Style glassmorphism cohérent avec le thème existant

- [x] Task 3: Protéger les routes dans App.tsx (AC: #1, #4)
  - [x] 3.1: Wrapper `/admin/partenaires` avec ProtectedRoute (role: admin)
  - [x] 3.2: Wrapper `/mon-compte/partenaire` avec ProtectedRoute
  - [x] 3.3: Wrapper `/echolink` avec ProtectedRoute
  - [x] 3.4: Wrapper `/cognisphere` avec ProtectedRoute

## Dev Notes

### Architecture

- **ProtectedRoute** : composant wrapper qui check le store Zustand, PAS de redirection automatique vers /login
- **AuthPrompt** : affiché à la place du contenu protégé (pas de redirect, message incitatif)
- **checkSession()** : déjà implémenté dans le store par Antigravity (Story 1.3), appelle `/api/auth/me`
- **isLoading** : déjà dans le store, utiliser pour afficher un spinner pendant la vérification

### Fichiers existants à réutiliser

| Fichier | Rôle | Action |
|---------|------|--------|
| `frontend/src/features/auth/store.ts` | Zustand store avec checkSession, isLoading | **Réutiliser** |
| `frontend/src/App.tsx` | Routes | **Modifier** (wrapper ProtectedRoute) |
| `frontend/src/components/ui/Button.tsx` | Button component | **Réutiliser** |

### Conventions

- Composants React : PascalCase
- Thème : glassmorphism, couleurs echo-*
- Pas de redirect automatique — message incitatif à la place (AC #2)

## Dev Agent Record

### Agent Model Used

- **All tasks**: Claude Code (Opus 4.6)

### Debug Log References

- Frontend build: OK (vite build — 710 kB bundle)
- Routes protégées: /cognisphere, /echolink, /admin/partenaires, /mon-compte/partenaire toutes retournent 200
- /api/auth/me sans token retourne 401 → checkSession() invalide correctement la session
- Vite dev server: aucune erreur de compilation

### Completion Notes List

- ProtectedRoute: wrapper avec useEffect(checkSession), loading spinner, AuthPrompt pour non-auth, requiredRole pour admin guard
- AuthPrompt: design glassmorphism cohérent, icône LogIn, boutons Se connecter + Créer un compte
- 4 routes protégées dans App.tsx: cognisphere, echolink (user), admin/partenaires (admin), mon-compte/partenaire (user)
- Réutilise checkSession() et isLoading du store enrichi par Antigravity (Story 1.3)

### File List

| File | Action | Description |
|------|--------|-------------|
| `frontend/src/features/auth/components/ProtectedRoute.tsx` | Created | Guard auth avec checkSession + requiredRole |
| `frontend/src/features/auth/components/AuthPrompt.tsx` | Created | Message incitatif glassmorphism |
| `frontend/src/App.tsx` | Modified | 4 routes wrappées avec ProtectedRoute |
