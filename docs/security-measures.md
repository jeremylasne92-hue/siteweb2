# Mesures techniques et organisationnelles — RGPD art. 32

**Responsable** : Jeremy LASNE, President
**Association** : Mouvement ECHO — SIRET 933 682 510 00013
**Contact** : contact@mouvementecho.fr
**Date de mise a jour** : 2026-03-21

---

## 1. Chiffrement

| Mesure | Detail |
|---|---|
| Transport | HTTPS obligatoire via Let's Encrypt (TLS 1.2+) |
| Mots de passe | Hashage bcrypt avec 12 rounds de salage |
| Cookies d'authentification | httpOnly, Secure, SameSite=Lax |
| Base de donnees | MongoDB Atlas avec chiffrement au repos (AES-256) et en transit (TLS) |
| Emails | SendGrid avec chiffrement TLS en transit |

## 2. Authentification

| Mesure | Detail |
|---|---|
| Authentification principale | Email/mot de passe avec cookies httpOnly |
| OAuth | Google OAuth 2.0 (authentification simplifiee) |
| 2FA | TOTP optionnel (6 digits, secrets.choice CSPRNG), jamais logge en clair |
| Sessions | Tokens de session avec expiration 24h, stockes cote serveur (MongoDB) |
| Tokens de reinitialisation | Expiration 24h, usage unique, TTL MongoDB auto-suppression |
| Brute force 2FA | Rate limiting 5 tentatives / 15 min par IP |

## 3. Controle d'acces

| Mesure | Detail |
|---|---|
| Roles | Trois niveaux : user, member, admin |
| Verification | Cote serveur systematique (middleware FastAPI, decorateur `require_admin`) |
| Endpoints admin | Proteges par `require_admin` |
| Principe du moindre privilege | Chaque role n'accede qu'aux ressources necessaires |
| Nombre d'admins | 2 administrateurs identifies |

## 4. Protection reseau et API

| Mesure | Detail |
|---|---|
| Rate limiting | IP-based : 5 tentatives/15 min sur 2FA, 3/heure sur contact |
| CORS | Configuration stricte (origines autorisees uniquement) |
| CSRF | Validation Origin/Referer sur requetes mutantes (POST/PUT/PATCH/DELETE) |
| CAPTCHA | reCAPTCHA v3 server-side (validation backend, skip si cle absente) |
| Honeypot | Champ cache sur formulaire de contact (rejet silencieux des bots) |
| IP anonymisees | Adresses IP tronquees avant stockage (rate limiting) |
| Taille requete | Limite 10 Mo (middleware, sauf endpoints upload) |

## 5. Headers de securite

| Header | Valeur |
|---|---|
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | geolocation=(), microphone=(), camera=() |
| Content-Security-Policy | Politique restrictive (self + domaines autorises) |
| Strict-Transport-Security | max-age=31536000; includeSubDomains (production) |

## 6. Infrastructure

| Composant | Hebergeur | Localisation | Securite |
|---|---|---|---|
| Frontend | OVHcloud | France | Serveurs en France, HTTPS |
| Backend API | Render | Francfort (UE) | Auto-deploy, HTTPS, isolation conteneur |
| Base de donnees | MongoDB Atlas | Paris eu-west-3 (UE) | Chiffrement AES-256 au repos, TLS en transit, replica set, sauvegardes continues |
| Emails | SendGrid / Twilio | US (clauses contractuelles types) | DKIM, SPF, DMARC configures |

## 7. Protection des emails

| Mesure | Detail |
|---|---|
| Authentification | DKIM + SPF + DMARC configures sur le domaine |
| Desinscription | Lien HMAC signe (inviolable, non devinable) |
| Activation | Envoi uniquement si SENDGRID_API_KEY + ENVIRONMENT=production |
| Anti-abus | Rate limiting sur les endpoints declenchant des emails |

## 8. Integrite et disponibilite des donnees

| Mesure | Detail |
|---|---|
| Replication | MongoDB Atlas avec replica set automatique |
| Sauvegardes | Sauvegardes automatiques MongoDB Atlas (continues, point-in-time recovery) |
| TTL automatique | Index MongoDB TTL pour suppression automatique des donnees expirees |
| Suppression RGPD art. 17 | Auto-purge des comptes avec `deletion_requested_at` apres 30 jours |
| Contact messages | TTL 6 mois (180 jours) sur `created_at` |
| Candidatures | TTL 2 ans sur `created_at` |
| Analytics | TTL 12 mois sur `created_at` |
| Sessions | TTL auto-expiration via `expires_at` |

## 9. Journalisation et audit

| Mesure | Detail |
|---|---|
| Logs serveur | Render (stdout/stderr), rotation automatique |
| Requetes lentes | Detection et alerte si > 2 secondes |
| Erreurs 5xx | Compteur en memoire pour monitoring |
| Actions admin | Collection `admin_actions` avec horodatage, retention 3 ans |
| Analytics | Events anonymises, retention 12 mois (TTL) |
| Rate limit | Enregistrement des tentatives par IP anonymisee |
| Health check | Endpoint `/api/health` avec latence DB et uptime |

## 10. Securite du developpement

| Mesure | Detail |
|---|---|
| Donnees de dev | Pas de donnees reelles en environnement de developpement |
| Secrets | `.env` non commite (dans `.gitignore`), variables d'environnement |
| Revue de code | Revue systematique avant merge |
| Dependances | Verification reguliere des vulnerabilites (npm audit, pip audit) |
| CSP | Content Security Policy configuree (scripts, styles, images) |
| Validation | Pydantic (backend) pour validation stricte des entrees |
| XSS | React echappe par defaut, pas de `dangerouslySetInnerHTML` |
| API docs | Desactivees en production (docs_url=None, redoc_url=None) |

## 11. Mise a jour et maintenance

| Mesure | Detail |
|---|---|
| Dependances | Verification reguliere des mises a jour de securite |
| Correctifs | Application rapide des correctifs critiques |
| Monitoring | Surveillance des alertes de securite (GitHub, npm, PyPI) |
| Incident response | Procedure documentee dans `docs/incident-response.md` |
| Audit | Audit de securite pre-lancement realise (2026-03-17) |
