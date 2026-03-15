# SEO/GEO Phase Enrichissement — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementer les actions 8, 9, 11, 12, 14 de la roadmap SEO/GEO (phase Enrichissement) pour renforcer la structuration semantique du site ECHO avant le lancement du 20 mars 2026.

**Architecture:** Injection de JSON-LD specifiques par page via le composant SEO existant (react-helmet-async), creation d'un composant Breadcrumbs reutilisable avec balisage JSON-LD BreadcrumbList, mise a jour des meta descriptions selon la strategie SEO, et ajout de badges "en developpement" sur CogniSphere et ECHOLink.

**Tech Stack:** React 19, TypeScript, react-helmet-async (via composant SEO.tsx), Tailwind CSS 4, Vitest (frontend tests)

**Ref:** `docs/echo-strategy-seo-geo.md` sections 5.3, 5.4, 5.6, 6.3, 7.2

---

### Task 1: JSON-LD FAQPage sur /faq

**Files:**
- Modify: `frontend/src/pages/FAQ.tsx`

**Context:** La page FAQ existe avec 22 questions/reponses dans 6 categories. Le composant SEO est deja present. Il faut ajouter un JSON-LD FAQPage schema.org dans le `<head>` via `<Helmet>`. Le schema JSON-LD FAQPage attend un tableau plat de Question/Answer (pas de categories).

**Step 1: Ajouter le JSON-LD FAQPage dans le composant**

Dans FAQ.tsx, apres le composant `<SEO>`, ajouter un bloc `<Helmet>` avec un `<script type="application/ld+json">` contenant le schema FAQPage. Le JSON-LD doit etre genere dynamiquement a partir du tableau `faqData` existant (aplatir categories → questions).

```tsx
// Inside the return, after <SEO>:
<Helmet>
    <script type="application/ld+json">
        {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "@id": "https://mouvementecho.fr/faq",
            "name": "Questions frequentes — Mouvement ECHO",
            "mainEntity": faqData.flatMap(cat => cat.items.map(item => ({
                "@type": "Question",
                "name": item.q,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": item.a
                }
            })))
        })}
    </script>
</Helmet>
```

**Important:** Utiliser `Helmet` de `react-helmet-async` (deja importe via le composant SEO). Ajouter l'import si necessaire : `import { Helmet } from 'react-helmet-async';`

**Step 2: Verifier**

Run: `cd frontend && npx eslint src/pages/FAQ.tsx`
Expected: No errors

Run: `cd frontend && npx vite build`
Expected: Build success

**Step 3: Commit**

```bash
git add frontend/src/pages/FAQ.tsx
git commit -m "feat(seo): add JSON-LD FAQPage schema on /faq"
```

---

### Task 2: JSON-LD CreativeWorkSeries + TVSeason sur /serie

**Files:**
- Modify: `frontend/src/pages/Serie.tsx`

**Context:** La page Serie existe avec les donnees des 3 saisons (S1 complete avec 11 episodes, S2/S3 placeholders). Le composant SEO est present. Il faut ajouter un JSON-LD CreativeWorkSeries avec 3 TVSeason. Utiliser le domaine `mouvementecho.fr` (pas `mouvement-echo.fr` comme dans le doc strategie).

**Step 1: Ajouter le JSON-LD CreativeWorkSeries**

Dans Serie.tsx, apres le composant `<SEO>`, ajouter :

