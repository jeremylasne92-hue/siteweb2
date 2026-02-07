---
description: Méthodologie d'orchestration multi-agents v4 pour le projet ECHO
---

# 🎯 Orchestration Multi-Agents ECHO v4

Ce workflow définit comment les agents sont coordonnés avec **3 niveaux de rigueur** selon la complexité.

---

## Phase 0 : Triage (OBLIGATOIRE)

**Agent** : 🏗️ Architect

> [!CAUTION]
> Toujours commencer par choisir le niveau de workflow.

1. Analyser la demande
2. Consulter `orchestration-levels.md` pour les critères
3. **Choisir le niveau** : 🟢 HOTFIX / 🟡 STANDARD / 🔴 MAJEUR
4. Noter le niveau dans `shared-context.md` section "Niveau Actif"
5. Suivre le workflow correspondant

**Critères de décision rapide** :

| Critère | 🟢 HOTFIX | 🟡 STANDARD | 🔴 MAJEUR |
|---------|-----------|-------------|-----------|
| Fichiers | 1-2 | 3-10 | 10+ |
| Temps | < 30 min | 30 min - 3h | > 3h |
| Risque | Faible | Moyen | Élevé |

---

## 🟢 Workflow HOTFIX (Microtâches)

```
👤 Demande → 🏗️ Évalue = HOTFIX → Agent corrige → 🧪 QA Express → 📤 Push
                                                                      ↓
                                                         📚 CHANGELOG (sous 24h)
```

**Applicable** : typo, ajustement CSS, bug évident
**Skip** : Scoping, Designer, Code Review, Doc API

---

## 🟡 Workflow STANDARD (Quotidien)

```
👤 Demande
      ↓
🎯 Scoping rapide (5 min)
      ↓
🏗️ Planning + Locks
      ↓
🔧 Backend (si concerné) → 📚 Doc API
      ↓
[🎨 Designer] ← optionnel si impact visuel
      ↓
⚛️ Frontend (lit specs Designer si existantes)
      ↓
🧪 QA (unitaire + E2E + perf)
      ↓
[👁️ Code Review] ← optionnel si code critique
      ↓
📚 Doc Finale (CHANGELOG)
      ↓
📤 Push
```

**Applicable** : nouvel endpoint, nouvelle page, amélioration
**Optionnel** : Designer (si pas d'impact visuel), Code Review (si code simple)

---

## 🔴 Workflow MAJEUR (Features Complexes)

```
👤 Demande
      ↓
🎯 Scoping complet (questions + périmètre)
      ↓
🏗️ Planning détaillé + Locks + Validation utilisateur
      ↓
🔧 Backend → 📚 Doc API
      ↓
🎨 Designer (specs visuelles OBLIGATOIRES)
      ↓
⚛️ Frontend
      ↓
🧪 QA Complet (unitaire + E2E + perf + sécu + a11y)
      ↓
👁️ Code Review OBLIGATOIRE
      ↓
📚 Doc Finale (README + CHANGELOG + Guides)
      ↓
👤 Validation Humaine OBLIGATOIRE
      ↓
📤 Push
```

**Applicable** : nouveau module, refonte, migration
**Tout obligatoire** : tous agents, tous checkpoints

---

## Détail des Phases

### Phase Scoping (STANDARD + MAJEUR)

1. Analyser la demande en détail
2. Poser des questions de clarification si nécessaire
3. Définir le périmètre (in-scope / out-of-scope)
4. Vérifier blocages actifs

### Phase Planning

1. Créer `implementation_plan.md`
2. Poser les locks (2h max)
3. Définir l'ordre des agents

### Phase Exécution

**Backend** → Endpoints, modèles
**Doc API** → Documentation immédiate (MOMENT 1)
**Designer** → Specs visuelles dans `shared-context.md`
**Frontend** → Implémente selon specs

### Phase Validation

**QA/Tester** :
- 🟢 HOTFIX : Test unitaire zone touchée
- 🟡 STANDARD : Unitaire + E2E + perf
- 🔴 MAJEUR : Complet (+ sécu + a11y)

**Code Review** :
- 🟢 HOTFIX : Skip
- 🟡 STANDARD : Optionnel
- 🔴 MAJEUR : Obligatoire

### Phase Documentation

- 🟢 HOTFIX : CHANGELOG en différé (24h)
- 🟡 STANDARD : CHANGELOG
- 🔴 MAJEUR : README + CHANGELOG + Guides

---

## 🚨 Mode Hotfix Post-Push (Urgences)

Pour bugs critiques découverts après Push :

```
Architect → Agent concerné → QA express → Push immédiat → Doc en différé
```

---

## Gestion des Locks

| Règle | Valeur |
|-------|--------|
| Durée max | 2h |
| Expiration | Libération automatique |
| Conflit | Attendre ou demander libération |

---

## Règles d'Or

> [!CAUTION]
> **Toujours choisir le niveau AVANT de commencer**

> [!IMPORTANT]
> **Si hésitation → choisir le niveau supérieur**

> [!IMPORTANT]
> **Designer AVANT Frontend (STANDARD/MAJEUR avec impact visuel)**

> [!WARNING]
> **HOTFIX = documentation en différé, pas d'excuse pour l'oublier**

---

## Engagement Architect

1. **Trier** : Toujours choisir le niveau en premier
2. **Adapter** : Suivre le workflow du niveau choisi
3. **Justifier** : Tout écart au niveau noté dans shared-context
4. **Exécuter** : Ordre strict pour STANDARD et MAJEUR
5. **Valider** : QA obligatoire à tous les niveaux
6. **Documenter** : CHANGELOG toujours (immédiat ou différé)
