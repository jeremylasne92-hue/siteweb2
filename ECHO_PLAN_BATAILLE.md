# ECHO : Plan de Bataille — 2026-03-12

## 0. État du Projet (depuis shared-context.md)
- **Phase** : Post-Epics — Consolidation MVP (lancement 20 mars 2026 — **J-8**)
- **Epics** : 4/4 terminés (16/16 stories done)
- **Locks actifs** : Aucun
- **Dernière décision** : RGPD compliance en cours — 3 commits pushés (pages légales, footer/banner, consentements formulaires) + travail non-commité massif (export données, désinscription email, headers sécurité, TTL indexes)

## 1. Rétrospective des 24h

### Succès
- **RGPD Phase 1 livrée** : 5 commits couvrant pages légales (PrivacyPolicy, LegalNotice, TermsOfService), liens Footer, CookieBanner, checkboxes consentement sur 3 formulaires (PartnerFormModal, Contact, TechApplicationForm)
- **Admin CSV exports** : endpoints `GET /api/auth/admin/export-users` et `GET /api/partners/admin/export-partners` fonctionnels
- **Admin Partner management** : edit/suspend partenaire + logout Header dropdown
- **Code-Splitting** : React.lazy sur toutes les routes, manualChunks Vite (vendor-forms, vendor-leaflet, vendor-react, vendor-ui, vendor-query)
- **Tests stables** : 51 backend + 17 frontend = 68 tests, tous passent
- **Build clean** : production build réussit (index 258kB gzip ~80kB)

### Frictions
1. **Partners.tsx est un fichier binaire (UTF-16 LE)** — ESLint ne peut pas le parser → 1 erreur ESLint permanente + risque de corruption silencieuse. Ce fichier a probablement été sauvé par un éditeur en mauvais encoding.
2. **23 fichiers modifiés non-commités** — travail RGPD (Tasks 9-11 du plan) + security headers + TTL indexes + docs Antigravity. Risque de perte de travail.
3. **30 erreurs ESLint** dont 11 `@typescript-eslint/no-explicit-any`, 1 `no-unused-vars`, 1 `no-useless-escape`, 1 `react-hooks/exhaustive-deps`, 1 binary parse error (Partners.tsx). La dette lint s'accumule.
4. **Register consent checkbox** ajoutée dans les unstaged changes mais sans commit dédié — mélangé avec d'autres modifications.
5. **Docs Antigravity** : 7 fichiers docs regenerés/archivés non trackés. Architecture docs modifiées en masse, réduisant le contenu de ~450 lignes.

### Loi de correction du jour
> **Commiter atomiquement** : chaque modification logique = 1 commit. Ne jamais accumuler 23 fichiers modifiés non-commités. Commiter le travail RGPD restant AVANT de démarrer de nouveaux lots.

## 2. Cap Hebdomadaire

| Objectif de la semaine | Statut | Ajustement |
| :--- | :--- | :--- |
| RGPD compliance complète (12 tasks) | 🟡 En cours — 8/12 tasks commitées, 4 en unstaged | Commiter le travail restant immédiatement (LOT-01) |
| Corriger Partners.tsx encoding | 🔴 Non démarré — bug critique | Priorité P0 : convertir UTF-16 → UTF-8 (LOT-02) |
| Zéro erreur ESLint | 🔴 30 erreurs | Réduire à <5 erreurs (LOT-03) |
| Page profil utilisateur | 🔴 Non démarré — dans backlog | Créer page profil basique avec droits RGPD (LOT-05) |
| Tests parcours critiques | 🟡 Coverage faible (~38% BE, ~14% FE) | Ajouter tests RGPD + tests admin (LOT-07) |
| Responsive mobile | 🔴 Non démarré — dans backlog | Audit + fix des breakpoints critiques (LOT-08) |
| Formulaire adhésion association | 🔴 Non démarré — dans backlog | Différé post-launch si pas le temps |
| Vérification parcours utilisateurs | 🔴 Non démarré | Audit complet des flows (LOT-06) |

## 3. La Chambre Noire (Délibération des 7 Agents BMAD)

### Débat

