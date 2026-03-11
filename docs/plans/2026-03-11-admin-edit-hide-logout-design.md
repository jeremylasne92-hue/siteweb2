# Design: Admin Edit/Hide Partner + Logout Button

**Date**: 2026-03-11
**Niveau BMAD**: STANDARD
**Agent**: Claude Code (Opus 4.6)

## Scope

3 fonctionnalités:
1. Edition d'un partenaire par l'admin (tous les champs)
2. Masquer un partenaire (statut `suspended`)
3. Bouton de déconnexion dans le Header

## 1. Edition partenaire (admin)

### Backend
- Nouveau endpoint `PUT /api/partners/admin/{partner_id}/edit`
- Accepte un body JSON avec tous les champs modifiables (tous optionnels)
- Requiert `require_admin`
- Met à jour `updated_at` automatiquement

### Frontend
- Bouton "Éditer" (icône Pencil) dans la modale `AdminPartnerDetail`
- Toggle entre mode lecture et mode édition
- En mode édition: inputs pour chaque champ, boutons Sauvegarder/Annuler
- Appel PUT vers le nouveau endpoint, puis refresh des données

## 2. Masquer un partenaire

### Backend
- Nouveau endpoint `PUT /api/partners/admin/{partner_id}/suspend`
- Passe le statut à `suspended` (le GET public filtre déjà sur `approved` uniquement)
- Requiert `require_admin`

### Frontend
- Bouton "Masquer" dans la modale de détail (pour les partenaires `approved`)
- Bouton "Réactiver" (pour les partenaires `suspended`)
- Le statut `suspended` est déjà dans le `statusConfig` avec label/couleur

## 3. Bouton de déconnexion

### Frontend uniquement
- La fonction `logout()` existe déjà dans le store Zustand (`features/auth/store.ts`)
- Modifier le Header: quand `isAuthenticated`, afficher un menu déroulant:
  - "Mon Compte" (lien vers `/login` ou profil)
  - "Se déconnecter" (appelle `logout()` + redirect `/`)
- Mobile: ajouter le bouton dans le menu burger

## Fichiers impactés

### Backend
- `backend/routes/partners.py` — 2 nouveaux endpoints (edit + suspend)

### Frontend
- `frontend/src/pages/AdminPartners.tsx` — mode édition + boutons masquer/réactiver
- `frontend/src/components/layout/Header.tsx` — menu utilisateur avec logout

## Hors scope
- Pas de nouveau test backend (optionnel, ajout ultérieur)
- Pas de page profil utilisateur dédiée
