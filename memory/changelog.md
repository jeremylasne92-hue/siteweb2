# Changelog ECHO

## 2026-04-03 — Sécurité : faux positif GitHub Secret Scanning

### Contexte
GitHub Secret Scanning a détecté un faux positif dans `.agents/skills/mongodb-mcp-setup/SKILL.md#L101` (commit `104fe4d6`) : le template d'exemple `mongodb+srv://username:password@cluster.mongodb.net/database` a été confondu avec de vraies credentials.

### Actions
- Template corrigé : `username:password` → `<user>:<pass>` (commit `5ba8d78`)
- Alerte GitHub #1 "MongoDB Atlas Database URI with credentials" clôturée comme "False positive"
- Aucune vraie credential n'était exposée — `.mcp.json` reste gitignored

### Fichiers modifiés
- `.agents/skills/mongodb-mcp-setup/SKILL.md` — template URI MongoDB

---

## 2026-04-02 — MongoDB Agent Skills + optimisation connexion/index

### Ajouts
- 7 MongoDB Agent Skills installees (`.agents/skills/`) : connection, schema-design, query-optimizer, natural-language-querying, search-and-ai, mcp-setup, atlas-stream-processing
- MCP Server MongoDB configure (`.mcp.json`, gitignored) : Atlas read-only sur `echo_database`
- Connexion Motor optimisee : pool 10/2, timeouts 5s, compression zlib, retries
- 4 index manquants ajoutes : analytics_events(partner_id), contact_messages(status+created_at), partners(name), member_profiles(display_name)

### Audit schema-design
- Schema valide conforme aux best practices MongoDB (embedding correct, TTL RGPD, compound indexes)
- Atlas Search non applicable (M0, necessite M10+)

### Fichiers modifies
- `backend/server.py` — connexion Motor + 4 index
- `CLAUDE.md` — section MongoDB MCP + Skills
- `.mcp.json` — config MCP Server (gitignored)
- `.gitignore` — exclusion .mcp.json

### Tests
- 275 tests backend passes, aucune regression

---

## 2026-04-02 — Monitoring admin automatise + verification GA

### Ajouts
- Endpoint `GET /api/admin/monitoring` protege par `X-Cron-Secret` header (pas d'OAuth requis)
- Tache planifiee `echo-admin-monitoring` : verifie les candidatures/partenariats en attente tous les 2 jours (9h17)
- Variable `CRON_SECRET` configuree sur Render

### Verification
- Google Analytics GA4 (`G-KHBWHQQF6W`) confirme en place : consent mode RGPD, IP anonymisee, dashboard admin `/admin/analytics`, double tracking GA4 + MongoDB interne
- 275 tests backend passes, aucune regression

### Fichiers modifies
- `backend/routes/admin_dashboard.py` — ajout endpoint monitoring + helper `_get_pending_summary()`
- `backend/.env` — ajout CRON_SECRET local

---

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