**Architect** : Situation. J-8 avant lancement. Le code RGPD est là mais pas commité. Partners.tsx est corrompu en UTF-16. 30 erreurs lint. On a 23 fichiers en l'air. Priorité absolue : stabiliser ce qui existe avant d'ajouter quoi que ce soit. Je veux des opinions.

**QA Tester** : Le non-commité m'inquiète. `backend/server.py` a des changements majeurs : SecurityHeadersMiddleware (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS), CORS restreint de `*` à `localhost:5173`, TTL indexes MongoDB pour data retention. Tout ça est critique pour la sécurité ET la RGPD — mais aucun test. Je demande au minimum un test pour le middleware de headers et un test pour l'endpoint `/me/export`. L'endpoint `/unsubscribe/{user_id}` dans `backend/routes/auth.py` est un GET sans authentification — n'importe qui peut désinscrire un utilisateur par son ID. C'est une vulnérabilité.

**Backend** : QA a raison sur le `/unsubscribe`. Un GET sans auth, c'est de l'IDOR. Il faut soit signer le lien (HMAC token), soit passer en POST avec auth. Le CORS restreint à `localhost:5173` va aussi casser en production — il faut que `CORS_ORIGINS` soit configuré dans l'env de déploiement Webstrator. Les TTL indexes dans `startup_indexes()` sont bien pensés : 6 mois pour `tech_candidatures`, 1 an pour `analytics_events`, 24h pour `password_reset_tokens`. La cascade delete dans `/auth/user/{user_id}` est améliorée — elle supprime maintenant partners, tech_candidatures et episode_optins. Correct.

**Frontend** : Partners.tsx en UTF-16 est un P0. ESLint refuse de le parser → on ne voit pas les erreurs potentielles dans ce fichier. La solution : `iconv -f UTF-16LE -t UTF-8 Partners.tsx > Partners.tmp && mv Partners.tmp Partners.tsx`. Pour les 11 `no-explicit-any`, je connais les fichiers — `AdminDashboard.tsx:21`, `AdminPartners.tsx:186,205`, `ECHOLink.tsx:125`, `Mouvement.tsx:217,245`, `MyPartnerAccount.tsx:82,143`, `PartnersPage.tsx:21`. La plupart sont des event handlers ou des catch blocks — facile à typer.

**Designer** : Je n'ai vu aucun test mobile dans les commits récents. Le CookieBanner (160 lignes dans le diff) — est-il responsive ? Les pages légales (PrivacyPolicy 252 lignes, TermsOfService 215 lignes) ont-elles un bon espacement mobile ? Les formulaires multi-étapes (RegisterForm, TechApplicationForm avec StepProgress) — comment se comportent-ils sur un écran 375px ? On lance dans 8 jours et personne n'a regardé le mobile.

**Code Reviewer** : J'ai des alertes sur le code non-commité :
1. `frontend/src/pages/MyPartnerAccount.tsx` — `handleDeleteAccount` fait un fetch `/auth/me` puis `/auth/user/{me.id}` en cascade. Le user ID devrait être dans le store, pas refetché.
2. `frontend/src/components/ui/CookieBanner.tsx` — le diff montre +160 lignes ajoutées aux 59 existantes = 219 lignes. Pour un banner cookie, c'est beaucoup. Il y a probablement du code de gestion granulaire qui pourrait être simplifié.
3. `backend/routes/candidatures.py` et `backend/routes/partners.py` ont des changements de 3 lignes chacun dans le diff — vérifier que ce ne sont pas des résidus.
4. `frontend/src/features/auth/schemas.ts` : +3 lignes — probablement l'ajout du champ consent dans le schema Zod.
5. Le `no-useless-escape` dans `RegisterForm.tsx:83` : un `\/` dans une regex qui n'a pas besoin d'être échappé.

**Documentation** : Les docs Antigravity ont été régénérées en masse : `docs/architecture.md` (-180 lignes), `docs/project-overview.md` (-141 lignes), `docs/development-guide.md` (-146 lignes). C'est une perte de contenu significative. Il faut vérifier que l'information essentielle est toujours là avant de commiter. Les fichiers untracked (`docs/architecture-patterns.md`, `docs/integration-architecture.md`, `docs/source-tree-analysis.md`, `docs/technology-stack.md`) sont des ajouts Antigravity — ils enrichissent la doc mais aucun n'est référencé dans CLAUDE.md ou shared-context.md.

