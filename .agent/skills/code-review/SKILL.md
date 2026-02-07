---
name: Code Review
description: Revue de code automatisée avec détection de problèmes et suggestions
---

# Code Review

Ce skill effectue des revues de code automatisées pour améliorer la qualité du code.

## Quand utiliser ce skill

- Avant un commit important
- Lors de la révision de pull requests
- Pour améliorer du code existant
- Détection de code dupliqué

## Checklist de Revue

### 1. Qualité du Code
- [ ] Pas de code dupliqué
- [ ] Fonctions courtes (< 50 lignes)
- [ ] Noms de variables explicites
- [ ] Commentaires pertinents

### 2. TypeScript
- [ ] Pas d'utilisation de `any`
- [ ] Interfaces bien définies
- [ ] Types exportés si réutilisés
- [ ] Gestion des `null`/`undefined`

### 3. React
- [ ] Composants avec une seule responsabilité
- [ ] Props typées
- [ ] Hooks utilisés correctement
- [ ] Éviter les re-renders inutiles

### 4. CSS/Styles
- [ ] Utilisation des variables CSS
- [ ] Styles responsifs
- [ ] Conventions de nommage cohérentes
- [ ] Pas de styles inline

### 5. Performance
- [ ] Lazy loading pour les grosses dépendances
- [ ] Images optimisées
- [ ] Pas de boucles infinies dans useEffect
- [ ] Memoization appropriée

### 6. Sécurité
- [ ] Pas de données sensibles en dur
- [ ] Validation des entrées utilisateur
- [ ] Échappement XSS
- [ ] HTTPS pour les requêtes externes

## Format de Rapport

```markdown
## Rapport de Revue de Code

### ✅ Points Positifs
- ...

### ⚠️ Suggestions d'Amélioration
- ...

### ❌ Problèmes à Corriger
- ...

### 📊 Score Global: X/10
```

## Instructions

Pour demander une revue :
- "Fais une revue du fichier Header.tsx"
- "Analyse la qualité du code dans pages/"
- "Vérifie les bonnes pratiques dans ce composant"
