---
name: Component Generator
description: Génération automatisée de composants React avec styles et tests
---

# Component Generator

Ce skill permet de générer rapidement des composants React complets avec leurs fichiers associés.

## Quand utiliser ce skill

- Création rapide de nouveaux composants
- Génération de pages avec structure standard
- Scaffolding de composants UI

## Types de Composants

### 1. Composant UI
Composant réutilisable pour l'interface utilisateur.

**Structure générée :**
```
components/ui/
└── ComponentName/
    ├── ComponentName.tsx
    ├── ComponentName.css
    └── index.ts
```

### 2. Composant Page
Page complète de l'application.

**Structure générée :**
```
pages/
└── PageName.tsx
```

### 3. Composant Layout
Composant de mise en page.

**Structure générée :**
```
components/layout/
└── LayoutName.tsx
```

## Templates

### Template UI Component
```tsx
import React from 'react';
import './[NAME].css';

interface [NAME]Props {
  // Props ici
}

export const [NAME]: React.FC<[NAME]Props> = (props) => {
  return (
    <div className="[name-kebab]">
      {/* Contenu */}
    </div>
  );
};

export default [NAME];
```

### Template Page
```tsx
import React from 'react';
import Layout from '../components/layout/Layout';

const [NAME]Page: React.FC = () => {
  return (
    <Layout>
      <section className="[name-kebab]-page">
        <h1>[NAME]</h1>
        {/* Contenu de la page */}
      </section>
    </Layout>
  );
};

export default [NAME]Page;
```

## Instructions d'utilisation

Pour générer un composant, demander :
- "Génère un composant UI Button"
- "Crée une page Contact"
- "Scaffolde un composant Header"
