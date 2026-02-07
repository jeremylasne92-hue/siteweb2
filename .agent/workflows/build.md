---
description: Build de production du frontend React/Vite
---
# Build Production

Génère le build de production optimisé du frontend.

## Étapes

// turbo
1. Nettoyer le dossier de build précédent :
```powershell
cd frontend
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
```

// turbo
2. Exécuter le build de production :
```powershell
cd frontend
npm run build
```

3. Vérifier que le build a réussi :
```powershell
cd frontend
Get-ChildItem dist
```

## Résultat
Le build sera disponible dans `frontend/dist/`

## Notes
- Le build utilise Vite pour l'optimisation
- Les assets sont minifiés et compressés
- Vérifier les erreurs TypeScript avant le build
