# Consolidation MVP — Lancement Securise

> Design valide le 2026-03-07
> Objectif : corriger les problemes critiques avant le lancement du 20 mars 2026

---

## Contexte

Audit complet realise le 7 mars 2026 couvrant securite, tests, UX et performance.
4 issues critiques securite, 2 critiques robustesse, 2 critiques SEO/UX identifiees.

Approche retenue : **Lancement Securise** — focus sur les critiques uniquement.

---

## Scope

### Section 1 : Securite Backend

#### 1.1 CAPTCHA server-side
- **Fichier** : `backend/routes/auth.py` (L104-110)
- **Probleme** : `captcha_verified: bool` trusted client-side, contournable
- **Solution** :
  - Remplacer par validation serveur Google reCAPTCHA v3
  - Appel `httpx.post("https://www.google.com/recaptcha/api/siteverify")` avec token
  - Nouveau champ modele : `captcha_token: str` au lieu de `captcha_verified: bool`
  - Nouvelle env var : `RECAPTCHA_SECRET_KEY`
  - Seuil score reCAPTCHA : >= 0.5

#### 1.2 Logs 2FA nettoyes
- **Fichiers** : `backend/routes/auth.py` (L144), `backend/email_service.py` (L21)
- **Probleme** : Codes 2FA logges en clair
- **Solution** : Remplacer par `logger.info(f"2FA code sent to {email}")` sans le code

#### 1.3 Cookies securises
- **Fichier** : `backend/routes/auth.py` (L88-94, 165-171, 236-242, 282-288)
- **Probleme** : Pas de `secure=True` sur les cookies session
- **Solution** :
  - Ajouter `secure=True` sur les 4 `set_cookie()`
  - Conditionner via env var `ENVIRONMENT` (dev=False, prod=True)
  - Ajouter `ENVIRONMENT` dans `.env` et `core/config.py`

#### 1.4 Suppression localStorage token
- **Fichier** : `frontend/src/features/auth/store.ts` (L24, 30)
- **Probleme** : Token en localStorage = vulnerable XSS
- **Solution** :
  - Supprimer tout usage `localStorage.*session_token*`
  - Utiliser `credentials: 'include'` dans tous les fetch API
  - Le backend utilise deja le cookie httpOnly comme source principale
  - Adapter `checkSession()` pour appeler `/auth/me` avec cookie
  - Mettre a jour CORS : `allow_credentials=True` (deja en place)

### Section 2 : Robustesse Frontend

#### 2.1 Error Boundary React
- **Nouveau fichier** : `frontend/src/components/ErrorBoundary.tsx`
- Class component React avec `componentDidCatch`
- Fallback UI : message d'erreur + bouton "Recharger"
- Style coherent avec le theme Nature (echo-*)
- Wrap dans `App.tsx` autour de `<Routes>`

#### 2.2 Page 404
- **Nouveau fichier** : `frontend/src/pages/NotFound.tsx`
- Message "Page introuvable" + lien retour accueil
- Lazy-loaded
- Route `<Route path="*" element={<NotFound />} />` en fin de Routes

### Section 3 : SEO & Meta

#### 3.1 Meta tags index.html
- **Fichier** : `frontend/index.html`
- Titre : `ECHO — Mouvement citoyen & serie documentaire`
- Meta description
- Open Graph tags (og:title, og:description, og:image, og:url)
- Twitter Card tags

#### 3.2 Corrections HTML
- `lang="fr"` au lieu de `lang="en"`
- Favicon avec logo ECHO existant

---

## Hors scope (report post-lancement)

- Tests supplementaires (couverture backend/frontend)
- Accessibilite ARIA / focus trap modals
- Lazy loading images / srcSet
- Optimisation build Vite avancee
- Codes 2FA 6 chiffres
- Reset token cryptographique
- SameSite=Strict
- Rate limiting /verify-2fa
