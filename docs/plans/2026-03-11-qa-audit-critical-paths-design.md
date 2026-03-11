# Audit QA — Parcours critiques

**Date** : 2026-03-11
**Objectif** : Vérifier visuellement les 5 parcours critiques du site ECHO avant lancement, identifier et corriger les bugs UI/UX.

## Scope

Parcours critiques uniquement (pas d'audit exhaustif).

## Méthode

Approche A — audit visuel via preview server. Navigation étape par étape, documentation des bugs, correction immédiate.

## Parcours à auditer

### 1. Navigation globale
- Header : tous les liens (8 nav + logo + compte + admin + soutenir)
- Footer : tous les liens (navigation, ressources, légal, réseaux sociaux, cookies)
- Home : tous les CTA (Découvrir la série, Rejoindre le mouvement, piliers)

### 2. Inscription (3 étapes)
- `/register` → Step 1 (username + email) → Step 2 (password + force) → Step 3 (consentements age + RGPD)
- Validation : champs vides, email invalide, mot de passe faible, checkbox non cochées
- Redirect vers `/login?registered=true` après succès
- Lien "Se connecter" depuis le formulaire

### 3. Connexion + Mot de passe oublié
- `/login` → onglets Google / Email
- Formulaire email : identifiant + mot de passe + toggle visibilité
- Lien "Mot de passe oublié" → `/forgot-password`
- Formulaire forgot : email → confirmation
- Lien "S'inscrire" depuis login

### 4. Candidature partenaire (4 étapes)
- `/partenaires` → bouton "Devenir partenaire" → PartnerFormModal
- Step 1 : nom + catégorie + thématiques + description + logo
- Step 2 : recherche adresse (Nominatim) + ville + CP
- Step 3 : contact (nom, rôle, email, téléphone, URLs)
- Step 4 : mot de passe + consentement RGPD
- Écran succès avec lien booking

### 5. Candidature technique (3 étapes)
- `/cognisphere` → bouton "Rejoindre le programme" → scroll #candidature → TechApplicationForm
- `/echolink` → bouton "Rejoindre le développement" → scroll #candidature → TechApplicationForm
- Step 1 : nom + email
- Step 2 : compétences (textarea)
- Step 3 : motivation + RGPD + honeypot
- Écran confirmation

### 6. Admin partenaires
- `/admin` → navigation vers `/admin/partenaires`
- Tableau avec filtres par statut
- Clic sur partenaire → modale détail
- Actions : approuver, refuser, toggle vedette

## Critères de bug

- Bouton ne fait rien au clic
- Lien vers `#` ou route 404
- Formulaire non soumis malgré champs valides
- Erreur console JavaScript
- Texte coupé ou illisible
- Élément non cliquable visuellement (cursor, hover)
- Navigation incohérente (pas de retour possible)

## Livrable

Liste de bugs trouvés + corrections appliquées + screenshots de vérification.
