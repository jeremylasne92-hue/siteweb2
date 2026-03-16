# Rapport de Readiness Pré-Lancement — Mouvement ECHO
**Date :** 2026-03-16
**Lancement prévu :** 2026-03-20
**Jours restants :** 4

---

## Score Global de Readiness

**78 / 100**

## Recommandation

> **CONDITIONNEL GO** — Le projet est fonctionnellement complet et techniquement solide. Quatre points bloquants ou à fort risque doivent être résolus avant le 20 mars. Le reste peut être géré post-lancement sans impact utilisateur critique.

---

## Résumé Exécutif

Les 4 Epics (17 stories) sont terminés. 150 tests backend passent. 18 tests frontend passent. Le build de production compile proprement. La RGPD a reçu un audit complet avec 14 écarts corrigés. L'analytique GA4 et l'analytique interne sont opérationnels.

Cependant, quatre problèmes critiques restent ouverts : (1) le `.env` de production n'est pas configuré — Google OAuth est inutilisable avec des clés placeholder ; (2) la Content Security Policy bloque les iframes YouTube (`youtube-nocookie.com` absent de `frame-src`) ; (3) SendGrid est configuré avec une clé API exposée en clair dans le dépôt ; (4) les données de test ne sont pas nettoyées avant publication.

---

## 1. Couverture des Exigences PRD

### Fonctionnalités MVP — Critique (toutes requises)

| Ref | Exigence | Statut |
|-----|----------|--------|
| FR1 | Google OAuth inscription | ⚠️ Implémenté — clés placeholder dans .env |
| FR2 | Login email/mot de passe | ✅ Implémenté |
| FR3 | Reset mot de passe | ✅ Implémenté (SendGrid) |
| FR4 | Case âge >15 ans à l'inscription | ✅ Implémenté |
| FR5 | Incitation à l'inscription visiteurs | ✅ Implémenté (AuthPrompt) |
| FR6 | Bande-annonce sans compte | ✅ Implémenté (façade RGPD) |
| FR7 | Badge "Bientôt disponible" S1 | ✅ Implémenté |
| FR8 | Modale synopsis épisodes | ✅ Implémenté |
| FR9 | Opt-in alertes email S1 | ✅ Implémenté |
| FR10 | Carte/liste ECHOSystem publique | ✅ Implémenté |
| FR11 | Formulaire candidature partenaire | ✅ Implémenté (upload, géocoding) |
| FR12 | Email confirmation candidature | ✅ Implémenté (SendGrid) |
| FR13 | Email alerte équipe candidature | ✅ Implémenté |
| FR14 | Dashboard statut partenaire | ✅ Implémenté |
| FR15 | Bouton RDV Google Calendar | ✅ Implémenté |
| FR16 | Bouton "Visiter le site" partenaire | ✅ Implémenté |
| FR17 | Formulaires candidature CogniSphère/ECHOLink | ✅ Implémenté |
| FR18 | Anti-spam honeypot + reCAPTCHA | ✅ Implémenté (reCAPTCHA skippé si clé absente) |
| FR19 | Liens HelloAsso page Soutenir | ✅ Implémenté |
| FR20 | Accès admin restreint au rôle ADMIN | ✅ Implémenté (RBAC + 2FA) |
| FR21 | Approbation partenaires admin | ✅ Implémenté |
| FR22 | Modifier/supprimer/mettre en avant partenaires | ✅ Implémenté |
| FR23 | CRUD événements admin | ✅ Implémenté |
| FR24 | Export base email opt-in | ✅ Implémenté (CSV, AdminExports) |

**Score fonctionnel PRD : 23/24 exigences couvertes (96%)**
Le seul point incomplet (FR1) est technique (clés non configurées), pas un manque d'implémentation.

### Pages

