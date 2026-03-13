# Design : Candidatures Scénaristes

**Date** : 2026-03-13
**Niveau BMAD** : STANDARD
**Agent** : Claude Code (Opus 4.6)

## Objectif

Permettre aux scénaristes de postuler pour participer à la série ECHO depuis la page Série. L'admin peut accepter/refuser et échanger avec eux via email.

## Approche

Extension du système `tech_candidatures` existant (collection MongoDB unique, mêmes routes, même admin). Ajout du type `"scenariste"` comme valeur de `project`.

## Modèle de données

### Modifications à `TechCandidature` (backend/models.py)

```python
# project: ajouter "scenariste"
project: Literal["cognisphere", "echolink", "scenariste"]

# Nouveaux champs optionnels (backwards-compatible)
portfolio_url: Optional[str] = Field(None, max_length=500)
creative_interests: Optional[str] = Field(None, max_length=500)
```

### Validation `portfolio_url`

- Champ optionnel, max 500 caractères
- Validation scheme http/https uniquement (rejet `javascript:`, `data:`, etc.)
- Pas de résolution DNS côté serveur (pas de risque SSRF)

### Nom du champ `creative_interests` (pas `interests`)

Évite la collision avec `User.interests: list[str]` qui a un type incompatible.

## Frontend

### Formulaire `ScenaristApplicationForm`

Nouveau composant inspiré de `TechApplicationForm`, 4 étapes :

| Étape | Champs | Type |
|-------|--------|------|
| 1. Identité | Nom, Email | Input texte + email |
| 2. Compétences | Compétences d'écriture, Lien portfolio (optionnel) | Textarea + Input URL |
| 3. Intérêts | Centres d'intérêt créatifs | Tags prédéfinis cliquables (Fiction, Documentaire, Écologie, Sciences, Philosophie, Société, Technologie, Arts) |
| 4. Motivation | Message d'alignement avec le Mouvement | Textarea |

- Honeypot anti-spam (champ `website` caché)
- Checkbox RGPD obligatoire
- Soumission vers `POST /api/candidatures/tech` avec `project: "scenariste"`

### Intégration page Série

- Le bouton "Rejoindre l'aventure" existant ouvre une modale avec le formulaire
- Texte du bouton inchangé (le contexte "Vous avez une plume et des convictions ?" est suffisant)
- Titre de la modale : "Candidature Scénariste"

### Console Admin (AdminCandidatures.tsx)

- Ajout du filtre "Scénaristes" dans le dropdown projet
- Modale de détail : affichage de `portfolio_url` (lien cliquable, `target="_blank" rel="noopener noreferrer"`) et `creative_interests`
- Validation front du scheme URL avant rendu (`/^https?:\/\//i`)
- Export CSV : ajout des colonnes `portfolio_url` et `creative_interests`

## Sécurité

| Mesure | Détail |
|--------|--------|
| Rate limiting | `check_rate_limit()` centralisé, 3/h/IP |
| Anti-spam | Honeypot field (champ `website`) |
| URL validation | Scheme http/https only, max 500 chars |
| Lien admin | `target="_blank" rel="noopener noreferrer"` |
| IP | Anonymisation avant stockage (RGPD) |

## Revue multi-agents

### Architecte Backend — Approuvé avec réserves
- Renommer `interests` → `creative_interests` (collision type) ✅ Intégré
- Valider `portfolio_url` avec Pydantic ✅ Intégré
- Étendre export CSV ✅ Intégré

### UX/Frontend — Approuvé avec réserves
- CTA ambigu → modale avec titre explicite ✅ Intégré
- Étape 2 surchargée → séparation en 4 étapes ✅ Intégré
- Type union admin → extension propre du type existant ✅ Intégré

### Sécurité — Approuvé avec réserves
- Validation URL anti-XSS/SSRF ✅ Intégré
- Rate limiting centralisé ✅ Intégré
- Liens admin sécurisés ✅ Intégré

## Hors scope

- Messagerie intégrée (in-app) — overkill pour le MVP
- Upload de fichiers — liens URL seulement
- Notifications automatiques par email — manuel via mailto
- Page admin séparée — réutilise l'existant
