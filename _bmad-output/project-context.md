---
project_name: 'sitewebecho by emergent'
user_name: 'JeReM'
date: '2026-03-04'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'critical_rules']
existing_patterns_found: 3
status: 'complete'
rule_count: 38
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## 1. Technology Stack & Versions

**Core Technologies:**
- **Frontend :** React 19.2.0, TypeScript ~5.9.3, Vite 7.2.4
- **Styling :** TailwindCSS 4.1.18
- **Backend :** FastAPI 0.110.1, Python 3.11+, Motor 3.3.1 (MongoDB async)

**Key Dependencies:**
- **Data Fetching :** TanStack Query v5 / React Query (Frontend)
- **State Management :** Zustand v5.0 (Frontend)
- **Forms & Validation :** React Hook Form v7.71 + Zod v4.3 (Frontend) <=> Pydantic 2.12.3 (Backend)
- **Security & Data :** PyJWT 2.10.1, bcrypt 4.1.3, Pillow (Backend image validation)

**Agent Architectural Constraints (Approved by Team):**
- **Backend Async (Motor) :** Toutes les opérations MongoDB doivent être gérées de manière asynchrone (`await`).
- **Frontend Type Safety :** Interdiction d'utiliser le type `any`. Typage strict des formulaires imposé via `Zod`.
- **QA & Validation :** Tout ajout d'endpoint FastAPI couplé à Pydantic doit inclure des tests pour les erreurs de validation (422).

### 2. Language-Specific Rules

**Python (Backend) :**
- **Validation DTO :** Tous les DTOs entrants/sortants doivent hériter de `pydantic.BaseModel`. Aucune validation métier "à la main" dans les contrôleurs.
- **Typage Strict :** Utilisez les Type Hints Python avancés (ex: `List[T]`, `Optional[T]`) natifs. Évitez le type `Any`.
- **Nommage :** Privilégiez le `snake_case` pour toutes les variables, fonctions et collections MongoDB.
- **Réduction des Stacktraces :** En cas d'erreur de traitement, levez toujours des exceptions `HTTPException(status_code=x, detail="...")`.
- **Dependency Injection :** Ne jamais instancier les services dans les routes. Toujours utiliser `Depends(get_my_service)` pour injecter les dépendances.
- **Docstrings :** Utiliser les docstrings standards pour documenter les classes Pydantic complexes ou la logique métier non-triviale.

**TypeScript (Frontend) :**
- **Import/Export Conventions :** Préférez toujours les `export const` nommés aux `export default`. Les interfaces commencent par un I (ex: `IUser`) ou avec `Schema`.
- **Nommage des Composants :** Les fichiers et composants React doivent être en `PascalCase`.
- **Gestion des Promesses :** Utilisez `async/await` plutôt que `.then().catch()`, enveloppé dans des blocs `try/catch`.
- **Gestion des Imports :** Importer depuis la racine des modules (ex: `lucide-react`). Pour les imports de locaux, utiliser des chemins absolus avec alias (ex: `@/components/`) si définis, sinon des relatifs stricts.
- **JSDoc :** Documenter l'usage des props des composants et des hooks personnalisés avec le format `/** */`.

### 3. Framework-Specific Rules

**React (Frontend) :**
- **Hooks Usage :** Regroupez systématiquement tous les hooks natifs au début du composant. Ne jamais contourner les avertissements du linter `eslint-plugin-react-hooks`.
- **Component Structure :** Un fichier = Un composant exporté par défaut au maximum. Sous-composants très locaux autorisés dans le même fichier, mais à extraire dès qu'ils grossissent.
- **Separation of Concerns :** Extraire la logique calculatoire et la manipulation d'état complexe dans des *Custom Hooks* dédiés. Les composants JSX doivent rester maigres (dumb components).
- **State Management (Zustand) :** Le state global Zustand (`useAuthStore`, `useThemeStore`) est réservé aux données persistantes (session/thème).
- **State Management (React Query) :** Toute donnée provenant de l'API doit être gérée via `useQuery` / `useMutation`. Pas de `useEffect` sauvage pour des `fetch()`.
- **Validation Formulaires :** La validation de saisie doit se faire **exclusivement** via le `zodResolver` passé à `useForm`. Pas de conditions de validation ("c'est vide ?") dans la fonction `onSubmit()`.

