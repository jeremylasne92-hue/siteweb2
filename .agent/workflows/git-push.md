---
description: Git add, commit et push rapide avec message personnalisé
---
# Git Push Workflow

Workflow rapide pour commiter et pusher les changements.

## Étapes

// turbo
1. Ajouter tous les fichiers modifiés :
```powershell
git add -A
```

2. Créer un commit avec le message fourni :
```powershell
git commit -m "[VOTRE_MESSAGE]"
```

// turbo
3. Pusher vers le remote :
```powershell
git push
```

## Usage
Invoquer avec `/git-push` et fournir le message de commit souhaité.

## Notes
- Si le push échoue, vérifier que vous êtes sur la bonne branche
- Utiliser des messages de commit descriptifs suivant les conventions (feat:, fix:, docs:, etc.)
