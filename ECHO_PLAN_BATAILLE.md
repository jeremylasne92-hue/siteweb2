# ECHO : Plan de Bataille — 2026-03-26

## 0. État du Projet (depuis shared-context.md)
- **Phase** : 🚀 LANCÉ — Site en production depuis le 20 mars 2026
- **Epics** : 4/4 Epics terminés, 16/16 stories — MVP complet
- **Locks actifs** : Aucun
- **Dernière décision** : 2026-03-21 — Workflow BMAD strict réinstauré, système mémoire persistante, newsletter admin, onboarding J+3/J+10
- **Santé technique** : ✅ Lint 0 erreur (2 warnings React Hook Form), 32/32 tests passent, build OK (18s)
- **Backlog** : 26 tâches actives (11 complétées) — 4 P0, 6 P1, 9 P2, 8 Icebox

---

## 1. Rétrospective des 24h

- **Succès :**
  - Photo Thierry Korutos-Chatam mise à jour et centrée (c4fb8cb, 42af772)
  - Correction Cognisphère : citation Murre & Dros 2015 remplace le chiffre 90% non sourcé (9314307) — rigueur scientifique
  - Personnage Sacha "La Vision" ajouté avec texte galerie + fix responsive mobile (3b65514)
  - Page /pitch partenaires créée + page /bienvenue post-inscription + Schema.org TVSeries (296b55e)

