# Backlog ECHO — Post-lancement

> **Dernière mise à jour** : 2026-03-21
> **Résumé** : 26 tâches actives (7 Tech, 6 Marketing, 5 Contenu, 4 Légal/RGPD, 4 Infrastructure) — 11 complétées
> **Format** : Chaque tâche a un ID unique, une catégorie, une description en verbe d'action, et un "Pourquoi" expliquant l'impact concret.
> **Règle** : Maximum 20 tâches actives dans le backlog. Au-delà, déplacer en Icebox.

---

## ✅ Complétées

| ID | Cat. | Tâche | Ce qui a été fait | Date |
|---|---|---|---|---|
| T-001 | Tech | Email de bienvenue | Email automatique envoyé à chaque inscription avec présentation immersive de la série ECHO, ton narratif | 21/03 |
| T-002 | Tech | Fix reCAPTCHA v3 | Corrigé le captcha anti-spam qui bloquait toutes les inscriptions (chargement dynamique du script + clé secrète corrigée sur Render) | 21/03 |
| T-003 | Tech | Masquage compteurs | Les compteurs de partenaires et membres affichent un message qualitatif ("Rejoignez les premiers...") quand il y a peu de données, au lieu de chiffres bas qui font "site vide" | 21/03 |
| T-004 | Infra | Monitoring health check | Endpoint /api/health qui vérifie la connexion base de données + middleware qui logge les requêtes lentes + compteur d'erreurs 5xx | 21/03 |
| T-005 | Tech | Refactoring tests admin | 275 tests passent avec 0 échec (avant : 68 faux négatifs car les tests essayaient de se connecter au vrai serveur) | 21/03 |
| T-006 | Tech | Délivrabilité emails | Ajout d'une version texte brut dans chaque email + désactivation du tracking SendGrid (les liens trackés déclenchent les filtres anti-spam) | 21/03 |
| T-007 | Tech | Newsletter admin | Page admin complète pour créer une newsletter : éditeur + aperçu en temps réel + envoi test obligatoire avant envoi réel + historique des envois + brouillon sauvegardé automatiquement | 21/03 |
| T-008 | Tech | Fix YouTube embed | Le bouton "Accepter et afficher la vidéo" charge directement la vidéo YouTube sans obliger à accepter d'abord les cookies du site | 21/03 |
| T-009 | Tech | Séquence email onboarding | 2 emails automatiques envoyés aux nouveaux inscrits : J+3 (coulisses de l'écriture à Formiguères) + J+10 (invitation à candidater). Un cron externe (cron-job.org) appelle le backend toutes les heures pour déclencher les envois | 21/03 |
| T-010 | Tech | Renommage Akou | Le personnage Akou est désormais "Le Guide" au lieu de "Le Guide Spirituel" | 21/03 |
| T-017 | Marketing | Open Graph / SEO méta | Balises OG optimisées (image fond sombre, og:locale, og:site_name), SEO ajouté à la page 404, "documentaire" → "fiction" partout | 21/03 |

---

## 🔴 P0 — Cette semaine (actions critiques pour l'acquisition)

| ID | Cat. | Tâche | Description | Pourquoi | Qui |
|---|---|---|---|---|---|
| T-011 | Infra | Render tier payant | Passer le backend Render de gratuit à $7/mois. Le plan gratuit "endort" le serveur après 15 min d'inactivité — au prochain visiteur, il faut 30-60 secondes pour que le serveur se réveille | Un visiteur qui attend 30 secondes sur la page de connexion pense que le site est cassé et part. Le cold start fait perdre des inscriptions | 👤 Toi |
| T-012 | Marketing | Post prologue réseaux sociaux | Publier la bande-annonce/prologue sur LinkedIn, Instagram et TikTok avec un texte accrocheur sur le contre-pied IA (voix et musique authentiques, images IA) | Sans post public, personne en dehors du réseau personnel ne sait que le site existe. C'est le premier levier d'acquisition organique | 👤 Toi |
| T-013 | Marketing | 100 messages personnels | Envoyer un message individuel (pas un post public) à 100 personnes du réseau de l'équipe (5 personnes × 20 contacts chacun) avec le lien vers le prologue et un texte personnalisé | Un message personnel a un taux de clic 10× supérieur à un post public. Les 100 premiers inscrits viendront du réseau, pas du SEO (qui prend 3+ semaines) | 👤 Toi |
| T-014 | Marketing | Bande-annonce YouTube | Mettre en ligne le prologue sur YouTube avec : miniature optimisée, titre SEO, description détaillée, tags pertinents, disclaimer IA | YouTube est la plateforme principale de diffusion de la bande-annonce. Une bonne miniature et un bon titre déterminent le taux de clic | 👤 Toi |

---

## 🟠 P1 — Semaine 2-3 (consolidation)

| ID | Cat. | Tâche | Description | Pourquoi | Qui |
|---|---|---|---|---|---|
| T-015 | Marketing | Test emails FAI français | Créer des comptes test chez Orange, Free, SFR et Bouygues pour vérifier que les emails d'ECHO (bienvenue, onboarding, newsletter) arrivent bien en boîte de réception et pas en spam | Un domaine neuf (mouvementecho.fr) a une réputation email de zéro. Les FAI français sont particulièrement stricts. Si les emails arrivent en spam, tout le système d'onboarding est inutile | 👤 Toi |
| T-016 | Marketing | Stratégie Vald — 5 vidéos | Produire et publier les 5 contenus courts planifiés (voir section Stratégie Virale du shared-context) : extrait psychiatre, side-by-side, Easter egg 33, making-of, plan B multi-rappeurs | Vald a 1,82M d'abonnés YouTube. S'il reposte un contenu ou accepte le rôle, c'est une visibilité massive et gratuite. Les fan pages Vald sont le vecteur principal | 👤 Toi |
| T-018 | Infra | Backup MongoDB hebdo | Mettre en place un export automatique hebdomadaire de la base MongoDB Atlas (mongodump ou script). Atlas M0 fait des snapshots mais pas de point-in-time recovery | Si une erreur de manipulation supprime des données utilisateurs, il n'y a aucun moyen de les récupérer. Un backup hebdomadaire est le filet de sécurité minimum | 🤖 Claude |
| T-019 | Légal | Registre des traitements RGPD | Créer le document obligatoire (RGPD article 30) listant tous les traitements de données personnelles : quelles données, pourquoi, combien de temps conservées, qui y a accès | C'est une obligation légale. En cas de contrôle CNIL, l'absence de registre est une infraction. L'audit RGPD du 15/03 l'avait identifié comme écart critique | 🤖+👤 |
| T-020 | Légal | Endpoint exercice des droits | Créer un endpoint API permettant aux utilisateurs de demander l'accès à leurs données, leur rectification ou leur suppression (RGPD articles 15-17) | C'est une obligation légale. Un utilisateur doit pouvoir demander "quelles données avez-vous sur moi ?" et obtenir une réponse. Actuellement, il faut le faire manuellement dans MongoDB | 🤖 Claude |

---

## 🟡 P2 — Mois 1 (croissance et crédibilité)

| ID | Cat. | Tâche | Description | Pourquoi | Qui |
|---|---|---|---|---|---|
| T-021 | Tech | Dashboard Partenaire UX | Revoir le design, les données affichées et l'expérience utilisateur du dashboard destiné aux partenaires (associations, entreprises, institutions) | Les premiers partenaires vont juger le sérieux du projet sur la qualité de l'interface qui leur est dédiée. Un dashboard brut ou vide fait amateur | 🤖 Claude |
| T-022 | Contenu | Kit partenaire PDF | Créer un document PDF téléchargeable de 4 pages : concept de la série, équipe, calendrier de production, modalités de participation | Quand l'équipe contacte un partenaire potentiel par email, elle a besoin d'un document pro en pièce jointe. Actuellement il n'y a rien à envoyer | 🤖+👤 |
| T-023 | Contenu | Blog/Actualités | Créer une section blog simple sur le site + rédiger le premier article (making-of du prologue IA : comment les images ont été générées, pourquoi les voix sont authentiques) | Le SEO a besoin de contenu texte frais et régulier pour indexer le site correctement. Un article sur le making-of IA est aussi un contenu viral potentiel | 🤖 Claude |
| T-024 | Tech | Tunnel conversion post-vidéo | Créer un parcours guidé après la vidéo : bande-annonce → bouton d'inscription visible → choix du rôle (bénévole, technicien, stagiaire, scénariste) | Un visiteur qui regarde la vidéo jusqu'au bout est "chaud" — sans call-to-action clair, il repart sans s'inscrire. Le tunnel capte cette intention | 🤖 Claude |
| T-025 | Contenu | Page /pitch | Créer une page web épurée destinée aux partenaires : prologue vidéo + chiffres clés du projet + calendrier de production + bouton "Devenir partenaire" | Quand l'équipe envoie un lien à un partenaire, cette page doit convaincre en 30 secondes. Différente de la page publique qui est plus narrative et longue | 🤖 Claude |
| T-026 | Contenu | Synopsis accessibles aux inscrits | Rendre les synopsis des scénarios consultables par les membres inscrits, comme avant-première exclusive de la série | Donner une raison concrète de s'inscrire et de rester inscrit. Le contenu exclusif crée de la valeur pour les membres | 🤖 Claude |
| T-027 | Contenu | Contenu Formiguères | Intégrer les photos et vidéos des 4 semaines d'écriture des scénarios à Formiguères (sud de la France) dans le site et les emails | Ce contenu "coulisses" humanise le projet et montre qu'il y a une vraie équipe qui travaille. C'est le type de contenu qui génère le plus d'engagement | 👤+🤖 |
| T-028 | Marketing | Dossier de presse | Créer un dossier de presse téléchargeable orienté médias et festivals (différent du kit partenaire) : concept, équipe, visuels HD, extraits, contacts presse | Pour démarcher des médias ou soumettre la série à des festivals, un dossier de presse professionnel est indispensable | 🤖+👤 |
| T-029 | Marketing | Calendrier éditorial | Planifier les publications réseaux sociaux sur 1 mois : 1 post/semaine minimum + stories + contenu coulisses | Sans rythme régulier, l'algorithme des réseaux sociaux arrête de montrer le contenu. La constance est plus importante que la viralité ponctuelle | 👤 Toi |

---

## 🧊 Icebox (P3+ — à revoir plus tard)

| ID | Cat. | Tâche | Description | Pourquoi | Qui |
|---|---|---|---|---|---|
| T-030 | Tech | Indicateur "Où en sommes-nous ?" | Ajouter sur la page Mouvement un indicateur visuel montrant l'étape actuelle du projet (écriture → production → post-production) et les objectifs atteints | Les visiteurs veulent savoir si le projet avance. Crée un sentiment de transparence et de dynamisme | 🤖 Claude |
| T-031 | Marketing | URLs Google Search Console | Soumettre manuellement les URLs clés du site dans Google Search Console pour accélérer l'apparition dans les résultats Google | Google indexe naturellement mais lentement (2-4 semaines). La soumission manuelle accélère le processus | 👤 Toi |
| T-032 | Marketing | Réseaux sociaux personnages | Créer les comptes fictifs des personnages de la série sur Instagram et TikTok (Sacha, Nadine, Akou, etc.) | Crée de l'immersion narrative — les personnages "vivent" sur les réseaux avant que la série ne sorte. Génère du buzz et de la curiosité | 👤 Mai 2026 |
| T-033 | Infra | Rotation secrets | Changer périodiquement les secrets de production (CRON_SECRET, OAUTH_STATE_SECRET, UNSUBSCRIBE_SECRET) | Si un secret est compromis, la rotation limite la fenêtre d'exposition. Bonne pratique de sécurité | 🤖+👤 |
| T-034 | Infra | Cache OVH optimisé | Configurer les headers Cache-Control dans le .htaccess pour que les assets statiques (images, CSS, JS) soient mis en cache par le navigateur | Réduit le temps de chargement pour les visiteurs récurrents. Le navigateur ne re-télécharge pas les fichiers qui n'ont pas changé | 🤖 Claude |
| T-035 | Légal | Suivi audit RGPD | Reprendre les 14 écarts identifiés dans l'audit du 15/03/2026 et vérifier lesquels ont été corrigés. Planifier la correction des écarts restants | L'audit a identifié 3 écarts critiques et 5 importants. Certains ont été corrigés indirectement, d'autres non. Il faut un suivi formalisé | 🤖+👤 |
| T-036 | Légal | Politique de cookies conforme | Revoir le bandeau cookies pour qu'il soit conforme à la directive ePrivacy (opt-in avant dépôt, catégories, lien politique détaillée) | Le site utilise des cookies YouTube et potentiellement Google Analytics. Le bandeau actuel n'est pas un vrai mécanisme de consentement granulaire | 🤖 Claude |
| T-037 | Tech | Analytics de conversion | Mettre en place un suivi des conversions : visiteur → visionnage vidéo → inscription → complétion profil → candidature | Impossible de savoir ce qui fonctionne ou pas sans mesurer. "Combien de visiteurs regardent la vidéo ? Combien s'inscrivent après ?" | 🤖 Claude |

---

## ❌ Exclu

| Tâche | Raison |
|---|---|
| Discussion/échange entre utilisateurs | Pas de fonctionnalité de type forum ou chat sur le site — hors scope du MVP |
| Segmentation newsletter | Prématuré à < 100 abonnés. À reconsidérer à 500+ |
| Dashboard CRM avancé | Prématuré. Les données sont consultables directement dans MongoDB Atlas |
| Brouillons newsletter multiples | Un seul brouillon (localStorage) suffit pour le rythme d'une newsletter par mois |

---

## Légende

| Symbole | Signification |
|---|---|
| 🤖 Claude | Tâche réalisable par Claude Code |
| 👤 Toi | Tâche que seul Jérémy/l'équipe peut faire (accès admin, création de contenu, réseaux sociaux) |
| 🤖+👤 | Tâche collaborative : Claude prépare, Jérémy valide/complète |
| 🔴 P0 | Critique — cette semaine |
| 🟠 P1 | Important — semaine 2-3 |
| 🟡 P2 | Souhaitable — mois 1 |
| 🧊 Icebox | À revoir plus tard — pas urgent |