| Page | Route | Statut |
|------|-------|--------|
| Accueil | `/` | ✅ |
| La Série | `/serie` | ✅ |
| Le Mouvement | `/mouvement` | ✅ |
| CogniSphère | `/cognisphere` | ✅ |
| ECHOLink | `/echolink` | ✅ |
| ECHOSystem / Partenaires | `/partenaires` | ✅ |
| Événements | `/agenda` | ✅ |
| Ressources | `/ressources` | ✅ |
| Soutenir | `/soutenir` | ✅ |
| Contact | `/contact` | ✅ |
| Auth (Login/Register) | `/login`, `/register` | ✅ |
| Politique de confidentialité | `/politique-de-confidentialite` | ✅ |
| Mentions légales | `/mentions-legales` | ⚠️ Téléphone placeholder `+33 6 00 00 00 00 [À COMPLÉTER]` |
| CGU | `/cgu` | ✅ |
| 404 | `/404` | ✅ |
| Espace partenaire | `/mon-compte/partenaire` | ✅ |
| Mes données | `/mes-donnees` | ✅ |
| Panel Admin | `/admin/*` | ✅ |

---

## 2. Blocages Critiques (GO requis avant lancement)

### BLOCAGE 1 — Clé API SendGrid exposée dans le dépôt Git
**Priorité :** CRITIQUE — Sécurité
**Constat :** La clé `SG.N8XZUt9FRV2LEu4hZET14g...` est en clair dans `backend/.env` qui est tracké dans git (fichier présent dans le diff git status).
**Impact :** Clé accessible à quiconque accède au dépôt. Si le dépôt est public ou partagé, la clé doit être révoquée immédiatement depuis le tableau de bord SendGrid.
**Action :** (1) Révoquer la clé depuis SendGrid immédiatement. (2) Générer une nouvelle clé. (3) Ajouter `.env` au `.gitignore` si ce n'est pas déjà le cas. (4) Configurer la nouvelle clé dans l'environnement de production hors-dépôt.

### BLOCAGE 2 — Variables d'environnement de production non configurées
**Priorité :** CRITIQUE — Fonctionnel
**Constat :** Le fichier `backend/.env` contient :
- `GOOGLE_CLIENT_ID="your_google_client_id_here"` (placeholder)
- `GOOGLE_CLIENT_SECRET="your_google_client_secret_here"` (placeholder)
- `MONGO_URL="mongodb://localhost:27017"` (dev local)
- `CORS_ORIGINS="http://localhost:5173"` (dev local)
- `ENVIRONMENT` non défini (mode development par défaut)
- `OAUTH_STATE_SECRET` et `UNSUBSCRIBE_SECRET` absents (valeurs par défaut non sécurisées)
**Impact :** Google OAuth inopérant. CORS bloquera les requêtes depuis le domaine de production. Les secrets de sécurité resteront sur leurs valeurs par défaut non sécurisées. reCAPTCHA non activé.
**Action :** Créer un `.env` de production sur le serveur de déploiement avec toutes les valeurs réelles :
```
MONGO_URL=<URI Atlas ou serveur production>
DB_NAME=echo_production
CORS_ORIGINS=https://mouvementecho.fr
GOOGLE_CLIENT_ID=<clé réelle>
GOOGLE_CLIENT_SECRET=<clé réelle>
FRONTEND_URL=https://mouvementecho.fr
ENVIRONMENT=production
OAUTH_STATE_SECRET=<secret fort aléatoire>
UNSUBSCRIBE_SECRET=<secret fort aléatoire>
RECAPTCHA_SECRET_KEY=<clé reCAPTCHA>
SENDGRID_API_KEY=<nouvelle clé>
```

### BLOCAGE 3 — CSP bloque les iframes YouTube en production
**Priorité :** CRITIQUE — Fonctionnel
**Constat :** Le backend (`server.py` ligne 193) définit `frame-src https://www.google.com;` uniquement. Le composant `YouTubeEmbed` charge les iframes depuis `https://www.youtube-nocookie.com/embed/...`. Cette origine est absente de la politique CSP.
**Impact :** La bande-annonce sera bloquée par le navigateur en production pour tous les utilisateurs ayant donné leur consentement. Le parcours utilisateur principal (FR6) est cassé.
**Action :** Modifier la ligne CSP dans `backend/server.py` :
```python
"frame-src https://www.google.com https://www.youtube-nocookie.com https://www.youtube.com;"
```
Également ajouter les domaines nécessaires à `script-src` pour Google Tag Manager et `connect-src` pour les requêtes analytics.

