# Design : Responsive Mobile — Tout le site

**Date** : 2026-03-13
**Niveau BMAD** : STANDARD
**Scope** : Toutes les pages (publiques + auth + admin)

## Principes

- Mobile-first fixes : corriger ce qui casse, pas de nouvelles features
- Breakpoint test : 375px (iPhone SE), vérifié aussi à 768px (tablette)
- Uniquement classes Tailwind, pas de CSS custom
- Modales : `max-h-[90vh] overflow-y-auto` partout
- Tables admin : `overflow-x-auto` wrapper horizontal scroll
- Approche page-par-page, fixes localisés

## Phase 1 — Bugs critiques

| Bug | Fix |
|-----|-----|
| Cookie banner : boutons invisibles mobile | Boutons en `flex-col sm:flex-row` |
| Nav desktop : hamburger à 1280px | Vérifier/ajuster breakpoint lg |
| CTA Home overlap par cookie banner | Padding bottom hero ou z-index banner |

## Phase 2 — Pages publiques (10 pages)

- **Home** : hero padding, CTA stacking, grids, stats
- **Serie** : épisodes grid 1 col, player responsive
- **Mouvement** : timeline mobile, valeurs grid
- **Contact** : formulaire inputs full-width (probablement OK)
- **Support** : donation tiers stacking, progress bar
- **Events** : cards stacking (filtres scroll déjà OK)
- **FAQ** : accordion responsive (probablement OK)
- **Partners** : grid 1 col, map height réduite, filtres stacking
- **CogniSphère** : sections stacking, images responsive
- **ECHOLink** : idem

## Phase 3 — Auth + Profil

- **Login/Register** : modal centrée, inputs full-width (probablement OK)
- **Profile** : sections stacking, candidatures responsive

## Phase 4 — Admin (5 pages)

- **AdminDashboard** : stats grid 1 col mobile
- **AdminCandidatures** : table scroll-x, modale responsive, batch bar
- **AdminPartners** : table scroll-x, modale responsive
- **AdminEvents** : formulaire stacking, image upload
- **AdminExports** : boutons stacking

## Vérification

1. Preview mobile (375px) pour chaque page
2. `cd frontend && npx eslint .`
3. `cd frontend && npx vitest run`
4. `cd backend && python -m pytest -p no:recording -q`
5. `cd frontend && npm run build`

## Fichiers impactés

~20+ fichiers dans `frontend/src/pages/` et `frontend/src/components/`
