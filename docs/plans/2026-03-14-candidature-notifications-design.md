# Design : Notifications et suivi des candidatures dev/scénariste

**Date :** 2026-03-14
**Approche retenue :** Emails directs + page Mon Compte (Approche 1)

## Contexte

Les boutons "Convoquer en entretien", "Accepter" et "Rejeter" dans l'admin candidatures changent le statut en base mais n'envoient aucune notification au candidat. Le candidat n'a aucun moyen de suivre sa candidature.

**Objectif :** Envoyer un email à chaque changement de statut et permettre aux utilisateurs connectés de suivre leurs candidatures dans un espace "Mon compte".

## Backend — Emails transactionnels

### 4 fonctions email dans `email_service.py`

| Déclencheur | Fonction | Contenu clé |
|---|---|---|
| Soumission candidature | `send_candidature_confirmation(email, name, project)` | "Nous avons bien reçu votre candidature pour {projet}" |
| Admin → Entretien | `send_candidature_interview(email, name, booking_url)` | "Réservez un créneau d'entretien" + lien booking |
| Admin → Accepté | `send_candidature_accepted(email, name, project)` | "Félicitations, votre candidature est acceptée" |
| Admin → Rejeté | `send_candidature_rejected(email, name, status_note?)` | "Nous ne pouvons pas donner suite" + motif optionnel |

### Intégration

- `POST /candidatures/tech` → `send_candidature_confirmation` via `BackgroundTasks`
- `PUT /candidatures/admin/{id}/status` → email correspondant au nouveau statut via `BackgroundTasks`
- Lien booking : nouvelle variable `BOOKING_URL` dans `core/config.py` (fallback : valeur actuelle hardcodée)
- Pattern identique aux emails partenaires existants
- Les textes email sont des placeholders à personnaliser ultérieurement

## Frontend — Page "Mon Compte" (`/mon-compte`)

### Nouvelle page `MyAccount.tsx`

Accessible à tout utilisateur connecté (USER, PARTNER, ADMIN).

**Structure :**
- Header avec nom/email de l'utilisateur
- Section "Mes candidatures" :
  - Liste via `GET /candidatures/me` (endpoint existant, matching par email)
  - Par candidature : badge projet (coloré), date soumission, statut visuel
  - Pastilles statut : En attente (jaune), Entretien (bleu), Accepté (vert), Rejeté (rouge)
  - Si statut = "entretien" → bouton "Réserver un créneau" avec lien booking
  - Si aucune candidature → message vide

### Navigation

- Utilisateur connecté (USER) → lien "Mon compte" → `/mon-compte`
- Utilisateur connecté (PARTNER) → "Mon compte" + "Mon espace partenaire"
- Non connecté → pas de lien "Mon compte"
- Route protégée (redirect login si non connecté)

### Style

Dark theme, accents dorés, composants existants (Button, Input).

## Hors scope

- Pas de modification du système d'auth
- Pas de nouveau rôle utilisateur
- Pas de modification du modèle TechCandidature
- Pas de notifications temps réel / in-app

## Backlog (à faire ultérieurement)

1. Rédaction des emails définitifs par l'équipe (textes personnalisés pour les 4 emails)
2. Notifications in-app (badge, liste) si le volume de candidatures le justifie
