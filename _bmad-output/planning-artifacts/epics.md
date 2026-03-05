---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
---

# sitewebecho by emergent - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for sitewebecho by emergent, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Les visiteurs peuvent créer un compte via OAuth (Google).
FR2: Les utilisateurs peuvent se connecter via email/mot de passe avec validation de format.
FR3: Les utilisateurs isolés (mot de passe oublié) peuvent le réinitialiser via un lien sécurisé envoyé par email.
FR4: Le système intègre une case à cocher stipulant l'âge (>15 ans ou accord parental) lors de l'inscription pour conformité RGPD.
FR5: Les visiteurs non connectés ne peuvent pas accéder aux formulaires d'alertes (lead gen) ni à l'espace membre, mais voient systématiquement une incitation à l'action invitant à rejoindre le Mouvement.
FR6: Les visiteurs peuvent visionner la bande-annonce de la série sans créer de compte (lecteur média externe intégré).
FR7: Le système affiche "Bientôt disponible" ou une étiquette spécifique sur les Épisodes 1 à 5 qui n'entreront en production qu'en septembre 2026.
FR8: Les visiteurs peuvent cliquer sur les cartes "Épisodes 1 à 5" pour afficher une modale (ou pop-up/page) décrivant le titre, le synopsis et les thématiques couvertes.
FR9: Les utilisateurs inscrits peuvent s'inscrire aux notifications/alertes email concernant la future sortie (Automne 2026) des épisodes de la Saison 1.
FR10: Les visiteurs peuvent consulter la carte interactive ou la liste ECHOSystem affichant l'ensemble des partenaires actuels et validés.
FR11: Les candidats partenaires peuvent remplir un "Formulaire de Candidature" complet (incluant coordonnées, description, localisation géographique, et upload d'un fichier image Logo).
FR12: Le système envoie un email transactionnel récapitulatif ("Demande reçue") au candidat partenaire lors de la soumission de sa candidature.
FR13: Le système envoie un email d'alerte à l'adresse de contact interne Mouvement ECHO pour chaque nouvelle candidature partenaire reçue.
FR14: Les partenaires ayant un compte peuvent consulter le statut actuel de leur candidature (ex : "En cours d'étude", "Validé") dans un Tableau de Bord Membre (Dashboard).
FR15: Les partenaires peuvent accéder via leur menu à un bouton ou widget (embed/URL redirect) "Prendre Rendez-vous" pointant vers l'agenda Google du Mouvement.
FR16: Les visiteurs publics de la page ECHOSystem peuvent cliquer sur le bouton "Visiter le site" de chaque partenaire individuel pour ouvrir leur URL dans un nouvel onglet.
FR17: Les développeurs ou technophiles intéressés peuvent soumettre leur profil via les formulaires de candidature spécifiques aux projets CogniSphère et ECHOLink.
FR18: Tous les formulaires de collecte (recrutement tech et partenaires) intègrent une vérification anti-spam basique frontend/backend.
FR19: Toute section appelant au don financier (ex: "Soutenir le Mouvement") propose au clic un ou plusieurs liens de redirection HTTPS sortants vers les prestataires retenus par l'association (ex: Campagne HelloAsso).
FR20: Les utilisateurs détenant le rôle "Administrateur" (via vérification stricte en Base de Données) détiennent de manière exclusive l'accès au Panel d'Administration (Dashboard Admin).
FR21: Les Administrateurs peuvent basculer le statut d'un partenaire candidat de "En Attente" à "Approuvé" dans l'interface CRUD du Panel d'Administration, déclenchant son affichage public immédiat.
FR22: Les Administrateurs peuvent modifier, supprimer ou mettre en avant (ordre d'affichage préférentiel) les partenaires existants.
FR23: Les Administrateurs peuvent créer, supprimer ou modifier les textes, statuts et dates des événements publiés dans l'Agenda public ("Épisodes IRL" ou projections).
FR24: Les Administrateurs peuvent exporter et/ou visualiser toute la base email des utilisateurs inscrits ayant coché leur consentement aux campagnes d'information liées à la série.

### NonFunctional Requirements

NFR-Perf-1 (Temps d'Interaction) : TTI < 3 secondes sur connexion mobile 4G.
NFR-Perf-2 (Feedback Formulaires) : Retour visuel (loader/succès/erreur) en < 1.5 seconde.
NFR-Perf-3 (Budget Poids) : Bundle JS compressé initial (Gzip/Brotli) < 300 Ko. Pas d'iframe vidéo externe bloquant le main thread (Lazy loading).
NFR-Sec-1 (Cryptographie) : Mots de passe utilisateurs hashés avec sel (ex: bcrypt/Argon2).
NFR-Sec-2 (Headers & CORS) : Politique stricte CORS (domaine frontend uniquement).
NFR-Sec-3 (Vérification Uploads) : Blocage strict des fichiers > 2 Mo. Vérification MIME Type backend (ex: via Pillow, pas seulement le suffixe).
NFR-Sec-4 (Rate Limiting) : Seuils de ~5 requêtes par IP/min sur endpoints d'inscription/contact.
NFR-Scale-1 (Capacité de Charge) : Soutenir des pics soudains de 2000 requêtes simultanées sans excéder 20% dégradation du TTI (Uptime 99.5%).
NFR-Scale-2 (Mise en Cache API) : Stockage Cache-mémoire backend (TTL > 5 min) sur les endpoints intensifs (ex: liste partenaires, agenda).

### Additional Requirements

- Le projet est "Brownfield" (Existant React/Vite + FastAPI). Continuer depuis la codebase existante plutôt que partir from scratch. (Impact majeur : Epic 1 Story 1).
- Frontend State Management: Zustands v5.0 pour le statut Global (Session), React Query (TanStack Query v5) pour l'API caching.
- Validation: React Hook Form v7.71 + Zod v4.3 avec mapping direct sur les schémas Pydantic.
- Styling: Tailwind CSS v4 avec les tokens (echo-*) existants.
- Backend DB: Motor (MongoDB) centralisé via singleton core.
- Architecture Backend: Service Pattern imposé. Les routes HTTP n'ont aucune logique, elles injectent des services via `Depends(get_service)`.
- Stockage Image: Localisé dans le path sécurisé `backend/uploads/` pour la validation image.
- Conventions: Collection MongoDB (lowercase_plural), Python (snake_case), Composants React (PascalCase), Variables/états (camelCase), API endpoints (/api/kebab-case).
- Réponse d'Erreurs : Backend retourne toujours {"detail": "..."} via FastAPI, masquant impérativement les stacktraces (Erreurs HTTP 500).
- Notifications email: Utilisation de la librairie native de SendGrid ou Mailjet en python plutôt qu'un log dans le terminal.
- Organisation Répertoires : Frontend structuré en "features" module (ex: src/features/partners, src/pages/admin/partners).

### FR Coverage Map

FR1: Epic 1 - Inscription OAuth
FR2: Epic 1 - Connexion standard
FR3: Epic 1 - Mot de passe oublié
FR4: Epic 1 - Conformité RGPD âge
FR5: Epic 1 - Accès restreint/Incitation
FR6: Epic 2 - Lecteur bande-annonce
FR7: Epic 2 - Statut teasers épisodes non sortis
FR8: Epic 2 - Modale d'informations épisodes
FR9: Epic 2 - Opt-in notifications sorties
FR10: Epic 3 - Listing et Map partenaires
FR11: Epic 3 - Formulaire de candidature complet
FR12: Epic 3 - Email transactionnel candidat
FR13: Epic 3 - Email alerte équipe
FR14: Epic 3 - Dashboard candidat (statut)
FR15: Epic 3 - Widget prise de RDV (Calendar)
FR16: Epic 3 - External Link "Visiter le site"
FR17: Epic 2 - Formulaires candidatures Tech
FR18: Epic 2 & 3 - Sécurité Anti-spam
FR19: Epic 2 - Liens dons HTTPS
FR20: Epic 4 - Accès restreint Admin
FR21: Epic 4 - Modération CRUD Partenaires
FR22: Epic 4 - Édition/Mise en avant Partenaires
FR23: Epic 4 - Modération CRUD Événements/Agenda
FR24: Epic 4 - Export CSV de la base e-mail opt-in

## Epic List

### Epic 1: Identité & Sécurité Utilisateur (Auth Core)
L'inscription, la connexion sécurisée et la gestion de profil pour permettre aux membres d'accéder au Mouvement et d'enregistrer leur progression vidéo, dans le respect du RGPD.
**FRs couverts:** FR1, FR2, FR3, FR4, FR5

### Story 1.1: Inscription via Google OAuth
As a Visiteur,
I want m'inscrire ou me connecter en un clic via mon compte Google en certifiant mon âge,
So that rejoindre le mouvement rapidement sans retenir un nouveau mot de passe.

**Acceptance Criteria:**

**Given** Je suis sur la page d'inscription et déconnecté
**When** Je clique sur "Continuer avec Google" après avoir coché la case de consentement d'âge (>15 ans)
**Then** Je suis redirigé de manière sécurisée vers l'authentification Google
**And** À mon retour, un compte membre est créé/lié en base de données et je suis défini comme "Connecté".

### Story 1.2: Authentification Classique Sécurisée
As a Visiteur,
I want pouvoir créer un compte et me connecter via une adresse email et un mot de passe classique,
So that garder le contrôle de mes données sans dépendre d'un compte externe.

**Acceptance Criteria:**

**Given** Je remplis le formulaire d'inscription/connexion classique
**When** Je soumets un mot de passe respectant les critères de sécurité
**Then** Le mot de passe est haché avant insertion en base
**And** Je reçois un feedback visuel de succès en moins de 1.5s et un JWT de session m'est attribué.

### Story 1.3: Réinitialisation de Mot de Passe
As a Utilisateur ayant oublié son mot de passe,
I want pouvoir le réinitialiser,
So that retrouver accès à mon espace personnel.

**Acceptance Criteria:**

**Given** Je demande une réinitialisation depuis la page de Login
**When** Je fournis une adresse email valide
**Then** Je reçois un email transactionnel (SendGrid) avec un lien contenant un jeton sécurisé temporaire
**And** Ce lien me permet de définir et sauvegarder mon nouveau mot de passe haché.

### Story 1.4: Isolation des Vues Privées
As a Système,
I want bloquer l'accès aux formulaires et tableaux de bord si l'utilisateur n'est pas authentifié,
So that protéger l'espace membre et forcer la conversion (Lead Gen).

**Acceptance Criteria:**

**Given** Je suis un visiteur non authentifié (Pas de JWT valide)
**When** Je tente d'accéder à l'Espace Partenaire, aux candidatures Tech ou à un composant restreint
**Then** L'accès est bloqué
**And** L'interface affiche un message incitatif ("Rejoignez le Mouvement pour accéder à cette section").

### Epic 2: Découverte Publique & Acquisition (Media & Leads)
Une vitrine attrayante pour présenter la série via sa bande-annonce, récolter les candidatures techniques (CogniSphère/ECHOLink) et centraliser les parcours de dons sécurisés.
**FRs couverts:** FR6, FR7, FR8, FR9, FR17, FR18, FR19

### Story 2.1: Vitrine Vidéo & Bande-Annonce
As a Visiteur,
I want pouvoir visionner la bande-annonce de la série et voir la liste des futurs épisodes,
So that comprendre le projet ECHO sans avoir à m'inscrire immédiatement.

**Acceptance Criteria:**

**Given** Je suis sur la page 'La Série'
**When** Je clique sur le lecteur vidéo public
**Then** La bande-annonce se lance via un lecteur externe (YouTube/Vimeo)
**And** Je vois des cartes "Bientôt disponible" pour les épisodes de la saison 1 (non cliquables pour lecture).

### Story 2.2: Exploration des Épisodes & Opt-in
As a Visiteur intéressé,
I want pouvoir lire le synopsis des épisodes à venir et m'inscrire à une alerte de sortie,
So that rester informé de l'avancement du projet.

**Acceptance Criteria:**

**Given** Je clique sur une carte d'épisode "Bientôt disponible"
**When** La modale de détails s'ouvre
**Then** Je peux lire le titre, le synopsis et les thématiques
**And** Si je suis connecté, je dispose d'un bouton (opt-in) pour m'abonner aux notifications par email concernant cet épisode.

### Story 2.3: Candidatures Techniques Anti-Spam
As a Développeur engagé,
I want pouvoir postuler pour rejoindre les équipes techniques de CogniSphère ou ECHOLink,
So that contribuer au développement de ces outils open-source.

**Acceptance Criteria:**

**Given** Je suis sur la page CogniSphère ou ECHOLink
**When** Je remplis le formulaire de candidature technique complet
**Then** Le système effectue une vérification anti-spam silencieuse (ou visuelle type Turnstile/reCAPTCHA)
**And** Une fois soumis et validé en Backend, l'équipe interne ECHO reçoit une notification email.

### Story 2.4: Passerelle de Soutien et Dons
As a Soutien du mouvement,
I want pouvoir faire un don financier de manière claire et sécurisée,
So that contribuer au financement et à l'indépendance de l'association.

**Acceptance Criteria:**

**Given** Je suis sur la page Mouvement ou je navigue sur le footer
**When** Je clique sur le bouton de "Soutien" ou d'"Accompagnement financier"
**Then** Je suis redirigé de manière fluide (href `_blank` ou redirection native)
**And** J'arrive sur la page de la campagne de l'association via la plateforme sécurisée certifiée (ex: HelloAsso).

### Epic 3: Espace Partenaires & ECHOSystem (Partner Onboarding)
Le cœur du Mouvement associatif : recrutement des partenaires via un formulaire avec géolocalisation et upload de logo, prise de RDV, et affichage de la cartographie publique de l'ECHOSystem.
**FRs couverts:** FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR18

### Story 3.1: Formulaire de Candidature Partenaire
As a Candidat Partenaire,
I want pouvoir soumettre un dossier complet incluant mes coordonnées, une géolocalisation et l'upload de mon logo,
So that proposer l'intégration de mon organisation à l'association ECHO.

**Acceptance Criteria:**

**Given** Je suis connecté et je remplis le formulaire de candidature
**When** Je soumets un logo (Max 2Mo, PNG/JPEG/WEBP)
**Then** Le backend valide le type MIME (via `Pillow`) pour éviter les exécutions malveillantes
**And** Mes données sont enregistrées en base avec le statut par défaut "En attente".

### Story 3.2: Notifications Transactionnelles
As a Système,
I want envoyer des emails de notification lors d'une nouvelle candidature partenaire,
So that informer le candidat de la bonne réception et d'alerter l'équipe Mouvement ECHO.

**Acceptance Criteria:**

**Given** Une candidature partenaire vient d'être insérée en base avec succès
**When** La transaction base de données est confirmée (Post-save)
**Then** Un email formaté est envoyé au candidat ("Demande bien reçue") via l'API SendGrid
**And** Un email d'alerte avec le résumé des infos est envoyé à l'administration ECHO.

### Story 3.3: Tableau de bord Partenaire
As a Partenaire (Candidat ou Approuvé),
I want consulter le statut actuel de mon organisation depuis mon espace,
So that savoir où en est le traitement de ma demande par l'équipe ECHO.

**Acceptance Criteria:**

**Given** Je suis connecté en tant que compte partenaire
**When** Je navigue sur la page `Mon Espace Partenaire` (Dashboard)
**Then** Je vois un résumé des informations soumises et mon statut ("En attente" / "Approuvé")
**And** L'interface affiche l'état actuel sous forme de badge visuel.

### Story 3.4: Prise de RDV Google Calendar
As a Partenaire (Candidat ou Approuvé),
I want pouvoir facilement prendre un rendez-vous avec l'équipe pour contractualiser,
So that finaliser l'intégration de mon organisation.

**Acceptance Criteria:**

**Given** Je suis sur mon espace membre partenaire
**When** Je clique sur l'action de Prise de RDV
**Then** L'interface affiche l'embed (ou la redirection) vers le Google Calendar de l'équipe ECHO
**And** Ce widget/lien n'est rendu que pour les utilisateurs authentifiés.

### Story 3.5: Cartographie et Listing Publique ECHOSystem
As a Visiteur,
I want voir la liste et la géolocalisation de tous les partenaires officiels,
So that découvrir l'écosystème physique du Mouvement et visiter leurs sitewebs.

**Acceptance Criteria:**

**Given** Je suis sur la page ECHOSystem
**When** La page se charge
**Then** L'API Backend ne retourne *QUE* les partenaires ayant le statut `Approuvé` (les "En attente" sont masqués publiquement)
**And** Je peux cliquer sur "Visiter le site" pour ouvrir l'URL du partenaire dans un nouvel onglet.

### Epic 4: Back-Office d'Administration (Control Tower)
Le tableau de bord sécurisé (Dashboard Admin) réservé à l'équipe ECHO pour valider les candidatures partenaires, gérer les événements publics et exporter les listes de contact email.
**FRs couverts:** FR20, FR21, FR22, FR23, FR24

### Story 4.1: Panel d'Administration Sécurisé
As a Administrateur ECHO,
I want accéder à un Dashboard privé d'administration,
So that gérer les contenus et les utilisateurs de la plateforme de manière centralisée.

**Acceptance Criteria:**

**Given** Je suis connecté avec mon compte
**When** Je navigue vers l'URL `/admin/...` ou je clique sur "Administration"
**Then** Le système vérifie que mon rôle en base de données est strictement `ADMIN`
**And** Si je ne suis pas Admin, je suis redirigé avec une erreur "Accès Refusé" (Isolation).

### Story 4.2: Modération des Candidatures Partenaires
As a Administrateur ECHO,
I want pouvoir consulter, approuver, rejeter ou mettre en avant les partenaires,
So that valider manuellement l'écosystème avant toute publication publique.

**Acceptance Criteria:**

**Given** Je suis sur la vue "Gestion Partenaires" de l'Administration
**When** Je clique sur une fiche partenaire "En attente"
**Then** Je peux consulter toutes ses informations (Logo, description, coordonnées)
**And** Je dispose de boutons d'actions pour passer son statut à "Approuvé" ou le "Mettre en avant" (featured).

### Story 4.3: Gestion de l'Agenda (Événements)
As a Administrateur ECHO,
I want pouvoir créer, modifier et supprimer des événements publics via une interface CRUD,
So that animer la communauté avec des Ciné-débats ou projections IRL.

**Acceptance Criteria:**

**Given** Je suis sur la vue "Gestion Événements"
**When** Je remplis un formulaire de création d'événement (Titre, Date ISO 8601, Lieu, Description)
**Then** L'événement est sauvegardé en base de données
**And** Il apparaît instantanément sur la page publique Agenda du Frontend.

### Story 4.4: Export de la Base Email Opt-in
As a Administrateur ECHO,
I want pouvoir générer un export CSV des utilisateurs ayant consenti aux newsletters,
So that pouvoir les contacter en masse via un outil externe d'emailing publicitaire.

**Acceptance Criteria:**

**Given** Je suis sur le Dashboard Admin
**When** Je clique sur le bouton "Exporter Contacts Opt-in"
**Then** Le backend filtre les utilisateurs par statut d'opt-in positif
**And** Un fichier CSV structuré et nettoyé m'est proposé au téléchargement.