- **Frictions :**
  - 5 jours sans mise à jour de `shared-context.md` ni `changelog.md` (dernière : 21/03, aujourd'hui : 26/03) — la mémoire projet dérive
  - `shared-context.md` indique encore "27 actives" alors que le backlog réel montre 26 + des tâches complétées non tracées (T-025 /pitch est faite mais pas marquée complétée)
  - Aucun test backend lancé depuis le 21/03 (pas de CI automatique, Render auto-deploy sans gate)
  - Le build produit un `MyPartnerAccount` de 376 KB gzippé à 111 KB — chunk anormalement gros (carte Leaflet embedded)
  - Le hero Home.tsx utilise encore une image Unsplash externe (`images.unsplash.com`) au lieu d'un asset local — dépendance CDN fragile + potentiel ralentissement LCP

- **Loi de correction du jour :**
  > **Toute session DOIT terminer par la mise à jour de `shared-context.md`, `changelog.md` et `backlog.md`.** Les 3 fichiers de mémoire sont un triplet atomique — on ne met pas à jour l'un sans les autres.

---

## 2. Cap Hebdomadaire

| Objectif de la semaine | Statut | Ajustement |
| :--- | :--- | :--- |
| Contenu narratif enrichi (personnages, galerie, pitch) | ✅ En avance | Sacha ajouté, /pitch créé, /bienvenue créé — continuer |
| RGPD compliance (T-019, T-020) | 🟡 En retard | Corrections RGPD faites (2257dcf) mais registre + endpoint droits pas encore codés |
| Acquisition premiers utilisateurs (T-012, T-013) | 🔴 En retard | Aucun post réseaux, aucun message personnel envoyé — 6 jours post-lancement, critique |
| Stabilité technique + tests | 🟡 Dans les temps | Tests frontend OK, backend non vérifié, build OK mais chunk MyPartnerAccount trop gros |
| Backup MongoDB (T-018) | 🔴 Non commencé | Aucune sauvegarde en place — risque de perte de données utilisateurs |

---

## 3. La Chambre Noire (Délibération des 7 Agents BMAD)

### Débat

**🏗️ Architect** : L'état du projet est bon techniquement mais la mémoire projet est désynchronisée — 5 jours sans update de shared-context. La page /pitch (T-025) est livrée mais pas marquée complétée dans le backlog. Avant de coder quoi que ce soit aujourd'hui, on resynchronise la documentation. Ensuite, je vois 3 axes prioritaires : RGPD (obligation légale), blog/SEO (acquisition organique), et optimisation technique (chunk size, tests manquants).

**🔧 Backend** : Je regarde les routes existantes — on a 19 fichiers dans `backend/routes/`. L'endpoint exercice des droits RGPD (T-020) est le plus urgent côté légal. Je propose : un `backend/routes/gdpr.py` avec 3 endpoints : `GET /api/gdpr/my-data` (export JSON des données utilisateur), `POST /api/gdpr/rectify` (modification), `DELETE /api/gdpr/delete` (suppression compte + anonymisation). Le modèle User dans `backend/models.py` (499 lignes) a déjà tout ce qu'il faut. Il faut aussi créer le script de backup MongoDB — un simple `backend/scripts/backup_mongo.py` qui utilise `mongodump` ou l'API Atlas.

**⚛️ Frontend** : La page /pitch (204 lignes) et /bienvenue (164 lignes) sont livrées. Côté priorité, je vois 2 chantiers : (1) le blog/actualités (T-023) — nouvelle page `frontend/src/pages/Blog.tsx` + route `/blog` dans App.tsx, avec un premier article making-of IA en dur (pas besoin de CMS pour 1 article). (2) Le tunnel conversion post-vidéo (T-024) — c'est un composant CTA après le player YouTube dans `Serie.tsx` (987 lignes) qui guide vers l'inscription. `Serie.tsx` est déjà gros, il faudra extraire le composant CTA.

**🎨 Designer** : Le chunk `MyPartnerAccount` à 376 KB est un red flag UX — c'est la carte Leaflet. On devrait lazy-loader la carte uniquement quand le user scrolle jusqu'à elle. Pour le blog, je propose un layout simple : cards avec image de couverture, date, titre, extrait. Le design system ECHO (variables `--color-forest-*`, `--color-sand-*`, effets `.glass-card`) doit être respecté. Pour le tunnel conversion, le CTA doit être visuellement fort : couleur `--color-echo-accent`, animation `organic-transition`, placé juste sous la vidéo dans Serie.tsx.

**🧪 QA Tester** : 32 tests frontend passent, mais il n'y a que 3 fichiers de test pages (`Serie.test.tsx`, `Cognisphere.test.tsx`, `Support.test.tsx`). Les nouvelles pages `/pitch` et `/bienvenue` n'ont aucun test. Les tests backend n'ont pas été lancés — je recommande de les exécuter immédiatement. L'endpoint GDPR doit avoir des tests de sécurité : vérifier qu'un user ne peut exporter que SES données, que la suppression anonymise vraiment, que le rate limiting fonctionne.

**🔍 Code Reviewer** : Le `RegisterForm.tsx` a 2 warnings ESLint (React Hook Form incompatible library) — ce n'est pas bloquant mais ça pollue la sortie lint. Plus préoccupant : `Home.tsx:37` charge une image Unsplash en CDN pour le hero background — si Unsplash change l'URL ou est lent, le hero est cassé. Il faut télécharger l'image et la servir localement. Aussi, `App.tsx:110` a une indentation inconsistante (AdminNewsletter avec des espaces supplémentaires).

**📝 Documentation** : Le backlog dit 26 actives mais le compteur dans shared-context dit 27. La page /pitch (T-025) est faite (commit 296b55e) mais toujours en P2 "à faire". Le changelog n'a pas d'entrée depuis le 21/03. Il faut une entrée 22-26/03 couvrant les 5 commits (photo Thierry x2, Cognisphère fix, Sacha personnage, page pitch/bienvenue/Schema.org, corrections RGPD). Le `docs/component-inventory.md` doit aussi être mis à jour avec les nouveaux composants Pitch et Welcome.

### Consensus

**L'Architect tranche :**

1. **Documentation d'abord** — Resynchroniser les 3 fichiers mémoire (shared-context, changelog, backlog) avant tout développement. Marquer T-025 comme complétée.
2. **RGPD endpoint** (T-020) — Obligation légale, 6 jours post-lancement sans endpoint de droits. Backend lead, QA valide.
3. **Blog/Actualités** (T-023) — Premier article statique, pas de CMS. SEO a besoin de contenu frais. Frontend lead.
4. **Tunnel conversion** (T-024) — CTA post-vidéo dans Serie.tsx. Conversion directe. Designer specs + Frontend implémente.
5. **Backup MongoDB** (T-018) — Script Python simple, pas d'infra complexe. Backend lead.
6. **Optimisation chunk MyPartnerAccount** — Lazy-load Leaflet. Frontend + Designer.
7. **Tests pages manquantes** — Pitch.test.tsx + Welcome.test.tsx. QA lead.
8. **Hero image locale** — Remplacer CDN Unsplash par asset local. Frontend hotfix.
9. **Registre RGPD** (T-019) — Document structuré des traitements. Documentation lead.
10. **Lint cleanup** — Fix indentation App.tsx. Code Reviewer hotfix.

---

## 4. Lots de Production du Jour (Optimiste)

| ID | Chantier | Agent Lead | Niveau | Skills BMAD | Fichiers / Collections Cibles | Priorité | Effort |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| LOT-01 | Resynchronisation mémoire projet | Documentation | 🟢 HOTFIX | — | `.agent/memory/shared-context.md`, `memory/changelog.md`, `docs/backlog.md` | P0 | ~20min |
| LOT-02 | Endpoint RGPD exercice des droits | Backend | 🟡 STANDARD | `code-review` | `backend/routes/gdpr.py` (nouveau), `backend/server.py`, `backend/models.py`, `backend/tests/routes/test_gdpr.py` | P1 | ~2h |
| LOT-03 | Blog/Actualités — page + premier article | Frontend | 🟡 STANDARD | `react-typescript`, `css-design-system` | `frontend/src/pages/Blog.tsx` (nouveau), `frontend/src/App.tsx`, `frontend/src/components/layout/Header.tsx` | P2 | ~2h |
| LOT-04 | Tunnel conversion post-vidéo | Frontend + Designer | 🟡 STANDARD | `component-generator`, `css-design-system` | `frontend/src/pages/Serie.tsx`, `frontend/src/components/ui/ConversionCTA.tsx` (nouveau) | P2 | ~1h30 |
| LOT-05 | Script backup MongoDB Atlas | Backend | 🟢 HOTFIX | — | `backend/scripts/backup_mongo.py` (nouveau), `docs/backlog.md` | P1 | ~30min |
| LOT-06 | Lazy-load Leaflet (MyPartnerAccount) | Frontend | 🟢 HOTFIX | `react-typescript` | `frontend/src/pages/MyPartnerAccount.tsx` | P2 | ~30min |
| LOT-07 | Tests pages Pitch + Welcome | QA Tester | 🟢 HOTFIX | `code-review` | `frontend/src/pages/Pitch.test.tsx` (nouveau), `frontend/src/pages/Welcome.test.tsx` (nouveau) | P2 | ~45min |
| LOT-08 | Hero image locale (remplacer Unsplash CDN) | Frontend | 🟢 HOTFIX | — | `frontend/src/pages/Home.tsx`, `frontend/public/images/` | P1 | ~15min |
| LOT-09 | Registre des traitements RGPD (document) | Documentation | 🟡 STANDARD | — | `docs/rgpd-registre-traitements.md` (nouveau) | P1 | ~1h |
| LOT-10 | Fix indentation App.tsx + lint cleanup | Code Reviewer | 🟢 HOTFIX | `code-review` | `frontend/src/App.tsx:110` | P3 | ~10min |

**Effort total estimé : ~9h30** (6 HOTFIX + 4 STANDARD)

---

## 5. Commandes d'Exécution Multi-Agents
*(Copier/coller la commande du lot souhaité dans Claude Code le matin)*

**LOT-01 : Resynchronisation mémoire projet**
```
Lis .agent/agents/documentation.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : HOTFIX.
Mission : Resynchroniser les 3 fichiers de mémoire projet :
1. Mettre à jour `docs/backlog.md` : marquer T-025 (page /pitch) comme complétée (commit 296b55e du 25/03).
2. Mettre à jour `memory/changelog.md` : ajouter une entrée 2026-03-22 à 2026-03-26 couvrant les 5 commits (photo Thierry x2, Cognisphère citation, Sacha personnage, page pitch/bienvenue/Schema.org, corrections RGPD).
3. Mettre à jour `.agent/memory/shared-context.md` : corriger le compteur (26 actives → 25), ajouter les décisions récentes (Sacha ajouté, /pitch livré, /bienvenue livré, Schema.org TVSeries, corrections RGPD sec:).
Loi de correction du jour : Les 3 fichiers mémoire (shared-context, changelog, backlog) sont un triplet atomique — on ne met pas à jour l'un sans les autres.
NE MODIFIE AUCUN CODE SOURCE — documentation uniquement.
```

**LOT-02 : Endpoint RGPD exercice des droits**
```
Lis .agent/agents/backend.md et .agent/skills/code-review/SKILL.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : STANDARD.
Mission : Créer l'endpoint exercice des droits RGPD (T-020 du backlog).
Fichiers cibles :
- Créer `backend/routes/gdpr.py` avec 3 endpoints :
  - GET /api/gdpr/my-data — exporte toutes les données de l'utilisateur connecté (user, candidatures, messages) en JSON
  - POST /api/gdpr/rectify — permet de modifier email/display_name
  - DELETE /api/gdpr/delete — suppression du compte avec anonymisation (remplacer email par anonymized-{id}@deleted, vider display_name, conserver les données agrégées)
- Modifier `backend/server.py` pour inclure le nouveau router
- Créer `backend/tests/routes/test_gdpr.py` avec tests de sécurité : un user ne peut accéder qu'à SES données, la suppression anonymise correctement, rate limiting sur DELETE
- Auth : cookie httpOnly uniquement (JAMAIS de JWT en localStorage)
- Modèle User existant dans `backend/models.py` (499 lignes)
- Collections MongoDB à interroger : users, candidatures, contact_messages
Loi de correction du jour : Les 3 fichiers mémoire sont un triplet atomique — mettre à jour après implémentation.
Après implémentation, exécute dans l'ordre :
cd frontend && npx eslint .
cd frontend && npx vitest run
cd backend && python -m pytest -p no:recording -q
cd frontend && npm run build
Mets à jour .agent/memory/shared-context.md (Décisions Récentes + Historique des Niveaux).
```

**LOT-03 : Blog/Actualités — page + premier article**
```
Lis .agent/agents/frontend.md et .agent/skills/react-typescript/SKILL.md et .agent/skills/css-design-system/SKILL.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : STANDARD.
Mission : Créer la section blog du site (T-023 du backlog).
Fichiers cibles :
- Créer `frontend/src/pages/Blog.tsx` : page listant les articles avec cards (image, date, titre, extrait). Premier article en dur : "Making-of du prologue : comment l'IA donne vie à ECHO" (comment les images ont été générées, pourquoi les voix sont authentiques).
- Modifier `frontend/src/App.tsx` : ajouter route `/blog` (lazy-loaded)
- Modifier `frontend/src/components/layout/Header.tsx` : ajouter lien "Blog" dans la navigation
- Design system ECHO : utiliser les variables `--color-forest-*`, `--color-sand-*`, effets `.glass-card`, `.nature-shadow`
- Ajouter composant SEO avec balises OG pour la page blog
- Les articles sont statiques (pas de CMS, pas de backend) — tableau d'objets dans le fichier
Loi de correction du jour : Les 3 fichiers mémoire sont un triplet atomique — mettre à jour après implémentation.
Après implémentation, exécute dans l'ordre :
cd frontend && npx eslint .
cd frontend && npx vitest run
cd backend && python -m pytest -p no:recording -q
cd frontend && npm run build
Mets à jour .agent/memory/shared-context.md (Décisions Récentes + Historique des Niveaux).
```

**LOT-04 : Tunnel conversion post-vidéo**
```
Lis .agent/agents/frontend.md et .agent/agents/designer.md et .agent/skills/component-generator/SKILL.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : STANDARD.
Mission : Créer un tunnel de conversion après la vidéo (T-024 du backlog).
Fichiers cibles :
- Créer `frontend/src/components/ui/ConversionCTA.tsx` : composant CTA affiché après le player YouTube, avec 3-4 choix de rôle (bénévole, technicien, stagiaire, scénariste) + bouton inscription. Couleur accent (`--color-echo-accent`), animation `organic-transition`.
- Modifier `frontend/src/pages/Serie.tsx` (987 lignes) : intégrer le ConversionCTA après la section vidéo prologue
- Le CTA ne s'affiche que si l'utilisateur n'est PAS connecté (useAuthStore)
- Chaque bouton de rôle redirige vers `/register?role=benevole` (ou technicien, etc.)
- Tracking analytics : `trackEvent('conversion_cta_click', role)`
Loi de correction du jour : Les 3 fichiers mémoire sont un triplet atomique — mettre à jour après implémentation.
Après implémentation, exécute dans l'ordre :
cd frontend && npx eslint .
cd frontend && npx vitest run
cd backend && python -m pytest -p no:recording -q
cd frontend && npm run build
Mets à jour .agent/memory/shared-context.md (Décisions Récentes + Historique des Niveaux).
```

**LOT-05 : Script backup MongoDB Atlas**
```
Lis .agent/agents/backend.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : HOTFIX.
Mission : Créer un script de backup MongoDB (T-018 du backlog).
Fichiers cibles :
- Créer `backend/scripts/backup_mongo.py` : script Python qui utilise pymongo pour exporter les collections critiques (users, candidatures, partners, contact_messages, episodes, newsletters) en JSON horodaté dans un dossier `backups/YYYY-MM-DD/`.
- Utiliser la variable MONGODB_URL de `backend/core/config.py`
- Ajouter `backups/` au `.gitignore`
- Le script doit être exécutable en standalone : `python backend/scripts/backup_mongo.py`
- Documenter l'usage dans un commentaire en tête de fichier
Loi de correction du jour : Les 3 fichiers mémoire sont un triplet atomique — mettre à jour après implémentation.
Mets à jour .agent/memory/shared-context.md (Décisions Récentes + Historique des Niveaux).
```

**LOT-06 : Lazy-load Leaflet (MyPartnerAccount)**
```
Lis .agent/agents/frontend.md et .agent/skills/react-typescript/SKILL.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : HOTFIX.
Mission : Réduire le chunk MyPartnerAccount de 376 KB en lazy-loadant la carte Leaflet.
Fichiers cibles :
- `frontend/src/pages/MyPartnerAccount.tsx` (605 lignes) : identifier l'import Leaflet/react-leaflet et le remplacer par un `React.lazy()` + `Suspense` avec un placeholder. La carte ne doit se charger que quand la section est visible (IntersectionObserver ou simple lazy import).
- Vérifier que le chunk Leaflet (`vendor-leaflet-*.js`, 154 KB) est séparé et ne se charge qu'à la demande.
Loi de correction du jour : Les 3 fichiers mémoire sont un triplet atomique — mettre à jour après implémentation.
Après implémentation, exécute dans l'ordre :
cd frontend && npx eslint .
cd frontend && npx vitest run
cd frontend && npm run build
Vérifier que le chunk MyPartnerAccount a diminué significativement.
Mets à jour .agent/memory/shared-context.md (Décisions Récentes + Historique des Niveaux).
```

**LOT-07 : Tests pages Pitch + Welcome**
```
Lis .agent/agents/qa-tester.md et .agent/skills/code-review/SKILL.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : HOTFIX.
Mission : Ajouter des tests pour les nouvelles pages Pitch et Welcome.
Fichiers cibles :
- Créer `frontend/src/pages/Pitch.test.tsx` : tester le rendu (titre, sections clés, bouton CTA partenaire), vérifier que la page est standalone (pas de Layout/header).
- Créer `frontend/src/pages/Welcome.test.tsx` : tester le rendu post-inscription (message de bienvenue, liens de navigation).
- S'inspirer du pattern des tests existants : `Serie.test.tsx` (7 tests), `Cognisphere.test.tsx` (3 tests), `Support.test.tsx` (3 tests).
- Minimum 3 tests par page.
Loi de correction du jour : Les 3 fichiers mémoire sont un triplet atomique — mettre à jour après implémentation.
Après implémentation, exécute :
cd frontend && npx vitest run
Mets à jour .agent/memory/shared-context.md (Décisions Récentes + Historique des Niveaux).
```

**LOT-08 : Hero image locale (remplacer Unsplash CDN)**
```
Lis .agent/agents/frontend.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : HOTFIX.
Mission : Remplacer l'image Unsplash CDN du hero Home par un asset local.
Fichiers cibles :
- `frontend/src/pages/Home.tsx:37` : remplacer `bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?...')]` par un asset local
- Télécharger l'image dans `frontend/public/images/` (ou utiliser une image existante du projet si appropriée)
- Optimiser l'image (WebP, max 200KB) pour ne pas dégrader le LCP
Loi de correction du jour : Les 3 fichiers mémoire sont un triplet atomique — mettre à jour après implémentation.
Après implémentation, exécute dans l'ordre :
cd frontend && npx eslint .
cd frontend && npx vitest run
cd frontend && npm run build
Mets à jour .agent/memory/shared-context.md (Décisions Récentes + Historique des Niveaux).
```

**LOT-09 : Registre des traitements RGPD**
```
Lis .agent/agents/documentation.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : STANDARD.
Mission : Créer le registre des traitements RGPD (T-019 du backlog, article 30).
Fichiers cibles :
- Créer `docs/rgpd-registre-traitements.md` avec le format standard CNIL :
  - Pour chaque traitement : finalité, base légale, catégories de données, destinataires, durée de conservation, mesures de sécurité
- Traitements à documenter (lire le code source pour être exact) :
  - Inscription utilisateur (`backend/routes/auth.py`) : email, display_name, password hash, role
  - Candidatures (`backend/routes/candidatures.py`) : données candidat
  - Contact (`backend/routes/contact.py`) : messages, TTL configuré
  - Newsletter (`backend/routes/newsletter.py`) : email, consentement
  - Partenaires (`backend/routes/partners.py`) : données organisation
  - Analytics (`backend/routes/analytics.py`) : events tracking
  - Onboarding (`backend/routes/onboarding.py`) : step, next_at
- Référencer l'audit RGPD du 15/03 (`memory/project_rgpd_audit.md`) et les corrections du 25/03 (commit 2257dcf)
NE MODIFIE AUCUN CODE SOURCE — documentation uniquement.
Mets à jour .agent/memory/shared-context.md (Décisions Récentes + Historique des Niveaux).
```

**LOT-10 : Fix indentation App.tsx + lint cleanup**
```
Lis .agent/agents/code-reviewer.md.
Vérifie les locks dans .agent/memory/shared-context.md.
Niveau : HOTFIX.
Mission : Corriger l'indentation inconsistante dans App.tsx et nettoyer les warnings lint.
Fichiers cibles :
- `frontend/src/App.tsx:110` : corriger l'indentation de la route AdminNewsletter (espaces supplémentaires)
- Évaluer si les 2 warnings React Hook Form dans `RegisterForm.tsx` et `ResetPasswordForm.tsx` peuvent être supprimés avec un commentaire eslint-disable ciblé (pas de suppression globale)
Loi de correction du jour : Les 3 fichiers mémoire sont un triplet atomique — mettre à jour après implémentation.
Après implémentation, exécute :
cd frontend && npx eslint .
cd frontend && npm run build
```

---

## 6. Mise à jour shared-context.md
*(Bloc à appendre dans `.agent/memory/shared-context.md` après exécution du plan)*

```yaml
derniere_mise_a_jour: 2026-03-26
phase_actuelle: 🚀 LANCÉ — Consolidation post-lancement semaine 1
decisions_recentes:
  - date: 2026-03-26
    decision: "Loi de correction : shared-context + changelog + backlog = triplet atomique, toujours mis à jour ensemble"
    agent: Architect
  - date: 2026-03-26
    decision: "Conseil nocturne — 10 lots planifiés : RGPD endpoints + blog + tunnel conversion + backup MongoDB + lazy Leaflet + tests + hero local + registre RGPD + lint fix + resync mémoire"
    agent: Architect
historique_niveaux:
  - date: 2026-03-26
    lots_planifies: 10
    lots_hotfix: 6
    lots_standard: 4
    lots_majeur: 0
locks_actifs: []
```
