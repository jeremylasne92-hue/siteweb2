---
description: Guide des 3 niveaux de workflow selon la complexité du changement
---

# 🚦 Niveaux de Workflow ECHO

Ce guide définit les 3 niveaux de workflow selon la complexité du changement.

---

## Tableau de Décision

| Critère | 🟢 HOTFIX | 🟡 STANDARD | 🔴 MAJEUR |
|---------|-----------|-------------|-----------|
| Fichiers touchés | 1-2 | 3-10 | 10+ |
| Composants impactés | 1 | 2-4 | 5+ |
| Risque métier | Faible | Moyen | Élevé |
| Temps estimé | < 30 min | 30 min - 3h | > 3h |
| Tests requis | Unitaire zone | Unitaire + E2E | Complet |

---

## 🟢 Niveau HOTFIX (Microtâches)

**Quand l'utiliser** :
- Fix typo, correction orthographe
- Ajustement CSS mineur (couleur, padding)
- Bug évident avec solution simple
- Changement 1-2 fichiers

**Workflow** :
```
👤 Demande
   ↓
🏗️ Architect (évalue = HOTFIX)
   ↓
Agent concerné corrige
   ↓
🧪 QA Express (test unitaire zone touchée)
   ↓
📤 Push
   ↓
📚 Doc en différé (CHANGELOG sous 24h)
```

**Skip** : Scoping détaillé, Designer, Code Review, Doc API, Validation humaine
**Garde** : QA express, CHANGELOG en différé

---

## 🟡 Niveau STANDARD (Quotidien)

**Quand l'utiliser** :
- Nouvel endpoint + page associée
- Amélioration fonctionnelle existante
- Ajout composant UI
- Modification logique métier simple

**Workflow** :
```
👤 Demande
   ↓
🎯 Scoping rapide (5 min)
   ↓
🏗️ Planning + Locks
   ↓
🔧 Backend (si concerné)
   ↓
📚 Doc API (si Backend modifié)
   ↓
[🎨 Designer] ← SI impact visuel
   ↓
⚛️ Frontend
   ↓
🧪 QA (unitaire + E2E + perf)
   ↓
[👁️ Code Review] ← SI code critique
   ↓
📚 Doc Finale (CHANGELOG)
   ↓
📤 Push
```

**Optionnel** : Designer (si pas d'impact visuel), Code Review (si code simple)
**Garde** : QA complet, Documentation

---

## 🔴 Niveau MAJEUR (Features Complexes)

**Quand l'utiliser** :
- Nouveau module complet (ex: Echolink)
- Refonte UI/UX
- Migration technique
- Feature multi-composants
- Changements d'architecture

**Workflow** :
```
👤 Demande
   ↓
🎯 Scoping complet (questions, périmètre)
   ↓
🏗️ Planning détaillé + Locks + Validation utilisateur
   ↓
🔧 Backend
   ↓
📚 Doc API
   ↓
🎨 Designer (specs visuelles obligatoires)
   ↓
⚛️ Frontend
   ↓
🧪 QA Complet (unitaire + E2E + perf + sécu + a11y)
   ↓
👁️ Code Review obligatoire
   ↓
📚 Doc Finale (README + CHANGELOG + Guides)
   ↓
👤 Validation Humaine obligatoire
   ↓
📤 Push
```

**Tout obligatoire** : Tous agents, tous checkpoints, validation humaine

---

## Exemples Concrets

| Demande | Niveau | Justification |
|---------|--------|---------------|
| "Fix la faute de frappe sur Contact" | 🟢 HOTFIX | 1 fichier, 0 risque |
| "Change la couleur du bouton en vert" | 🟢 HOTFIX | 1 ligne CSS |
| "Ajoute un endpoint /api/newsletter" | 🟡 STANDARD | Backend + Doc, pas d'UI |
| "Crée une page Partenaires" | 🟡 STANDARD | Frontend + CSS, feature isolée |
| "Ajoute un formulaire de contact avec envoi email" | 🟡 STANDARD | Backend + Frontend, scope clair |
| "Refonte complète de la page d'accueil" | 🔴 MAJEUR | Plusieurs composants, impact visuel fort |
| "Ajoute le module Echolink complet" | 🔴 MAJEUR | Nouveau module, multi-fichiers |
| "Migration de Flask vers FastAPI" | 🔴 MAJEUR | Architecture, risque élevé |

---

## Règle de Choix

> [!IMPORTANT]
> L'Architect choisit le niveau en phase Scoping et le note dans `shared-context.md` section "Niveau Actif".

Si hésitation entre deux niveaux → **choisir le plus élevé**.

---

## 🧪 Mode SPIKE (Expérimentation)

**Quand l'utiliser** :
- Tester une nouvelle lib/framework
- Prototype UI jetable
- Benchmark de performance
- Explorer une solution technique

**Workflow** :
```
👤 "Je veux tester X"
   ↓
🏗️ Crée branche spike/nom
   ↓
Expérimentation libre (max 2h)
   ↓
📚 Note conclusions dans shared-context
   ↓
❌ Ne push pas OU ✅ Transforme en Standard/Majeur si validé
```

**Règles** :
- Durée max : 2h
- Branche jetable
- Conclusions toujours documentées
- Pas de push direct

---

## 🧪 Détail QA par Niveau

### QA Express (🟢 HOTFIX)
- Tests unitaires sur la zone modifiée uniquement
- Test manuel rapide navigateur (si UI)
- Smoke test (vérif que rien ne casse autour)
- **Durée : 5-10 min max**

### QA Standard (🟡 STANDARD)
- Tests unitaires complets
- Tests E2E sur le parcours impacté
- Tests de non-régression
- Lighthouse performance check
- **Durée : 20-40 min**

### QA Complet (🔴 MAJEUR)
- Tout Standard +
- Tests de sécurité (OWASP top 10)
- Tests d'accessibilité (axe/Lighthouse a11y)
- Tests de performance approfondis
- **Durée : 1-2h**

---

## 👁️ Code Reviewer en Mode Majeur

**Qui fait la revue ?**

| Option | Quand l'utiliser |
|--------|------------------|
| Agent Code Reviewer (Sonnet 4.5 lecture seule) | Code standard, logique métier |
| Validation humaine | Code critique (auth, paiement, données sensibles) |

> [!IMPORTANT]
> Pour le code critique (authentification, paiement), toujours préférer la validation humaine.

---

## 🚨 Règle Anti-Boucle Infinie

Si un agent revient **>3 fois** au même checkpoint (QA ou Code Review) :

1. L'Architect intervient
2. Diagnostique la cause (specs floues ? bug récurrent ?)
3. Actions possibles :
   - Refactorer le plan
   - Clarifier les specs
   - Escalader en validation humaine
   - Découper la tâche différemment

> [!WARNING]
> 3 aller-retours max sur un même checkpoint. Au-delà, intervention Architect obligatoire.