**Architect** : Décisions. Je tranche :

1. **LOT-01 (P0)** : Commiter le travail RGPD non-commité en commits atomiques. C'est du travail fait, il faut le sauver.
2. **LOT-02 (P0)** : Fix Partners.tsx UTF-16 → UTF-8. Bug critique.
3. **LOT-03 (P1)** : Fix vulnérabilité `/unsubscribe` — signer le lien ou passer en POST auth.
4. **LOT-04 (P1)** : Corriger les 30 erreurs ESLint (11 `any` + 1 unused var + 1 useless escape + 1 binary).
5. **LOT-05 (P1)** : Page profil utilisateur avec section RGPD (export + delete) — généraliser MyPartnerAccount.
6. **LOT-06 (P2)** : Tests RGPD backend (export, unsubscribe, security headers, cascade delete).
7. **LOT-07 (P2)** : Audit responsive mobile — CookieBanner, pages légales, formulaires multi-étapes.
8. **LOT-08 (P2)** : Vérifier les docs Antigravity avant commit — s'assurer que le contenu essentiel n'est pas perdu.
9. **LOT-09 (P3)** : Formulaire d'inscription RegisterForm — ajouter consentement RGPD dans le flow multi-étapes.
10. **LOT-10 (P3)** : Audit des parcours utilisateurs — vérifier tous les boutons et liens.

Le débat est clos. On stabilise avant d'innover.

### Consensus
- **Stabilisation d'abord** : commiter le travail existant, fixer l'encoding, corriger la vulnérabilité
- **RGPD complet** : les droits utilisateur (export/delete/unsubscribe) doivent être accessibles à tous les users, pas seulement les partenaires
- **Mobile non testé** : risque majeur à J-8, audit obligatoire
- **Docs Antigravity** : vérifier avant commit, ne pas perdre de contenu
- **Vulnérabilité `/unsubscribe`** : IDOR critique, à corriger avant lancement

## 4. Lots de Production du Jour (Optimiste)

| ID | Chantier | Agent Lead | Niveau | Skills BMAD | Fichiers / Collections Cibles | Priorité | Effort |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| LOT-01 | Commit atomique travail RGPD non-commité | Backend + Frontend | 🟢 HOTFIX | multi-agent | `backend/routes/auth.py`, `backend/server.py`, `backend/models.py`, `backend/email_service.py`, `backend/utils/rate_limit.py`, `backend/routes/candidatures.py`, `backend/routes/partners.py`, `frontend/src/pages/MyPartnerAccount.tsx`, `frontend/src/components/ui/CookieBanner.tsx`, `frontend/src/features/auth/components/RegisterForm.tsx`, `frontend/src/features/auth/schemas.ts`, `frontend/src/pages/LegalNotice.tsx`, `frontend/src/pages/PrivacyPolicy.tsx`, `frontend/src/components/layout/Footer.tsx` | P0 | ~30min |
| LOT-02 | Fix Partners.tsx encoding UTF-16 → UTF-8 | Frontend | 🟢 HOTFIX | react-typescript | `frontend/src/pages/Partners.tsx` | P0 | ~10min |
| LOT-03 | Sécuriser endpoint /unsubscribe (HMAC token) | Backend | 🟡 STANDARD | code-review | `backend/routes/auth.py`, `backend/email_service.py` | P1 | ~45min |
| LOT-04 | Fix 30 erreurs ESLint (any, unused, escape) | Frontend | 🟡 STANDARD | react-typescript | `AdminDashboard.tsx`, `AdminPartners.tsx`, `ECHOLink.tsx`, `Mouvement.tsx`, `MyPartnerAccount.tsx`, `PartnersPage.tsx`, `RegisterForm.tsx` | P1 | ~1h |
| LOT-05 | Page profil utilisateur (/profil) avec droits RGPD | Frontend + Backend | 🟡 STANDARD | component-generator, react-typescript | Nouveau: `frontend/src/pages/Profile.tsx`, Modifier: `frontend/src/App.tsx`, `frontend/src/components/layout/Header.tsx` | P1 | ~2h |
| LOT-06 | Tests RGPD backend (export, unsubscribe, headers, cascade delete) | QA Tester | 🟡 STANDARD | code-review | Nouveau: `backend/tests/routes/test_rgpd.py`, `backend/tests/test_security_headers.py` | P2 | ~1h30 |
| LOT-07 | Audit + fix responsive mobile (banner, légal, formulaires) | Designer + Frontend | 🟡 STANDARD | css-design-system | `frontend/src/components/ui/CookieBanner.tsx`, `frontend/src/pages/PrivacyPolicy.tsx`, `frontend/src/pages/LegalNotice.tsx`, `frontend/src/pages/TermsOfService.tsx`, `frontend/src/features/auth/components/RegisterForm.tsx`, `frontend/src/components/forms/TechApplicationForm.tsx` | P2 | ~1h30 |
| LOT-08 | Vérifier et commiter docs Antigravity | Documentation | 🟢 HOTFIX | multi-agent | `docs/architecture.md`, `docs/project-overview.md`, `docs/development-guide.md`, `docs/index.md`, `docs/component-inventory.md`, `docs/data-models.md`, `docs/api-contracts.md`, `docs/architecture-patterns.md`, `docs/integration-architecture.md`, `docs/source-tree-analysis.md`, `docs/technology-stack.md` | P2 | ~30min |
| LOT-09 | Consentement RGPD dans RegisterForm multi-étapes | Frontend | 🟢 HOTFIX | react-typescript | `frontend/src/features/auth/components/RegisterForm.tsx`, `frontend/src/features/auth/schemas.ts` | P3 | ~20min |
| LOT-10 | Audit parcours utilisateurs + boutons non-fonctionnels | QA Tester | 🟡 STANDARD | code-review | Toutes les pages dans `frontend/src/pages/`, `frontend/src/components/` | P3 | ~1h |

