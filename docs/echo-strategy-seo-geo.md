# ECHO — Strategie SEO, GEO et Architecture Semantique

**Document de reference** — Version 1.0
**Date** : 15 mars 2026
**Statut** : Valide apres 10 rounds de co-construction strategique
**Auteurs** : Jeremy Lasne (fondateur) + Claude (strategie IA)

---

## Table des matieres

1. [Diagnostic strategique](#1-diagnostic-strategique)
2. [Positionnement recommande](#2-positionnement-recommande)
3. [Architecture de site recommandee](#3-architecture-de-site-recommandee)
4. [Modele semantique et entites](#4-modele-semantique-et-entites)
5. [Plan de balisage JSON-LD par type de page](#5-plan-de-balisage-json-ld-par-type-de-page)
6. [Strategie AI-readable / citation-ready](#6-strategie-ai-readable--citation-ready)
7. [Roadmap priorisee](#7-roadmap-priorisee)
8. [Recommandation argumentee finale avec arbitrages](#8-recommandation-argumentee-finale-avec-arbitrages)

---

## 1. Diagnostic strategique

### 1.1 Etat des lieux a J-5 (15 mars 2026)

**Ce qui existe :**

- Site web SPA React 19 + TypeScript + Vite 7 + Tailwind CSS 4 fonctionnel
- Backend FastAPI + MongoDB operationnel (15 modules de routes, 50+ endpoints)
- 14 pages publiques avec contenu narratif riche
- Composant SEO (react-helmet-async) sur 10/14 pages publiques
- robots.txt et sitemap.xml configures (incomplets)
- Google Analytics 4 en mode cookieless RGPD
- Structure narrative differenciante (Dante, 3 actes, 33 episodes)
- Domaine mouvement-echo.fr actif sur Firebase Hosting

**Ce qui manque :**

| Lacune | Impact | Criticite |
|--------|--------|-----------|
| SPA pur (client-side rendering uniquement) | Contenu invisible pour les crawlers IA (GPTBot, ClaudeBot, PerplexityBot) et indexation Google retardee/incomplete | BLOQUANT |
| Zero JSON-LD / schema.org | Aucune entite declaree dans le Knowledge Graph, pas de rich snippets | BLOQUANT |
| Pas de page /a-propos factuelle | Aucune page citable par un LLM pour decrire ECHO | BLOQUANT |
| Google Search Console non configure | Pas de monitoring d'indexation, pas de soumission de sitemap | CRITIQUE |
| Bing Webmaster Tools non configure | Invisible pour ChatGPT Browse et Copilot (index Bing) | CRITIQUE |
| Pas de profil LinkedIn organisation | Pas de signal social d'existence | IMPORTANT |
| Pas de fiche Google Business Profile | Pas de Knowledge Panel potentiel | IMPORTANT |
| Pas de Wikidata Q-item | Absent des graphes de connaissances mondiaux | IMPORTANT |
| Pas de fiche IMDb | Absent de la reference audiovisuelle mondiale | IMPORTANT |
| Sitemap incomplet (7 URLs sur 14+ pages publiques) | Pages non decouvertes par les crawlers | IMPORTANT |
| 4 pages sans composant SEO (Cognisphere, ECHOLink, Events, Resources) | Meta tags par defaut, pas de description specifique | MODERE |
| Pas de llms.txt | Pas de surface dediee aux agents IA | NICE-TO-HAVE |
| Pas de balises canonical | Risque de contenu duplique | MODERE |
| Pas de breadcrumbs | Pas de rich snippet navigation, hierarchie floue | MODERE |
| Zero backlink externe connu | Domain Authority ~0 | CRITIQUE (long terme) |
| Zero mention presse | Aucune source tierce citable | CRITIQUE (long terme) |
| Zero episode produit | Contenu central inexistant | EXISTENTIEL |

### 1.2 Analyse concurrentielle

ECHO n'a **aucun concurrent direct** sur sa niche exacte. Le croisement "serie documentaire longue forme + structure narrative Dante + apprentissage par repetition espacee + reseau d'acteurs du changement" est unique et non occupe.

**Projets voisins (meme espace semantique, dimensions differentes) :**

| Projet | Dimension partagee | Dimension manquante |
|--------|-------------------|---------------------|
| Demain (Cyril Dion) | Documentaire ecologique | Pas de serie, pas de plateforme |
| On Est Pret | Mouvement citoyen, video | Pas de serie longue, pas d'apprentissage |
| DataGueule | Serie web documentaire | Pas de plateforme communautaire |
| Blast / Reporterre | Journalisme ecologique | Pas de format serie narrative |
| Nota Bene | Documentaire educatif | Pas de transition ecologique |

**Consequence strategique :** ECHO ne doit pas lutter sur des requetes generiques ("transition ecologique", "documentaire ecologique") ou les acteurs etablis dominent. ECHO doit posseder les requetes d'intersection ou il est le seul acteur.

### 1.3 Le probleme fondamental

Le site ECHO est **techniquement invisible** pour les agents IA et **semantiquement non structure** pour les moteurs de recherche. Le contenu existe mais il est enferme dans un SPA React que seul un navigateur avec execution JavaScript peut lire. Ni GPTBot, ni ClaudeBot, ni PerplexityBot n'executent le JavaScript. Google le fait avec retard (jours/semaines) et de maniere incomplete.

Le levier le plus puissant n'est pas la creation de contenu (il existe deja) mais son **accessibilite technique** (pre-rendu HTML) et sa **structuration semantique** (JSON-LD).

---

## 2. Positionnement recommande

### 2.1 Formulation factuelle validee

**Definition courte (1 phrase — pour les LLM et meta descriptions) :**

> Mouvement ECHO est une association citoyenne francaise (loi 1901) qui produit une serie documentaire de 33 episodes sur la transition ecologique et sociale, et developpe des plateformes numeriques d'apprentissage et de mise en reseau des acteurs du changement.

**Definition differenciante (2 phrases — pour les pages piliers) :**

> Mouvement ECHO est la premiere initiative combinant une serie documentaire structuree en 3 actes inspires de la Divine Comedie de Dante (Enfer/Purgatoire/Paradis), une plateforme d'apprentissage par repetition espacee (CogniSphere) et un reseau de mise en relation des acteurs de la transition (ECHOLink). Fondee en 2024 par Jeremy Lasne, l'association federe les citoyens autour d'un recit collectif en 33 episodes documentant les crises, amplifiant les solutions du terrain et projetant des imaginaires alternatifs.

### 2.2 Positionnement semantique — requetes cibles

**Requetes de marque (priorite maximale) :**
- "Mouvement ECHO"
- "ECHO serie documentaire"
- "mouvement-echo.fr"

**Requetes de niche (priorite haute — faible concurrence) :**
- "serie documentaire transition ecologique France"
- "documentaire citoyen changement social"
- "serie inspiree Divine Comedie Dante ecologie"
- "projet alliant documentaire et engagement citoyen"
- "plateforme apprentissage transition ecologique"

**Requetes thematiques (priorite moyenne — post-lancement) :**
- "documentaire [thematique] transition" (par thematique)
- "apprentissage citoyen ecologie"
- "reseau acteurs changement France"

**Requetes generiques (NE PAS cibler a court terme) :**
- "transition ecologique"
- "serie documentaire"
- "engagement citoyen"
- "changer le monde"

### 2.3 Mots et expressions a eviter

| A eviter | Pourquoi | Alternative |
|----------|----------|-------------|
| "Transformer le monde" | Non verifiable, non citable | "Documenter les crises et amplifier les solutions" |
| "Revolutionnaire" | Hyperbole non prouvable | "Premiere initiative combinant..." |
| "Unique en son genre" | Affirmation marketing | Decrire factuellement ce qui est combine |
| "Impact majeur" | Non mesure | "33 episodes, 10 thematiques, [N] partenaires" |
| "Nous" en premiere phrase | Pronom orphelin non citable | "Mouvement ECHO est..." |

---

## 3. Architecture de site recommandee

### 3.1 Architecture actuelle (14 pages publiques)

```
/                                 (Home)
/serie                            (La Serie)
/mouvement                        (Le Mouvement)
/cognisphere                      (CogniSphere)
/echolink                         (ECHOLink)
/partenaires                      (Partenaires)
/agenda                           (Evenements)
/ressources                       (Ressources)
/soutenir                         (Soutenir/Don)
/contact                          (Contact)
/faq                              (FAQ)
/politique-de-confidentialite     (RGPD)
/mentions-legales                 (Mentions legales)
/cgu                              (CGU)
```

### 3.2 Architecture recommandee — Phase 1 (lancement J-0)

**Pages a ajouter :**

```
/a-propos                         (NOUVELLE — page pivot "About" + manifeste)
```

**Pages a restructurer :**

```
/partenaires    → contenu editorial statique ("Nos partenaires se revelent
                  a partir de mars 2026" + CTA inscription)
/agenda         → contenu editorial statique ("Evenements a venir" + CTA)
/ressources     → contenu editorial statique si vide en base
```

**Sitemap mis a jour (14 URLs) :**

```xml
mouvement-echo.fr/                   priority=1.0  changefreq=weekly
mouvement-echo.fr/serie              priority=0.9  changefreq=monthly
mouvement-echo.fr/a-propos           priority=0.9  changefreq=monthly
mouvement-echo.fr/mouvement          priority=0.8  changefreq=monthly
mouvement-echo.fr/cognisphere        priority=0.7  changefreq=monthly
mouvement-echo.fr/echolink           priority=0.7  changefreq=monthly
mouvement-echo.fr/faq                priority=0.8  changefreq=monthly
mouvement-echo.fr/soutenir           priority=0.7  changefreq=monthly
mouvement-echo.fr/partenaires        priority=0.6  changefreq=weekly
mouvement-echo.fr/agenda             priority=0.6  changefreq=weekly
mouvement-echo.fr/ressources         priority=0.5  changefreq=weekly
mouvement-echo.fr/contact            priority=0.5  changefreq=yearly
mouvement-echo.fr/mentions-legales   priority=0.3  changefreq=yearly
mouvement-echo.fr/faq                priority=0.8  changefreq=monthly
```

### 3.3 Architecture recommandee — Phase 2 (J+30 a J+90)

**Pages episodiques (au rythme de publication bi-mensuel) :**

```
/serie/saison-1                       (Hub Saison 1 — TVSeason)
/serie/saison-1/episode-1             (Page episode — TVEpisode)
/serie/saison-1/episode-2
...
```

**Pages piliers thematiques (10 pages, par ordre de priorite) :**

```
/thematiques/ecologie-climat
/thematiques/education
/thematiques/technologie-ia
/thematiques/culture-arts
/thematiques/economie-alternative
/thematiques/justice-sociale
/thematiques/democratie-gouvernance
/thematiques/sante
/thematiques/afrique-international
/thematiques/spiritualite-sens
```

**Regle stricte :** ne publier une page thematique que si elle a au minimum 2 episodes lies OU 1 partenaire actif OU 1 evenement passe sur le sujet. Pas de coquilles vides.

**Pages CogniSphere publiques (J+60) :**

```
/cognisphere/parcours/[thematique]    (Parcours decouverte gratuit)
```

### 3.4 Architecture recommandee — Phase 3 (J+90 a J+18m)

```
/serie/saison-2                       (Quand S2 demarre)
/serie/saison-2/episode-12
...
/presse                               (Revue de presse quand articles existent)
/impact                               (Page de mesure d'impact quand donnees existent)
```

### 3.5 Hierarchie de maillage interne

```
                         HOME
                       /  |   \
                SERIE  A-PROPOS  FAQ
                /    \      |       \
          SAISON-1  SAISON-2  SOUTENIR  CONTACT
           / | \
        EP1 EP2 EP3
         |    |    |
         └────┼────┘
              |
        THEMATIQUES  ←→  PARTENAIRES  ←→  EVENEMENTS
        (10 pages piliers)
              |
        COGNISPHERE/PARCOURS
```

**Regles de maillage :**

| Regle | Implementation |
|-------|---------------|
| Chaque page a un lien vers sa page parente | Breadcrumb navigation |
| Chaque page a 2-3 liens vers des pages soeurs | "Voir aussi" ou liens contextuels |
| Chaque episode lie ses thematiques | Tags cliquables vers /thematiques/[slug] |
| Chaque thematique liste ses episodes | Section "Episodes lies" |
| Chaque partenaire lie ses thematiques | Tags thematiques |
| La FAQ lie les pages de contenu | Liens dans les reponses |
| Le footer contient les 6 pages principales | Maillage permanent |

---

## 4. Modele semantique et entites

### 4.1 Mini-ontologie ECHO

```
Organization (NGO) : "Mouvement ECHO"
  │
  ├── founder ──────────→ Person : "Jeremy Lasne"
  ├── member ───────────→ Person : "Duc Ha Duong"
  │
  ├── hasPart ──────────→ CreativeWorkSeries : "Serie ECHO"
  │                         ├── hasPart → TVSeason : "S1 Enfer"
  │                         │               └── hasPart → TVEpisode (×11, quand publies)
  │                         │                               ├── about → DefinedTerm (thematiques)
  │                         │                               ├── actor → Person (intervenants)
  │                         │                               └── associatedMedia → VideoObject (YouTube)
  │                         ├── hasPart → TVSeason : "S2 Purgatoire"
  │                         └── hasPart → TVSeason : "S3 Paradis"
  │
  ├── hasPart ──────────→ WebApplication : "CogniSphere"
  │                         └── hasPart → LearningResource (parcours publics)
  │
  ├── hasPart ──────────→ WebApplication : "ECHOLink"
  │
  ├── partner ──────────→ Organization : "EICAR" (quand confirme)
  │
  ├── mainEntityOfPage ─→ WebPage : mouvement-echo.fr
  │
  └── subjectOf ────────→ Article : page /a-propos
```

### 4.2 Entites par niveau de priorite

**Niveau 1 — BLOQUANT (Jour 1-2, avant lancement) :**

| Entite | Type schema.org | Page(s) | Statut |
|--------|----------------|---------|--------|
| Mouvement ECHO | Organization + NGO | Toutes (via index.html) | A creer |
| Le site web | WebSite | index.html | A creer |
| La FAQ | FAQPage + Question/Answer | /faq | A creer |

**Niveau 2 — IMPORTANT (Jour 2-4) :**

| Entite | Type schema.org | Page(s) | Statut |
|--------|----------------|---------|--------|
| Serie ECHO | CreativeWorkSeries | /serie | A creer |
| Saison 1 Enfer | TVSeason | /serie | A creer |
| Saison 2 Purgatoire | TVSeason | /serie | A creer |
| Saison 3 Paradis | TVSeason | /serie | A creer |
| Jeremy Lasne | Person | /a-propos | A creer |
| Page a-propos | AboutPage | /a-propos | A creer |
| Breadcrumbs | BreadcrumbList | Toutes les pages | A creer |

**Niveau 3 — POST-LANCEMENT (J+30 a J+90) :**

| Entite | Type schema.org | Page(s) | Declencheur |
|--------|----------------|---------|-------------|
| Episodes individuels | TVEpisode | /serie/saison-1/episode-N | Publication de l'episode |
| Intervenants | Person | Pages episodes | Confirmation de l'intervenant |
| Videos | VideoObject | Pages episodes | Publication YouTube |
| Thematiques | DefinedTerm | /thematiques/[slug] | Contenu editorial pret |
| CogniSphere | WebApplication + SoftwareApplication | /cognisphere | Fonctionnalite publique |
| ECHOLink | WebApplication | /echolink | Fonctionnalite publique |
| Partenaires | Organization + partner | /partenaires | Partenariat signe |
| Evenements | Event | /agenda | Evenement confirme |
| Parcours apprentissage | LearningResource | /cognisphere/parcours/[slug] | Contenu pret |

### 4.3 Relations inter-entites cles

| Propriete | De | Vers | Quand |
|-----------|-----|------|-------|
| founder | Organization | Person (Lasne) | J-0 |
| hasPart | Organization | CreativeWorkSeries | J-0 |
| hasPart | CreativeWorkSeries | TVSeason (×3) | J-0 |
| hasPart | TVSeason | TVEpisode | A chaque publication |
| about | TVEpisode | DefinedTerm (thematiques) | A chaque publication |
| actor / contributor | TVEpisode | Person (intervenants) | A chaque publication |
| associatedMedia | TVEpisode | VideoObject (YouTube) | A chaque publication |
| publisher | WebSite | Organization | J-0 |
| mainEntityOfPage | WebPage | Organization | J-0 |
| sameAs | Organization | LinkedIn, Wikidata, IMDb, Google Business | Des creation des profils |
| partner | Organization | Organization (partenaires) | Signature du partenariat |

---

## 5. Plan de balisage JSON-LD par type de page

### 5.1 index.html — Organization + WebSite (global)

**A injecter dans `<head>` de index.html, en dur (pas via React) :**

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "NGO"],
      "@id": "https://mouvement-echo.fr/#organization",
      "name": "Mouvement ECHO",
      "alternateName": "ECHO",
      "url": "https://mouvement-echo.fr",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mouvement-echo.fr/logo-echo-transparent.png"
      },
      "description": "Association citoyenne francaise (loi 1901) qui produit une serie documentaire de 33 episodes sur la transition ecologique et sociale, et developpe des plateformes numeriques d'apprentissage et de mise en reseau des acteurs du changement.",
      "foundingDate": "2024",
      "founder": {
        "@type": "Person",
        "@id": "https://mouvement-echo.fr/#jeremy-lasne",
        "name": "Jeremy Lasne",
        "jobTitle": "President-fondateur"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "59 quai Boissy d'Anglas",
        "addressLocality": "Bougival",
        "postalCode": "78380",
        "addressCountry": "FR"
      },
      "areaServed": {
        "@type": "Country",
        "name": "France"
      },
      "knowsAbout": [
        "Transition ecologique",
        "Innovation sociale",
        "Serie documentaire",
        "Engagement citoyen",
        "Economie sociale et solidaire",
        "Narration audiovisuelle",
        "Apprentissage citoyen"
      ],
      "sameAs": []
    },
    {
      "@type": "WebSite",
      "@id": "https://mouvement-echo.fr/#website",
      "name": "Mouvement ECHO",
      "url": "https://mouvement-echo.fr",
      "publisher": {
        "@id": "https://mouvement-echo.fr/#organization"
      },
      "inLanguage": "fr-FR",
      "description": "Site officiel du Mouvement ECHO — serie documentaire citoyenne sur la transition ecologique et sociale."
    }
  ]
}
```

**Note :** le champ `sameAs` sera enrichi au fur et a mesure de la creation des profils externes (LinkedIn, Wikidata, IMDb, Google Business).

### 5.2 /a-propos — AboutPage

```json
{
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": "https://mouvement-echo.fr/a-propos",
  "name": "A propos de Mouvement ECHO",
  "description": "Presentation, mission, equipe et manifeste du Mouvement ECHO.",
  "mainEntity": {
    "@id": "https://mouvement-echo.fr/#organization"
  },
  "isPartOf": {
    "@id": "https://mouvement-echo.fr/#website"
  },
  "inLanguage": "fr-FR"
}
```

### 5.3 /serie — CreativeWorkSeries + TVSeason

```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWorkSeries",
  "@id": "https://mouvement-echo.fr/serie#series",
  "name": "ECHO",
  "alternateName": "ECHO — La Serie",
  "description": "Serie documentaire-fiction de 33 episodes repartis en 3 saisons, melan documentaire et narration fictionnelle. Structure inspiree de la Divine Comedie de Dante : S1 Enfer (diagnostic), S2 Purgatoire (solutions), S3 Paradis (prospective).",
  "numberOfSeasons": 3,
  "genre": ["Documentary", "Drama"],
  "inLanguage": "fr-FR",
  "productionCompany": {
    "@id": "https://mouvement-echo.fr/#organization"
  },
  "creator": {
    "@id": "https://mouvement-echo.fr/#jeremy-lasne"
  },
  "hasPart": [
    {
      "@type": "TVSeason",
      "@id": "https://mouvement-echo.fr/serie#saison-1",
      "name": "Saison 1 — Enfer",
      "seasonNumber": 1,
      "numberOfEpisodes": 11,
      "description": "Diagnostic des dysfonctionnements systemiques. Decryptage des crises ecologiques, sociales et economiques.",
      "partOfSeries": {
        "@id": "https://mouvement-echo.fr/serie#series"
      }
    },
    {
      "@type": "TVSeason",
      "@id": "https://mouvement-echo.fr/serie#saison-2",
      "name": "Saison 2 — Purgatoire",
      "seasonNumber": 2,
      "numberOfEpisodes": 11,
      "description": "Solutions concretes du terrain. Documentation des acteurs innovants et des alternatives viables.",
      "partOfSeries": {
        "@id": "https://mouvement-echo.fr/serie#series"
      }
    },
    {
      "@type": "TVSeason",
      "@id": "https://mouvement-echo.fr/serie#saison-3",
      "name": "Saison 3 — Paradis",
      "seasonNumber": 3,
      "numberOfEpisodes": 11,
      "description": "Prospective et imaginaires alternatifs. Projection vers les futurs souhaitables.",
      "partOfSeries": {
        "@id": "https://mouvement-echo.fr/serie#series"
      }
    }
  ]
}
```

### 5.4 /faq — FAQPage

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://mouvement-echo.fr/faq",
  "name": "Questions frequentes — Mouvement ECHO",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Qu'est-ce que le Mouvement ECHO ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Mouvement ECHO est une association citoyenne francaise (loi 1901) fondee en 2024 par Jeremy Lasne. Elle produit une serie documentaire de 33 episodes sur la transition ecologique et sociale, structuree en 3 saisons inspirees de la Divine Comedie de Dante, et developpe des plateformes numeriques d'apprentissage (CogniSphere) et de mise en reseau (ECHOLink)."
      }
    },
    {
      "@type": "Question",
      "name": "Combien d'episodes compte la serie ECHO ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La serie ECHO compte 33 episodes repartis en 3 saisons de 11 episodes chacune : Saison 1 Enfer (diagnostic des crises), Saison 2 Purgatoire (solutions du terrain), Saison 3 Paradis (prospective et imaginaires alternatifs)."
      }
    },
    {
      "@type": "Question",
      "name": "Qui a fonde ECHO ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Mouvement ECHO a ete fonde en 2024 par Jeremy Lasne, ancien cadre de grands groupes du CAC 40 reconverti dans l'innovation sociale et culturelle, base en region parisienne (Bougival, Yvelines)."
      }
    },
    {
      "@type": "Question",
      "name": "Quel est le lien entre ECHO et la Divine Comedie de Dante ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La serie ECHO est structuree en 3 actes inspires de la Divine Comedie de Dante Alighieri : Saison 1 correspond a l'Enfer (decryptage des dysfonctionnements), Saison 2 au Purgatoire (solutions concretes), Saison 3 au Paradis (projections vers des futurs souhaitables). Cette structure narrative en initiation guide le spectateur d'un etat de conscience des crises vers l'action."
      }
    },
    {
      "@type": "Question",
      "name": "ECHO est-il une association ou une entreprise ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Mouvement ECHO est une association loi 1901 a but non lucratif, declaree en France, dont le siege est a Bougival (78380). Une SASU existe en parallele pour les activites commerciales liees au projet."
      }
    },
    {
      "@type": "Question",
      "name": "Comment ECHO se finance-t-il ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Mouvement ECHO se finance par les dons des citoyens (trois niveaux : Graine a 10 euros, Racine a 50 euros, Canopee a partir de 100 euros), les partenariats et les candidatures a des programmes d'innovation sociale comme ChangeNOW."
      }
    },
    {
      "@type": "Question",
      "name": "Qu'est-ce que CogniSphere ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CogniSphere est une plateforme numerique d'apprentissage developpee par Mouvement ECHO qui utilise la repetition espacee (algorithme FSRS-5) pour transformer les contenus de la serie documentaire en connaissances durables. Elle est en cours de developpement."
      }
    },
    {
      "@type": "Question",
      "name": "Qu'est-ce que ECHOLink ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ECHOLink est un reseau numerique de mise en relation des acteurs du changement developpe par Mouvement ECHO. Il permet aux spectateurs de la serie de devenir acteurs en se connectant avec des porteurs de projets, des associations et des entrepreneurs sociaux. Il est en cours de developpement."
      }
    }
  ]
}
```

### 5.5 Pages episodes (template — a utiliser quand un episode est publie)

```json
{
  "@context": "https://schema.org",
  "@type": "TVEpisode",
  "@id": "https://mouvement-echo.fr/serie/saison-1/episode-1",
  "name": "[Titre de l'episode]",
  "episodeNumber": 1,
  "partOfSeason": {
    "@id": "https://mouvement-echo.fr/serie#saison-1"
  },
  "partOfSeries": {
    "@id": "https://mouvement-echo.fr/serie#series"
  },
  "description": "[Synopsis factuel en 2-3 phrases]",
  "datePublished": "[YYYY-MM-DD]",
  "duration": "[PTXXM]",
  "about": [
    {
      "@type": "DefinedTerm",
      "name": "[Thematique 1]"
    },
    {
      "@type": "DefinedTerm",
      "name": "[Thematique 2]"
    }
  ],
  "director": {
    "@type": "Person",
    "name": "[Nom du realisateur]"
  },
  "actor": [
    {
      "@type": "Person",
      "name": "[Nom de l'intervenant]",
      "jobTitle": "[Titre/Fonction]"
    }
  ],
  "productionCompany": {
    "@id": "https://mouvement-echo.fr/#organization"
  },
  "video": {
    "@type": "VideoObject",
    "name": "[Titre]",
    "description": "[Description]",
    "thumbnailUrl": "[URL]",
    "uploadDate": "[YYYY-MM-DD]",
    "contentUrl": "[URL YouTube]",
    "embedUrl": "[URL embed YouTube]"
  }
}
```

### 5.6 Breadcrumbs (sur chaque page)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://mouvement-echo.fr/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "[Nom de la section]",
      "item": "https://mouvement-echo.fr/[section]"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "[Nom de la page]",
      "item": "https://mouvement-echo.fr/[section]/[page]"
    }
  ]
}
```

### 5.7 Discipline de balisage — regles strictes

| Regle | Detail |
|-------|--------|
| **Ne jamais declarer ce qui n'existe pas** | Pas de TVEpisode sans episode publie, pas de Event sans evenement confirme |
| **Coherence balisage/contenu visible** | Tout ce qui est dans le JSON-LD doit etre visible sur la page |
| **Pas de numberOfEpisodes global** | Declarer numberOfEpisodes par saison (11) mais pas le total (33) tant que les episodes n'existent pas |
| **Statut explicite** | Utiliser des descriptions qui incluent "en developpement" ou "en production" quand applicable |
| **Validation systematique** | Tester chaque page avec Rich Results Test de Google et Schema Markup Validator avant deploiement |
| **Enrichissement progressif** | Ajouter les entites au fur et a mesure de leur existence reelle |

---

## 6. Strategie AI-readable / citation-ready

### 6.1 Principes de contenu citable

| Principe | Explication | Exemple |
|----------|-------------|---------|
| **Definition-first** | Premiere phrase = definition complete de l'entite | "Mouvement ECHO est une association citoyenne francaise (loi 1901) fondee en 2024..." |
| **Pas de pronoms orphelins** | Jamais "Nous sommes..." en premiere phrase | "Mouvement ECHO est..." (pas "Nous sommes un mouvement...") |
| **Assertions auto-suffisantes** | Chaque paragraphe peut etre extrait seul | Pas de reference a "ci-dessus" ou "comme mentionne" |
| **Faits > promesses** | Chiffres et dates plutot que superlatifs | "33 episodes sur 3 saisons" pas "une serie revolutionnaire" |
| **Statuts explicites** | Transparence sur l'etat reel | "En developpement (lancement S1 prevu 2026)" |
| **Densite factuelle** | Maximum de faits verifiables par phrase | Noms, dates, lieux, chiffres, statuts juridiques |
| **Questions reelles en FAQ** | Formuler comme un humain le demanderait a un LLM | "Qu'est-ce que le Mouvement ECHO ?" pas "En savoir plus" |
| **Snippets citation-ready** | Phrases pretes a etre citees par un LLM | "Selon Mouvement ECHO, la transition ecologique necessite trois leviers..." |

### 6.2 Structure de contenu par type de page

**Page /a-propos (page pivot) :**

```
[Resume executif — 3 phrases max, en haut de page]

