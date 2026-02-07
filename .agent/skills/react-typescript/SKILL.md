---
name: React TypeScript Pro
description: Best practices et patterns modernes pour le développement React avec TypeScript
---

# React TypeScript Pro

Ce skill fournit une expertise spécialisée pour le développement React avec TypeScript.

## Quand utiliser ce skill

- Création de nouveaux composants React
- Refactoring de composants existants
- Typage TypeScript avancé
- Patterns hooks personnalisés

## Patterns de Composants

### Composant Fonctionnel Typé
```tsx
import React from 'react';

interface ComponentProps {
  title: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Component: React.FC<ComponentProps> = ({ title, children, onClick }) => {
  return (
    <div className="component" onClick={onClick}>
      <h2>{title}</h2>
      {children}
    </div>
  );
};
```

### Hook Personnalisé
```tsx
import { useState, useCallback } from 'react';

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return { value, toggle, setTrue, setFalse };
}
```

## Structure de Fichiers Recommandée

```
src/
├── components/
│   ├── ui/           # Composants UI réutilisables (Button, Modal, etc.)
│   ├── layout/       # Composants de mise en page (Header, Footer, Layout)
│   └── features/     # Composants spécifiques aux fonctionnalités
├── pages/            # Pages de l'application
├── hooks/            # Hooks personnalisés
├── utils/            # Fonctions utilitaires
├── types/            # Types TypeScript partagés
└── styles/           # Styles globaux et variables CSS
```

## Bonnes Pratiques

1. **Props explicites** : Toujours définir une interface pour les props
2. **Éviter `any`** : Utiliser `unknown` ou des types génériques si nécessaire
3. **Composants purs** : Préférer les composants fonctionnels sans état
4. **Hooks pour la logique** : Extraire la logique réutilisable dans des hooks
5. **Memoization** : Utiliser `useMemo` et `useCallback` pour l'optimisation