**FastAPI (Backend) :**
- **Service Pattern :** Les endpoints dans les `Routers` ne doivent posséder aucune logique métier. Ils reçoivent la requête, appellent un `Service` via `Depends()`, et renvoient le résultat du service.
- **Injections Asynchrones :** Toute fonction utilisée pour `Depends(...)` (ex: connexion DB, authentification) doit **impérativement** être définie en `async def` si elle fait de l'I/O pour ne pas bloquer le threadpool de FastAPI.
- **Base de Données :** L'interaction avec MongoDB (Motor) doit se faire via des classes `Repositories` (ou dans des `Services` dédiés pour des requêtes simples), jamais directement dans les routes.
- **Middlewares :** Toute modification/vérification globale (ex: CORS, rate limiting, logs) doit être implémentée au niveau de l'app principale `main.py`.

### 4. Testing Rules

**Backend (FastAPI / Pytest) :**
- **Test Organization :** Utiliser `pytest` et le `TestClient` natif. Placer les tests dans `tests/` en miroir de l'arborescence des routes (ex: `tests/routes/test_partners.py`).
- **Mock Usage :** Mocker systématiquement la base de données (Motor) et les appels externes (ex: SendGrid).
- **Validation des Payloads :** Ne testez pas uniquement les codes HTTP (200 OK). Les assertions doivent valider la structure exacte du JSON retourné en fonction des contrats Pydantic.

**Frontend (React / Vite) :**
- **Test Organization :** Utiliser React Testing Library. Fichiers `.test.tsx` situés à côté des composants ciblés.
- **Mock Usage :** Mocker les appels API externes pour isoler la vue des données.
- **Testing User Behavior :** Interdiction d'accéder au state interne du framework. Tester via l'accessibilité (`getByRole`, `userEvent`) pour simuler un vrai parcours utilisateur.

**Application Globale & Sécurité :**
- **Tests de Régression :** La validation des DTOs mal formattés (422) et les restrictions d'accès d'authentification (401/403) doivent obligatoirement posséder un test unitaire prouvant l'isolation.

### 5. Code Quality & Style Rules

**Linting/Formatting :**
- **ESLint & Prettier (Front) :** Le code ne doit déclencher aucun avertissement. Vérifier scrupuleusement les dépendances de `useEffect`.
- **Black & Flake8 (Back) :** Formater selon les standards de Black. Pas d'imports inutilisés.

**Clean Code Général :**
- **Magic Numbers & Strings :** Interdiction stricte de coder en dur des valeurs "magiques" répétées. Extraire en constantes globales.
- **Return Early (Bouncer Pattern) :** Traiter les erreurs et les conditions d'arrêt en tout début de fonction (Guard Clauses) pour garder le *"Happy Path"* plat à la fin.
- **Docstrings & JSDoc :** Limités au "Pourquoi" d'une décision complexe. Le nommage des fonctions doit être assez explicite pour se passer du "Comment".

**Styling Tailwind CSS :**
- **Design System Tokens :** Interdiction des valeurs arbitraires Tailwind (ex: `w-[234px]`). Utiliser les tokens natifs du thème.
- **Fusion Conditionnelle :** Utiliser systématiquement les utilitaires comme `clsx` + `tailwind-merge` pour toute concaténation de classes dynamique.