[Fiche entite visible — donnees structurees en texte clair]
  Nom : Mouvement ECHO
  Type : Association loi 1901
  Fondation : 2024
  Siege : Bougival, France (78)
  Fondateur : Jeremy Lasne
  Site : mouvement-echo.fr

[Sections auto-suffisantes]
  ## Pourquoi ECHO existe
  ## Ce que fait ECHO concretement
  ## La methode : une structure narrative en 3 actes
  ## L'equipe
  ## Preuves et references
  ## Contact
```

**Page /serie :**

```
[Resume executif — fiche technique de la serie]
[Fiche technique visible : format, episodes, saisons, statut]
[Section par saison — 3 phrases factuelles chacune]
[Les 10 thematiques transversales — liste avec 1 phrase par theme]
```

**Pages /cognisphere et /echolink :**

```
[Premiere phrase = definition complete "What is X"]
[Comment ca marche — 3-5 phrases]
[A qui c'est destine — 1-2 phrases]
[Statut — en developpement / disponible]
```

**Page /faq :**

```
[Chaque reponse commence par une phrase complete autonome]
[Questions formulees comme un utilisateur les poserait a un LLM]
[Liens internes vers les pages concernees dans chaque reponse]
```

### 6.3 Meta descriptions optimisees

| Page | Meta description recommandee (max 155 car.) |
|------|---------------------------------------------|
| Home | "Mouvement ECHO : association citoyenne produisant une serie documentaire de 33 episodes sur la transition ecologique. Serie, CogniSphere, ECHOLink." |
| /a-propos | "Mouvement ECHO est une association loi 1901 fondee en 2024 par Jeremy Lasne. Mission, equipe, manifeste et vision du projet." |
| /serie | "Serie documentaire ECHO : 33 episodes en 3 saisons inspirees de Dante (Enfer, Purgatoire, Paradis). Ecologie, justice sociale, prospective." |
| /faq | "Questions frequentes sur Mouvement ECHO : association, serie documentaire, CogniSphere, ECHOLink, financement, equipe." |
| /cognisphere | "CogniSphere : plateforme d'apprentissage par repetition espacee (FSRS-5) liee a la serie ECHO. Transformez le visionnage en connaissances." |
| /echolink | "ECHOLink : reseau de mise en relation des acteurs du changement. Passez de spectateur a acteur de la transition ecologique." |
| /soutenir | "Soutenez Mouvement ECHO : dons a partir de 10 euros. Association loi 1901, serie documentaire, plateformes citoyennes." |
| /mouvement | "Le Mouvement ECHO : 7 etapes pour passer de la conscience a l'action. Rejoignez une communaute citoyenne engagee." |
| /contact | "Contactez Mouvement ECHO. Association loi 1901, Bougival (78). Formulaire de contact et informations." |

### 6.4 Fichier llms.txt (bilingue)

**Emplacement :** `frontend/public/llms.txt` (servi a la racine du domaine)

```markdown
# Mouvement ECHO

> Association citoyenne francaise (loi 1901) fondee en 2024 par Jeremy
> Lasne. Produit une serie documentaire de 33 episodes sur la transition
> ecologique et sociale, et developpe des plateformes numeriques
> d'apprentissage et de mise en reseau.

## Main links / Liens principaux

- [A propos / About](https://mouvement-echo.fr/a-propos): Presentation,
  mission, equipe, manifeste
- [La Serie / The Series](https://mouvement-echo.fr/serie): 33 episodes,
  3 saisons (Enfer/Purgatoire/Paradis), structure inspiree de Dante
- [CogniSphere](https://mouvement-echo.fr/cognisphere): Plateforme
  d'apprentissage par repetition espacee / Spaced repetition learning
  platform
- [ECHOLink](https://mouvement-echo.fr/echolink): Reseau de mise en
  relation des acteurs du changement / Changemaker networking platform
- [FAQ](https://mouvement-echo.fr/faq): Questions frequentes /
  Frequently asked questions
- [Contact](https://mouvement-echo.fr/contact): Formulaire de contact

## Key facts / Faits cles

- Legal status: French non-profit association (loi 1901)
- Headquarters: Bougival, France (78380)
- Founder: Jeremy Lasne
- Series: 33 episodes, 3 seasons, in development
- Themes: ecology, social justice, alternative economy, democracy,
  education, health, culture, technology, international, spirituality
- Platforms: CogniSphere (learning), ECHOLink (networking)
- Launch date: March 2026

## In English

Mouvement ECHO is a French citizen-led non-profit association (loi 1901)
founded in 2024 by Jeremy Lasne. It produces a 33-episode documentary
series on ecological and social transition, structured in 3 seasons
inspired by Dante's Divine Comedy: Season 1 (Inferno) diagnoses systemic
dysfunctions, Season 2 (Purgatorio) documents real-world solutions,
Season 3 (Paradiso) projects alternative futures. ECHO also develops
CogniSphere, a spaced-repetition learning platform linked to the series
content, and ECHOLink, a networking platform connecting changemakers.
```

### 6.5 Fichier robots.txt mis a jour

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /login
Disallow: /register
Disallow: /profil
Disallow: /mes-donnees
Disallow: /mon-compte

# AI crawlers — explicitly allowed
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Googlebot
Allow: /

Sitemap: https://mouvement-echo.fr/sitemap.xml
```

### 6.6 Strategie de pre-rendu

**Objectif :** servir du HTML statique avec contenu pour chaque page publique.

**Solution recommandee :** pre-rendu statique au build (vite-plugin-prerender ou script Puppeteer post-build).

**Pages a pre-rendre (12 pages) :**

```
/
/a-propos
/serie
/mouvement
/cognisphere
/echolink
/faq
/soutenir
/contact
/partenaires
/agenda
/ressources
```

**Pages a NE PAS pre-rendre :**

```
/login, /register, /forgot-password, /reset-password/*
/profil, /mes-donnees, /mon-compte/*
/admin, /admin/*
```

**Verification post-deploiement :**

Pour chaque URL pre-rendue, executer :
```bash
curl -s https://mouvement-echo.fr/[path] | grep "Mouvement ECHO"
```
Si la commande ne retourne rien, le pre-rendu ne fonctionne pas pour cette page.

### 6.7 Strategie video (YouTube + site)

**Modele hybride valide :**

| Element | Plateforme | Justification |
|---------|-----------|---------------|
| Episode complet | YouTube (upload natif) | Indexation YouTube, sous-titres auto, algorithme de decouverte |
| Page episode sur le site | mouvement-echo.fr/serie/saison-1/episode-N | Hub semantique, JSON-LD TVEpisode, contenu textuel enrichi (synopsis, intervenants, ressources) |
| Embed YouTube sur la page | Composant YouTubeEmbed existant | Le visiteur regarde sur le site, le SEO beneficie des deux |

**Regle :** chaque episode existe a la fois comme video YouTube ET comme page enrichie sur le site. Le site est le hub semantique, YouTube est le canal de distribution. Jamais YouTube seul sans page site.

---

## 7. Roadmap priorisee

### 7.1 Quick wins (J-5 a J+7) — Avant et juste apres le lancement

| # | Action | Type | Effort | Impact | Responsable |
|---|--------|------|--------|--------|-------------|
| 1 | Injecter JSON-LD Organization + WebSite dans index.html | Technique | 1h | CRITIQUE | Dev |
| 2 | Creer la page /a-propos avec contenu factuel structure | Editorial + Dev | 3h | CRITIQUE | Fondateur + Dev |
| 3 | Configurer Google Search Console pour mouvement-echo.fr | Technique | 30min | CRITIQUE | Fondateur |
| 4 | Configurer Bing Webmaster Tools | Technique | 30min | CRITIQUE | Fondateur |
| 5 | Mettre en place le pre-rendu statique des 12 pages publiques | Technique | 4h | BLOQUANT | Dev |
| 6 | Ajouter le composant SEO sur Cognisphere, ECHOLink, Events, Resources | Technique | 1h | IMPORTANT | Dev |
| 7 | Mettre a jour sitemap.xml avec toutes les pages publiques | Technique | 30min | IMPORTANT | Dev |
| 8 | Mettre a jour robots.txt avec directives crawlers IA | Technique | 15min | IMPORTANT | Dev |
| 9 | Ajouter JSON-LD FAQPage sur /faq | Technique | 1h | IMPORTANT | Dev |
| 10 | Creer le profil LinkedIn Organisation "Mouvement ECHO" | Autorite | 30min | IMPORTANT | Fondateur |
| 11 | Creer la fiche Google Business Profile | Autorite | 30min | IMPORTANT | Fondateur |
| 12 | Creer et deployer llms.txt bilingue | Technique | 30min | NICE-TO-HAVE | Dev |
| 13 | Ajouter meta canonical sur toutes les pages publiques | Technique | 1h | MODERE | Dev |
| 14 | Ajouter JSON-LD CreativeWorkSeries + TVSeason sur /serie | Technique | 1h | IMPORTANT | Dev |
| 15 | Ajouter des badges "en developpement" sur les sections non livrees | Editorial | 1h | IMPORTANT | Fondateur |
| 16 | Publier le premier post LinkedIn depuis le compte orga | Autorite | 1h | IMPORTANT | Fondateur |

### 7.2 Chantiers structurants (J+7 a J+90)

| # | Action | Type | Effort | Impact | Declencheur |
|---|--------|------|--------|--------|-------------|
| 17 | Creer la fiche IMDb "in development" pour la serie ECHO | Autorite | 2h | FORT | Immediatement apres lancement |
| 18 | Creer un stub Wikidata Q-item pour Mouvement ECHO | Autorite | 2h | FORT | Apres au moins 1 source tierce |
| 19 | Obtenir 3-5 articles de presse en ligne | Autorite | 20h (5h/sem × 4 sem) | CRITIQUE | Communique de lancement |
| 20 | Publier 1 article thought leadership LinkedIn/semaine | Autorite | 2h/sem | FORT | Immediat |
| 21 | Publier 1 article Medium/Substack/mois | Autorite | 4h/mois | MODERE | Apres lancement |
| 22 | Passer le repo GitHub en public (apres audit secrets) | Autorite | 2h (audit + README) | MODERE | J+2 |
| 23 | Ajouter breadcrumbs (composant + JSON-LD BreadcrumbList) | Technique | 3h | MODERE | J+14 |
| 24 | Mettre a jour les premieres phrases de chaque page (definition-first) | Editorial | 4h | FORT | J+7 |
| 25 | Enrichir la FAQ avec 15-20 questions optimisees LLM | Editorial | 4h | FORT | J+14 |
| 26 | Formaliser le partenariat EICAR (mention croisee site-a-site) | Autorite | Variable | FORT | Des que possible |
| 27 | Se faire inviter sur 2-3 podcasts francophone | Autorite | 5h (pitch + enregistrement) | FORT | J+30 |

### 7.3 Paris experimentaux (J+30 a J+18m)

| # | Action | Type | Effort | Impact potentiel | Risque |
|---|--------|------|--------|-----------------|--------|
| 28 | Creer les 10 pages piliers thematiques | Editorial + Dev | 30h total | TRES FORT a terme | Coquilles vides si pas assez de contenu |
| 29 | Creer les pages episodes (au rythme bi-mensuel) | Editorial + Dev | 2h/episode | FORT cumulatif | Depend de la production |
| 30 | Creer les parcours CogniSphere publics | Editorial + Dev | 20h+ | MODERE | Depend du dev de CogniSphere |
| 31 | Proposer une conference TEDx ou ChangeNOW | Autorite | 10h (preparation) | TRES FORT si accepte | Incertain |
| 32 | Soumettre a Wikipedia (article) | Autorite | 5h | TRES FORT | Risque de suppression si notoriete insuffisante |
| 33 | Experimentier les formats "citation-ready snippets" par thematique | Editorial | 10h | INCONNU | Experimental, pas de donnees fiables |
| 34 | Monitoring GEO systematique (protocole hebdomadaire) | Mesure | 1h/sem | INFORMATIF | Mesure artisanale, non fiable |

### 7.4 Calendrier synthetique

```
J-5 → J-0  : Quick wins techniques (#1-9) + page /a-propos (#2)
J-0        : LANCEMENT (20 mars 2026)
J+1 → J+7  : Quick wins autorite (#10-11, 16) + llms.txt (#12)
J+7 → J+14 : Breadcrumbs (#23) + FAQ enrichie (#25) + IMDb (#17)
J+14 → J+30: Premieres phrases (#24) + presse (#19) + thought leadership (#20)
J+30 → J+60: Pages thematiques (#28, les 3 premieres) + GitHub public (#22)
J+60       : Premier episode S1 prevu → premiere page TVEpisode (#29)
J+60 → J+90: Parcours CogniSphere (#30) + podcasts (#27) + Wikidata (#18)
J+90+      : Enrichissement continu au rythme des episodes
```

---

## 8. Recommandation argumentee finale avec arbitrages

### 8.1 L'arbitrage central : technique vs autorite vs contenu

La strategie repose sur trois piliers interdependants. Voici l'arbitrage de priorite :

```
AUTORITE EXTERNE (preuves, backlinks, mentions)
     ↑
     | Alimente
     |
CONTENU REEL (episodes, intervenants, ressources)
     ↑
     | Necessite
     |
FONDATION TECHNIQUE (pre-rendu, JSON-LD, sitemap)
```

**L'ordre est imperatif :** sans la fondation technique, le contenu est invisible. Sans contenu reel, l'autorite est impossible a construire. Sans autorite, le contenu n'est pas cite.

**Le facteur limitant actuel n'est ni la technique ni l'editorial — c'est la production des episodes.** Toute la strategie SEO/GEO a long terme repose sur l'hypothese que la Saison 1 sera effectivement produite et publiee au rythme bi-mensuel a partir de J+60.

### 8.2 Les 5 decisions strategiques cles

**Decision 1 : Pre-rendu statique, pas SSR**

Arbitrage : le pre-rendu statique au build est la solution la plus simple, la plus rapide a implementer et la plus compatible avec Firebase Hosting. Le SSR dynamique (Remix, Next.js) necessiterait une refonte architecturale. On garde le SPA React + pre-rendu statique. Si les limites du pre-rendu deviennent bloquantes (contenu dynamique trop frequent), on migrera vers SSR — mais pas avant J+180.

**Decision 2 : JSON-LD en dur dans index.html pour Organization/WebSite, via composant React pour le reste**

Arbitrage : le JSON-LD Organization et WebSite est global (meme sur toutes les pages) et doit etre present meme si React ne s'hydrate pas. Il va dans `<head>` de index.html en dur. Les JSON-LD specifiques par page (FAQPage, CreativeWorkSeries, TVEpisode, BreadcrumbList) sont generes par un composant React et seront captures par le pre-rendu statique. Cela centralise la logique dans le code React tout en garantissant que l'entite Organisation est toujours presente.

**Decision 3 : Niche semantique, pas requetes generiques**

Arbitrage : ECHO ne peut pas rivaliser avec Wikipedia, ADEME, Reporterre sur "transition ecologique". Mais ECHO peut posseder l'intersection "serie documentaire + transition ecologique + engagement citoyen + apprentissage". Toute la strategie de contenu cible cette niche. Les requetes generiques viendront naturellement avec l'autorite — mais on ne les cible pas activement.

**Decision 4 : YouTube pour la distribution, site pour la semantique**

Arbitrage : les episodes seront sur YouTube (visibilite, algorithme, sous-titres) ET auront une page dediee sur mouvement-echo.fr (JSON-LD, contenu textuel enrichi, maillage interne). Le site reste le hub semantique central. Cette strategie hybride maximise la visibilite (YouTube) et l'autorite semantique (site).

**Decision 5 : Transparence radicale sur le statut du projet**

Arbitrage : le site doit dire clairement "en developpement" la ou c'est le cas. Pas de balisage JSON-LD pour ce qui n'existe pas. Pas de page partenaire sans partenaire confirme. Pas d'episode sans episode produit. La transparence est un signal de credibilite plus fort que la promesse. Un projet qui dit "voila ce que nous construisons, voila ou nous en sommes" est plus citable qu'un projet qui pretend etre plus avance qu'il ne l'est.

### 8.3 Les 3 metriques de succes

A 90 jours, ECHO aura reussi sa strategie SEO/GEO si :

1. **Toutes les pages publiques sont indexees dans Google et Bing** (verifiable dans Search Console et Bing Webmaster Tools)
2. **Au moins 3 domaines externes mentionnent "Mouvement ECHO" avec un lien** (articles presse, podcasts, partenaires)
3. **La requete "Mouvement ECHO" dans Perplexity retourne une reponse factuellement correcte citant mouvement-echo.fr** (test manuel)

Si ces 3 conditions sont remplies, la fondation est posee. Le reste est une question de temps et de contenu.

### 8.4 Le risque existentiel (rappel)

Le risque principal n'est pas technique. Il est editorial. Si les episodes ne sont pas produits, le graphe semantique reste vide, l'autorite ne se construit pas, et le site reste un projet "en intention" — bien balise mais creux. La recommandation strategique la plus importante de ce document est : **produire le premier episode est plus important que toute optimisation technique.**

### 8.5 Ce que ce document ne couvre pas

- **Strategie de contenu detaillee** (redaction complete des pages) — a faire en phase d'implementation
- **Configuration technique detaillee** (code exact du pre-rendu, composants React) — a faire en phase de developpement
- **Strategie reseaux sociaux** (calendrier editorial, formats, frequence) — hors scope SEO/GEO
- **Strategie de financement** (modele economique, partenariats commerciaux) — hors scope
- **Mesure d'impact social** (indicateurs de transformation sociale) — hors scope

---

## Annexes

### A. Niveaux de certitude utilises dans ce document

| Niveau | Signification |
|--------|---------------|
| **CERTAIN** | Documente par Google/Bing/schema.org, consensus de l'industrie SEO |
| **PROBABLE** | Observe de maniere coherente, non documente officiellement |
| **EXPERIMENTAL** | Emergent, peu de donnees, potentiellement impactant |
| **SPECULATIF** | Hypothese non testee, risque de changement rapide |

### B. Outils recommandes (budget minimal)

| Outil | Usage | Cout |
|-------|-------|------|
| Google Search Console | Indexation, erreurs, impressions | Gratuit |
| Bing Webmaster Tools | Indexation Bing (alimente ChatGPT/Copilot) | Gratuit |
| Google Alerts | Surveillance des mentions "Mouvement ECHO" | Gratuit |
| Rich Results Test (Google) | Validation JSON-LD | Gratuit |
| Schema Markup Validator | Validation schema.org | Gratuit |
| Ubersuggest (version gratuite) | Suivi basique des positions | Gratuit |
| PageSpeed Insights | Performance web | Gratuit |

### C. Protocole de test GEO hebdomadaire

1. Ouvrir une session de navigation privee
2. Poser ces 4 requetes sur ChatGPT, Perplexity, Google AI Overview et Claude :
   - "Qu'est-ce que le Mouvement ECHO ?"
   - "Serie documentaire transition ecologique France"
   - "Projets citoyens innovants transition ecologique 2026"
   - "Association documentaire ecologie engagement citoyen"
3. Pour chaque reponse, documenter dans un tableur :
   - Date, plateforme, requete exacte
   - ECHO mentionne : oui/non
   - Si oui : quelle information est citee, source indiquee
   - Si non : quels projets sont cites a la place
4. Comparer avec la semaine precedente

### D. Checklist de deploiement J-0

- [ ] JSON-LD Organization + WebSite dans index.html
- [ ] Page /a-propos creee avec contenu factuel
- [ ] Pre-rendu statique des 12 pages publiques
- [ ] Composant SEO ajoute sur Cognisphere, ECHOLink, Events, Resources
- [ ] sitemap.xml mis a jour avec toutes les URLs publiques
- [ ] robots.txt mis a jour avec directives crawlers IA
- [ ] Meta canonical sur toutes les pages publiques
- [ ] Badges "en developpement" visibles sur les sections non livrees
- [ ] llms.txt deploye a la racine
- [ ] Google Search Console configure et sitemap soumis
- [ ] Bing Webmaster Tools configure et sitemap soumis
- [ ] Verification curl : chaque page pre-rendue retourne du HTML avec contenu
- [ ] Validation JSON-LD via Rich Results Test
- [ ] Test : curl -s mouvement-echo.fr/a-propos | grep "association"
- [ ] Test : curl -s mouvement-echo.fr/serie | grep "33 episodes"
- [ ] Test : curl -s mouvement-echo.fr/faq | grep "Mouvement ECHO"

---

*Document genere le 15 mars 2026. A reviser tous les 30 jours en fonction de l'avancement du projet.*
