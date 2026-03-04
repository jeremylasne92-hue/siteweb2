# Inventaire des Composants UI — Frontend ECHO

## Composants Layout (`src/components/layout/`)

### Layout
- **Fichier** : `Layout.tsx` (20 lignes)
- **Props** : `{ children: React.ReactNode }`
- **Rôle** : Wrapper principal flex-col min-h-screen avec Header + main (pt-20) + Footer

### Header
- **Fichier** : `Header.tsx` (110 lignes)
- **State** : `isScrolled` (scroll > 20px), `isMobileMenuOpen`
- **Features** :
  - Navigation sticky avec effet blur/opacity au scroll
  - Menu desktop (8 liens) + menu mobile (hamburger)
  - Logo, recherche, bouton compte, bouton "Soutenir"
  - Highlight de la page active via `useLocation()`

### Footer
- **Fichier** : `Footer.tsx` (85 lignes)
- **Sous-composants** : `SocialIcon`, `FooterLink`
- **Sections** : Brand (logo + desc + social), Navigation, Ressources, Légal
- **Social** : YouTube, Instagram, Facebook, Twitter

---

## Composants UI (`src/components/ui/`)

### Button
- **Fichier** : `Button.tsx` (52 lignes)
- **Props** : `variant`, `size`, `isLoading` + `ButtonHTMLAttributes`
- **Variants** : `primary` (gold), `secondary` (white/10), `outline` (gold border), `ghost` (transparent)
- **Tailles** : `sm` (h-8), `md` (h-10), `lg` (h-12)
- **Exports** : `Button` (forwardRef) + `cn` (utility class merger)

### Card
- **Fichier** : `Card.tsx` (31 lignes)
- **Props** : `variant` + `HTMLAttributes<HTMLDivElement>`
- **Variants** : `default` (bg darker + border), `glass` (glassmorphism), `solid` (neutral-900)
- **Features** : Hover overlay pour variant glass

### Input
- **Fichier** : `Input.tsx` (35 lignes)
- **Props** : `label`, `error` + `InputHTMLAttributes`
- **Features** : Label optionnel, message d'erreur, focus ring echo-gold, état disabled

### Modal
- **Fichier** : `Modal.tsx` (57 lignes)
- **Props** : `isOpen`, `onClose`, `title`, `children`, `className`
- **Features** : Body scroll lock, backdrop blur, fermeture par overlay click, animation fade-in

---

## Sous-composants de Pages

### Serie.tsx
- `CharacterCard` : Carte personnage avec image aspect 3/4, overlay description au hover, liens sociaux (Instagram, Facebook, TikTok)

### Mouvement.tsx
- `TimelineItem` : Élément de timeline gauche/droite avec icône sur la ligne
- `PhaseCard` : Carte de phase numérotée avec liste d'actions

### ECHOLink.tsx
- `FeatureCard` : Carte de fonctionnalité avec icône, titre, description, couleur personnalisée

### ECHOsystem.tsx
- `ProblemCard` (inline) : Absent — page réécrite sans sous-composants custom (utilise `Card` générique)

### Cognisphere.tsx
- `ProblemCard` : Carte problème→solution avec emoji, texte barré et description
- `StepCard` : Étape numérotée avec icône, badge et description
- `ContentType` : Icône + label de type de contenu supporté

---

## Résumé

| Catégorie | Nombre | Fichiers |
|-----------|--------|----------|
| Layout | 3 | Layout, Header, Footer |
| UI réutilisables | 4 | Button, Card, Input, Modal |
| Sous-composants pages | 8 | CharacterCard, TimelineItem, PhaseCard, FeatureCard, ProblemCard, StepCard, ContentType |
| **Total** | **15** | |