### BLOCAGE 4 — Données de test non nettoyées
**Priorité :** CRITIQUE — Contenu
**Constat :** Le backlog (item 23) identifie explicitement que les données de test (événements, comptes partenaires, candidatures, profils membres de test) doivent être nettoyées avant le 20 mars. La base de données pointe vers `test_database` en dev.
**Impact :** Des données de test apparaîtraient sur le site public au lancement, nuisant à la crédibilité.
**Action :** Avant déploiement, nettoyer ou réinitialiser les collections MongoDB de production. S'assurer que le `DB_NAME` de production est `echo_production` (ou équivalent), distinct de `test_database`.

---

## 3. Risques Importants (à traiter avant ou juste après lancement)

### RISQUE 1 — Mentions légales avec numéro placeholder
**Priorité :** Important — Légal
**Constat :** La page `/mentions-legales` affiche `+33 6 00 00 00 00 [À COMPLÉTER]`.
**Impact :** Non-conformité légale. Les mentions légales doivent contenir les coordonnées réelles.
**Mitigation :** Compléter le numéro de téléphone avant le 20 mars.

### RISQUE 2 — Liens réseaux sociaux non configurés (12 liens `href="#"`)
**Priorité :** Moyen — UX
**Constat :** Footer (4 liens), Contact.tsx (social links), Serie.tsx (3 liens personnages) — tous pointent vers `#`.
**Impact :** Opportunité d'acquisition manquée dès le lancement. Les visiteurs qui cliquent sur les icônes sociales ne sont pas redirigés.
**Mitigation :** Fournir les URLs des comptes sociaux ECHO pour mise à jour avant le 20 mars.

### RISQUE 3 — Vidéo prologue/bande-annonce non confirmée
**Priorité :** Important — Contenu
**Constat :** Le backlog (item 21) indique que la bande-annonce est "prévue terminée le 18 mars 2026". L'ID vidéo actuellement configuré (`5NvxbMIbjAo`) dans `Serie.tsx` est peut-être provisoire.
**Impact :** Si la bande-annonce n'est pas disponible ou si l'ID n'est pas mis à jour, le contenu central du site sera manquant.
**Mitigation :** Confirmer l'ID vidéo YouTube final avant le 20 mars. Prévoir un plan B si la bande-annonce est retardée.

### RISQUE 4 — Chunk MyPartnerAccount très large (376 kB non gzippé)
**Priorité :** Moyen — Performance
**Constat :** `MyPartnerAccount-_s640noX.js` fait 376 kB (112 kB gzippé). La bibliothèque `recharts` (PartnerAnalytics) n'est pas extraite dans les `manualChunks` de `vite.config.ts`.
**Impact :** Les partenaires qui ouvrent leur espace de compte auront un chargement plus lent. Cela ne concerne pas les visiteurs grand public.
**Mitigation :** Ajouter `recharts` aux `manualChunks`. Effort faible (5 minutes). Peut être fait post-lancement sans impact critique.

### RISQUE 5 — Dashboard Partenaire non revu (rappel pré-lancement)
**Priorité :** Moyen — UX
**Constat :** Le fichier `shared-context.md` liste explicitement "Revoir le Dashboard Partenaire avant la sortie officielle (UX, données, design)" comme point ouvert.
**Impact :** Potentiellement une interface partenaire peu soignée lors du premier contact des partenaires.
**Mitigation :** Allouer une session de revue UX du Dashboard avant le 20 mars.

