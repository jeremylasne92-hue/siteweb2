# 🧠 ECHO - Contexte Partagé

> Ce fichier est la mémoire partagée entre tous les agents. Consultez-le avant toute action et mettez-le à jour après vos modifications.
> 📦 Historique pré-lancement archivé dans `archive-pre-lancement.md`

---

## 📋 État du Projet

**Dernière mise à jour** : 2026-03-21
**Phase actuelle** : 🚀 LANCÉ — Site en production (20 mars 2026)
**Statut** : ✅ EN LIGNE — https://mouvementecho.fr
**Infrastructure** : OVH mutualisé (frontend) + Render (backend API) + MongoDB Atlas M0 (DB) + SendGrid (emails)

### ✅ Configuration Production (complète)
- HTTPS Let's Encrypt actif (expire 18/06/2026)
- Google Search Console vérifié + sitemap soumis
- SendGrid Domain Authentication (DKIM s1/s2 + SPF + DMARC) ✅
- EMAIL_FROM = noreply@mouvementecho.fr
- Custom domain Render : api.mouvementecho.fr (Verified + Certificate Issued)
- Toutes variables Render configurées (OAUTH_STATE_SECRET, UNSUBSCRIBE_SECRET, RECAPTCHA_SECRET_KEY, GOOGLE_CLIENT_ID/SECRET, SENDGRID_API_KEY, ENVIRONMENT=production, etc.)
- Comptes admin : jeremy.lasne92@gmail.com + mouvement.echo.france@gmail.com (role: admin)
- Base de données production propre (0 données de test)

---

## 📋 Backlog Post-Lancement

**🔴 P0 — Cette semaine**
- [ ] Passer Render en tier payant ($7/mois) — supprimer le cold start 30-60s
- [ ] Email de bienvenue automatique post-inscription (SendGrid, séquence : bienvenue → présentation série → CTA candidature)
- [ ] Post prologue IA sur LinkedIn/Instagram/TikTok (texte : contre-pied IA, voix et musique authentiques)
- [ ] Messages personnels équipe (100 contacts, message personnalisé avec lien prologue)

**🟠 P1 — Semaine 2-3**
- [ ] Masquer/adapter compteurs communautaires Home si < seuil crédible (éviter effet preuve sociale inverse)
- [ ] Newsletter mensuelle via SendGrid (template + liste inscrits email_opt_out=false)
- [ ] Monitoring Render + Atlas (alertes latence > 2s, erreurs 5xx, stockage Atlas)
- [ ] Tester réception emails FAI français (Orange, Free, SFR) — réputation domaine neuf

**🟡 P2 — Mois 1**
- [ ] Dashboard Partenaire — revoir UX, données, design avant premiers partenaires
- [ ] Kit partenaire PDF téléchargeable (4 pages : concept, équipe, calendrier, participation)
- [ ] Section Actualités/Blog simple + 1er article making-of prologue IA (SEO + contenu frais)
- [ ] Tunnel de conversion post-vidéo : bande-annonce → inscription → choix du rôle
- [ ] Page /pitch épurée pour les partenaires (prologue + chiffres + calendrier)

**🟢 P3 — Mois 2+**
- [ ] Séquence email onboarding (J+1 bienvenue, J+7 coulisses, J+14 CTA candidature)
- [ ] Indicateur "Où en sommes-nous ?" sur page Mouvement (étape actuelle, objectifs)
- [ ] Soumettre manuellement les URLs clés dans Google Search Console (accélérer indexation)
- [ ] Réseaux sociaux personnages (prévu mai 2026)

**❌ Exclu**
- Pas de fonctionnalité de discussion/échange entre utilisateurs sur le site

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
| 2026-03-21 | Restructuration shared-context : archivage historique pré-lancement dans archive-pre-lancement.md (fichier passé de ~23K tokens à ~5K tokens). Backlog documenté. Stratégie virale Vald documentée (5 vidéos + plan d'activation). | Claude Code (Opus 4.6) |
| 2026-03-20 | Configuration production complète : SendGrid Domain Auth (DKIM/SPF/DMARC), EMAIL_FROM→noreply@mouvementecho.fr, toutes variables Render, custom domain api.mouvementecho.fr, comptes admin, base propre. | Claude Code (Opus 4.6) |
| 2026-03-20 | Ajustements post-lancement : saisons renommées (Diagnostic/Solutions/Futurs), texte prologue (storyboard IA), crédits compacts, Nantes badge vert, sous-nav "Rejoindre", formatDisplayName() profil, trailer vidéo R34yKJuPDWA, page À propos supprimée. | Claude Code (Opus 4.6) |
| 2026-03-19 | Footer réseaux sociaux (YouTube, Instagram, TikTok) + SendGrid configuré + Page Resources redesignée + Email bienvenue inscription. | Claude Code (Opus 4.6) |

> Historique complet des décisions pré-lancement : voir `archive-pre-lancement.md`
