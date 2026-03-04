# Deep-Dive Documentation: Authentification & Sécurité

**Date générée:** 2026-03-04
**Module concerné:** Gestion de l'Authentification Backend (FastAPI)
**Fichiers analysés:** 4
**Lignes de Code:** ~550 LOC

## 🎯 Objectif et Contexte
Ce document détaille l'architecture du système d'authentification de la plateforme ECHO. Il inclut une gestion d'authentification classique (Email/Mot de passe), une authentification tiers (Google OAuth via l'agent Emergent), ainsi qu'une vérification à deux facteurs (2FA) par email. Le module gère également les sessions persistantes (`sessions_token`) et la modération des rôles (RBAC).

---

## 📂 File Inventory & Contracts

### 1. `backend/routes/auth.py`
**Objectif :** Gère les endpoints REST de l'authentification et du cycle de vie des sessions.
**Dépendances :** `fastapi`, `motor`, `httpx` (pour l'appel OAuth), `models.py`, `auth_utils.py`, `email_service.py`

**Routes Exposées (Contrats) :**
- `POST /auth/register` : Crée un utilisateur. Si `enable_2fa` est True, génère le code et renvoie `requires_2fa: True`.
- `POST /auth/login` : Login classique. **⚠️ Note :** `captcha_verified` envoyé par le client est pour l'instant trusted. Si 2FA activé, suspend la session en attente du code. Sinon, crée et définit le cookie `session_token`.
- `POST /auth/verify-2fa` : Valide le code 2FA soumis (max 5 tentatives) et crée le `session_token`.
- `POST /auth/google-oauth` : Valide un `session_id` auprès du serveur `demobackend.emergentagent.com`, enregistre ou connecte l'utilisateur.
- `GET /auth/me` : Renvoie les informations du profil de la session courante.
- `DELETE /auth/user/{user_id}` : Suppression du compte. Limité à l'utilisateur lui-même.
- `POST /auth/logout` : Invalide le cookie de session et supprime le token en base.

**Méthodes Centrales :**
- `get_current_user(...)` : Dépendance FastAPI principale qui lit le cache du cookie `session_token` ou le header `Authorization: Bearer`.
- `require_admin(...)` : Extension de dépendance contrôlant le statut `role == "admin"`.

### 2. `backend/auth_utils.py`
**Objectif :** Utilitaires de cryptographie et de vérification.
**Exportations notables :**
- `hash_password(password: str) -> str` : Hash en bcrypt.
- `verify_password(plain_password: str, hashed_password: str) -> bool`
- `generate_session_token() -> str` : Sécurisé via `secrets.token_urlsafe(32)`.
- `generate_2fa_code() -> str` : Génère code numérique 4 lettres (via `random.choices`).

### 3. `backend/models.py` (Auth fragment)
**Objectif :** Validation Pydantic pour I/O et MongoDB.
- `User` : Contient l'email, username, mot de passe hashé, rôle, `is_2fa_enabled` et traces OAuth. L'`id` est assigné via `uuid4()`.
- `UserSession` : Garde trace des expires_at (Actuellement configuré pour 7 jours de validité TTL).
- `Pending2FA` : Stocke le code de sécurité éphémère et traque la variable `attempts` (incrément jusqu'à erreur fatale au bout de 5).

### 4. `backend/email_service.py`
**Objectif :** Distribution de code. (Actuellement en mode Débogage).
- **Risque de déploiement :** Les fonctions `send_2fa_code` loggent actuellement en console locale mais n'implémentent aucun Provider Transactionnel (ex: SendGrid/AWS).

---

## 🔄 Data Flow (Authentification 2FA)

1. Client envoie `POST /auth/login` avec identifiants (inclut `captcha_verified`).
2. Serveur valide en MongoDB. Si `is_2fa_enabled == True` 👇
3. Crée doc `Pending2FA` avec expiration H+10 minutes.
4. Envoie email (virtuel prémédité dans `email_service.py`).
5. Renvoie `{ "requires_2fa": true }` sans créer de JWT / Cookie.
6. Client affiche écran PIN.
7. Client envoie `POST /auth/verify-2fa` avec `code` et `user_id`.
8. Serveur compare (increment de `attempt` à l'échec). Succès : Efface le `Pending2FA`, crée `UserSession`, retourne le cookie en Set-Cookie header.

---

## 🎯 Observations & TODOs (Party Mode Baseline)

| Fichier | Composant | Todo / Observation Détectée | Criticité |
|---------|-----------|-----------------------------|-----------|
| `auth.py` | Captcha | Le paramètre `credentials.captcha_verified` est validé uniquement coté front. L'absence de vérification du Google reCAPTCHA Secret interdisant un bypass HTTP direct côté backend ouvre le serveur au brute-force massif. | **HIGH** |
| `auth.py` | Google Auth | La route demande le `session_id` au microservice Emergent synchronisé sans vérifier un possible nonce mitigant un Replay Attack côté client. Faisable si Emergent gère ce risque. | **MEDIUM** |
| `email_service.py` | Emails | Le stub actuel écrit un log console. Doit être bindé au fournisseur de mailing réel avant la prod. | **Blocker Phase 1** |
| `auth.py` | Session Cookie | Le cookie `session_token` est configuré à `httponly=True, samesite="lax"`. Il manque systématiquement l'attribut `secure=True` (à imposer dynamiquement si `ENV == production` pour éviter les vols MITM). | **MEDIUM** |
