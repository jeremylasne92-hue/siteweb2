# Changelog ECHO

## 2026-03-21 — Session post-lancement

### Ajouts
- Système de mémoire persistante (`memory/decisions.csv`, `memory/changelog.md`, `memory/backlog-history.md`)
- Script de révision des décisions (`scripts/review.sh`)
- Newsletter admin intégrée au panneau d'administration
- Monitoring health check `/api/health`
- Stratégie virale Vald (5 vidéos) documentée

### Corrections
- Fix reCAPTCHA v3 (score threshold + fallback)
- Refactorisation tests admin avec TestClient FastAPI
- Délivrabilité emails : ajout plain text + désactivation tracking SendGrid

### Configuration
- SendGrid Domain Authentication (DKIM/SPF/DMARC)
- Masquage compteurs sous seuil configurable

### Documentation
- Mise à jour CLAUDE.md avec section mémoire persistante
- Archivage historique pré-lancement dans shared-context
