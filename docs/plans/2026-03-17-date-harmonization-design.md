# Date Harmonization Design

**Date:** 2026-03-17
**Objectif:** Harmoniser tous les formats de dates backend et frontend avant le lancement du 20 mars 2026.
**Approche retenue:** Migration complète `datetime.now(UTC)` + script de données MongoDB

## Contexte

L'audit a révélé 6 incohérences dans la gestion des dates :

| Problème | Impact |
|----------|--------|
| 52x `datetime.utcnow()` (naive) vs 4x `datetime.now(UTC)` (aware) | Deprecation Python 3.12+, comparaisons mixtes |
| `start_date` accepte YYYY-MM et YYYY-MM-DD | Données hétérogènes en base |
| AdminEvents.tsx timezone issue | Décalage date -1 jour pour UTC+1 |
| CSV exports en ISO brut | Illisible pour les admins |
| `start_date` affiché brut dans AdminStudents | Incohérence visuelle |
| Données MongoDB naïves | Pas d'info timezone en base |

**Public cible :** Francophonie élargie (UTC-5 à UTC+3).
**Consommateurs CSV :** Admins ECHO uniquement, Excel/Google Sheets.

## Design

### 1. Convention datetime backend

**Règle unique :** Tout `datetime` utilise `datetime.now(UTC)` (timezone-aware).

Fichiers impactés (18 fichiers prod, 52 occurrences) :
- `models.py`, `models_partner.py`, `models_member.py`, `models_mediatheque.py`
- `routes/auth.py`, `partners.py`, `members.py`, `candidatures.py`, `volunteers.py`, `analytics.py`, `contact.py`, `mediatheque.py`, `episodes.py`, `progress.py`
- `services/auth_service.py`, `auth_local_service.py`, `password_reset_service.py`
- `utils/rate_limit.py`, `audit.py`
- `seed_partners.py`

### 2. Migration des données MongoDB

Script one-shot `backend/scripts/migrate_dates_utc.py` :
- Parcourt 17 collections
- Pour chaque date naïve : `field.replace(tzinfo=timezone.utc)` puis `$set`
- Idempotent (ignore les dates déjà aware)
- Log le nombre de documents modifiés par collection

Collections : `users`, `user_sessions`, `episodes`, `video_progress`, `episode_optins`, `events`, `tech_candidatures`, `volunteer_applications`, `student_applications`, `contact_messages`, `analytics_events`, `partners`, `members`, `media_items`, `password_reset_tokens`, `pending_2fa`.

### 3. `start_date` strict YYYY-MM-DD

- Validateur Pydantic : regex `^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$`
- Message d'erreur : "Le format doit être YYYY-MM-DD (ex: 2026-09-10)"
- Migration : les `start_date` existants en YYYY-MM reçoivent `-01`
- AdminStudents.tsx : afficher `new Date(start_date).toLocaleDateString('fr-FR')`

### 4. CSV exports en DD/MM/YYYY HH:MM

Helper dans `backend/utils/helpers.py` :
```python
def format_date_csv(dt: datetime | None) -> str:
    return dt.strftime("%d/%m/%Y %H:%M") if dt else ""
```

Remplace `.isoformat()` dans 6 fichiers de routes (auth, candidatures, students, volunteers, partners, episodes).

`start_date` (string) converti en DD/MM/YYYY pour cohérence.

### 5. AdminEvents.tsx timezone fix

Éviter le décalage UTC sur les `<input type="date">` :
```typescript
// Avant : new Date(inputValue).toISOString() → décalage -1 jour en UTC+1
// Après : new Date(inputValue + 'T00:00:00').toISOString()
```

### 6. Tests

Mettre à jour tous les fichiers de tests utilisant `datetime.utcnow()` pour utiliser `datetime.now(UTC)`.

## Fichiers impactés (récapitulatif)

| Catégorie | Fichiers | Type de changement |
|-----------|----------|-------------------|
| Modèles Pydantic | 4 | `default_factory` → `now(UTC)` |
| Routes backend | 10 | `utcnow()` → `now(UTC)` + CSV format |
| Services | 3 | `utcnow()` → `now(UTC)` |
| Utils | 2-3 | `utcnow()` → `now(UTC)` + helper CSV |
| Script migration | 1 (nouveau) | Migration données MongoDB |
| Frontend | 2 | AdminStudents display + AdminEvents timezone |
| Tests | ~10 | Alignement `now(UTC)` |
| Seed | 1 | `utcnow()` → `now(UTC)` |

**Total : ~21-25 fichiers, ~80 modifications**
