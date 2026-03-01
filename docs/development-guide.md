# Guide de Développement — Mouvement ECHO

## Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | 18+ |
| npm | 9+ |
| Python | 3.11+ |
| MongoDB | 5.0+ |

## Installation & Lancement

### Frontend

```bash
cd frontend
npm install
npm run dev          # Démarre sur http://localhost:5173
```

### Backend

```bash
cd backend
pip install -r requirements.txt

# Configurer le fichier .env
# MONGO_URL=mongodb://localhost:27017
# DB_NAME=echo_db
# CORS_ORIGINS=http://localhost:5173

uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Documentation API interactive

Avec le backend lancé : `http://localhost:8001/docs` (Swagger UI)

## Conventions de Code

### Frontend (TypeScript/React)

- **Composants** : Fonctions nommées exportées (`export function Button()`)
- **Fichiers** : PascalCase pour pages et composants (`Serie.tsx`, `Button.tsx`)
- **Props** : Types inline ou interfaces locales
- **Styling** : Classes Tailwind (préférer les tokens ECHO : `echo-gold`, `echo-dark`, etc.)
- **État** : `useState` local ; pas de state management global pour le moment

### Backend (Python/FastAPI)

- **Routes** : Un fichier par domaine dans `routes/` avec `APIRouter`
- **Modèles** : Pydantic `BaseModel` avec `Field` et `Config`
- **Dépendances** : DI FastAPI (`Depends(get_db)`, `Depends(require_admin)`)
- **Logging** : Module `logging` Python standard

## Structure de Routage Frontend

| Route | Composant | Wrappé par Layout ? |
|-------|-----------|-------------------|
| `/` | `Home` | ✅ (via App.tsx) |
| `/serie` | `Serie` | ✅ |
| `/mouvement` | `Mouvement` | ⚠️ (Layout interne) |
| `/echolink` | `ECHOLink` | ✅ |
| `/partenaires` | `ECHOsystem` | ✅ |
| `/agenda` | `Events` | ✅ |
| `/ressources` | `Resources` | ✅ |
| `/contact` | `Contact` | ✅ |

> **Note:** `Mouvement.tsx` inclut son propre `<Layout>` interne en plus du wrapper Layout du router. Les autres pages ne le font pas. C'est potentiellement un bug à corriger.

## Rôles & Permissions

| Action | User | Admin |
|--------|------|-------|
| Voir les épisodes | ✅ | ✅ |
| Sauvegarder la progression | ✅ | ✅ |
| Gérer son compte | ✅ | ✅ |
| CRUD épisodes | ❌ | ✅ |
| CRUD thématiques / ressources | ❌ | ✅ |
| Gestion utilisateurs | ❌ | ✅ |
| Upload vidéos | ❌ | ✅ |

## Compte Admin par défaut

Au premier lancement, créer un compte admin manuellement dans MongoDB :

```json
{
  "id": "...",
  "username": "darkthony",
  "email": "admin@projet-echo.fr",
  "password_hash": "...",
  "role": "admin"
}
```

## Déploiement

Voir le `README.md` à la racine pour les instructions de déploiement sur Webstrator.

## Points d'attention

1. **Email** : Le service email est un stub (logs en console). Implémenter SendGrid/AWS SES pour la production.
2. **Stockage vidéo** : Local pour le moment. Migration AWS S3 + CloudFront planifiée.
3. **2FA** : Mode démo (code affiché dans la réponse API). Retirer pour la production.
4. **CAPTCHA** : Booléen simple côté client. Implémenter reCAPTCHA pour la production.
5. **HTTPS** : Non configuré. À activer en production (Nginx/CloudFront).
