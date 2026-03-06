# 🧠 ECHO - Contexte Partagé

> Ce fichier est la mémoire partagée entre tous les agents. Consultez-le avant toute action et mettez-le à jour après vos modifications.

---

## 📋 État du Projet

**Dernière mise à jour** : 2026-03-06
**Phase actuelle** : Sprint 2 — Epic 2 en cours
**Statut** : ✅ Opérationnel
**Dernier milestone** : Story 2.1 (Vitrine Vidéo) done — badge "Bientôt disponible" ajouté

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
| Story 2.1 Vitrine Vidéo | 🟢 HOTFIX | Ajout badge uniquement, page existante |

---

## 📝 Décisions Récentes

| Date | Décision | Agent |
|------|----------|-------|
| 2026-03-06 | Story 2.1 complétée — Badge "Bientôt disponible" sur cartes S1 (FR7) | Claude Code (Opus 4.6) |
| 2026-03-06 | Story 1.4 complétée — Epic 1 (Identité & Sécurité) DONE, 4/4 stories | Claude Code (Opus 4.6) |
| 2026-03-06 | Story 1.3 complétée — Reset mot de passe (backend + frontend + code review) | Antigravity (Gemini) |
| 2026-03-05 | Story 1.2 frontend complété (RegisterForm, EmailLoginForm, Login tabs, Register page, store enrichi) | Claude Code (Opus 4.6) |
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
| 2026-03-06 | 🟢 HOTFIX | Story 2.1 Vitrine Vidéo | ~5min (badge uniquement) | Frontend |
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

**Epic 1 (Identité & Sécurité) — TERMINÉ** (4/4 stories done)

**Prochaine priorité : Epic 2 — Contenu & Engagement Visiteur**
1. ~~**Story 2.1** — Vitrine vidéo / bande-annonce~~ (done)
2. **Story 2.2** — Exploration des épisodes opt-in (backlog)
3. **Story 2.3** — Candidatures techniques anti-spam (backlog)
4. **Story 2.4** — Passerelle de soutien et dons (backlog)

### Notes techniques

- Plugin `pytest-recording` (vcrpy) incompatible avec urllib3 — utiliser `-p no:recording`
- Frontend bundle > 500kB — code splitting recommandé (Epic 2+)
- Routes protégées : `/cognisphere`, `/echolink`, `/admin/partenaires` (admin), `/mon-compte/partenaire`