## 5. Commandes d'Exécution Multi-Agents

**LOT-01 : Commit atomique RGPD**
```
Lis .agent/agents/architect.md et .agent/skills/multi-agent/SKILL.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : HOTFIX.
Mission : Commiter le travail RGPD non-commité en commits atomiques séparés :
  1. Commit "feat(rgpd): add security headers middleware and tighten CORS" → backend/server.py
  2. Commit "feat(rgpd): add TTL indexes for data retention" → backend/server.py (si combiné avec 1, OK)
  3. Commit "feat(rgpd): add user data export endpoint and cascade delete" → backend/routes/auth.py
  4. Commit "feat(rgpd): add email unsubscribe endpoint and opt-out field" → backend/routes/auth.py, backend/models.py, backend/email_service.py
  5. Commit "feat(rgpd): add RGPD section with export and delete on partner account" → frontend/src/pages/MyPartnerAccount.tsx
  6. Commit "feat(rgpd): enhance cookie banner with granular consent" → frontend/src/components/ui/CookieBanner.tsx
  7. Commit "feat(rgpd): add consent checkbox to registration form" → frontend/src/features/auth/components/RegisterForm.tsx, frontend/src/features/auth/schemas.ts
  8. Commit "feat(rgpd): enhance legal pages content" → frontend/src/pages/PrivacyPolicy.tsx, frontend/src/pages/LegalNotice.tsx, frontend/src/components/layout/Footer.tsx
NE PAS commiter les fichiers docs (gérés par LOT-08).
NE PAS commiter backend/routes/candidatures.py ni backend/routes/partners.py sans vérifier le contenu (petits diffs à valider).
Loi de correction du jour : un commit = une modification logique. Pas de commit fourre-tout.
Après chaque commit, vérifier que les tests passent.
Après tous les commits :
cd frontend && npx eslint .
cd frontend && npx vitest run
cd backend && python -m pytest -p no:recording -q
cd frontend && npm run build
Mets à jour .agent/memory/shared-context.md (Décisions Récentes + Historique des Niveaux).
```

