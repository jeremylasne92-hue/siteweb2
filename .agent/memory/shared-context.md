# 🧠 ECHO - Contexte Partagé

> Ce fichier est la mémoire partagée entre tous les agents. Consultez-le avant toute action et mettez-le à jour après vos modifications.

---

## 📋 État du Projet

**Dernière mise à jour** : 2026-03-05
**Phase actuelle** : Sprint 1 — Epic 1 (Authentification)
**Statut** : ✅ Opérationnel
**Story en cours** : 1.2 Authentification Classique Sécurisée → **review** (code complet, tests OK, build OK)

---

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)
```
frontend/src/
├── components/
│   ├── layout/    # Header, Footer
│   └── ui/        # Button, Card, Input
├── pages/         # Home, Serie, Contact, Events, ECHOsystem
├── App.tsx        # Router principal
├── main.tsx       # Point d'entrée
└── index.css      # Styles globaux + thème Nature
```

### Backend (FastAPI + MongoDB via Motor)
```
backend/
├── server.py              # Point d'entrée FastAPI (port 8000)
├── models.py              # Pydantic models (User, UserRegister, UserLoginLocal, etc.)
├── auth_utils.py          # hash_password, verify_password (bcrypt/passlib)
├── routes/
│   ├── auth.py            # /register, /login-local, /login, /google/*, /me, /logout
│   ├── episodes.py        # CRUD épisodes
│   ├── progress.py        # Suivi progression vidéo
│   ├── videos.py          # Upload/streaming vidéo
│   ├── users.py           # Gestion utilisateurs (admin)
│   ├── partners.py        # Gestion partenaires
│   ├── thematics.py       # Thématiques
│   └── resources.py       # Ressources
├── services/
│   ├── auth_service.py    # Google OAuth service
│   └── auth_local_service.py  # Register/Login local (Service Pattern)
├── core/config.py         # Settings centralisés
└── tests/routes/
    └── test_auth_local.py # 6 tests (register + login)
```

---

## 🎨 Thème Nature - Conventions

### Palette Active
| Nom | Variable | Hex |
|-----|----------|-----|
| Forêt Foncé | `--color-forest-dark` | #1a3a2f |
| Forêt Moyen | `--color-forest-medium` | #2d5a47 |
| Sable Clair | `--color-sand-light` | #f5f0e6 |

### Classes Réutilisables
- `.glass-card` : Effet glassmorphism
- `.nature-shadow` : Ombre douce verte
- `.organic-transition` : Animation fluide

---

## 📄 Pages Existantes

| Page | Route | Statut |
|------|-------|--------|
| Accueil | `/` | ✅ Complète |
| La Série | `/serie` | ✅ Complète |
| Le Mouvement | `/mouvement` | ✅ Complète |
| Cognisphère | `/cognisphere` | ✅ Complète |
| ECHOLink | `/echolink` | 🔄 WIP |
| ECHOsystem | `/partenaires` | ✅ Complète |
| Événements | `/agenda` | ✅ Complète |
| Ressources | `/ressources` | ✅ Complète |
| Soutenir | `/soutenir` | ✅ Complète |
| Contact | `/contact` | ✅ Complète |
| Login | `/login` | ✅ Complète (tabs Google + Email) |
| Inscription | `/register` | ✅ Complète (Story 1.2) |
| Google Callback | `/auth/google/success` | ✅ Complète |
| Admin Partenaires | `/admin/partenaires` | ✅ Complète |
| Mon Compte Partenaire | `/mon-compte/partenaire` | ✅ Complète |

---

## 🔄 Workflows Disponibles

- `/orchestration` : **Méthodologie obligatoire** (v4 avec niveaux)
- `/orchestration-levels` : Guide des 3 niveaux de workflow
- `/start-dev` : Lance frontend + backend
- `/build` : Build production
- `/deploy` : Déploiement complet
- `/git-push` : Commit et push rapide

---

## 🚦 Niveau Actif

> L'Architect note ici le niveau choisi pour la tâche en cours.

| Tâche | Niveau | Justification |
|-------|--------|---------------|
| Story 1.2 — Auth Classique Sécurisée | 🟡 STANDARD | Backend + Frontend, 13 fichiers, scope clair |

