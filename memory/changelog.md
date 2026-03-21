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

### Processus
- Relecture intégrale des workflows BMAD (7 agents, 3 niveaux, locks, QA, code review)
- Correction préférence utilisateur : specs détaillées + BMAD > action directe
- Mise à jour mémoire personnelle (preferences.md, learnings.md, context.md, todos.md)
- Ajout 13 décisions dans decisions.csv (10 techniques + 3 processus)

### Hotfixes
- Fix YouTube embed : bouton "Accepter et afficher la vidéo" accepte directement les cookies au lieu d'ouvrir le panneau CMP — vidéo accessible en 1 clic en navigation privée

### Onboarding email (workflow BMAD STANDARD)
- Séquence 2 emails : J+3 "Les coulisses d'ECHO" (Formiguères, saison 1) + J+10 "Et toi, tu rejoins l'aventure ?" (CTA candidature + synopsis)
- Endpoint cron `POST /api/cron/onboarding` (X-Cron-Secret, limit 20/exec)
- Champs `onboarding_step` + `onboarding_next_at` sur User
- Migration users existants → step=3
- Widget stats onboarding dans dashboard admin
- Health check enrichi avec statut cron
- Config : CRON_SECRET à ajouter sur Render + cron-job.org à configurer