**LOT-02 : Fix Partners.tsx UTF-16**
```
Lis .agent/agents/frontend.md et .agent/skills/react-typescript/SKILL.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : HOTFIX.
Mission : Le fichier frontend/src/pages/Partners.tsx est encodé en UTF-16 Little Endian au lieu d'UTF-8. ESLint ne peut pas le parser ("Parsing error: File appears to be binary").
  1. Lire le fichier Partners.tsx et comprendre son contenu
  2. Réécrire le fichier en UTF-8 (utiliser Write tool ou iconv)
  3. Vérifier que ESLint peut parser le fichier
  4. Vérifier le build
  5. Commiter : "fix: convert Partners.tsx from UTF-16 to UTF-8 encoding"
Loi de correction du jour : vérifier l'encoding des fichiers après toute manipulation OneDrive/multi-éditeur.
Après implémentation :
cd frontend && npx eslint .
cd frontend && npx vitest run
cd backend && python -m pytest -p no:recording -q
cd frontend && npm run build
Mets à jour .agent/memory/shared-context.md.
```

**LOT-03 : Sécuriser /unsubscribe**
```
Lis .agent/agents/backend.md et .agent/skills/code-review/SKILL.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : STANDARD.
Mission : L'endpoint GET /api/auth/unsubscribe/{user_id} dans backend/routes/auth.py est un IDOR — n'importe qui peut désinscrire un utilisateur en devinant son UUID. Solutions possibles :
  Option A (recommandée) : Ajouter un token HMAC signé au lien. Générer le token côté backend avec hmac + secret key quand on envoie l'email. Vérifier le token dans l'endpoint.
  Option B : Transformer en POST avec authentification (Depends(get_current_user)).
Implémenter Option A :
  1. Créer une fonction sign_unsubscribe_token(user_id: str) → str dans backend/services/ ou backend/utils/
  2. Modifier l'endpoint : GET /api/auth/unsubscribe/{user_id}?token={hmac_token}
  3. Vérifier le HMAC avant d'appliquer le opt-out
  4. Modifier backend/email_service.py pour inclure le token signé dans le lien
  5. Ajouter un test dans backend/tests/routes/test_rgpd.py
Fichiers : backend/routes/auth.py, backend/email_service.py, backend/core/config.py (si besoin d'une UNSUBSCRIBE_SECRET).
Loi de correction du jour : tout endpoint modifiant des données utilisateur DOIT être authentifié ou signé.
Après implémentation :
cd frontend && npx eslint .
cd frontend && npx vitest run
cd backend && python -m pytest -p no:recording -q
cd frontend && npm run build
Mets à jour .agent/memory/shared-context.md.
```

**LOT-04 : Fix 30 erreurs ESLint**
```
Lis .agent/agents/frontend.md et .agent/skills/react-typescript/SKILL.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : STANDARD.
Mission : Corriger les 30 erreurs ESLint. Détail par fichier :
  - frontend/src/pages/Partners.tsx → sera corrigé par LOT-02 (binary parse), vérifier après
  - frontend/src/pages/AdminDashboard.tsx:21 → typer le `any` (probablement un event handler ou error)
  - frontend/src/pages/AdminPartners.tsx:186,205 → typer les `any` (probablement des responses fetch)
  - frontend/src/pages/AdminPartners.tsx:735 → ajouter fetchPartners dans le dependency array du useEffect (ou utiliser useCallback)
  - frontend/src/pages/ECHOLink.tsx:125 → typer le `any`
  - frontend/src/pages/Mouvement.tsx:217,245 → typer les `any`
  - frontend/src/pages/MyPartnerAccount.tsx:82,121,143 → typer le `any` + renommer `err` unused
  - frontend/src/pages/PartnersPage.tsx:21 → typer le `any`
  - frontend/src/features/auth/components/RegisterForm.tsx:83 → retirer le `\/` inutile dans la regex
  Vérifier s'il y a d'autres erreurs non listées dans les fichiers restants (AdminEvents, etc.).
  Ne PAS ajouter de commentaires supplémentaires. Typer avec des types précis, pas `unknown` partout.
Loi de correction du jour : chaque `any` remplacé doit utiliser le type réel (Response, Error, Event, etc.), pas un type générique.
Après implémentation :
cd frontend && npx eslint .
cd frontend && npx vitest run
cd backend && python -m pytest -p no:recording -q
cd frontend && npm run build
Mets à jour .agent/memory/shared-context.md.
```