**Code Organization :**
- **Architecture de Dossiers :** Les composants Frontend complexes doivent être isolés par feature (`src/features/...`).
- **Nommage (Python) :** Fichiers/fonctions/variables en `snake_case`. Classes en `PascalCase`. Variables globales en `UPPER_SNAKE_CASE`.
- **Nommage (TypeScript) :** Variables et fonctions en `camelCase`. Composants React (`PascalCase.tsx`). Fichiers utilitaires (`camelCase.ts`).

### 6. Development Workflow Rules

**Git/Repository Rules & Commits :**
- **Branch Naming :** Format explicite `type/ticket-description` (ex: `feat/FR1-oauth-google` ou `fix/login-crash`).
- **Commit Message Format :** Conventionnal Commits obligatoires `type(scope): description`.
- **Commits Atomiques :** L'agent doit s'engager (commit) de manière granulaire après chaque sous-tâche fonctionnelle validée. Pas de "Big Bang commits" en fin de Sprint.

**Production Readiness :**
- **Zero Dead Code & Logs :** Aucun `console.log()` laissé en suspens, aucun code "mort" ou `# TODO` ne doit persister dans la livraison d'une tâche. Le code est rendu prêt pour la production.
- **Fail-Safe UI :** Les fonctionnalités Incomplètes ne doivent jamais polluer l'expérience utilisateur finale (Boutons masqués, routes inaccessibles).

**PR & Code Review Requirements :**
- **Validation Globale (Tests) :** Toujours faire tourner Pylint/Vitest/Pytest localement avant de marquer la fin d'une tâche. S'assurer que les changements n'ont rien cassé dans le projet global.
- Ne jamais désactiver une règle de Linter globale `.eslintrc` pour "gagner du temps", sauf commentaire en-ligne (ex: `// eslint-disable-next-line ...`) très justifié.
- Le build frontend (Vite) doit rester léger. L'agent ne doit jamais introduire de gros paquets inutiles de dépendances (ex: `momentjs` entier alors qu'on peut utiliser l'API Date native).

## 7. Critical Don't-Miss Rules

**Anti-Patterns to Avoid :**
- **Sauter les typages génériques :** Ne jamais utiliser `any` ou `ts-ignore`. Ne contournez jamais le typage des réponses Axios/Query (`useQuery<any>`).
- **Logique Métier Côté Vue (Front) :** Ne jamais écrire de boucle de traitement métier complexe à l'intérieur du JSX `return ()`.
- **Passoire de Sécurité (Back) :** Ne jamais exposer de route de mutation (`POST`/`PUT`/`DELETE`) sans vérifier explicitement si un contrôle d'accès `Depends(get_current_user)` est requis.

**Securité & Données :**
- **Zero Hardcoded Secrets :** Interdiction absolue de coder en dur des mots de passe, clés d'API ou tokens, même "pour tester temporairement". Utilisez toujours les variables d'environnement.
- **Fail-Safe Authentification :** En cas de doute sur l'autorisation d'un utilisateur, échouez de manière sécurisée (`403 Forbidden`).
- **Soft Delete Obligatoire :** Aucune suppression physique (`delete_one`) n'est autorisée sur les entités majeures (Partenaires, Membres, Évènements). Utilisez systématiquement le Soft Delete (`is_deleted = True`) et filtrez les requêtes de lecture en correspondance.
- **Upload Helper (Pillow) :** Ne jamais faire confiance à l'extension d'un fichier uploadé. Toujours vérifier le type MIME réel via `python-magic` ou `Pillow` côté backend.

**Performance & UX :**
- **No Silent Failures (Front) :** Chaque appel API asynchrone doit déclencher un retour visuel (Loading Spinner / Skeleton) et posséder une gestion d'erreur via l'affichage d'un message d'erreur à l'utilisateur (`Toast`).
- **N+1 Query Problem (Back) :** Avec MongoDB Motor, ne jamais exécuter en boucle unitairement un `find_one()` sur une liste d'IDs en mémoire. Utilisez toujours l'opérateur sélecteur `$in` pour faire une requête de récupération en lot performante.

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-03-05
