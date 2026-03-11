# Design : Mise en conformite RGPD

**Date** : 2026-03-11
**Statut** : Approuve
**Priorite** : Critique (pre-lancement 20 mars 2026)

## Contexte

Le site ECHO collecte des donnees personnelles (inscription, partenariat, contact, candidature tech) mais manque de transparence legale : pas de pages legales, pas de banniere cookies, pas de consentement explicite sur les formulaires. L'analytics GA4 est deja en mode cookieless (conforme). L'API de suppression de compte existe mais n'a pas de bouton frontend.

## Etat actuel

| Zone | Statut |
|------|--------|
| Analytics GA4 | Conforme (cookieless, IP anonymisee) |
| Analytics custom | Conforme (pas de PII) |
| Auth cookies | Conforme (httpOnly, secure en prod) |
| Pages legales | Manquant |
| Banniere cookies | Manquant |
| Consentement formulaires | Partiel (age sur inscription uniquement) |
| Suppression compte | Backend OK, pas de UI |
| Export donnees utilisateur | Manquant |
| Desinscription emails | Manquant |

## Design en 5 blocs

### Bloc 1 — Pages legales (3 nouvelles pages)

Trois nouvelles pages statiques avec texte generique adapte a ECHO :

-  — Politique de confidentialite
  - Identite du responsable (association Mouvement ECHO)
  - Donnees collectees et finalites
  - Base legale (consentement, interet legitime, execution contrat)
  - Duree de conservation
  - Droits des utilisateurs (acces, rectification, suppression, portabilite)
  - Contact DPO / exercice des droits
  - Cookies et trackers utilises

-  — Mentions legales
  - Editeur (association loi 1901)
  - Hebergeur
  - Directeur de publication
  - Propriete intellectuelle

-  — Conditions generales d'utilisation
  - Objet et acceptation
  - Inscription et comptes
  - Regles de la plateforme
  - Responsabilites
  - Modification des CGU

**Liens dans le Footer** : section Legal existante, remplacer les placeholders.
**Liens dans le Header** : non necessaire.

### Bloc 2 — Banniere cookie simple

Composant  affiche en bas de page :
- Texte : "Ce site utilise des cookies necessaires au fonctionnement et des cookies analytics optionnels."
- Lien vers la politique de confidentialite
- Deux boutons : "Accepter" / "Refuser"
- Stockage du choix dans - Si Accepter : - Si Refuser ou pas de choix : GA4 reste en mode cookieless (defaut actuel)
- Ne s'affiche plus apres un choix (sauf reset)
- Monte dans  ou 
### Bloc 3 — Consentement formulaires

Ajouter une checkbox obligatoire sur 3 formulaires :

1. **PartnerFormModal.tsx** (candidature partenariat)
2. **Contact.tsx** (formulaire de contact)
3. **TechApplicationForm.tsx** (candidature technique)

Texte : "J'accepte que mes donnees soient traitees conformement a la [politique de confidentialite](/politique-de-confidentialite)."

- Checkbox non cochee par defaut
- Validation : formulaire ne peut pas etre soumis sans la case cochee
- Lien cliquable vers la page de confidentialite

### Bloc 4 — Droits utilisateur (suppression + export)

**Suppression de compte :**
- Bouton "Supprimer mon compte" sur  et future page profil
- Modale de confirmation avec texte d'avertissement
- Appelle  (endpoint existant)

**Export de donnees :**
- Nouveau endpoint - Retourne un JSON avec toutes les donnees de l'utilisateur (profil, sessions, optins, partenaire si applicable)
- Bouton "Exporter mes donnees" a cote du bouton de suppression

### Bloc 5 — Emails (desinscription)

- Ajouter un lien de desinscription en bas des templates email dans - Nouveau endpoint   - Token signe contenant le user_id
  - Desactive les emails non-transactionnels pour cet utilisateur
- Champ  dans le modele User

## Fichiers a creer

| Fichier | Description |
|---------|-------------|
|  | Page politique de confidentialite |
|  | Page mentions legales |
|  | Page CGU |
|  | Banniere cookie consent |

## Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
|  | 3 nouvelles routes legales |
|  | Liens vers pages legales |
|  | Monter CookieBanner |
|  | Checkbox consentement |
|  | Checkbox consentement |
|  | Checkbox consentement |
|  | Bouton suppression + export |
|  | Endpoints export + unsubscribe |
|  | Champ email_opt_out sur User |
|  | Lien desinscription dans templates |

## Hors scope

- Gestion avancee des preferences cookies (categories)
- Service tiers cookie (Axeptio, Tarteaucitron)
- DPO formel (association loi 1901 < 250 salaries)
- Audit CNIL complet (a faire post-lancement si necessaire)