### RISQUE 6 — UptimeRobot non configuré
**Priorité :** Moyen — Opérationnel
**Constat :** Le PRD (critère de succès technique #18) exige une disponibilité de 99.5%+ surveillée par UptimeRobot. Aucune configuration n'est tracée dans le projet.
**Impact :** Pas d'alerte si le site tombe après le lancement.
**Mitigation :** Créer un compte UptimeRobot et configurer le monitoring sur `https://mouvementecho.fr` et `https://api.mouvementecho.fr/api/health` avant le lancement.

### RISQUE 7 — Ressources page non finalisée (backlog item 9)
**Priorité :** Basse — Contenu
**Constat :** La page `/ressources` est fonctionnelle (156 lignes, aucun TODO) mais le backlog indique qu'elle "reste" à modifier pour le contenu éditorial.
**Impact :** Contenu potentiellement incomplet ou générique.
**Mitigation :** Vérifier le contenu éditorial actuel avec l'équipe ECHO.

---

## 4. Conformité RGPD

**Statut : CONFORME** (audit du 2026-03-15 — 14 écarts corrigés)

| Point | Statut |
|-------|--------|
| Bannière cookies CMP | ✅ |
| Blocage YouTube avant consentement | ✅ |
| Notice reCAPTCHA v3 visible | ✅ |
| Case CGU/PC à l'inscription | ✅ |
| Emails/téléphones partenaires masqués publiquement | ✅ |
| Politique de confidentialité complète (15 sections) | ✅ |
| Registre des traitements (RoPA) | ✅ |
| Page "Mes données" (export + suppression) | ✅ |
| Clause mineurs CGU (15 ans+) | ✅ |
| Mention HelloAsso + notice /soutenir | ✅ |
| Procédure violation de données | ✅ |
| Désinscription emails (unsubscribe) | ✅ |
| Durées de conservation documentées | ✅ |
| Mentions légales complètes | ⚠️ Numéro de téléphone à compléter |
| Hébergement Europe (RGPD) | A vérifier lors du déploiement |

---

## 5. Sécurité

| Point | Statut |
|-------|--------|
| Mots de passe hashés bcrypt | ✅ |
| Auth cookie HttpOnly (jamais localStorage) | ✅ |
| 2FA sur comptes admin | ✅ |
| Rate limiting (auth, formulaires, contact) | ✅ |
| Headers sécurité (X-Frame-Options, CSP, HSTS prod) | ✅ |
| Validation MIME upload logo (Pillow) | ✅ |
| Honeypot anti-spam formulaires | ✅ |
| CORS restrictif (liste blanche) | ⚠️ Config dev en place, production à mettre à jour |
| reCAPTCHA v3 | ⚠️ Skippé si clé absente (clé absente du .env actuel) |
| Clé SendGrid | 🔴 Exposée dans le dépôt — à révoquer immédiatement |
| Google OAuth secrets | 🔴 Placeholders — à configurer |
| OAUTH_STATE_SECRET / UNSUBSCRIBE_SECRET | 🔴 Valeurs par défaut non sécurisées si ENVIRONMENT non mis à production |
| CSP frame-src YouTube | 🔴 youtube-nocookie.com absent — bande-annonce bloquée |

---

## 6. Performance

| Critère | Cible PRD | Mesuré | Statut |
|---------|-----------|--------|--------|
| Bundle index (gzip) | < 300 kB | 82.5 kB gzip / 267 kB brut | ✅ Conforme |
| Code splitting en place | Oui | React.lazy + manualChunks | ✅ |
| Cache API publiques (TTL > 5 min) | Oui | 30 min (analytics/stats) | ✅ |
| Build Vite propre | Oui | 0 erreurs, 2 warnings React Hook Form | ✅ |
| Chunk MyPartnerAccount | — | 376 kB / 112 kB gzip | ⚠️ recharts non extrait |
| SEO Open Graph | Oui | react-helmet-async sur toutes pages | ✅ |
| robots.txt | Oui | Présent, /admin bloqué | ✅ |
| sitemap.xml | Oui | Présent, domaine mouvementecho.fr | ✅ |
| Favicon | Oui | logo-echo.jpg (JPEG — idéalement ICO/SVG) | ⚠️ |

---

## 7. Tests

| Suite | Résultat |
|-------|---------|
| Backend (pytest) | ✅ 150 passed, 5 warnings |
| Frontend (vitest) | ✅ 18 passed (4 fichiers) |
| Lint ESLint | ✅ 0 erreurs, 2 warnings (React Hook Form — non bloquant) |
| Build production | ✅ Succès |

**Note :** Les tests backend ne peuvent être lancés qu'avec `cd backend && python -m pytest`. Depuis la racine, ils échouent avec `ModuleNotFoundError: No module named 'server'`. Ce comportement est connu et documenté dans CLAUDE.md.

---

## 8. Backlog — Items Non Résolus Impactant le Lancement

| # | Item | Impact |
|---|------|--------|
| 14 | Configurer SendGrid en production | 🔴 BLOQUANT |
| 21 | Crédits série + vidéo prologue → bande-annonce | 🔴 BLOQUANT (contenu clé) |
| 23 | Nettoyer données de test | 🔴 BLOQUANT |
| 15 | Liens sociaux (12 `href="#"`) | 🟠 Important |
| 9 | Ressources — contenu éditorial | 🟡 Moyen |
| 13 | Nouvelle charte graphique | 🟢 Basse — accepté post-lancement |
| 20 | Audit MongoDB + brainstorming | 🟢 Basse — post-lancement |
| 39 | Plan 3 phases Mouvement | 🟢 Basse — post-lancement |

---

## 9. Checklist Pré-Lancement

### Avant le 18 mars (CRITIQUE)

- [ ] **Révoquer la clé SendGrid exposée** dans le dépôt git. En générer une nouvelle.
- [ ] **Ajouter `.env` au `.gitignore`** et vérifier qu'il ne sera plus commité.
- [ ] **Créer le `.env` de production** sur le serveur avec toutes les valeurs réelles (MongoDB Atlas, Google OAuth, CORS, ENVIRONMENT=production, secrets forts).
- [ ] **Corriger la CSP** dans `backend/server.py` : ajouter `https://www.youtube-nocookie.com` à `frame-src`.
- [ ] **Configurer l'ID vidéo final** dans `Serie.tsx` dès que la bande-annonce est disponible (ID `5NvxbMIbjAo` à confirmer ou remplacer).
- [ ] **Compléter le numéro de téléphone** dans les Mentions Légales.

### Avant le 20 mars (IMPORTANT)

- [ ] **Fournir les URLs des réseaux sociaux** ECHO pour remplacer les `href="#"` (Footer, Contact, Serie).
- [ ] **Nettoyer les données de test** en base MongoDB de production (événements, partenaires, candidatures, membres).
- [ ] **Revue UX du Dashboard Partenaire** (rappel flagué dans shared-context.md).
- [ ] **Configurer UptimeRobot** (monitoring 99.5%+ exigé par le PRD).
- [ ] **Vérifier CORS de production** (`CORS_ORIGINS=https://mouvementecho.fr`).

### Déploiement

- [ ] Build frontend : `cd frontend && npm run build`
- [ ] Déployer le dossier `dist/` sur le CDN (Webstrator)
- [ ] Démarrer le backend avec Gunicorn/Uvicorn en mode production
- [ ] Vérifier que `ENVIRONMENT=production` est bien défini (active HSTS, valide les secrets)
- [ ] Tester le parcours complet : inscription → lecture vidéo → candidature partenaire → admin
- [ ] Vérifier la Console GA4 (G-KHBWHQQF6W configuré dans index.html)

### Post-Lancement (Sprint 1)

- [ ] Extraire `recharts` dans un chunk séparé (Vite manualChunks)
- [ ] Remplacer le favicon JPEG par un ICO ou SVG
- [ ] Backlog admin console (pagination, audit log, soft-delete)
- [ ] Internationalisation FR/EN (backlog item 48)

---

## 10. Analyse des Écarts PRD vs Implémenté

| Décision PRD | Implémentation | Écart |
|---|---|---|
| API versionnée `/api/v1/...` | Routes en `/api/...` (sans v1) | Accepté — prévu Phase 2 |
| SSG / pré-rendu pour SEO | SPA React + react-helmet-async | Partiel — Open Graph OK, pas de SSG complet |
| Favicon propre | `logo-echo.jpg` (JPEG) | Mineur |
| Authentification stateless JWT | Cookie HttpOnly (plus sécurisé) | Amélioration délibérée vs PRD |
| DB hébergée région EU | À vérifier lors du déploiement | Non vérifié |

---

## Synthèse

| Dimension | Score | Commentaire |
|---|---|---|
| Couverture fonctionnelle | 96% | 23/24 FR implémentées |
| Qualité du code | 90% | Tests verts, build propre, 0 erreur ESLint |
| Sécurité | 55% | 4 points critiques ouverts (clé exposée, OAuth, CSP, CORS) |
| RGPD | 92% | 14 écarts corrigés, 1 point légal ouvert (téléphone) |
| Performance | 85% | Bundle conforme, cache en place, chunk recharts à optimiser |
| Contenu éditorial | 75% | Liens sociaux manquants, bande-annonce à confirmer |
| Déploiement | 30% | Aucune configuration de production en place |

**Score composite : 78/100**

Le projet sera en état de lancement dès que les 4 blocages critiques seront résolus. La fenêtre de 4 jours est suffisante pour traiter tous les points de la checklist.

---

*Rapport généré le 2026-03-16 par Claude Code (Sonnet 4.6) — Workflow check-implementation-readiness*
