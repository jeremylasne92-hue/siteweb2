# ECHO — Strategie SEO, GEO et Architecture Semantique

**Document de reference** — Version 2.0
**Date** : 15 mars 2026
**Statut** : Valide apres 13 rounds de co-construction strategique
**Auteurs** : Jeremy Lasne (fondateur) + Claude (strategie IA)

---

> **AVERTISSEMENT CRITIQUE — LIRE AVANT TOUT LE RESTE**
>
> Ce document est une **boite a outils**, pas un plan de bataille.
>
> La strategie SEO/GEO documentee ici est une **fondation passive necessaire
> mais ne sera pas le levier de croissance principal** d'ECHO. Le reseau humain
> direct (evenements, rencontres, projections) et la production de contenu video
> sont les leviers prioritaires. Le SEO/GEO ne generera quasiment rien en trafic
> dans les 12 premiers mois.
>
> **Ce qu'il faut faire avant le lancement : les 7 actions de fondation minimale
> (Bloc 0, ~8 heures de travail).** Puis fermer ce document et aller produire
> le premier episode.
>
> Le reste de cette boite a outils s'ouvrira au bon moment — quand le contenu
> existera pour alimenter la machine. Un episode pilote qui circule fait plus
> pour le SEO/GEO que tout le JSON-LD du monde.
>
> **Le risque principal n'est pas technique. Il est humain et editorial.**
> Voir le Bloc 9 pour le diagnostic complet.

---

## Table des matieres

