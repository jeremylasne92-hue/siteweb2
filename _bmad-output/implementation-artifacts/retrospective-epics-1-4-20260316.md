# Rétrospective ECHO — Epics 1 à 4
**Date :** 16 mars 2026
**Phase :** Post-Epics — Pré-lancement (lancement 20 mars 2026)
**Rédigée par :** Agent Rétrospective BMAD
**Statut projet :** Opérationnel — 4/4 Epics complétés

---

## Table des matières

1. [Ce qui a bien marché](#1-ce-qui-a-bien-marché)
2. [Ce qui pourrait être amélioré](#2-ce-qui-pourrait-être-amélioré)
3. [Métriques](#3-métriques)
4. [Leçons apprises par Epic](#4-leçons-apprises-par-epic)
5. [Recommandations post-lancement](#5-recommandations-post-lancement)

---

## 1. Ce qui a bien marché

### 1.1 Méthodologie multi-agents (Claude Code + Antigravity)

La collaboration en parallèle entre Claude Code (Opus 4.6) et Antigravity (Gemini) s'est révélée efficace sur la durée des Epics. Les deux agents ont co-construit la plateforme sans conflit de merge significatif grâce à la discipline du fichier `shared-context.md` comme source de vérité partagée.

**Points forts observés :**
- La séparation naturelle des responsabilités a émergé organiquement : Antigravity s'est concentré sur les propositions UX/onboarding et la documentation exhaustive, Claude Code sur la sécurité, les tests et les corrections critiques.
- La règle "dernier commit testé et buildé gagne" a évité les conflits d'arbitrage sans nécessiter de réunions de synchronisation.
- Le scan documentaire exhaustif exécuté par Antigravity (11 mars, `/document-project`) a constitué une base de référence solide qui a accéléré les décisions d'architecture post-Epic 2.

### 1.2 Niveaux de workflow BMAD (HOTFIX / STANDARD / MAJEUR)

Le système à 3 niveaux a permis une calibration efficace de l'effort investi par rapport à la complexité réelle des tâches.

- Les **HOTFIX** (10–40 min) ont traité rapidement les corrections isolées sans surcharger le processus : fix logo, remplacement images Unsplash, badges, proxy Vite.
- Les **STANDARD** (20 min–1h30) ont couvert la grande majorité des stories des 4 Epics, avec un ratio effort/valeur optimal.
- Les **MAJEUR** (25 min–2h) ont été employés à bon escient pour les chantiers transversaux : RGPD compliance, système KPI BI Analytics, Dashboard partenaire (Recharts), audit RGPD v2.

Le fait que même des MAJEUR aient été complétés en 25–30 minutes (KPI BI, audit RGPD v2) démontre la maturité acquise au fil des Epics dans la décomposition des tâches complexes.

### 1.3 Exécution parallèle des agents

La technique "Subagent-Driven Development" (SDD) introduite pour les tâches MAJEUR a démontré une efficacité remarquable :
- Le système KPI BI Analytics (14 KPIs, 7 tâches parallèles, 15 fichiers, 128 tests backend) a été livré en ~25 min.
- L'audit RGPD (14 écarts, 7 groupes parallèles, 25 fichiers) a été résolu en ~30 min.

Cette approche a permis de traiter des chantiers qui auraient normalement requis plusieurs heures en séquentiel.

### 1.4 Processus de code review

La code review finale à 5 agents parallèles (16 mars 2026) a prouvé sa valeur en identifiant 3 issues critiques qui auraient pu compromettre l'expérience utilisateur au lancement :
- La whitelist TLD sur `isValidEmail` bloquait silencieusement des TLD légitimes (.ai, .re, .bzh, .eco).
- `CityAutocomplete` bloquait la soumission du formulaire en cas d'échec de l'API Nominatim.
- Le honeypot du formulaire Contact avait un attribut `tabIndex` mal placé (dans `style` au lieu d'une prop JSX).

L'intégration d'une étape de code review multi-agents en fin de cycle est une pratique à maintenir systématiquement.

### 1.5 Couverture RGPD proactive

L'audit RGPD complet réalisé le 15 mars 2026 a identifié et corrigé 14 écarts réglementaires avant le lancement, incluant des points critiques (façade YouTube, reCAPTCHA notice, CGU checkbox). Cette démarche proactive protège l'association dès le premier jour de publication.

---

## 2. Ce qui pourrait être amélioré

### 2.1 Bugs et régressions détectés tardivement

Plusieurs issues ont été introduites durant le sprint intensif pré-lancement et corrigées seulement lors de la code review finale :

| Issue | Epic d'origine | Détecté le | Délai de correction |
|-------|---------------|------------|---------------------|
| TLD whitelist bloquante dans `isValidEmail` | Epic 1 (auth) | 16 mars | Même jour |
| `CityAutocomplete` bloquait si Nominatim échoue | Epic 3 (partenaires) | 16 mars | Même jour |
| Honeypot Contact.tsx (tabIndex mal positionné) | Epic 2 (contact) | 16 mars | Même jour |
| Breadcrumbs supprimés accidentellement | Post-Epic 4 | 16 mars | Backlog — à restaurer |
| Partner model Pydantic crash (champs requis vs null DB) | Epic 3 | 15 mars | Même jour (HOTFIX) |
| Marqueurs superposés carte membres (même ville) | Post-Epic 4 | 15 mars | Même jour (HOTFIX) |

**Recommandation :** Intégrer une étape de smoke test systématique sur les formulaires critiques (inscription, candidature, contact) à chaque fin de sprint plutôt qu'en code review finale.

### 2.2 Lacunes de documentation

- Les **breadcrumbs** ont été supprimés sans être consignés comme dette technique immédiatement — ils ont atterri en backlog sans lien vers le commit responsable.
- Le fichier `source-tree.md` a été mis à jour seulement lors de la code review finale (16 mars), alors que l'architecture avait évolué depuis le 11 mars.
- Les **contrats API** (`docs/api-contracts.md`) n'ont pas été tenus à jour en temps réel lors des ajouts d'endpoints post-Epic 2 (membres, analytics, RGPD endpoints). Les 30 endpoints documentés ne reflètent pas les ~50+ endpoints réels.
- La documentation des **modèles de données** (`docs/data-models.md`) aurait dû être mise à jour à chaque ajout de collection MongoDB (member_profiles, contact_messages, admin_audit_log prévu).

### 2.3 Couverture de tests

La couverture de tests a progressé tout au long du projet (6 tests initiaux → 128 tests backend), mais des gaps subsistent :

- **Frontend :** Tests Vitest essentiellement absents pour les composants critiques (PartnerFormModal, AdminPartners, AdminMembers, AuthFlow). Les 18 tests frontend couvrent principalement la validation de formulaires.
- **Tests d'intégration :** Aucun test end-to-end (Playwright/Cypress) n'a été mis en place. Les flux critiques (inscription → connexion → candidature → modération admin) ne sont pas couverts automatiquement.
- **Tests de régression :** L'issue `CityAutocomplete` aurait pu être détectée par un test unitaire simulant une API Nominatim en erreur.
- **Coverage backend :** Routes membres (`routes/members.py`) et analytics (`routes/analytics.py`) ont une couverture correcte (21 + 5 tests), mais les routes RGPD (my-data export/delete) n'ont pas de tests dédiés.

### 2.4 Gestion des dépendances front-end

- `react-helmet-async` a été introduit pour le SEO OpenGraph mais n'était pas dans les dépendances initiales du PRD — aucune friction, mais le bundle a augmenté sans contrôle préalable.
- Recharts (Dashboard partenaire) représente une dépendance lourde pour un composant unique. Une alternative plus légère (Chart.js ou graphiques CSS natifs) aurait pu réduire le bundle.
- Le bundle initial est à ~230 kB gzip (~72 kB) — dans la cible NFR-Perf-3 (< 300 kB), mais sans marge confortable pour les futures features.

### 2.5 Coordination inter-agents sur les données partagées

Deux cas de `shared-context.md` légèrement désynchronisé ont été observés :
- Le port backend était noté "Flask" au lieu de "FastAPI" au début du projet (corrigé le 5 mars).
- Certaines décisions Antigravity du 11–12 mars ont été enregistrées dans shared-context avec moins de détail que les décisions Claude Code, rendant la traçabilité asymétrique.

---

## 3. Métriques

### 3.1 Stories complétées

| Epic | Stories planifiées | Stories livrées | Taux |
|------|-------------------|-----------------|------|
| Epic 1 — Identité & Sécurité | 4 | 4 | 100% |
| Epic 2 — Contenu & Engagement | 4 | 4 | 100% |
| Epic 3 — Partenaires & ECHOSystem | 5 | 5 | 100% |
| Epic 4 — Back-Office Administration | 4 | 4 | 100% |
| **Total** | **17** | **17** | **100%** |

En ajoutant les features post-Epics (hors stories planifiées) :
- RGPD compliance complète (14 écarts)
- Système KPI BI Analytics (14 KPIs)
- Profils membres (collection + 10 endpoints + frontend)
- Notifications candidatures (4 emails transactionnels)
- Refonte événements (upload images, drag & drop, réservation)
- Candidatures scénaristes
- Dashboard partenaire avec analytics Recharts
- Landing page dynamique (compteurs communautaires)
- SEO OpenGraph (React Helmet Async)
- Micro-analytique RGPD (sendBeacon)
- Onboarding gamification (formulaires multi-étapes)
- Code Splitting + optimisation bundle
- Admin Console improvements (audit trail partiel, filtres, notes)
- Responsive mobile (26 fichiers, 375px+)
- Pages légales RGPD (3 pages + RoPA + procédure violation)

**Estimation :** ~35 features/stories livrées au total (17 planifiées + ~18 post-Epics).

### 3.2 Durées moyennes par niveau

Basé sur les 32 entrées mesurées dans l'Historique des Niveaux :

| Niveau | Nb tâches | Durée min | Durée max | Durée moyenne estimée |
|--------|-----------|-----------|-----------|----------------------|
| HOTFIX | 12 | 5 min | 40 min | ~17 min |
| STANDARD | 16 | 10 min | 1h30 | ~37 min |
| MAJEUR | 4 | 25 min | 2h | ~55 min |

**Observation :** Les MAJEUR ont été significativement plus courts que prévu (estimation PRD : 5h pour un module complet). La technique SDD (Subagent-Driven Development) explique principalement cet écart positif.

### 3.3 Agents utilisés

| Agent | Rôle principal | Tâches attribuées |
|-------|---------------|-------------------|
| Claude Code (Opus 4.6) | Sécurité, tests, corrections, backend | ~24 tâches |
| Antigravity (Gemini) | UX, documentation, onboarding, analytics | ~8 tâches |
| **Total** | **2 agents actifs** | **~32 tâches** |

Agents définis dans `.agent/agents/` mais non mobilisés en tant qu'agents indépendants durant les Epics : architect, designer, qa-tester, code-reviewer, documentation (utilisés comme rôles/personas intégrés aux tâches Claude Code).

### 3.4 Fichiers modifiés

Estimation basée sur les entrées shared-context :

| Epic / Chantier | Fichiers estimés |
|----------------|-----------------|
| Epic 1 (auth, register, reset) | ~15 |
| Epic 2 (vitrine, opt-in, candidatures, dons) | ~20 |
| Epic 3 (partenaires, carte, RDV, analytics) | ~25 |
| Epic 4 (admin, events, exports) | ~20 |
| RGPD compliance v1 | ~30 |
| RGPD audit v2 (15 mars) | ~25 |
| KPI BI Analytics | ~15 |
| Profils membres | ~20 |
| Refonte pages (Mouvement, CogniSphère, ECHOLink) | ~15 |
| Code review finale + validation formulaires | ~21 |
| Divers (logo, images, hotfixes) | ~20 |
| **Total estimé** | **~226 fichiers** |

Note : Avec overlaps entre chantiers, le nombre de fichiers uniques modifiés est estimé à **~130–150 fichiers distincts** sur l'ensemble du projet.

### 3.5 Couverture de tests backend

| Date | Nb tests backend |
|------|-----------------|
| 5 mars (Epic 1) | 6 |
| 6 mars (Epic 2–3) | ~20 |
| 7 mars (Epic 4 + sécurité) | ~51 |
| 13 mars (candidatures + contact) | 71 |
| 14 mars (membres + notifications + événements) | 81 → ~102 |
| 15 mars (RGPD + KPI BI) | ~128 |
| 16 mars (validation formulaires) | 128 + 18 = 146 |

**Croissance :** 6 → 146 tests backend (facteur x24 sur la durée du projet).

---

## 4. Leçons apprises par Epic

### Epic 1 — Identité & Sécurité

**Ce qui a bien marché :**
- Le choix cookie-only httpOnly (jamais localStorage) pour l'auth a été posé dès le départ et tenu rigoureusement. Zéro exception observée.
- La collaboration backend (Antigravity) + frontend (Claude Code) sur Story 1.2 a démontré qu'une story peut être split entre agents sans perte de cohérence.
- Le CSPRNG (`secrets.choice`) pour la 2FA et `secrets.token_urlsafe(32)` pour les tokens de reset ont été appliqués correctement dès la première implémentation.

**Ce qui aurait pu être mieux :**
- La validation email (`isValidEmail`) a introduit une whitelist TLD trop restrictive qui a duré jusqu'au 16 mars — soit 11 jours en production potentielle. Un test unitaire couvrant les TLD non-classiques (.ai, .re, .eco, .bzh) aurait détecté le problème immédiatement.
- La story 1.4 (isolation vues privées) reposait sur ProtectedRoute, qui avait un bug d'accès refusé incorrect corrigé plus tard (6 mars). Les critères d'acceptation auraient dû inclure un scénario de test explicite pour le rôle admin.

**Leçon principale :** Pour toute logique de validation/filtrage, écrire des tests aux limites (edge cases) dès la première implémentation.

### Epic 2 — Contenu & Engagement Visiteur

**Ce qui a bien marché :**
- L'anti-spam multi-couches (honeypot + rate limit + reCAPTCHA v3) sur les formulaires candidatures a été implémenté en une seule story (2.3), créant un composant réutilisable bénéficiant à tous les formulaires ultérieurs.
- La story 2.1 (badge "Bientôt disponible") a été correctement classée HOTFIX (5 min) — évite le sur-engineering sur une feature simple.
- Les candidatures scénaristes (ajout post-Epic 2) ont réutilisé exactement la même architecture que les candidatures tech, validant la décision d'architecture modulaire dès Epic 2.

**Ce qui aurait pu être mieux :**
- Le formulaire Contact backend (13 mars) aurait dû être inclus dans Epic 2 plutôt qu'en feature post-epic — il couvre le cas d'usage "engagement visiteur" et était implicitement attendu par FR18.
- L'opt-in notifications (Story 2.2) a créé une collection dédiée mais les notifications push/email de sortie d'épisodes ne seront actives qu'en septembre 2026 — la feature génère des données sans usage immédiat. Une note explicite dans le backlog post-lancement aurait été utile.

**Leçon principale :** Définir dès le départ la distinction entre "feature de collecte" et "feature d'activation" — les données collectées maintenant doivent avoir une roadmap claire d'utilisation.

### Epic 3 — Partenaires & ECHOSystem

**Ce qui a bien marché :**
- La validation MIME via Pillow (backend) pour les uploads logo a été implémentée correctement dès story 3.1, conformément à NFR-Sec-3.
- Stories 3.2 et 3.3 marquées "done" sans implémentation supplémentaire car déjà couvertes — preuve que l'architecture existante était suffisamment robuste.
- Le dashboard partenaire (Recharts, 3 métriques, 30 jours) livré par Antigravity sur un workflow MAJEUR en 1h30 a fourni une valeur réelle aux partenaires dès le lancement.

**Ce qui aurait pu être mieux :**
- Le modèle `Partner` avait des champs `str` requis pour address/city/latitude/longitude alors que la base de données pouvait contenir des `null` (partenaires créés avant ces champs). Ce désalignement Pydantic/MongoDB a causé des crashs 500 silencieux pendant plusieurs jours avant d'être détecté (15 mars). Un test de régression avec des données partielles aurait exposé l'issue plus tôt.
- L'autocomplétion adresse (`CityAutocomplete`) n'a pas été testée en conditions d'échec réseau lors de l'implémentation initiale — le bug setCustomValidity bloquant a été découvert en code review finale.
- Le tracking analytics partenaire (partner_id sur AnalyticsEvent) a été ajouté comme champ dans le modèle de manière rétrospective — aurait dû être anticipé dans la spec Epic 3.

**Leçon principale :** Les intégrations tierces (Nominatim, Google Calendar) doivent systématiquement avoir un chemin de dégradation gracieuse testé dès l'implémentation.

### Epic 4 — Back-Office Administration

**Ce qui a bien marché :**
- La story 4.4 (export CSV opt-in) a bénéficié d'une code review interne immédiate qui a corrigé 5 problèmes de qualité (BOM UTF-8, `to_list(None)`, format date ISO, lien retour, test orphelin) avant merge — modèle de qualité à répliquer.
- La refonte événements (post-Epic 4, 14 mars) a significativement enrichi la story 4.3 au-delà du scope initial : drag & drop images, toggle réservation, séparation past/upcoming, organizer personnalisable. Valeur ajoutée importante pour une UX admin professionnelle.
- La page AdminExports avec 3 cartes d'export distinctes (users, partenaires, opt-in) est une UX claire et extensible.

**Ce qui aurait pu être mieux :**
- Les stories 4.1 et 4.2 ont été traitées en une seule session le 6 mars car 4.2 était "déjà implémentée" — indice que le scope d'Epic 4 avait été implicitement absorbé dans Epic 3, créant une dette de documentation. La scoping phase aurait dû l'identifier plus tôt.
- L'audit log structuré (collection `admin_audit_log` pour tracer les actions admin) est resté en backlog post-lancement alors qu'il est requis pour la conformité RGPD (accountability). Il aurait dû être inclus dans Epic 4 ou Epic 1 (sécurité).
- Pagination serveur : tous les tableaux admin utilisent `limit=500` hardcodé. Avec une croissance de la base de données, c'est un risque de performance identifié dès maintenant.

**Leçon principale :** Les features d'administration doivent inclure dès leur spec les exigences de scalabilité (pagination, audit log) — elles sont plus difficiles à ajouter rétrospectivement.

---

## 5. Recommandations post-lancement

Les priorités suivantes sont issues de l'analyse du backlog et des leçons apprises. Elles sont classées par impact/urgence pour les premières semaines après le lancement du 20 mars 2026.

### Priorité 1 — Nettoyage données de test avant publication (avant le 20 mars)

**Tâche backlog #23**
Supprimer tous les comptes partenaires, événements, candidatures, bénévoles et profils membres créés lors des développements et tests. Une plateforme lancée avec des données fictibles visibles publiquement nuit immédiatement à la crédibilité.

**Actions :**
- Script de purge MongoDB ciblé par email de test (`@test.`, `@example.`, `@localhost`)
- Vérification manuelle de la carte ECHOSystem (marqueurs partenaires fictifs)
- Reset des compteurs `analytics_events` de test

### Priorité 2 — Configurer SendGrid en production (avant le 20 mars)

**Tâche backlog #14**
Tous les emails transactionnels (inscription, reset password, candidatures × 4, notifications partenaires, contact) sont en mode silencieux tant que `SENDGRID_API_KEY` et `ENVIRONMENT=production` ne sont pas configurés. Le lancement sans emails actifs empêche les parcours de conversion critiques.

**Actions :**
- Configurer les variables d'environnement sur Webstrator
- Envoyer un email de test sur chaque template (6 templates distincts)
- Vérifier le SPF/DKIM du domaine expéditeur

### Priorité 3 — Restaurer les breadcrumbs (première semaine post-lancement)

**Tâche backlog implicite — issue code review 16 mars**
Les breadcrumbs ont été supprimés accidentellement lors de l'audit validation formulaires du 16 mars. Leur absence impacte l'accessibilité (WCAG 2.1, navigation contextuelle) et le SEO (structured data `BreadcrumbList`).

**Actions :**
- Identifier le commit responsable de la suppression
- Restaurer le composant `Breadcrumb` sur les pages profondes (admin, profil partenaire, ressources)
- Ajouter un test de régression sur la présence des breadcrumbs

### Priorité 4 — Audit log admin structuré (première quinzaine post-lancement)

**Tâche backlog post-lancement #24**
Conformité RGPD (accountability, Article 5.2) : toutes les actions admin modifiant des données personnelles doivent être tracées. Collection MongoDB `admin_audit_log` avec champs : `admin_id`, `action`, `target_collection`, `target_id`, `diff`, `timestamp`, `ip`.

**Actions :**
- Créer la collection `admin_audit_log` avec index TTL (2 ans)
- Wrapper les endpoints d'action admin (PATCH statut partenaire, PATCH statut candidature, DELETE) avec un middleware de log
- Page de consultation audit dans AdminPanel (filtrable par admin/action/date)

### Priorité 5 — Bande-annonce + crédits série (avant le 20 mars)

**Tâche backlog #21**
La vidéo prologue doit être remplacée par la bande-annonce définitive (prévue terminée le 18 mars 2026) et les crédits de la série mis à jour. C'est le premier contenu que les visiteurs voient sur la page principale — une bande-annonce provisoire au lancement serait dommageable.

**Actions :**
- Substituer l'URL YouTube/Vimeo dans la config frontend dès livraison de la bande-annonce
- Mettre à jour les crédits (page La Série, sections épisodes)
- Vérifier l'image OpenGraph de la page Série (SEO.tsx) avec la nouvelle vignette

---

## Annexe — État des fichiers clés au 16 mars 2026

| Fichier | Rôle | Statut |
|---------|------|--------|
| `backend/models.py` | Modèles Pydantic core | Stable |
| `backend/models_partner.py` | Modèles partenaires (Optional fix) | Stable |
| `backend/models_member.py` | Modèles membres (ProjectType enrichi) | Stable |
| `backend/routes/auth.py` | Auth OAuth + local | Stable |
| `backend/routes/partners.py` | CRUD partenaires + stats | Stable |
| `backend/routes/members.py` | CRUD membres + seed | Stable |
| `backend/routes/analytics.py` | Events + KPI dashboard | Stable |
| `frontend/src/components/partners/PartnerFormModal.tsx` | Candidature partenaire | Stable |
| `frontend/src/components/partners/PartnersMap.tsx` | Carte ECHOSystem + membres | Stable |
| `frontend/src/utils/validation.ts` (ou équivalent) | isValidEmail, isValidPhone, sanitize | Stable (TLD fix appliqué) |
| `frontend/src/pages/Contact.tsx` | Formulaire contact (honeypot corrigé) | Stable |
| `frontend/src/features/auth/` | RegisterForm, EmailLoginForm | Stable |
| `docs/api-contracts.md` | Contrats API (30 endpoints) | A mettre à jour |
| `docs/data-models.md` | Modèles de données | A mettre à jour |

---

*Rétrospective générée automatiquement à partir de `.agent/memory/shared-context.md` et `_bmad-output/planning-artifacts/epics.md`.*
*Agent : Rétrospective BMAD — Claude Code (claude-sonnet-4-6) — 16 mars 2026*
