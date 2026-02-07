# 🧠 ECHO - Contexte Partagé

> Ce fichier est la mémoire partagée entre tous les agents. Consultez-le avant toute action et mettez-le à jour après vos modifications.

---

## 📋 État du Projet

**Dernière mise à jour** : 2026-02-07  
**Phase actuelle** : Maintenance et évolutions  
**Statut** : ✅ Opérationnel

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

### Backend (Flask)
```
backend/
├── app.py         # Point d'entrée
└── ...
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
| Contact | `/contact` | ✅ Complète |
| Événements | `/events` | ✅ Complète |
| ECHOsystem | `/echosystem` | ✅ Complète |

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
| _Aucune tâche en cours_ | - | - |

---

## 📝 Décisions Récentes

| Date | Décision | Agent |
|------|----------|-------|
| 2026-02-08 | Ajout mode SPIKE, QA détaillé, règle anti-boucle | Architect |
| 2026-02-07 | Workflow v4 avec 3 niveaux (Hotfix/Standard/Majeur) | Architect |
| 2026-02-07 | Designer repositionné AVANT Frontend | Architect |
| 2026-02-07 | Mise en place architecture multi-agents | Architect |

---

## 📊 Historique des Niveaux

> Pour analyse rétrospective : calibrer les estimations de niveau.

| Date | Niveau | Feature | Durée réelle | Agent(s) |
|------|--------|---------|--------------|----------|
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

_À compléter par l'Architect selon les demandes utilisateur_
