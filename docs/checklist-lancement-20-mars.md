# Checklist Lancement ECHO — 20 mars 2026

## J-3 → J-1 (17-19 mars)

### 🔴 BLOQUANT — Infrastructure

- [ ] **DNS CNAME** : Dans OVH, créer `api.mouvementecho.fr` → `echo-api-kfre.onrender.com`
- [ ] **Custom domain Render** : Ajouter `api.mouvementecho.fr` dans Render Dashboard → Settings → Custom Domains
- [ ] **Variables d'environnement Render** : Vérifier que toutes sont configurées :
  - `MONGO_URL` (connection string Atlas)
  - `DB_NAME=echo_database`
  - `CORS_ORIGINS=https://mouvementecho.fr,https://www.mouvementecho.fr`
  - `GOOGLE_CLIENT_ID` (credentials Google Cloud Console)
  - `GOOGLE_CLIENT_SECRET` (credentials Google Cloud Console)
  - `GOOGLE_REDIRECT_URI=https://api.mouvementecho.fr/api/auth/google/callback`
  - `FRONTEND_URL=https://mouvementecho.fr`
  - `ENVIRONMENT=production`
  - `OAUTH_STATE_SECRET` (générer : `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
  - `UNSUBSCRIBE_SECRET` (générer : idem)
  - `SENDGRID_API_KEY` (optionnel, requis pour les emails)
  - `RECAPTCHA_SECRET_KEY` (optionnel, requis pour anti-spam)

### 🔴 BLOQUANT — Google OAuth

- [ ] **Google Cloud Console** : Vérifier que les Authorized redirect URIs incluent :
  - `https://api.mouvementecho.fr/api/auth/google/callback`
- [ ] **Tester le login Google** une fois le DNS propagé

### 🟠 IMPORTANT — Migration données

- [ ] **Lancer le script de migration dates UTC sur Atlas** :
  ```bash
  # Depuis une machine avec accès Atlas (local ou Render shell)
  cd backend
  MONGO_URL="mongodb+srv://echo_admin:***@echo-cluster.xxxxx.mongodb.net/echo_database" python -m scripts.migrate_dates_utc
  ```
  Résultat attendu : X documents updated, 0 erreurs, idempotent si relancé.

- [ ] **Nettoyer les données de test** dans Atlas :
  - Supprimer les comptes utilisateurs de test
  - Supprimer les candidatures de test (tech, scénariste, bénévole, étudiant)
  - Supprimer les partenaires de test
  - Supprimer les événements de test
  - Garder le compte admin principal

### 🟠 IMPORTANT — Contenu

- [ ] **Crédits série + bande-annonce** : Remplacer vidéo prologue par la bande-annonce (prévue le 18 mars)
- [ ] **Liens sociaux** : Remplacer les 12 `href="#"` dans le footer par les vraies URLs (Instagram, Facebook, LinkedIn, Twitter)
- [ ] **SendGrid** : Configurer en production (clé API, vérification domaine expéditeur)

### 🟡 SOUHAITABLE

- [ ] **Dashboard Partenaire** : Revoir UX/données/design avant sortie
- [ ] **Page Ressources** : Mettre à jour le contenu

---

## Jour J (20 mars — matin)

### Déploiement

- [ ] **Build frontend** :
  ```bash
  cd frontend && npm run build
  ```
- [ ] **Upload `dist/`** sur OVH via FTP (FileZilla ou autre)
- [ ] **Vérifier le `.htaccess`** est bien présent (SPA routing + HTTPS redirect + security headers)

### Vérification (5 parcours)

- [ ] **Parcours 1 — Visiteur** : Home → Série → Mouvement → Contact (formulaire fonctionne)
- [ ] **Parcours 2 — Inscription** : Register → Login local → Profil → Mes données
- [ ] **Parcours 3 — Google OAuth** : Login Google → Callback → Profil
- [ ] **Parcours 4 — Candidature** : Rejoindre Série (étudiant ou scénariste) → Confirmation → Visible en admin
- [ ] **Parcours 5 — Partenaire** : Devenir Partenaire → Formulaire → Confirmation → Visible en admin

### Smoke test API

- [ ] `curl https://api.mouvementecho.fr/api/health` → 200
- [ ] `curl https://api.mouvementecho.fr/api/analytics/stats/public` → JSON avec compteurs
- [ ] `curl https://api.mouvementecho.fr/api/episodes` → JSON épisodes

---

## Post-lancement (J+1)

- [ ] Vérifier les logs Render (erreurs 500)
- [ ] Vérifier AdminAnalytics (les events s'enregistrent)
- [ ] Surveiller le cold start Render (~30s après 15 min d'inactivité)
- [ ] Planifier passage Render payant si trafic > 50K visiteurs
