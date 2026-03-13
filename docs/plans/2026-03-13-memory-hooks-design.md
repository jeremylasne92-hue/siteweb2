# Design — Hooks de mémoire automatique

**Date**: 2026-03-13
**Statut**: Approuvé

## Objectif

Capturer automatiquement le contexte des sessions Claude Code via des hooks,
pour que chaque nouvelle session démarre avec la connaissance de ce qui s'est
passé dans les sessions précédentes.

## Architecture

### Hooks (3)

| Hook | Événement | Type | Rôle |
|------|-----------|------|------|
| session-start.sh | SessionStart | command | Injecte le contexte (MEMORY.md + dernier résumé) |
| log-commands.sh | PostToolUse (Bash) | command | Log les commandes exécutées en JSONL |
| session-summary | SessionEnd | agent | Résume la session dans latest-summary.md |

### Fichiers

```
.claude/
  hooks/
    session-start.sh
    log-commands.sh
  settings.json          # Config hooks (projet)
memory/
  sessions/
    session-log.jsonl    # Journal commandes (écrasé à chaque session)
    latest-summary.md    # Dernier résumé (écrasé à chaque session)
```

### Décisions

- **SessionEnd** (pas Stop) pour le résumé — évite de tourner à chaque réponse
- **agent** (Haiku) pour le résumé — besoin d'IA pour synthétiser
- **JSONL** pour le log — append-only, léger, facile à parser
- **session-log.jsonl écrasé** à chaque SessionStart — on ne garde que la session courante
- **latest-summary.md** écrasé par le résumé — seul le dernier compte

## Ce qui ne change pas

- memory/MEMORY.md reste l'index principal (mis à jour manuellement)
- ~/.claude/settings.json global non touché
- Aucune dépendance externe ajoutée
