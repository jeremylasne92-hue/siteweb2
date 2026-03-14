# Auto-Seed des Profils Membres — Design

> **Principe** : "Le membre doit être visible sur le site web seulement s'il a été validé par l'administrateur."

## Contexte

Quand un admin accepte une candidature (bénévole, scénariste, technicien), le membre doit apparaître automatiquement sur la page publique ECHOSystem. Aucune action supplémentaire requise.

## Flux

1. Candidat soumet sa candidature → statut `pending`
2. Admin change le statut à `accepted`
3. **Auto-seed** : profil membre créé avec `visible: true`
4. Membre visible immédiatement sur ECHOSystem

## Changements Backend

### `routes/volunteers.py` — PUT status endpoint

Quand `new_status == "accepted"` :
- Récupérer la candidature
- Créer un document `member_profiles` avec :
  - `display_name` : champ `name` de la candidature (pas `first_name`/`last_name`)
  - `slug` : généré depuis `name`
  - `role_title` : "Bénévole"
  - `visible` : `true`
  - `candidature_id` : référence à la candidature
  - `email` : depuis la candidature
- Si profil existe déjà (même email) → skip, log info

### `routes/candidatures.py` — même logique pour scénaristes/techniciens

- `role_title` adapté au type : "Scénariste", "Technicien"

### Fix champ `name`

Le seed endpoint actuel (`POST /admin/members/seed/{id}`) utilise `first_name`/`last_name` qui n'existent pas dans les candidatures. Remplacer par le champ `name` directement.

### Gestion des cas limites

- Pas de compte utilisateur associé → créer le profil quand même avec les infos de la candidature
- Candidature déjà seedée → vérifier par `candidature_id` ou `email`, skip si existe

## Changements Frontend

- **Supprimer** le bouton "Créer le profil membre" de `AdminVolunteers.tsx`
- **Supprimer** le state `seedStatus` et `handleSeedProfile`
- Aucun autre changement — `MembersSection` fetch déjà les profils visibles

## Hors scope

- Édition de profil par le membre lui-même (futur)
- Photo/avatar personnalisé (futur)
- Toggle `visible` par l'admin (futur, si besoin)