**LOT-05 : Page profil utilisateur**
```
Lis .agent/agents/frontend.md, .agent/agents/designer.md, .agent/skills/component-generator/SKILL.md et .agent/skills/react-typescript/SKILL.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : STANDARD.
Mission : Créer la page /profil accessible à tous les utilisateurs connectés (pas seulement les partenaires).
  Contenu de la page :
  1. Section "Mon profil" — afficher nom, email, date d'inscription, dernière connexion
  2. Section "Mes données RGPD" :
     - Bouton "Exporter mes données" → fetch GET /api/auth/me/export → download JSON
     - Bouton "Supprimer mon compte" → confirmation modale → fetch DELETE /api/auth/user/{id}
     - Toggle "Recevoir les emails" → fetch POST/PUT pour modifier email_opt_out
  3. Section "Mon activité" — optins épisodes, candidatures en cours
  Fichiers cibles :
  - Créer : frontend/src/pages/Profile.tsx
  - Modifier : frontend/src/App.tsx (lazy import + route /profil protégée)
  - Modifier : frontend/src/components/layout/Header.tsx (ajouter lien "Mon profil" dans le dropdown user)
  Design : suivre le thème Nature (glass-card, forest-dark, sand-light). Utiliser Layout + SEO.
  La page MyPartnerAccount.tsx a déjà le code export/delete — réutiliser la logique, ne pas dupliquer.
Loi de correction du jour : un commit = une modification logique.
Après implémentation :
cd frontend && npx eslint .
cd frontend && npx vitest run
cd backend && python -m pytest -p no:recording -q
cd frontend && npm run build
Mets à jour .agent/memory/shared-context.md.
```

**LOT-06 : Tests RGPD backend**
```
Lis .agent/agents/qa-tester.md et .agent/skills/code-review/SKILL.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : STANDARD.
Mission : Ajouter des tests pour les endpoints et middleware RGPD :
  1. GET /api/auth/me/export — vérifier que les données sont retournées sans password_hash ni totp_secret
  2. GET /api/auth/unsubscribe/{user_id} — vérifier que email_opt_out passe à True (+ test token HMAC si LOT-03 fait)
  3. DELETE /api/auth/user/{user_id} — vérifier cascade delete (partners, tech_candidatures, episode_optins)
  4. SecurityHeadersMiddleware — vérifier que X-Content-Type-Options, X-Frame-Options sont présents dans les réponses
  Fichier cible : backend/tests/routes/test_rgpd.py (nouveau)
  Pattern de test : suivre le pattern existant dans test_auth_local.py (AsyncClient + httpx)
  Flag obligatoire : -p no:recording
Loi de correction du jour : chaque test doit vérifier une assertion précise, pas juste status 200.
Après implémentation :
cd backend && python -m pytest -p no:recording -q
cd frontend && npx vitest run
cd frontend && npm run build
Mets à jour .agent/memory/shared-context.md.
```

**LOT-07 : Audit responsive mobile**
```
Lis .agent/agents/designer.md et .agent/skills/css-design-system/SKILL.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : STANDARD.
Mission : Auditer et corriger le responsive mobile sur les composants récemment ajoutés :
  1. CookieBanner (frontend/src/components/ui/CookieBanner.tsx) — vérifier sur 375px, boutons empilés ?
  2. Pages légales (PrivacyPolicy.tsx, LegalNotice.tsx, TermsOfService.tsx) — texte lisible, padding correct sur mobile
  3. RegisterForm multi-étapes (frontend/src/features/auth/components/RegisterForm.tsx) — StepProgress visible, formulaire utilisable sur 375px
  4. TechApplicationForm multi-étapes (frontend/src/components/forms/TechApplicationForm.tsx) — même vérification
  5. Header dropdown utilisateur (frontend/src/components/layout/Header.tsx) — menu déroulant accessible sur mobile
  6. AdminPartners.tsx — page admin souvent oubliée en responsive
  Utiliser le dev server + preview tools pour vérifier. Fixer les problèmes trouvés directement.
  Conventions : Tailwind breakpoints (sm:640, md:768, lg:1024). Stack vertical sous md.
Loi de correction du jour : tout composant ajouté doit être testé à 375px AVANT commit.
Après implémentation :
cd frontend && npx eslint .
cd frontend && npx vitest run
cd frontend && npm run build
Mets à jour .agent/memory/shared-context.md.
```

