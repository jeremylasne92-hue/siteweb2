---
name: CSS Design System
description: Design system CSS pour le projet ECHO avec thème Nature
---

# CSS Design System - ECHO

Ce skill gère le design system CSS du projet ECHO avec son thème Nature.

## Quand utiliser ce skill

- Application de styles cohérents
- Création de nouveaux composants stylisés
- Modification du thème
- Animations et transitions

## Palette de Couleurs - Thème Nature

### Couleurs Principales
```css
:root {
  /* Verts - Couleurs primaires */
  --color-primary: #2D5A3D;      /* Vert forêt profond */
  --color-primary-light: #4A7C59;
  --color-primary-dark: #1E3D2A;
  
  /* Bruns - Couleurs secondaires */
  --color-secondary: #8B7355;     /* Brun terre */
  --color-secondary-light: #A68B6A;
  --color-secondary-dark: #6B5744;
  
  /* Accents */
  --color-accent: #C4A962;        /* Or naturel */
  --color-accent-green: #7CB342;  /* Vert feuille */
  
  /* Neutres */
  --color-background: #F5F2EB;    /* Beige clair */
  --color-surface: rgba(255, 255, 255, 0.8);
  --color-text: #2C2C2C;
  --color-text-light: #6B6B6B;
}
```

### Mode Sombre
```css
[data-theme="dark"] {
  --color-background: #1A1F1C;
  --color-surface: rgba(45, 55, 45, 0.9);
  --color-text: #E8E4DC;
  --color-text-light: #B5B0A5;
}
```

## Composants Glass Effect

```css
.glass-card {
  background: var(--color-surface);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

## Animations Standard

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Hover Lift */
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* Pulse naturel */
@keyframes naturalPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
```

## Typography

```css
:root {
  --font-primary: 'Outfit', sans-serif;
  --font-display: 'Playfair Display', serif;
  
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 2rem;
  --text-4xl: 2.5rem;
}
```

## Instructions

Pour appliquer le design system :
- "Applique le style glass-card à ce composant"
- "Utilise les couleurs du thème Nature"
- "Ajoute une animation hover-lift"
