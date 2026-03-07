# Story 3.1: Formulaire de Candidature Partenaire

Status: done

## Story

As a Candidat Partenaire,
I want pouvoir soumettre un dossier complet incluant mes coordonnées, une géolocalisation et l'upload de mon logo,
So that proposer l'intégration de mon organisation à l'association ECHO.

## Acceptance Criteria

1. **Given** Je suis connecté et je remplis le formulaire de candidature **When** Je soumets un logo (Max 2Mo, PNG/JPEG/WEBP) **Then** Le backend valide le type MIME (via Pillow) pour éviter les exécutions malveillantes.
2. **And** Mes données sont enregistrées en base avec le statut par défaut "En attente".

## Tasks / Subtasks

### Backend (écarts comblés sur infra existante)

- [x] Task 1: Validation MIME via Pillow (`PIL.Image.open().verify()`)
- [x] Task 2: Limite logo réduite de 5 Mo à 2 Mo (per AC)
- [x] Task 3: Formats restreints à JPEG/PNG/WebP (retrait SVG/GIF)
- [x] Task 4: Email alerte équipe interne (FR13) — `mouvement.echo.france@gmail.com`
- [x] Task 5: Email récapitulatif amélioré au candidat (FR12)
- [x] Task 6: Anti-spam rate limiting (3/h/IP) sur `POST /apply` (FR18)
- [x] Task 7: Champ `ip_address` ajouté au modèle Partner

### Tests

- [x] Task 8: 5 tests backend (succès, email dupliqué, logo invalide, logo trop gros, rate limiting)

## Dev Notes

### Infra existante (pré-Story 3.1)

L'infrastructure partenaire était déjà construite :
- **Backend** : `POST /partners/apply` avec upload, création User+Partner, slug, thématiques
- **Frontend** : `PartnerFormModal.tsx` — formulaire 4 étapes (identité, localisation, contact, compte)
- **Admin** : `AdminPartners.tsx` — approve/reject/feature toggle
- **Partner account** : `MyPartnerAccount.tsx` — profil éditable

### Écarts identifiés et corrigés

| # | Exigence | Avant | Après |
|---|----------|-------|-------|
| 1 | Validation MIME | Header Content-Type seul (spoofable) | Pillow `Image.open().verify()` |
| 2 | Taille max logo | 5 Mo | 2 Mo |
| 3 | Formats logo | JPEG/PNG/WebP/SVG/GIF | JPEG/PNG/WebP uniquement |
| 4 | Email équipe (FR13) | Non implémenté | `send_email("mouvement.echo.france@gmail.com", ...)` |
| 5 | Email candidat (FR12) | Message basique | Récapitulatif avec nom et catégorie |
| 6 | Anti-spam (FR18) | Aucun | Rate limit 3/h/IP |

### Conventions

- Dépendance ajoutée : `Pillow==11.2.1`
- Rate limiting via `db.partners.count_documents` (même pattern que candidatures.py)
- Champ `ip_address: Optional[str]` ajouté au modèle `Partner`

## Dev Agent Record

### Agent Model Used

- **All tasks**: Claude Code (Opus 4.6)

### Debug Log References

- Backend tests: 32/32 passed (pytest) — dont 5 nouveaux pour partners apply
- Frontend build: OK (vite build)

### Code Review (1 correctif)

1. **`partners.py`** : extensions logo incluaient `.svg` et `.gif` (héritage pré-story) — restreint à `.jpg`, `.jpeg`, `.png`, `.webp` per AC

### Completion Notes List

- Validation MIME via Pillow (Image.open + verify)
- Limite logo 2 Mo (réduite de 5 Mo)
- Formats logo restreints à JPEG/PNG/WebP
- Email alerte équipe interne à chaque candidature (FR13)
- Email récapitulatif amélioré au candidat (FR12)
- Rate limiting 3/h/IP sur POST /apply (FR18)
- 5 tests backend couvrent les cas critiques

### File List

| File | Action | Description |
|------|--------|-------------|
| `backend/routes/partners.py` | Modified | Pillow validation + 2Mo + rate limit + emails |
| `backend/models_partner.py` | Modified | Ajout champ ip_address |
| `backend/requirements.txt` | Modified | Ajout Pillow==11.2.1 |
| `backend/tests/routes/test_partners_apply.py` | Created | 5 tests backend |