**LOT-08 : Vérifier et commiter docs Antigravity**
```
Lis .agent/agents/documentation.md et .agent/skills/multi-agent/SKILL.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : HOTFIX.
Mission : Vérifier les modifications docs Antigravity avant commit :
  1. Comparer git diff pour docs/architecture.md, docs/project-overview.md, docs/development-guide.md — s'assurer que le contenu essentiel n'a pas été supprimé
  2. Vérifier que les nouveaux fichiers (docs/architecture-patterns.md, docs/integration-architecture.md, docs/source-tree-analysis.md, docs/technology-stack.md) apportent de la valeur
  3. Valider que docs/index.md référence correctement les nouveaux fichiers
  4. Si OK, commiter : "docs: update architecture and project documentation"
  5. Archiver docs/.archive/ si pertinent
  NE PAS commiter docs/project-scan-report.json (auto-généré, pas besoin de versionner)
Loi de correction du jour : vérifier le contenu supprimé dans les diffs, pas seulement le contenu ajouté.
Mets à jour .agent/memory/shared-context.md.
```

**LOT-09 : Consentement RGPD RegisterForm**
```
Lis .agent/agents/frontend.md et .agent/skills/react-typescript/SKILL.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : HOTFIX.
Mission : Vérifier que le RegisterForm (frontend/src/features/auth/components/RegisterForm.tsx) inclut bien un consentement RGPD dans le flow multi-étapes.
  Les unstaged changes montrent +29 lignes ajoutées dans RegisterForm.tsx et +3 lignes dans schemas.ts.
  1. Vérifier que la checkbox est bien présente et bloque la soumission si non cochée
  2. Vérifier que le schema Zod valide le consentement
  3. Vérifier le build
  Si déjà fait dans LOT-01 (commit), juste vérifier. Sinon implémenter.
Après implémentation :
cd frontend && npx eslint .
cd frontend && npx vitest run
cd frontend && npm run build
```

**LOT-10 : Audit parcours utilisateurs**
```
Lis .agent/agents/qa-tester.md et .agent/skills/code-review/SKILL.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : STANDARD.
Mission : Audit systématique de tous les parcours utilisateurs et boutons :
  1. Parcours inscription → login → accès contenu → logout
  2. Parcours candidature partenaire → validation admin → espace partenaire
  3. Parcours candidature tech (CogniSphère/ECHOLink)
  4. Parcours contact → envoi message
  5. Parcours admin → dashboard → gestion partenaires → événements → exports
  6. Vérifier tous les liens dans le Footer (12 href="#" signalés dans le backlog)
  7. Vérifier les boutons HelloAsso sur /soutenir
  8. Vérifier les liens sociaux (Twitter, Facebook, Instagram, etc.)
  Pour chaque parcours : noter les boutons cassés, liens morts, redirections incorrectes.
  Créer un fichier de rapport : docs/plans/2026-03-12-audit-parcours.md
Loi de correction du jour : tester les parcours complets, pas juste les pages individuelles.
```

## 6. Mise à jour shared-context.md

```yaml
derniere_mise_a_jour: 2026-03-12
phase_actuelle: Post-Epics — Consolidation MVP + RGPD Compliance (J-8 lancement)
decisions_recentes:
  - date: 2026-03-12
    decision: "Conseil stratégique nocturne — Stabilisation prioritaire : commiter RGPD non-commité, fix Partners.tsx UTF-16, sécuriser /unsubscribe IDOR, fix 30 erreurs ESLint. 10 lots planifiés."
    agent: Architect (Conseil 7 Agents)
  - date: 2026-03-12
    decision: "Loi de correction : commiter atomiquement, un commit = une modification logique. Ne jamais accumuler 23 fichiers modifiés non-commités."
    agent: Architect (Conseil 7 Agents)
  - date: 2026-03-12
    decision: "Vulnérabilité identifiée : GET /api/auth/unsubscribe/{user_id} est un IDOR sans authentification. Corriger avec HMAC token avant lancement."
    agent: QA Tester + Backend
historique_niveaux:
  - date: 2026-03-12
    lots_planifies: 10
    lots_hotfix: 4
    lots_standard: 6
    lots_majeur: 0
locks_actifs: []
```
