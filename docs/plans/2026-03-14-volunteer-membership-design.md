# Formulaire d'adhésion bénévole — Design

**Date** : 2026-03-14
**Statut** : Validé
**Auteur** : Claude Code (Opus 4.6)

## Objectif

Permettre à tout visiteur (connecté ou non) de candidater comme membre bénévole du Mouvement ECHO via un formulaire intégré à la page Mouvement. Les candidatures sont stockées dans une collection dédiée, gérées par les admins avec export CSV pour les déclarations associatives.

## Contexte

- Remplace le Google Forms "Questionnaire recrutement" existant
- Le bouton "Rejoindre le mouvement" existe déjà sur la page Mouvement → ouvre une modal
- Pattern identique aux candidatures tech (TechApplicationForm) et scénariste (ScenaristApplicationForm)

## Analyse du questionnaire Google Forms existant

### Conservé (adapté)
- Q1 (Email) → champ identité
- Q3 (Compétences checkboxes) → restructuré en 5 catégories
- Q4 (Niveau expérience, 4 niveaux) → radio button
- Q8 (Disponibilité, 3 niveaux) → radio button

### Modifié
- Q2 (Motivation texte libre) → tags prédéfinis sélectionnables
- Q7 (Valeurs OUI/NON) → checkbox unique d'adhésion aux valeurs
- Q9 (Coordonnées texte libre) → champ téléphone optionnel structuré

### Supprimé
- Q5 (Thématiques à coeur) — redondant avec intérêts du profil utilisateur
- Q6 (Motivation face aux épreuves) — trop entretien d'embauche pour du bénévolat

### Ajouté
- Nom complet (absent du Google Forms)
- Ville/Région (présentiel vs distance)
- Consentement RGPD

## Modèle de données

Collection MongoDB : `volunteer_applications`

```python
class VolunteerApplication(BaseModel):
    id: str                          # UUID
    name: str                        # Nom complet
    email: str
    phone: Optional[str] = None      # Téléphone (optionnel)
    city: str                        # Ville/Région
    motivation: list[str]            # Tags motivation sélectionnés
    skills: list[str]                # Sous-compétences cochées
    experience_level: str            # professional | student | self_taught | motivated
    availability: str                # punctual | regular | active
    values_accepted: bool            # Adhésion aux valeurs ECHO
    message: Optional[str] = None    # Message libre
    status: str = "pending"          # pending | entretien | accepted | rejected
    status_note: Optional[str] = None
    ip_address: str                  # Anonymisé (anti-spam)
    created_at: datetime
    updated_at: Optional[datetime] = None
```

## API Endpoints

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | /api/volunteers/apply | Public | Soumettre candidature (honeypot + rate limit 3/h/IP) |
| GET | /api/volunteers/admin/all | Admin | Lister (filtres: statut, disponibilité, compétence) |
| PUT | /api/volunteers/admin/{id}/status | Admin | Changer statut + email notification |
| DELETE | /api/volunteers/admin/{id} | Admin | Supprimer |
| GET | /api/volunteers/admin/export | Admin | Export CSV (registre membres asso) |
| PUT | /api/volunteers/admin/batch-status | Admin | Batch update statuts |
| GET | /api/volunteers/me | Connecté | Voir sa candidature (match email) |

## Formulaire frontend (4 étapes)

### Étape 1 — Identité
- Nom complet (obligatoire)
- Email (obligatoire)
- Téléphone (optionnel)
- Ville / Région (obligatoire)

### Étape 2 — Compétences
5 catégories avec checkboxes groupées :
- **Création audiovisuelle** : Vidéo, Montage, Réalisation, Production, Jeu d'acteur, Voix off, Mise en scène, Sound design
- **Création artistique** : Marketing, Graphisme, Illustration, Fresque, Animation, Écriture, Narration, Scénarisation, Poésie, Musique, Analyse des paroles
- **Tech & développement** : Dev Web & App, Automatisation, Agents IA, Architecture & BDD
- **Organisation & communication** : Gestion de projet, Réseaux sociaux, Recherche, Documentation, Événementiel, Escape game, Jeux vidéo
- **Administration** : Relations partenaires & presse, Comptabilité, Finance, Levée de fonds, Juridique, Logistique

+ Niveau d'expérience (radio) : Professionnel / Étudiant / Autodidacte / Motivé sans expérience

### Étape 3 — Engagement
- Motivations (tags) : La cause écologique, Le projet artistique, L'innovation technologique, L'aventure collective, Le développement personnel, Autre
- Disponibilité (radio) : Ponctuel / Régulier / Membre moteur
- Adhésion aux valeurs ECHO (checkbox) — 5 valeurs affichées : Coopération, Respect, Responsabilité, Intégrité, Innovation

### Étape 4 — Validation
- Message libre (optionnel)
- Consentement RGPD (checkbox obligatoire)
- Honeypot caché

## Intégration frontend

- **Trigger** : Bouton "Rejoindre le mouvement" existant sur page Mouvement → ouvre modal
- **Composant** : `VolunteerApplicationForm.tsx` dans `frontend/src/components/forms/`
- **Pattern** : Multi-étapes avec `StepProgress` (identique aux autres formulaires)

## Vue Admin

- **Route** : `/admin/benevoles`
- **Page** : `AdminVolunteers.tsx`
- Tableau avec colonnes : Nom, Email, Ville, Compétences (résumé), Disponibilité, Statut, Date
- Filtres : statut, disponibilité, catégorie compétence
- Actions : détail (modale), changer statut, batch, supprimer
- Export CSV complet (registre membres pour déclaration asso)
- Lien dans le dashboard admin hub

## Emails

4 emails transactionnels (même pattern que candidatures tech) :
1. Confirmation de réception
2. Convocation entretien (lien booking Google Calendar)
3. Acceptation (bienvenue membre bénévole)
4. Rejet (avec motif optionnel)

## Profil utilisateur

Étendre `Profile.tsx` : afficher la candidature bénévole dans "Mes candidatures" (match par email), badge vert, statut, bouton booking si entretien.