```tsx
<Helmet>
    <script type="application/ld+json">
        {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWorkSeries",
            "@id": "https://mouvementecho.fr/serie#series",
            "name": "ECHO",
            "alternateName": "ECHO — La Serie",
            "description": "Serie documentaire de 33 episodes en 3 saisons : S1 Enfer (diagnostic des crises), S2 Purgatoire (solutions du terrain), S3 Paradis (futurs souhaitables). Structure inspiree de la Divine Comedie de Dante.",
            "numberOfSeasons": 3,
            "genre": ["Documentary", "Drama"],
            "inLanguage": "fr-FR",
            "productionCompany": {
                "@id": "https://mouvementecho.fr/#organization"
            },
            "creator": {
                "@id": "https://mouvementecho.fr/#jeremy-lasne"
            },
            "hasPart": [
                {
                    "@type": "TVSeason",
                    "@id": "https://mouvementecho.fr/serie#saison-1",
                    "name": "Saison 1 — Enfer (diagnostic des crises)",
                    "seasonNumber": 1,
                    "numberOfEpisodes": 11,
                    "description": "Diagnostic des dysfonctionnements systemiques. Decryptage des crises ecologiques, sociales et economiques.",
                    "partOfSeries": { "@id": "https://mouvementecho.fr/serie#series" }
                },
                {
                    "@type": "TVSeason",
                    "@id": "https://mouvementecho.fr/serie#saison-2",
                    "name": "Saison 2 — Purgatoire (solutions du terrain)",
                    "seasonNumber": 2,
                    "numberOfEpisodes": 11,
                    "description": "Solutions concretes du terrain. Documentation des acteurs innovants et des alternatives viables.",
                    "partOfSeries": { "@id": "https://mouvementecho.fr/serie#series" }
                },
                {
                    "@type": "TVSeason",
                    "@id": "https://mouvementecho.fr/serie#saison-3",
                    "name": "Saison 3 — Paradis (futurs souhaitables)",
                    "seasonNumber": 3,
                    "numberOfEpisodes": 11,
                    "description": "Prospective et imaginaires alternatifs. Projection vers les futurs souhaitables.",
                    "partOfSeries": { "@id": "https://mouvementecho.fr/serie#series" }
                }
            ]
        })}
    </script>
</Helmet>
```

**Step 2: Verifier**

Run: `cd frontend && npx eslint src/pages/Serie.tsx`
Expected: No errors

Run: `cd frontend && npx vite build`
Expected: Build success

**Step 3: Commit**

```bash
git add frontend/src/pages/Serie.tsx
git commit -m "feat(seo): add JSON-LD CreativeWorkSeries + TVSeason on /serie"
```

---

### Task 3: Composant Breadcrumbs avec JSON-LD BreadcrumbList

**Files:**
- Create: `frontend/src/components/seo/Breadcrumbs.tsx`
- Modify: `frontend/src/pages/Serie.tsx`
- Modify: `frontend/src/pages/Cognisphere.tsx`
- Modify: `frontend/src/pages/ECHOLink.tsx`
- Modify: `frontend/src/pages/Events.tsx`
- Modify: `frontend/src/pages/Resources.tsx`
- Modify: `frontend/src/pages/FAQ.tsx`
- Modify: `frontend/src/pages/AboutPage.tsx`
- Modify: `frontend/src/pages/Contact.tsx`
- Modify: `frontend/src/pages/Support.tsx`

**Context:** Creer un composant Breadcrumbs reutilisable qui affiche une navigation fil d'Ariane visible + un JSON-LD BreadcrumbList dans le `<head>`. Le composant doit s'integrer en haut de chaque page publique (sous le header, au-dessus du hero).

**Step 1: Creer le composant Breadcrumbs.tsx**

```tsx
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
    label: string;
    href?: string; // Omit for current page (last item)
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

const BASE_URL = 'https://mouvementecho.fr';

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    const allItems: BreadcrumbItem[] = [{ label: 'Accueil', href: '/' }, ...items];

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": allItems.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.label,
            ...(item.href ? { "item": `${BASE_URL}${item.href}` } : {}),
        })),
    };

    return (
        <>
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            </Helmet>
            <nav
                aria-label="Fil d'Ariane"
                className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-2"
            >
                <ol className="flex items-center gap-1.5 text-sm text-echo-textMuted">
                    {allItems.map((item, index) => (
                        <li key={index} className="flex items-center gap-1.5">
                            {index > 0 && <ChevronRight size={14} className="opacity-40" />}
                            {item.href ? (
                                <Link
                                    to={item.href}
                                    className="hover:text-echo-gold transition-colors"
                                >
                                    {index === 0 ? <Home size={14} /> : item.label}
                                </Link>
                            ) : (
                                <span className="text-white/70">{item.label}</span>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    );
}
```

**Step 2: Integrer sur les pages publiques**

Ajouter le composant en debut de chaque page publique, juste apres le `<SEO>` (et avant le hero/contenu). Exemples :

**FAQ.tsx:**
```tsx
import { Breadcrumbs } from '../components/seo/Breadcrumbs';
// ...
<Breadcrumbs items={[{ label: 'FAQ' }]} />
```

**Serie.tsx:**
```tsx
import { Breadcrumbs } from '../components/seo/Breadcrumbs';
// ...
<Breadcrumbs items={[{ label: 'La Serie' }]} />
```

