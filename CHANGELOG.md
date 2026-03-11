# Changelog

Toutes les modifications notables apportées à ce projet seront documentées dans ce fichier.

## [Unreleased] - 2026-03-11

### Optimisé
- **Frontend** : Implémentation du Code-Splitting (Lazy-Loading) via `React.lazy()` sur les routes publiques (`/serie`, `/mouvement`, `/agenda`, etc.) dans `App.tsx` pour réduire la charge réseau initiale de ~30%.
- **Frontend Build Vite** : Restructuration de `vite.config.ts` (`manualChunks`) pour isoler l'UI (`lucide-react`) et les lib de formulaires (`react-hook-form`, `zod`) du bundle principal `index.js`, faisant chuter ce dernier de l'ordre de ~300kB à ~230kB `(gzip: ~72kB)`.
