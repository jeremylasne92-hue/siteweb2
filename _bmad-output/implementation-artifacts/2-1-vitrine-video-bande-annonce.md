# Story 2.1: Vitrine Vidéo & Bande-Annonce

Status: done

## Story

As a Visiteur,
I want pouvoir visionner la bande-annonce de la série et voir la liste des futurs épisodes,
So that comprendre le projet ECHO sans avoir à m'inscrire immédiatement.

## Acceptance Criteria

1. **Given** Je suis sur la page 'La Série' **When** Je clique sur le lecteur vidéo public **Then** La bande-annonce se lance via un lecteur externe (YouTube/Vimeo).
2. **Given** Je suis sur la page 'La Série' **Then** Je vois des cartes "Bientôt disponible" pour les épisodes de la saison 1 (non cliquables pour lecture).

## Tasks / Subtasks

### Frontend

- [x] Task 1: Badge "Bientôt disponible" sur les cartes épisodes S1 (AC: #2, FR7)
  - [x] 1.1: Ajout d'un badge en bas à gauche de chaque carte épisode S1
  - [x] 1.2: Style doré discret cohérent avec le thème existant

### Déjà implémenté (pré-existant)

- [x] Lecteur vidéo YouTube intégré dans la section Prologue (AC: #1, FR6)
- [x] Cartes épisodes S1 avec modale des thèmes (non cliquables pour lecture)
- [x] Placeholders Saison 2 et 3

## Dev Notes

### Analyse

La page `/serie` (Serie.tsx) contenait déjà 95% du contenu requis par cette story :
- Section Prologue avec iframe YouTube (`5NvxbMIbjAo`)
- 11 cartes épisodes S1 avec modale thèmes
- Tabs S1/S2/S3 avec placeholders

Le seul ajout nécessaire était le badge "Bientôt disponible" (FR7) sur chaque carte épisode S1.

### Conventions

- Badge position: `absolute bottom-3 left-3` (symétrique au "Voir les thèmes →" en bottom-right)
- Couleur: doré subtil (`text-[#D4AF37]/70`, `bg-[#D4AF37]/5`, `border-[#D4AF37]/20`)

## Dev Agent Record

### Agent Model Used

- **All tasks**: Claude Code (Opus 4.6)

### Debug Log References

- Frontend build: OK
- HMR update: Serie.tsx pris en compte
- Badge visible sur les 11 cartes épisodes S1
- Saisons 2/3 non affectées

### Completion Notes List

- Badge "Bientôt disponible" ajouté en bas à gauche de chaque carte épisode S1
- Style discret doré, cohérent avec le "Voir les thèmes →" existant
- Aucun changement backend requis
- FR6 (lecteur vidéo) et FR7 (étiquette épisodes) satisfaits

### File List

| File | Action | Description |
|------|--------|-------------|
| `frontend/src/pages/Serie.tsx` | Modified | Ajout badge "Bientôt disponible" sur cartes S1 |