**Cognisphere.tsx:**
```tsx
import { Breadcrumbs } from '../components/seo/Breadcrumbs';
// ...
<Breadcrumbs items={[{ label: 'CogniSphere' }]} />
```

**ECHOLink.tsx:**
```tsx
import { Breadcrumbs } from '../components/seo/Breadcrumbs';
// ...
<Breadcrumbs items={[{ label: 'ECHOLink' }]} />
```

**Events.tsx:**
```tsx
import { Breadcrumbs } from '../components/seo/Breadcrumbs';
// ...
<Breadcrumbs items={[{ label: 'Evenements', href: '/agenda' }]} />
// Note: href car la page est /agenda mais le label est "Evenements"
// Actually: last item should NOT have href (current page). So:
<Breadcrumbs items={[{ label: 'Evenements' }]} />
```

**Resources.tsx:**
```tsx
<Breadcrumbs items={[{ label: 'Ressources' }]} />
```

**AboutPage.tsx:**
```tsx
<Breadcrumbs items={[{ label: 'A propos' }]} />
```

**Contact.tsx:**
```tsx
<Breadcrumbs items={[{ label: 'Contact' }]} />
```

**Support.tsx** (page Soutenir):
```tsx
<Breadcrumbs items={[{ label: 'Soutenir' }]} />
```

**Note:** Ne PAS ajouter de breadcrumbs sur la Home (page racine), les pages legales (peu de valeur SEO), ni les pages admin/auth.

**Step 3: Verifier**

Run: `cd frontend && npx eslint src/components/seo/Breadcrumbs.tsx src/pages/FAQ.tsx src/pages/Serie.tsx src/pages/Cognisphere.tsx src/pages/ECHOLink.tsx src/pages/Events.tsx src/pages/Resources.tsx src/pages/AboutPage.tsx`
Expected: No errors

Run: `cd frontend && npx vite build`
Expected: Build success

**Step 4: Commit**

```bash
git add frontend/src/components/seo/Breadcrumbs.tsx frontend/src/pages/FAQ.tsx frontend/src/pages/Serie.tsx frontend/src/pages/Cognisphere.tsx frontend/src/pages/ECHOLink.tsx frontend/src/pages/Events.tsx frontend/src/pages/Resources.tsx frontend/src/pages/AboutPage.tsx frontend/src/pages/Contact.tsx frontend/src/pages/Support.tsx
git commit -m "feat(seo): add Breadcrumbs component with JSON-LD BreadcrumbList on public pages"
```

---

### Task 4: Meta descriptions optimisees SEO

**Files:**
- Modify: `frontend/src/pages/Home.tsx`
- Modify: `frontend/src/pages/Serie.tsx`
- Modify: `frontend/src/pages/Mouvement.tsx`
- Modify: `frontend/src/pages/Cognisphere.tsx`
- Modify: `frontend/src/pages/ECHOLink.tsx`
- Modify: `frontend/src/pages/FAQ.tsx`
- Modify: `frontend/src/pages/Contact.tsx`
- Modify: `frontend/src/pages/Support.tsx`
- Modify: `frontend/src/pages/AboutPage.tsx`

**Context:** Mettre a jour les props `description` du composant `<SEO>` sur chaque page pour utiliser les meta descriptions optimisees definies dans la strategie (section 6.3). Les descriptions actuelles sont generiques. Les nouvelles sont calibrees pour le SEO (max 155 caracteres, mots-cles cibles).

**Step 1: Mettre a jour chaque composant SEO**

Chercher le composant `<SEO ... description="..."` dans chaque page et remplacer la description par celle de la strategie :

| Page | Nouvelle description |
|------|---------------------|
| Home | "Mouvement ECHO : association citoyenne produisant une serie documentaire de 33 episodes sur la transition ecologique. Serie, CogniSphere, ECHOLink." |
| /a-propos | "Mouvement ECHO est une association loi 1901 fondee en 2024 par Jeremy Lasne. Mission, equipe, manifeste et vision du projet." |
| /serie | "Serie documentaire ECHO : 33 episodes en 3 saisons inspirees de Dante (Enfer, Purgatoire, Paradis). Ecologie, justice sociale, prospective." |
| /faq | "Questions frequentes sur Mouvement ECHO : association, serie documentaire, CogniSphere, ECHOLink, financement, equipe." |
| /cognisphere | Deja bonne — garder l'actuelle |
| /echolink | Deja bonne — garder l'actuelle |
| /soutenir | "Soutenez Mouvement ECHO : dons a partir de 10 euros. Association loi 1901, serie documentaire, plateformes citoyennes." |
| /mouvement | "Le Mouvement ECHO : 7 etapes pour passer de la conscience a l'action. Rejoignez une communaute citoyenne engagee." |
| /contact | "Contactez Mouvement ECHO. Association loi 1901, Bougival (78). Formulaire de contact et informations." |

