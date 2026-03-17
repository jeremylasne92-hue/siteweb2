# Design — Page Soutenir avec 3 campagnes HelloAsso

**Date** : 2026-03-17
**Statut** : Validé

## Contexte

La page `/soutenir` affiche actuellement une barre de progression hardcodée (13 000 € / 20 000 €) et des paliers fictifs (Graine/Racine/Canopée). En réalité, ECHO a 3 campagnes de crowdfunding distinctes sur HelloAsso :

| Campagne | Ville | Volet | Objectif | Deadline |
|----------|-------|-------|----------|----------|
| ECHO x Lille | Lille | Interactif (thriller, ECHOLink) | 1 200 € | 30/04/2026 |
| ECHO x Lyon | Lyon | Éducatif (CogniSphère) | 1 200 € | 31/05/2026 |
| ECHO x Bordeaux | Bordeaux | Artistique (9 Muses, Dante) | 1 200 € | 30/06/2026 |

Chaque campagne a ses propres paliers HelloAsso (1€ / 33€ / 100€ / 300€ / libre) et un widget compteur iframe fourni par HelloAsso.

## Design retenu : Trilogie + 3 cartes + iframe compteur

### Structure de page

```
1. Hero (existant, adapté)
   - Icone coeur + "Soutenir ECHO"
   - Nouveau sous-titre : "3 villes · 3 visions · 3 courts métrages"
   - Accroche narrative (3 lignes max) : trilogie dantesque
   - Mention soutiens : "Soutenus par Cyril Dion & Flore Vasseur"

2. Section 3 cartes campagnes
   - Triées par deadline (Lille → Lyon → Bordeaux)
   - Desktop : 3 colonnes côte à côte
   - Mobile : empilées verticalement
   - Chaque carte contient :
     a. Badge "J-XX" (jours restants, couleur selon urgence)
     b. Visuel/icône ville + nom volet
     c. Accroche 1 ligne
     d. Widget compteur HelloAsso (iframe wrapper)
     e. Mention "Dès 1 €"
     f. CTA "Contribuer" → lien HelloAsso campagne

3. FAQ (existante, conservée)
   - Utilisation des fonds
   - Réduction fiscale 66%
   - Annulation
```

### Identité visuelle par ville

| Ville | Couleur accent | Volet |
|-------|---------------|-------|
| Lille | Bleu brique `#60A5FA` | Interactif |
| Lyon | Vert émeraude `#10B981` | Éducatif |
| Bordeaux | Or/ambre `#F59E0B` | Artistique |

### Composant HelloAssoCounter (iframe wrapper)

```tsx
// Wrapper responsive et sécurisé pour l'iframe compteur HelloAsso
<div className="w-full max-w-[350px] mx-auto rounded-xl overflow-hidden
     border border-echo-gold/30 bg-white/5">
  <iframe
    src="...widget-compteur"
    title="Compteur ECHO x {ville}"
    className="w-full border-none"
    loading="lazy"
    sandbox="allow-scripts allow-same-origin"
  />
</div>
```

Garde-fous :
- `loading="lazy"` : seule l'iframe visible charge
- `sandbox` : bloque redirections et popups
- `postMessage` filtré par origine `helloasso.com`
- Fallback lien si iframe ne charge pas
- `aria-label` pour accessibilité

### URLs des campagnes HelloAsso

```
Bordeaux (widget) : https://www.helloasso.com/associations/mouvement-echo/collectes/echo-x-bordeaux-court-metrage-volet-artistique/widget-compteur
Lille (widget)    : https://www.helloasso.com/associations/mouvement-echo/collectes/echo-x-lille-court-metrage-volet-interactif/widget-compteur
Lyon (widget)     : https://www.helloasso.com/associations/mouvement-echo/collectes/echo-x-lyon-court-metrage-volet-educatif/widget-compteur

Bordeaux (don)    : https://www.helloasso.com/associations/mouvement-echo/collectes/echo-x-bordeaux-court-metrage-volet-artistique
Lille (don)       : https://www.helloasso.com/associations/mouvement-echo/collectes/echo-x-lille-court-metrage-volet-interactif
Lyon (don)        : https://www.helloasso.com/associations/mouvement-echo/collectes/echo-x-lyon-court-metrage-volet-educatif
```

### Badge jours restants

| Jours | Couleur | Label |
|-------|---------|-------|
| > 30 | Vert `#10B981` | J-XX |
| 15-30 | Orange `#F59E0B` | J-XX |
| < 15 | Rouge `#EF4444` | J-XX ⚠️ |

### Ce qui disparaît

- Barre de progression hardcodée "13 000 € / 20 000 €"
- Paliers Graine (10€) / Racine (50€) / Canopée (100€)
- Objectif unique "Saison 2"

### Ce qui reste

- Hero section (adapté)
- FAQ 3 questions
- SEO component
- Analytics tracking (adapter event names)

## Décisions clés

1. **Iframe compteur** plutôt qu'API HelloAsso — campagnes éphémères (3 mois), pas de backend à maintenir
2. **Paliers gérés par HelloAsso** — pas de duplication sur le site, mention "Dès 1 €" suffit
3. **Tri par deadline** — urgence naturelle, Lille en premier
4. **Post-campagne** : carte affiche "Campagne terminée" avec lien résultat
