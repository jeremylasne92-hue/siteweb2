# 🧠 ECHO - Contexte Partagé

> Ce fichier est la mémoire partagée entre tous les agents. Consultez-le avant toute action et mettez-le à jour après vos modifications.
> 📦 Historique pré-lancement archivé dans `archive-pre-lancement.md`

---

## 📋 État du Projet

**Dernière mise à jour** : 2026-04-03
**Phase actuelle** : 🚀 LANCÉ — Site en production (20 mars 2026)
**Statut** : ✅ EN LIGNE — https://mouvementecho.fr
**Infrastructure** : OVH mutualisé (frontend) + Render (backend API) + MongoDB Atlas M0 (DB) + SendGrid (emails)

### ✅ Configuration Production (complète)
- HTTPS Let's Encrypt actif (expire 18/06/2026)
- Google Search Console vérifié + sitemap soumis
- SendGrid Domain Authentication (DKIM s1/s2 + SPF + DMARC) ✅
- EMAIL_FROM = noreply@mouvementecho.fr
- Custom domain Render : api.mouvementecho.fr (Verified + Certificate Issued)
- Toutes variables Render configurées (OAUTH_STATE_SECRET, UNSUBSCRIBE_SECRET, RECAPTCHA_SECRET_KEY, GOOGLE_CLIENT_ID/SECRET, SENDGRID_API_KEY, CRON_SECRET, ENVIRONMENT=production, etc.)
- Monitoring automatise : endpoint `/api/admin/monitoring` (CRON_SECRET) + tache planifiee tous les 2 jours
- Comptes admin : jeremy.lasne92@gmail.com + mouvement.echo.france@gmail.com (role: admin)
- Base de données production propre (0 données de test)

---

## 📋 Backlog Post-Lancement

> **Backlog complet** : voir [`docs/backlog.md`](../docs/backlog.md)
> 37 tâches total — 10 complétées — 27 actives (4 P0, 6 P1, 9 P2, 8 Icebox)
> Format : ID unique, catégorie, description, pourquoi, qui — compréhensible par un novice
> Revue hebdomadaire : max 20 tâches actives, le reste en Icebox

### Résumé rapide
- **🔴 P0** : Render payant, post réseaux sociaux, 100 messages personnels, YouTube SEO
- **🟠 P1** : Test emails FAI, stratégie Vald, Open Graph, backup MongoDB, RGPD (registre + droits)
- **🟡 P2** : Dashboard partenaire, kit PDF, blog, tunnel conversion, page /pitch, synopsis, Formiguères, dossier presse, calendrier éditorial
- **🧊 Icebox** : Indicateur progression, Search Console, réseaux personnages, rotation secrets, cache, audit RGPD, cookies, analytics
- **❌ Exclu** : Discussion entre utilisateurs, segmentation newsletter, CRM avancé

---

## 🎬 Stratégie Virale — Opération Vald (Brainstorm 21/03/2026)

**Contexte** : Vald (1,82M YouTube, 1M Instagram, 1,7M Spotify) est intégré dans le plan narratif d'ECHO — rôle du psychiatre épisode 6. Convergence thématique profonde : structure dantesque (Pandémonium / ECHO), santé mentale (PROZACZOPIXAN), critique sociale (Ce monde est cruel). Vald est pro-IA et reposte régulièrement du contenu IA de lui-même.

