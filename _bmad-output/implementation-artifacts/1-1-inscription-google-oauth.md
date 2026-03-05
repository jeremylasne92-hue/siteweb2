# Story 1.1: Inscription via Google OAuth

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Visiteur,
I want m'inscrire ou me connecter en un clic via mon compte Google en certifiant mon âge,
so that rejoindre le mouvement rapidement sans retenir un nouveau mot de passe.

## Acceptance Criteria

1. **Given** Je suis sur la page d'inscription et déconnecté
   **When** Je clique sur "Continuer avec Google" après avoir coché la case de consentement d'âge (>15 ans)
   **Then** Je suis redirigé de manière sécurisée vers l'authentification Google
   **And** À mon retour, un compte membre est créé/lié en base de données et je suis défini comme "Connecté".
2. **Given** Je ne coche pas la case de consentement d'âge
   **When** Je tente de cliquer sur "Continuer avec Google"
   **Then** Le bouton est désactivé et/ou affiche un message d'erreur
   **And** Aucune redirection n'a lieu.

## Tasks / Subtasks

- [x] Task 1: Implémentation Backend (FastAPI)
  - [x] Ajouter les clés Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) au `.env` et à `core/config.py`
  - [x] Créer les routes `GET /api/auth/google/login` (Redirection) et `GET /api/auth/google/callback` (Capture) dans `routes/auth.py`.
  - [x] Créer le service métier correspondant dans `services/auth_service.py` et l'injecter via `Depends()`. Le service doit valider le token renvoyé par Google, vérifier/créer l'utilisateur dans MongoDB et renvoyer un JWT.
- [x] Task 2: Implémentation Frontend (Vue & Formulaire)
  - [x] Créer le composant `GoogleLoginButton.tsx` dans `src/features/auth/components/`.
  - [x] Intégrer la case à cocher "Consentement +15 ans" gérée via **React Hook Form / Zod**.
  - [x] Assurer que le bouton est désactivé si la case n'est pas cochée.
- [x] Task 3: Implémentation Frontend (Gestion de Session)
  - [x] Intercepter le retour sur la page Front contenant le "JWT" d'URL suite au callback de Google.
  - [x] Sauvegarder le token JWT dans l'état global **Zustand** (`src/features/auth/store.ts`).
  - [x] Rediriger silencieusement vers la vue Dashboard/Accueil.

## Dev Notes

### Dev Agent Guardrails & Technical Requirements

- L'Agent Developer doit lire `_bmad-output/project-context.md` impérativement.
- **Backend Architecture:** Motif **Service Pattern**. Les routes HTTP dans `routes/auth.py` ne doivent contenir aucune logique de base de données. Utilisez `Depends()`.
- **Database (Motor):** Obligation d'utiliser les méthodes asynchrones (ex. `await db.users.find_one(...)`).
- **Secret Keys:** Interdiction totale de hardcoder les identifiants OAuth. Utiliser les variables d'environnement.
- **Frontend State:** Utiliser **Zustand v5.0** pour l'état d'authentification persistant (Session). Utiliser **React Query** si besoin, pas de `useEffect` sauvage.
- **UX & Feedback:** Les temps de chargement lors de la redirection OAuth doivent posséder un feedback (Loader / Spinner / Disabled UX) (Règle No Silent Failures).

### Project Structure Notes

- Frontend feature isolation: `src/features/auth/*`
- Backend MVC isolation: `routes/auth.py`, `services/auth_service.py`, `utils/auth_utils.py`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-1] (FR1, FR4)
- [Source: _bmad-output/project-context.md] (Framework Patterns, Critical Rules)
- [Source: _bmad-output/planning-artifacts/architecture.md] (Boundaries)

## Dev Agent Record

### Agent Model Used

BMAD AI Agent - Default API Model

### Debug Log References

N / A

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Epic marked to 'in-progress' logic applied inside sprint-status.
- 🎯 Implémentation Terminée : Red-Green-Refactor effectué sur le Backend OAuth. Tests de connexion OK.
- 🎯 Hooks Zustand + Zod + Routing asynchrone ajouté au frontend sans linter errors.
- 🔒 Code Review Fix H1 : Création de `core/config.py` avec validation des env vars.
- 🔒 Code Review Fix H2 : JWT retiré de l’URL de redirection, stocké uniquement en cookie httpOnly.
- 🔒 Code Review Fix H3 : Ajout de la protection CSRF via paramètre `state` signé HMAC.
- 🔒 Code Review Fix M1 : Username atomique avec suffix aléatoire (plus de race condition).
- 🔒 Code Review Fix L1 : Timeout httpx ajouté (10s) sur les requêtes vers Google.
- 5 tests pytest au vert (dont 2 nouveaux tests CSRF).

### File List

- `backend/core/config.py` (nouveau)
- `backend/routes/auth.py`
- `backend/services/auth_service.py` (nouveau)
- `backend/tests/routes/test_auth_google.py` (nouveau)
- `backend/.env`
- `frontend/src/features/auth/components/GoogleLoginButton.tsx` (nouveau)
- `frontend/src/features/auth/store.ts` (nouveau)
- `frontend/src/pages/auth/Login.tsx` (nouveau)
- `frontend/src/pages/auth/GoogleCallback.tsx` (nouveau)
- `frontend/src/App.tsx`
- `frontend/src/components/layout/Header.tsx`
- `frontend/src/components/partners/PartnerModal.tsx`
- `frontend/src/pages/AdminPartners.tsx`
- `frontend/src/pages/ECHOLink.tsx`
- `frontend/src/pages/Home.tsx`
- `frontend/src/pages/Support.tsx`
- `frontend/package.json`
