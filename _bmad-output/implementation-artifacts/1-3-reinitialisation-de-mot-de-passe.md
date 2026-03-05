# Story 1.3: Réinitialisation de Mot de Passe

Status: ready-for-dev

## Story

As a Utilisateur,
I want pouvoir réinitialiser mon mot de passe via un lien sécurisé envoyé par email,
so that retrouver l'accès à mon compte en cas d'oubli.

## Acceptance Criteria

1. **Given** la page `/login` **When** l'utilisateur clique sur "Mot de passe oublié ?" **Then** un formulaire de saisie d'email s'affiche.
2. **Given** un email soumis **When** l'email existe en base **Then** un email contenant un lien avec un jeton sécurisé temporaire (1h) est envoyé et un feedback générique ("Si un compte existe…") est affiché.
3. **Given** un email soumis **When** l'email n'existe PAS **Then** le même message générique est affiché (anti-énumération).
4. **Given** l'utilisateur clique sur le lien reçu **When** le jeton est valide et non expiré **Then** un formulaire de nouveau mot de passe s'affiche.
5. **Given** un jeton expiré ou invalide **When** l'utilisateur tente d'accéder à la page reset **Then** un message d'erreur clair et un lien pour refaire la demande.
6. **Given** un nouveau mot de passe valide soumis **When** le jeton est valide **Then** le mot de passe est haché bcrypt, mis à jour en base, le jeton est invalidé, et l'utilisateur est redirigé vers `/login`.

## Tasks / Subtasks

### Backend

- [ ] Task 1: Créer le modèle `PasswordResetToken` (AC: #2)
  - [ ] 1.1: Ajouter dans `models.py` — token (uuid), user_id, expires_at, used (bool)

- [ ] Task 2: Créer `services/password_reset_service.py` (AC: #2, #3, #4, #5, #6)
  - [ ] 2.1: `request_reset(email, db)` — Lookup user, créer token 1h, appeler email_service
  - [ ] 2.2: `verify_token(token, db)` — Vérifier validité et expiration
  - [ ] 2.3: `reset_password(token, new_password, db)` — Valider mdp, hash, update, invalider token

- [ ] Task 3: Ajouter routes dans `routes/auth.py` (AC: #1-#6)
  - [ ] 3.1: `POST /forgot-password` — Accepter email, déléguer au service
  - [ ] 3.2: `GET /reset-password/{token}` — Vérifier token, retourner validité
  - [ ] 3.3: `POST /reset-password/{token}` — Soumettre nouveau mdp

- [ ] Task 4: Enrichir `email_service.py` (AC: #2)
  - [ ] 4.1: Améliorer `send_password_reset()` avec contenu email structuré (sujet, lien complet)

- [ ] Task 5: Écrire les tests pytest (AC: #2-#6)
  - [ ] 5.1: `test_forgot_password_known_email` — token créé + email envoyé
  - [ ] 5.2: `test_forgot_password_unknown_email` — même réponse (anti-enum)
  - [ ] 5.3: `test_verify_token_valid` — HTTP 200
  - [ ] 5.4: `test_verify_token_expired` — HTTP 400
  - [ ] 5.5: `test_reset_password_success` — mdp mis à jour + token invalidé
  - [ ] 5.6: `test_reset_password_weak` — HTTP 400

### Frontend

- [ ] Task 6: Créer les schemas Zod (AC: #1, #4)
  - [ ] 6.1: Ajouter `forgotPasswordSchema` et `resetPasswordSchema` dans `schemas.ts`

- [ ] Task 7: Créer les hooks API (AC: #2, #4, #6)
  - [ ] 7.1: `features/auth/api/useForgotPassword.ts` — mutation POST /forgot-password
  - [ ] 7.2: `features/auth/api/useResetPassword.ts` — mutation POST /reset-password/{token}

- [ ] Task 8: Créer les composants (AC: #1, #4)
  - [ ] 8.1: `features/auth/components/ForgotPasswordForm.tsx` — email input + feedback
  - [ ] 8.2: `features/auth/components/ResetPasswordForm.tsx` — nouveau mdp + strength indicator

- [ ] Task 9: Créer les pages et routes (AC: #1, #4, #5)
  - [ ] 9.1: `pages/auth/ForgotPassword.tsx` — page avec ForgotPasswordForm
  - [ ] 9.2: `pages/auth/ResetPassword.tsx` — page avec vérification token + ResetPasswordForm
  - [ ] 9.3: Ajouter routes `/forgot-password` et `/reset-password/:token` dans `App.tsx`

- [ ] Task 10: Ajouter lien "Mot de passe oublié ?" (AC: #1)
  - [ ] 10.1: Ajouter dans `EmailLoginForm.tsx` sous le champ mot de passe

## Dev Notes

### Architecture

- **Service Pattern** : Route → `password_reset_service` via `Depends()`
- **Anti-énumération** : Toujours retourner le même message, que l'email existe ou non
- **Token** : UUID v4, TTL 1h, usage unique (champ `used: bool`)
- **Email** : Utiliser `email_service.send_password_reset()` existant (enrichir le contenu)
- **Validation mdp** : Réutiliser `validate_password_strength()` de `auth_local_service.py`
- **Hashing** : Réutiliser `auth_utils.hash_password()`

### Fichiers existants à réutiliser

| Fichier | Action |
|---------|--------|
| `backend/auth_utils.py` | `hash_password()` — **Réutiliser** |
| `backend/services/auth_local_service.py` | `validate_password_strength()` — **Réutiliser** |
| `backend/email_service.py` | `send_password_reset()` — **Enrichir** |
| `backend/models.py` | **Enrichir** (ajouter `PasswordResetToken`) |
| `backend/routes/auth.py` | **Enrichir** (3 nouvelles routes) |
| `frontend/src/features/auth/schemas.ts` | **Enrichir** (2 nouveaux schemas) |
| `frontend/src/App.tsx` | **Enrichir** (2 nouvelles routes) |
| `frontend/src/features/auth/components/EmailLoginForm.tsx` | **Enrichir** (lien oublié) |

### URL du lien reset

```
{FRONTEND_URL}/reset-password/{token}
```
- `FRONTEND_URL` = `http://localhost:5173` en dev, configurable via env var

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3]
- [Source: backend/email_service.py] — stub send_password_reset existant
- [Source: backend/services/auth_local_service.py] — validate_password_strength réutilisable

## Dev Agent Record

### File List