**Messages envoyés** : DM à Echelon Records (formel, référence Pandémonium/PROZACZOPIXAN, proposition d'échange) + DM à Vald (personnel, références MAGNIFICAT, proposition rôle psychiatre épisode 6, lien santé mentale).

**Plan de production vidéos (5 contenus) :**

| # | Format | Contenu | Durée | Timing |
|---|--------|---------|-------|--------|
| 1 | Extrait mystère | Psychiatre PROZACZOPIXAN, montage rapide, hashtags #vald #rapfr #serie #ia | 12-15s | Samedi 22/03 18h |
| 2 | Side-by-side | Image IA psychiatre / photo réelle Vald — "POV : on a mis un rappeur dans notre série" | 8s | Dimanche 23/03 18h |
| 3 | Easter egg 33 | Extraits bande-annonce où "33" apparaît + sample audio *Bonus* de Vald — "33 épisodes. Coïncidence ?" | 10-15s | Lundi 24/03 18h |
| 4 | Making-of | Coulisses studio Mithra, voix originale sur images IA | 30s | Mardi 25/03 18h |
| 5 | Plan B | Compilation extraits + titre Vald (format qu'il reposte) | 30-60s | Semaine 2 si nécessaire |

**Plan d'activation :**
- [ ] Samedi matin : contacter 10 plus grosses fan pages Vald en DM (extrait + "référence cachée")
- [ ] Samedi 18h : post extrait 1 TikTok/Reels + DM message complet à @echelonrecords ET @valdsullyvan (vidéo jointe, pas lien) + bande-annonce YouTube complète avec miniature + disclaimer
- [ ] Dimanche 18h : post extrait 2 (side-by-side)
- [ ] Lundi 18h : post extrait 3 (Easter egg 33 / Bonus)
- [ ] Mardi 18h : post extrait 4 (making-of)
- [ ] Lundi soir : évaluation (> 10K vues → accélérer / < 1K → Plan B semaine 2)
- [ ] Semaine 2 si pas de réponse : vidéo virale avec extraits + titre Vald
- [ ] Semaine 3-4 si toujours rien : vidéo multi-rappeurs (élargir le spectre)

**Points clés :**
- Disclaimer YouTube : "Images générées par IA — hommage artistique. Non affilié à Vald ni Echelon Records."
- Ne jamais utiliser les termes "transition écologique" ou "documentaire" avec Vald — dire "série"
- Mettre en avant la convergence thématique (Dante, santé mentale, critique sociale), pas le fan service
- Le message à Vald cite ses textes (MAGNIFICAT, PROZACZOPIXAN) pour montrer la profondeur du lien
- Si Vald accepte → plan opérationnel nécessaire (enregistrement voix, planning, contrat)

---

## 📝 Décisions Récentes

| Date | Décision | Agent |
|------|----------|-------|
| 2026-03-21 | Newsletter admin complète (composition + aperçu + historique + test obligatoire + brouillon). Onboarding J+3/J+10 (cron-job.org configuré). Fix YouTube embed cookies. Système mémoire persistante (decisions.csv + changelog.md + review.sh). Workflow BMAD strict réinstauré. | Claude Code (Opus 4.6) |
| 2026-03-21 | Fix reCAPTCHA v3 (script dynamique + clé secrète corrigée), email bienvenue proposition 2 (narratif), masquage compteurs < seuil, monitoring health check + slow requests, refactoring tests admin (TestClient), délivrabilité emails (plain text + tracking off), Akou "Le Guide". | Claude Code (Opus 4.6) |
| 2026-03-21 | Restructuration shared-context : archivage historique pré-lancement dans archive-pre-lancement.md (fichier passé de ~23K tokens à ~5K tokens). Backlog documenté. Stratégie virale Vald documentée (5 vidéos + plan d'activation). | Claude Code (Opus 4.6) |
| 2026-03-20 | Configuration production complète : SendGrid Domain Auth (DKIM/SPF/DMARC), EMAIL_FROM→noreply@mouvementecho.fr, toutes variables Render, custom domain api.mouvementecho.fr, comptes admin, base propre. | Claude Code (Opus 4.6) |
| 2026-03-20 | Ajustements post-lancement : saisons renommées (Diagnostic/Solutions/Futurs), texte prologue (storyboard IA), crédits compacts, Nantes badge vert, sous-nav "Rejoindre", formatDisplayName() profil, trailer vidéo R34yKJuPDWA, page À propos supprimée. | Claude Code (Opus 4.6) |
| 2026-03-19 | Footer réseaux sociaux (YouTube, Instagram, TikTok) + SendGrid configuré + Page Resources redesignée + Email bienvenue inscription. | Claude Code (Opus 4.6) |

> Historique complet des décisions pré-lancement : voir `archive-pre-lancement.md`