**Step 2: Verifier**

Run: `cd frontend && npx eslint .`
Expected: No errors

Run: `cd frontend && npx vite build`
Expected: Build success

**Step 3: Commit**

```bash
git add frontend/src/pages/Home.tsx frontend/src/pages/Serie.tsx frontend/src/pages/Mouvement.tsx frontend/src/pages/FAQ.tsx frontend/src/pages/Contact.tsx frontend/src/pages/Support.tsx frontend/src/pages/AboutPage.tsx
git commit -m "feat(seo): update meta descriptions with SEO-optimized text"
```

---

### Task 5: Badges "en developpement" sur CogniSphere et ECHOLink

**Files:**
- Modify: `frontend/src/pages/Cognisphere.tsx`
- Modify: `frontend/src/pages/ECHOLink.tsx`

**Context:** La strategie SEO impose la transparence sur le statut du projet (decision 5, section 8.1). CogniSphere et ECHOLink sont en developpement. Il faut ajouter un badge visible "En developpement" en haut de chaque page, sous le hero. Ce badge doit etre discret mais visible (pas un blocage, juste une information).

**Step 1: Ajouter le badge**

Dans chaque page (Cognisphere.tsx et ECHOLink.tsx), ajouter un banner juste apres le hero section :

```tsx
{/* Status badge */}
<div className="bg-amber-500/10 border-b border-amber-500/20">
    <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2 text-sm text-amber-400">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        Plateforme en cours de developpement — Lancement prevu : juin 2026
    </div>
</div>
```

**Step 2: Verifier**

Run: `cd frontend && npx eslint src/pages/Cognisphere.tsx src/pages/ECHOLink.tsx`
Expected: No errors

Run: `cd frontend && npx vite build`
Expected: Build success

**Step 3: Commit**

```bash
git add frontend/src/pages/Cognisphere.tsx frontend/src/pages/ECHOLink.tsx
git commit -m "feat(seo): add 'en developpement' status badges on CogniSphere and ECHOLink"
```

---

### Task 6: Verification finale et mise a jour BMAD

**Files:**
- Modify: `.agent/memory/shared-context.md`

**Step 1: Run full quality check**

```bash
cd frontend && npx eslint .
cd frontend && npx vitest run
cd backend && python -m pytest -p no:recording -q
cd frontend && npm run build
```

All must pass.

**Step 2: Mettre a jour shared-context.md**

- Ajouter la decision dans "Decisions Recentes"
- Ajouter l'entree dans "Historique des Niveaux"
- Ajouter l'entree dans "Niveau Actif"

**Step 3: Commit et push**

```bash
git add .agent/memory/shared-context.md
git commit -m "docs: update BMAD shared-context with SEO/GEO enrichissement"
git push origin main
```

---

## Recapitulatif

| Task | Action strategie | Effort estime |
|------|-----------------|---------------|
| 1 | #8 JSON-LD FAQPage | 15min |
| 2 | #9 JSON-LD CreativeWorkSeries+TVSeason | 15min |
| 3 | #11 Breadcrumbs + JSON-LD BreadcrumbList | 45min |
| 4 | #12 Meta descriptions optimisees | 15min |
| 5 | #14 Badges "en developpement" | 10min |
| 6 | Verification + BMAD | 10min |
| **Total** | | **~2h** |

## Actions reportees (hors scope de ce plan)

| Action | Raison | Declencheur |
|--------|--------|-------------|
| #10 Pre-rendu statique | Effort 4h+, pas critique avant episodes | Quand pilote en production |
| #13 Enrichir FAQ 15-20 questions | Travail editorial, pas dev | Fondateur fournit le contenu |
| #15 Profil LinkedIn Organisation | Action manuelle hors dev | Fondateur |
