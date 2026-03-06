# Story 2.4: Passerelle de Soutien et Dons

Status: done

## Story

As a Soutien du mouvement,
I want pouvoir faire un don financier de manière claire et sécurisée,
So that contribuer au financement et à l'indépendance de l'association.

## Acceptance Criteria

1. **Given** Je suis sur la page Mouvement ou je navigue sur le footer **When** Je clique sur le bouton de "Soutien" **Then** Je suis redirigé de manière fluide (href `_blank` ou redirection native).
2. **And** J'arrive sur la page de la campagne de l'association via la plateforme sécurisée certifiée (HelloAsso).

## Tasks / Subtasks

### Frontend

- [x] Task 1: Fichier de configuration `donation.ts` avec URL HelloAsso centralisée
- [x] Task 2: Support.tsx — boutons "Je soutiens" → liens `<a target="_blank">` vers HelloAsso
  - [x] 2.1: Icône ExternalLink sur chaque bouton
  - [x] 2.2: Message "plateforme certifiée" remplace "intégration en cours"
- [x] Task 3: Mouvement.tsx — CTAs connectés (`/soutenir` + `/serie`)

### Tests

- [x] Task 4: 3 tests frontend (liens HelloAsso, attributs sécurité, paliers affichés)

## Dev Notes

### URL de donation

- **Placeholder** : `https://www.helloasso.com/associations/mouvement-echo`
- Centralisé dans `frontend/src/config/donation.ts` — à mettre à jour quand l'URL réelle sera disponible
- Tous les boutons de don pointent vers la même URL

### Sécurité liens externes

- `target="_blank"` + `rel="noopener noreferrer"` sur tous les liens sortants
- Icône `ExternalLink` de lucide-react pour signaler visuellement la redirection

### Conventions

- Pas de backend nécessaire (redirection externe uniquement)
- Footer déjà connecté à `/soutenir` (existant)

## Dev Agent Record

### Agent Model Used

- **All tasks**: Claude Code (Opus 4.6)

### Debug Log References

- Frontend tests: 17/17 passed (vitest) — 5 AuthPrompt + 6 Serie + 3 Cognisphere + 3 Support
- Frontend build: OK (vite build)

### Code Review (0 correctif)

Aucun problème identifié. Code propre et minimal.

### Completion Notes List

- Boutons "Je soutiens" redirigent vers HelloAsso (target="_blank")
- URL centralisée dans config/donation.ts (placeholder)
- Message "intégration en cours" remplacé par "plateforme certifiée"
- CTAs Mouvement connectés (/soutenir + /serie)
- Footer déjà fonctionnel (existant)
- Epic 2 terminé (Stories 2.1–2.4 done)

### File List

| File | Action | Description |
|------|--------|-------------|
| `frontend/src/config/donation.ts` | Created | URL HelloAsso centralisée |
| `frontend/src/pages/Support.tsx` | Modified | Boutons → liens externes HelloAsso |
| `frontend/src/pages/Mouvement.tsx` | Modified | CTAs connectés /soutenir + /serie |
| `frontend/src/pages/Support.test.tsx` | Created | 3 tests frontend |