0. [Fondation minimale — les 7 seules actions avant lancement](#0-fondation-minimale--les-7-seules-actions-avant-lancement)
1. [Diagnostic strategique](#1-diagnostic-strategique)
2. [Positionnement recommande](#2-positionnement-recommande)
3. [Architecture de site recommandee](#3-architecture-de-site-recommandee)
4. [Modele semantique et entites](#4-modele-semantique-et-entites)
5. [Plan de balisage JSON-LD par type de page](#5-plan-de-balisage-json-ld-par-type-de-page)
6. [Strategie AI-readable / citation-ready](#6-strategie-ai-readable--citation-ready)
7. [Roadmap priorisee et hierarchisee](#7-roadmap-priorisee-et-hierarchisee)
8. [Recommandation argumentee finale avec arbitrages](#8-recommandation-argumentee-finale-avec-arbitrages)
9. [Verdicts et verites inconfortables (rounds 11-13)](#9-verdicts-et-verites-inconfortables-rounds-11-13)

---

## 0. Fondation minimale — les 7 seules actions avant lancement

**Ce bloc est le seul qui doit etre execute avant le 20 mars 2026.**
Tout le reste du document est de la reference pour plus tard.

| # | Action | Temps | Impact | Qui |
|---|--------|-------|--------|-----|
| 1 | Injecter JSON-LD Organization + WebSite en dur dans `index.html` | 1h | Google et Bing savent qu'ECHO est une association loi 1901 qui produit une serie documentaire. Carte d'identite machine. | Dev |
| 2 | Creer la page `/a-propos` avec contenu factuel structure (definition-first, fiche entite visible, 6 sections auto-suffisantes) | 3h | Page pivot citable par les humains, les journalistes et les LLM. Sans elle, personne ne peut decrire ECHO correctement. | Fondateur + Dev |
| 3 | Corriger `sitemap.xml` (14 URLs publiques au lieu de 7) | 30min | Les crawlers decouvrent toutes les pages, pas la moitie. | Dev |
| 4 | Corriger `robots.txt` (autoriser GPTBot, ClaudeBot, PerplexityBot explicitement) | 15min | Ne pas bloquer activement les crawlers IA. | Dev |
| 5 | Ajouter `<link rel="canonical">` sur toutes les pages publiques | 1h | Evite toute confusion de contenu duplique, surtout si un pre-rendu est ajoute plus tard. | Dev |
| 6 | Ajouter le composant SEO sur les 4 pages manquantes (CogniSphere, ECHOLink, Events, Resources) | 1h | Meta title + description correctes partout. Ces 4 pages ont aujourd'hui les meta par defaut. | Dev |
| 7 | Configurer Google Search Console + Bing Webmaster Tools, soumettre le sitemap | 1h | Monitoring d'indexation. Savoir si les pages sont vues. Alertes en cas de probleme. | Fondateur |

**Total : 7h45. Une journee de travail.**

**Apres ces 7 actions : fermer ce document et aller produire le premier episode.**

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
| Zero backlink externe connu | Domain Authority ~0 | CRITIQUE (long terme) |
| Zero mention presse | Aucune source tierce citable | CRITIQUE (long terme) |
| Zero episode produit | Contenu central inexistant | **EXISTENTIEL** |
| Pas de profil LinkedIn organisation | Pas de signal social d'existence | IMPORTANT |
| Pas de fiche Google Business Profile | Pas de Knowledge Panel potentiel | IMPORTANT |
| Pas de Wikidata Q-item | Absent des graphes de connaissances mondiaux | IMPORTANT |
| Pas de fiche IMDb | Absent de la reference audiovisuelle mondiale | IMPORTANT |
| Sitemap incomplet (7 URLs sur 14+ pages publiques) | Pages non decouvertes par les crawlers | IMPORTANT |
| 4 pages sans composant SEO (Cognisphere, ECHOLink, Events, Resources) | Meta tags par defaut, pas de description specifique | MODERE |
| Pas de balises canonical | Risque de contenu duplique | MODERE |
| Pas de breadcrumbs | Pas de rich snippet navigation, hierarchie floue | MODERE |
| Pas de llms.txt | Pas de surface dediee aux agents IA | NICE-TO-HAVE |

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

**Lecons des projets similaires (Round 11) :** Aucun de ces projets n'a emerge par le SEO. Ils ont emerge par : (1) un contenu fort qui cree une emotion, (2) un reseau humain qui le propage, (3) un evenement declencheur qui cree le momentum. Demain = crowdfunding + Cannes. Blast = notoriete de Denis Robert + YouTube. On Est Pret = campagne virale + influenceurs.

**Consequence strategique :** le SEO/GEO est la fondation passive. Le levier de croissance reel est le reseau humain + le contenu video.

### 1.3 Le probleme fondamental

Le site ECHO est **techniquement invisible** pour les agents IA et **semantiquement non structure** pour les moteurs de recherche. Le contenu existe mais il est enferme dans un SPA React que seul un navigateur avec execution JavaScript peut lire.

Le levier le plus puissant n'est pas la creation de contenu (il existe deja) mais son **accessibilite technique** (pre-rendu HTML) et sa **structuration semantique** (JSON-LD). Mais ces leviers ne produiront des resultats qu'a partir du moment ou des sources tierces mentionneront ECHO.

### 1.4 Hierarchie des canaux de croissance (0-12 mois)

| Canal | Priorite reelle | Effort a investir |
|-------|----------------|-------------------|
| Reseau humain direct (evenements, rencontres, projections) | **#1** | 60% du temps |
| YouTube (episodes + contenus courts) | **#2** | 20% du temps |
| LinkedIn / reseaux sociaux (thought leadership) | **#3** | 10% du temps |
| SEO/GEO (fondation technique) | **#4** | 5% du temps (fait une fois, puis maintenance) |
| Presse / podcasts | **#5** | 5% du temps (opportuniste) |

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
- "projet alliant documentaire et engagement citoyen"
- "plateforme apprentissage transition ecologique"

**Requetes generiques (NE PAS cibler a court terme) :**
- "transition ecologique"
- "serie documentaire"
- "engagement citoyen"

### 2.3 Posture editoriale recommandee

Le positionnement ne doit etre ni neutre (impossible quand on parle de crises ecologiques) ni militant (reducteur et excluant). Il doit etre **documentaire** au sens fort : on montre, on ecoute, on structure, on laisse le spectateur se faire son opinion. Posture Depardon, pas Greenpeace.

| A faire | A eviter |
|---------|----------|
| "Cet episode documente comment [acteur] a transforme [lieu]" | "Cet episode denonce l'inaction de [institution]" |
| "Les intervenants presentent 3 approches contradictoires" | "La seule solution est [X]" |
| "Donnees : [source verifiable]" | "Tout le monde sait que..." |
| Montrer les tensions et les echecs | Storytelling uniquement positif |
| "Mouvement ECHO est une association..." | "Nous transformons le monde" |
| "33 episodes, 3 saisons, fondee en 2024" | "Revolutionnaire", "unique en son genre" |

### 2.4 Regle de communication a deux niveaux pour la structure Dante

La reference a Dante est un atout narratif puissant pour le storytelling humain et un facteur neutre pour les machines si on l'accompagne de sa traduction fonctionnelle.

| Contexte | Formulation |
|----------|-------------|
| **Pitch rapide** (meta description, JSON-LD, premiere phrase) | Fonctionnel d'abord : "3 saisons : diagnostic des crises, solutions du terrain, futurs souhaitables" |
| **Recit approfondi** (page /a-propos, interviews, dossier presse) | Dante comme cle narrative : "Structure comme un voyage initiatique inspire de la Divine Comedie..." |

**Regle stricte :** ne jamais ecrire "Saison 1 Enfer" sans ajouter "(diagnostic des crises)".

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

**Page a ajouter :**

```
/a-propos                         (NOUVELLE — page pivot "About" + manifeste)
```

### 3.3 Architecture recommandee — Phase 2 (J+30 a J+90)

**Pages episodiques (au rythme de publication bi-mensuel) :**

```
/serie/saison-1                       (Hub Saison 1 — TVSeason)
/serie/saison-1/episode-1             (Page episode — TVEpisode)
/serie/saison-1/episode-2
...
```

### 3.4 Architecture recommandee — Phase 3 (J+90 a J+18m)

**Pages piliers thematiques — uniquement quand le contenu existe :**

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
```

**Regles de maillage :**

| Regle | Implementation |
|-------|---------------|
| Chaque page a un lien vers sa page parente | Breadcrumb navigation |
| Chaque episode lie ses thematiques | Tags cliquables vers /thematiques/[slug] |
| Chaque thematique liste ses episodes | Section "Episodes lies" |
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
  │                         │               └── hasPart → TVEpisode (quand publies)
  │                         ├── hasPart → TVSeason : "S2 Purgatoire"
  │                         └── hasPart → TVSeason : "S3 Paradis"
  │
  ├── hasPart ──────────→ WebApplication : "CogniSphere"
  ├── hasPart ──────────→ WebApplication : "ECHOLink"
  │
  ├── mainEntityOfPage ─→ WebPage : mouvement-echo.fr
  └── sameAs ───────────→ LinkedIn, Wikidata, IMDb (quand crees)
```

### 4.2 Entites par niveau de priorite

**Niveau 1 — FONDATION MINIMALE (Bloc 0, avant lancement) :**

| Entite | Type schema.org | Page(s) |
|--------|----------------|---------|
| Mouvement ECHO | Organization + NGO | index.html (en dur) |
| Le site web | WebSite | index.html (en dur) |

**Niveau 2 — ENRICHISSEMENT (quand le pilote est en production) :**

| Entite | Type schema.org | Page(s) |
|--------|----------------|---------|
| La FAQ | FAQPage + Question/Answer | /faq |
| Serie ECHO | CreativeWorkSeries | /serie |
| 3 Saisons | TVSeason | /serie |
| Jeremy Lasne | Person | /a-propos |
| Breadcrumbs | BreadcrumbList | Toutes |

**Niveau 3 — AMPLIFICATION (quand le premier episode est publie) :**

| Entite | Type schema.org | Declencheur |
|--------|----------------|-------------|
| Episodes | TVEpisode | Publication de l'episode |
| Videos | VideoObject | Publication YouTube |
| Intervenants | Person | Confirmation |
| Partenaires | Organization + partner | Partenariat signe |
| Evenements | Event | Evenement confirme |

---

## 5. Plan de balisage JSON-LD par type de page

### 5.1 index.html — Organization + WebSite (FONDATION MINIMALE)

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
        "Engagement citoyen"
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

### 5.2 /a-propos — AboutPage (FONDATION MINIMALE)

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

### 5.3 /serie — CreativeWorkSeries + TVSeason (ENRICHISSEMENT)

```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWorkSeries",
  "@id": "https://mouvement-echo.fr/serie#series",
  "name": "ECHO",
  "alternateName": "ECHO — La Serie",
  "description": "Serie documentaire de 33 episodes en 3 saisons : S1 Enfer (diagnostic des crises), S2 Purgatoire (solutions du terrain), S3 Paradis (futurs souhaitables). Structure inspiree de la Divine Comedie de Dante.",
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
      "name": "Saison 1 — Enfer (diagnostic des crises)",
      "seasonNumber": 1,
      "numberOfEpisodes": 11,
      "description": "Diagnostic des dysfonctionnements systemiques. Decryptage des crises ecologiques, sociales et economiques.",
      "partOfSeries": { "@id": "https://mouvement-echo.fr/serie#series" }
    },
    {
      "@type": "TVSeason",
      "@id": "https://mouvement-echo.fr/serie#saison-2",
      "name": "Saison 2 — Purgatoire (solutions du terrain)",
      "seasonNumber": 2,
      "numberOfEpisodes": 11,
      "description": "Solutions concretes du terrain. Documentation des acteurs innovants et des alternatives viables.",
      "partOfSeries": { "@id": "https://mouvement-echo.fr/serie#series" }
    },
    {
      "@type": "TVSeason",
      "@id": "https://mouvement-echo.fr/serie#saison-3",
      "name": "Saison 3 — Paradis (futurs souhaitables)",
      "seasonNumber": 3,
      "numberOfEpisodes": 11,
      "description": "Prospective et imaginaires alternatifs. Projection vers les futurs souhaitables.",
      "partOfSeries": { "@id": "https://mouvement-echo.fr/serie#series" }
    }
  ]
}
```

### 5.4 /faq — FAQPage (ENRICHISSEMENT)

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
        "text": "ECHOLink est un reseau numerique de mise en relation des acteurs du changement developpe par Mouvement ECHO. Il permet aux spectateurs de la serie de se connecter avec des porteurs de projets, des associations et des entrepreneurs sociaux. Il est en cours de developpement."
      }
    }
  ]
}
```

### 5.5 Pages episodes — template (AMPLIFICATION)

**A utiliser uniquement quand un episode est publie ET a passe la porte de qualite (voir Bloc 9).**

```json
{
  "@context": "https://schema.org",
  "@type": "TVEpisode",
  "@id": "https://mouvement-echo.fr/serie/saison-1/episode-1",
  "name": "[Titre de l'episode]",
  "episodeNumber": 1,
  "partOfSeason": { "@id": "https://mouvement-echo.fr/serie#saison-1" },
  "partOfSeries": { "@id": "https://mouvement-echo.fr/serie#series" },
  "description": "[Synopsis factuel en 2-3 phrases]",
  "datePublished": "[YYYY-MM-DD]",
  "duration": "[PTXXM]",
  "about": [
    { "@type": "DefinedTerm", "name": "[Thematique 1]" },
    { "@type": "DefinedTerm", "name": "[Thematique 2]" }
  ],
  "director": { "@type": "Person", "name": "[Nom]" },
  "actor": [
    { "@type": "Person", "name": "[Nom]", "jobTitle": "[Fonction]" }
  ],
  "productionCompany": { "@id": "https://mouvement-echo.fr/#organization" },
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

### 5.6 Breadcrumbs — template (ENRICHISSEMENT)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://mouvement-echo.fr/" },
    { "@type": "ListItem", "position": 2, "name": "[Section]", "item": "https://mouvement-echo.fr/[section]" },
    { "@type": "ListItem", "position": 3, "name": "[Page]", "item": "https://mouvement-echo.fr/[section]/[page]" }
  ]
}
```

### 5.7 Discipline de balisage — regles strictes

| Regle | Detail |
|-------|--------|
| **Ne jamais declarer ce qui n'existe pas** | Pas de TVEpisode sans episode publie, pas de Event sans evenement confirme |
| **Coherence balisage/contenu visible** | Tout ce qui est dans le JSON-LD doit etre visible sur la page |
| **Statut explicite** | Utiliser des descriptions qui incluent "en developpement" ou "en production" quand applicable |
| **Validation systematique** | Tester chaque page avec Rich Results Test et Schema Markup Validator avant deploiement |
| **Porte de qualite pour les episodes** | Ne jamais publier un TVEpisode + VideoObject avant validation qualitative (voir Bloc 9.4) |

---

## 6. Strategie AI-readable / citation-ready

### 6.1 Principes de contenu citable

| Principe | Explication |
|----------|-------------|
| **Definition-first** | Premiere phrase = definition complete de l'entite. "Mouvement ECHO est..." |
| **Pas de pronoms orphelins** | Jamais "Nous sommes..." en premiere phrase |
| **Assertions auto-suffisantes** | Chaque paragraphe peut etre extrait seul |
| **Faits > promesses** | Chiffres et dates plutot que superlatifs |
| **Statuts explicites** | Transparence sur l'etat reel ("en developpement") |
| **Densite factuelle** | Maximum de faits verifiables par phrase |
| **Questions reelles en FAQ** | Formuler comme un humain le demanderait a un LLM |

### 6.2 Structure de contenu — page /a-propos (page pivot)

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

### 6.3 Meta descriptions optimisees

| Page | Meta description (max 155 car.) |
|------|-------------------------------|
| Home | "Mouvement ECHO : association citoyenne produisant une serie documentaire de 33 episodes sur la transition ecologique. Serie, CogniSphere, ECHOLink." |
| /a-propos | "Mouvement ECHO est une association loi 1901 fondee en 2024 par Jeremy Lasne. Mission, equipe, manifeste et vision du projet." |
| /serie | "Serie documentaire ECHO : 33 episodes en 3 saisons inspirees de Dante (Enfer, Purgatoire, Paradis). Ecologie, justice sociale, prospective." |
| /faq | "Questions frequentes sur Mouvement ECHO : association, serie documentaire, CogniSphere, ECHOLink, financement, equipe." |
| /cognisphere | "CogniSphere : plateforme d'apprentissage par repetition espacee (FSRS-5) liee a la serie ECHO. Transformez le visionnage en connaissances." |
| /echolink | "ECHOLink : reseau de mise en relation des acteurs du changement. Passez de spectateur a acteur de la transition ecologique." |
| /soutenir | "Soutenez Mouvement ECHO : dons a partir de 10 euros. Association loi 1901, serie documentaire, plateformes citoyennes." |
| /mouvement | "Le Mouvement ECHO : 7 etapes pour passer de la conscience a l'action. Rejoignez une communaute citoyenne engagee." |
| /contact | "Contactez Mouvement ECHO. Association loi 1901, Bougival (78). Formulaire de contact et informations." |

### 6.4 Fichier llms.txt (REPORTER A J+90)

**Emplacement futur :** `frontend/public/llms.txt`

```markdown
# Mouvement ECHO

> Association citoyenne francaise (loi 1901) fondee en 2024 par Jeremy
> Lasne. Produit une serie documentaire de 33 episodes sur la transition
> ecologique et sociale, et developpe des plateformes numeriques
> d'apprentissage et de mise en reseau.

## Liens principaux / Main links

- [A propos](https://mouvement-echo.fr/a-propos): Mission, equipe, manifeste
- [La Serie](https://mouvement-echo.fr/serie): 33 episodes, 3 saisons
- [CogniSphere](https://mouvement-echo.fr/cognisphere): Apprentissage par repetition espacee
- [ECHOLink](https://mouvement-echo.fr/echolink): Reseau d'acteurs du changement
- [FAQ](https://mouvement-echo.fr/faq): Questions frequentes
- [Contact](https://mouvement-echo.fr/contact): Formulaire de contact

## Key facts

- Legal status: French non-profit (loi 1901)
- Headquarters: Bougival, France (78380)
- Founder: Jeremy Lasne
- Series: 33 episodes, 3 seasons, in development
- Launch date: March 2026
```

### 6.5 Fichier robots.txt mis a jour (FONDATION MINIMALE)

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

### 6.6 Strategie de pre-rendu (ENRICHISSEMENT — quand le pilote est en production)

**Solution recommandee :** pre-rendu statique au build (vite-plugin-prerender ou script Puppeteer post-build).

**Pages a pre-rendre :** les 12 pages publiques (pas les pages auth/admin).

**Verification post-deploiement :**
```bash
curl -s https://mouvement-echo.fr/[path] | grep "Mouvement ECHO"
```

**Note :** le pre-rendu est important mais pas bloquant au lancement. Google finit par crawler les SPA. Les crawlers IA n'ont rien a chercher sur ECHO tant qu'il n'y a pas de source tierce. Reporter a la phase ENRICHISSEMENT.

### 6.7 Strategie video (YouTube + site)

| Element | Plateforme | Justification |
|---------|-----------|---------------|
| Episode complet | YouTube (upload natif) | Indexation YouTube, sous-titres auto, algorithme |
| Page episode sur le site | mouvement-echo.fr/serie/saison-1/episode-N | Hub semantique, JSON-LD, contenu textuel enrichi |
| Embed YouTube sur la page | Composant YouTubeEmbed existant | Le visiteur regarde sur le site |

**Regle :** chaque episode existe a la fois comme video YouTube ET comme page enrichie sur le site. Jamais YouTube seul sans page site.

---

## 7. Roadmap priorisee et hierarchisee

### 7.1 FONDATION MINIMALE (J-5 a J-0 — avant lancement — 8h)

**Voir Bloc 0 pour le detail des 7 actions.** C'est la seule phase obligatoire.

### 7.2 ENRICHISSEMENT (quand le pilote est en production)

| # | Action | Effort | Declencheur |
|---|--------|--------|-------------|
| 8 | JSON-LD FAQPage sur /faq | 1h | Apres fondation |
| 9 | JSON-LD CreativeWorkSeries + TVSeason sur /serie | 1h | Apres fondation |
| 10 | Pre-rendu statique des 12 pages publiques | 4h | Quand pilote en production |
| 11 | Breadcrumbs (composant + JSON-LD BreadcrumbList) | 3h | J+14 |
| 12 | Mettre a jour les premieres phrases de chaque page (definition-first) | 4h | J+7 |
| 13 | Enrichir la FAQ avec 15-20 questions optimisees | 4h | J+14 |
| 14 | Badges "en developpement" visibles partout | 1h | J-0 |
| 15 | Profil LinkedIn Organisation | 30min | Quand il y a quelque chose a poster |

### 7.3 AMPLIFICATION (quand le premier episode est publie)

| # | Action | Effort | Declencheur |
|---|--------|--------|-------------|
| 16 | Premiere page TVEpisode avec VideoObject | 2h | Publication episode 1 |
| 17 | llms.txt bilingue deploye a la racine | 30min | J+90 minimum |
| 18 | Creer la fiche IMDb "in development" | 2h | Apres lancement |
| 19 | Google Business Profile | 30min | Apres lancement |
| 20 | Pages piliers thematiques (les 3 premieres) | 10h | Apres 3e episode |
| 21 | Parcours CogniSphere publics | 20h | Quand CogniSphere est pret |

### 7.4 AUTORITE (quand des sources tierces existent)

| # | Action | Effort | Declencheur |
|---|--------|--------|-------------|
| 22 | Obtenir 3-5 articles de presse en ligne | 20h | Communique de lancement |
| 23 | Thought leadership LinkedIn (1/semaine) | 2h/sem | Immediat |
| 24 | Se faire inviter sur 2-3 podcasts | 5h | J+30 |
| 25 | Fiche Wikidata Q-item | 2h | Quand au moins 1 source tierce |
| 26 | Formaliser le partenariat EICAR (mention croisee) | Variable | Des que possible |
| 27 | Passer le repo GitHub en public | 2h | Apres audit secrets |
| 28 | Soumettre a Wikipedia | 5h | Quand notoriete suffisante |

### 7.5 Calendrier synthetique

```
J-5 → J-0  : FONDATION MINIMALE (#1-7, 8h de travail)
J-0        : LANCEMENT (20 mars 2026)
J+1 → J+60 : PRODUIRE LE PREMIER EPISODE (priorite absolue)
J+7 → J+14 : ENRICHISSEMENT (si temps disponible, en parallele)
J+60       : Premier episode publie → AMPLIFICATION
J+60+      : Enrichissement continu au rythme des episodes
J+90+      : AUTORITE (quand sources tierces existent)
```

---

## 8. Recommandation argumentee finale avec arbitrages

### 8.1 Les 5 decisions strategiques cles

**Decision 1 : Pre-rendu statique, pas SSR**

Le pre-rendu statique au build est la solution la plus simple et la plus compatible avec Firebase Hosting. Pas de refonte architecturale. Reporter a la phase ENRICHISSEMENT.

**Decision 2 : JSON-LD en dur pour Organization/WebSite, via React pour le reste**

Le JSON-LD Organization et WebSite va dans `<head>` de index.html en dur. Les JSON-LD specifiques par page sont generes par un composant React et seront captures par le pre-rendu statique.

**Decision 3 : Niche semantique, pas requetes generiques**

ECHO ne peut pas rivaliser avec Wikipedia, ADEME, Reporterre sur "transition ecologique". ECHO possede l'intersection "serie documentaire + transition ecologique + engagement citoyen + apprentissage". Les requetes generiques viendront avec l'autorite.

**Decision 4 : YouTube pour la distribution, site pour la semantique**

Episodes sur YouTube (visibilite, algorithme, sous-titres) ET page dediee sur mouvement-echo.fr (JSON-LD, contenu textuel enrichi, maillage interne).

**Decision 5 : Transparence radicale sur le statut du projet**

Le site dit clairement "en developpement" la ou c'est le cas. Pas de balisage JSON-LD pour ce qui n'existe pas. La transparence est un signal de credibilite plus fort que la promesse.

### 8.2 Le vrai indicateur de succes a 6 mois

**"Combien de personnes ont regarde un episode ECHO ET fait une action ensuite (don, inscription, partage, contact partenaire) ?"**

C'est le seul indicateur qui prouve simultanement que le contenu existe, qu'il est bon, qu'il cree de l'engagement, et que la plateforme convertit.

Un evaluateur ChangeNOW ne regardera pas le JSON-LD. Il regardera : combien d'episodes produits, combien de vues, combien d'actions post-visionnage.

Les 3 metriques SEO/GEO sont des **indicateurs de fondation** (pas de croissance) :

1. Toutes les pages publiques indexees dans Google et Bing
2. Au moins 3 domaines externes mentionnent "Mouvement ECHO" avec un lien
3. La requete "Mouvement ECHO" dans Perplexity retourne une reponse factuelle citant mouvement-echo.fr

### 8.3 L'arbitrage central

```
AUTORITE EXTERNE (preuves, backlinks, mentions)
     ↑ Alimente
CONTENU REEL (episodes, intervenants, ressources)
     ↑ Necessite
FONDATION TECHNIQUE (JSON-LD, sitemap, robots.txt)
```

Sans la fondation technique, le contenu est invisible.
Sans contenu reel, l'autorite est impossible.
Sans autorite, le contenu n'est pas cite.

**Le facteur limitant actuel n'est ni la technique ni l'editorial — c'est la production des episodes.**

---

## 9. Verdicts et verites inconfortables (rounds 11-13)

### 9.1 Le SEO/GEO est-il le bon cadre pour ECHO ?

**C'est la bonne strategie, mais a la mauvaise dose.** Ce document est une encyclopedie de reference pour 18 mois, alors qu'ECHO a besoin d'une ordonnance de 7 actions pour les 5 prochains jours — et le reste de son energie doit aller a produire un episode pilote.

Le SEO/GEO ne generera quasiment rien en trafic dans les 12 premiers mois. Le cout de la fondation technique est tres faible (~8h). Le vrai risque n'est pas de faire le SEO/GEO — c'est de croire que c'est suffisant.

### 9.2 Le cadre GEO est-il premature ?

**Oui pour la decouverte (personne ne cherche ECHO dans un LLM). Non pour la description (quand un LLM parlera d'ECHO, la qualite du contenu source determinera la qualite de la reponse).**

Le llms.txt et le protocole de test GEO hebdomadaire sont reportes a J+90. Le contenu definition-first et la FAQ factuelle restent en phase FONDATION car ils servent aussi les visiteurs humains.

### 9.3 La structure Dante est-elle un atout ou un handicap ?

**Atout narratif puissant, facteur neutre pour les machines si on l'accompagne de sa traduction fonctionnelle.** Ne jamais ecrire "Saison 1 Enfer" sans ajouter "(diagnostic des crises)". Le pitch rapide est fonctionnel, le recit approfondi utilise Dante.

### 9.4 Porte de qualite pour les episodes

**Regle critique :** ne jamais publier une page TVEpisode avec VideoObject tant que l'episode n'a pas passe un seuil de validation qualitative.

**Protocole :**
1. L'episode sort sur YouTube en "non repertorie"
2. Montre a 10-20 personnes de confiance
3. Retours collectes
4. Si consensus positif → page balisee publiee
5. Si "pas pret" → retravail avant de brancher la machine SEO

Le JSON-LD est un amplificateur. On ne branche l'amplificateur que quand on est sur de ce qu'on amplifie. Un episode mediocre bien balise est pire que pas d'episode.

### 9.5 Le risque de "SEO theater"

Le risque existe : perfectionner l'emballage pendant que le produit n'existe pas. Les 34 actions de la roadmap complete representent ~80-100 heures. C'est pourquoi le document est restructure en 4 phases avec seulement 7 actions obligatoires avant le lancement.

**Test de realite :** un episode pilote qui circule dans les reseaux militants fait plus pour le SEO/GEO que toute l'infrastructure semantique de ce document.

### 9.6 La verite inconfortable : le probleme du fondateur solo

Tout repose sur une seule personne. La vision, la production, le developpement, les partenariats, le contenu, la strategie. La question qu'on n'a jamais posee dans 13 rounds de strategie SEO/GEO : **qui va faire tout ca ?**

Les 7 actions de fondation minimale sont faisables (8h). Mais produire un episode pilote de qualite professionnelle, c'est des semaines de travail : recherche, reperage, contacts intervenants, tournage, montage, sound design, etalonnage, sous-titrage.

Le risque reel est que la strategie SEO/GEO devienne un refuge confortable — parce que c'est plus rassurant de peaufiner un sitemap que de se confronter a la difficulte de produire un documentaire.

**Recommandation la plus importante de tout ce document :** trouver 1-2 co-equipiers qui prennent en charge des pans entiers du projet (realisateur/monteur, community manager) pour que le fondateur se concentre sur ce que lui seul peut faire — la vision, les contacts, le recit.

Si ECHO est encore un projet solo en septembre 2026, toute la strategie SEO/GEO du monde n'y changera rien.

### 9.7 Ce que ce document ne couvre pas

- Strategie de contenu detaillee (redaction des pages) — a faire en phase d'implementation
- Configuration technique detaillee (code exact) — a faire en phase de developpement
- Strategie reseaux sociaux (calendrier editorial) — hors scope
- Strategie de financement — hors scope
- Mesure d'impact social — hors scope
- Recrutement de l'equipe — hors scope mais critique

---

## Annexes

### A. Outils recommandes (budget minimal)

| Outil | Usage | Cout |
|-------|-------|------|
| Google Search Console | Indexation, erreurs, impressions | Gratuit |
| Bing Webmaster Tools | Indexation Bing (ChatGPT/Copilot) | Gratuit |
| Google Alerts | Surveillance des mentions | Gratuit |
| Rich Results Test (Google) | Validation JSON-LD | Gratuit |
| Schema Markup Validator | Validation schema.org | Gratuit |
| PageSpeed Insights | Performance web | Gratuit |

### B. Protocole de test GEO (a demarrer a J+90)

1. Navigation privee, 4 requetes sur ChatGPT, Perplexity, Google AI Overview, Claude :
   - "Qu'est-ce que le Mouvement ECHO ?"
   - "Serie documentaire transition ecologique France"
   - "Projets citoyens innovants transition ecologique 2026"
   - "Association documentaire ecologie engagement citoyen"
2. Documenter : date, plateforme, ECHO mentionne oui/non, information citee, source
3. Comparer avec la semaine precedente

### C. Checklist de deploiement J-0 (fondation minimale uniquement)

- [ ] JSON-LD Organization + WebSite dans index.html
- [ ] Page /a-propos creee avec contenu factuel
- [ ] sitemap.xml mis a jour avec toutes les URLs publiques
- [ ] robots.txt mis a jour avec directives crawlers IA
- [ ] Meta canonical sur toutes les pages publiques
- [ ] Composant SEO ajoute sur CogniSphere, ECHOLink, Events, Resources
- [ ] Google Search Console configure et sitemap soumis
- [ ] Bing Webmaster Tools configure et sitemap soumis
- [ ] Validation JSON-LD via Rich Results Test

---

*Document genere le 15 mars 2026 (v1.0), mis a jour le 15 mars 2026 (v2.0 — integration des verdicts rounds 11-13). A reviser tous les 30 jours en fonction de l'avancement du projet.*
