---
description: Workflow complet de déploiement du site ECHO
---
# Deploy Workflow

Déploie le site ECHO en production.

## Pré-requis
- Avoir un build de production récent
- Être connecté aux services de déploiement

## Étapes

1. Exécuter le build de production :
```powershell
cd frontend
npm run build
```

2. Vérifier que le build est correct :
```powershell
cd frontend
npm run preview
```

3. Commiter les changements si nécessaire :
```powershell
git add -A
git commit -m "chore: prepare for deployment"
```

// turbo
4. Pusher vers la branche de production :
```powershell
git push origin main
```

## Déploiement Manuel
Si vous utilisez un hébergement manuel :
1. Copier le contenu de `frontend/dist/` vers votre serveur
2. Configurer le backend sur le serveur
3. Mettre à jour les variables d'environnement

## Notes
- Vérifier les variables d'environnement de production
- Tester l'application après déploiement