---

## 📝 Décisions Récentes

| Date | Décision | Agent |
|------|----------|-------|
| 2026-03-05 | Story 1.2 frontend complété (RegisterForm, EmailLoginForm, Login tabs, Register page, store enrichi) — en review | Claude Code (Opus 4.6) |
| 2026-03-05 | Story 1.2 backend complété (service pattern, models, routes, 6 tests OK) | Antigravity (Gemini) |
| 2026-03-05 | Correction shared-context : Backend = FastAPI (pas Flask), port 8000 | Claude Code (Opus 4.6) |
| 2026-02-08 | Ajout mode SPIKE, QA détaillé, règle anti-boucle | Architect |
| 2026-02-07 | Workflow v4 avec 3 niveaux (Hotfix/Standard/Majeur) | Architect |
| 2026-02-07 | Designer repositionné AVANT Frontend | Architect |
| 2026-02-07 | Mise en place architecture multi-agents | Architect |

---

## 📊 Historique des Niveaux

> Pour analyse rétrospective : calibrer les estimations de niveau.

| Date | Niveau | Feature | Durée réelle | Agent(s) |
|------|--------|---------|--------------|----------|
| 2026-03-05 | 🟡 STANDARD | Story 1.2 Auth Classique | Backend: ~1h (Antigravity), Frontend: ~30min (Claude Code) | Backend, Frontend |
| _Exemple_ | 🟢 HOTFIX | Fix typo Contact | 10 min | Frontend |
| _Exemple_ | 🟡 STANDARD | Page Partenaires | 2h | Frontend, Designer |
| _Exemple_ | 🔴 MAJEUR | Module Echolink | 5h | Tous |

---

## 🔒 Locks Actifs

> Les agents doivent vérifier cette section AVANT de modifier un fichier.
> **Durée max : 2h** - Après expiration, le lock est considéré libéré.

| Fichier | Agent | Depuis | Expiration |
|---------|-------|--------|------------|
| _Aucun lock actif_ | - | - | - |

---

## 🚧 Blocages Actifs

> Les agents peuvent marquer ici leurs tâches bloquées par des dépendances externes.

| Agent | Tâche | Bloqué par | Date | Action requise |
|-------|-------|------------|------|----------------|
| _Aucun blocage_ | - | - | - | - |

---

## 📐 Design Specs

> Section remplie par le Designer AVANT le Frontend.

_Aucune spec en cours._

<!--
### Exemple de format :
### [Nom Composant/Page]
- **Couleur fond** : `--color-sand-light`
- **Couleur texte** : `--color-forest-dark`
- **Espacement** : padding 24px, gap 16px
- **Effets** : `.glass-card`, `.nature-shadow`
- **Animation** : fade-in 0.3s, hover scale 1.02
- **Responsive** : stack vertical < 768px
-->

---

## ⚠️ Points d'Attention

- Toujours utiliser les variables CSS du thème Nature
- Tester sur mobile avant de valider
- Mettre à jour ce fichier après chaque modification majeure
- **Vérifier les locks avant de modifier un fichier**
- **QA et Code Review sont obligatoires avant push**
- **Designer intervient AVANT Frontend**
- **Phase de Scoping obligatoire avant planification**

---

## 🚀 Prochaines Tâches

1. **Story 1.2 — Code Review** : Revue du code avant commit (QA express + review)
2. **Story 1.3 — Réinitialisation de Mot de Passe** : Email transactionnel SendGrid (backlog)
3. **Story 1.4 — Isolation des Vues Privées** : Guard auth, message incitatif (backlog)

### Notes pour reprise par Antigravity

- Story 1.2 est en statut **review** — toutes les tâches sont complétées
- Backend tests: 6/6 OK (`pytest tests/routes/test_auth_local.py -p no:recording`)
- Frontend build: OK (warning chunk > 500kB à adresser plus tard via code splitting)
- Les fichiers ne sont PAS encore commités — faire code review puis commit
- Le plugin `pytest-recording` (vcrpy) est incompatible avec la version actuelle de urllib3 — utiliser `-p no:recording` pour les tests
- Le `shared-context.md` a été corrigé : Backend = **FastAPI** (pas Flask), architecture à jour
