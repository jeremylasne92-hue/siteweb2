import re

with open(r"c:\Users\JeReM\OneDrive\Bureau\sitewebecho by emergent\_bmad-output\planning-artifacts\prd.md", "r", encoding="utf-8") as f:
    text = f.read()

text = re.sub(r"## Product Scope.*?## User Journeys", "## User Journeys", text, flags=re.DOTALL)

new_scope2 = """## Product Scope & Boundaries

### MVP Strategy & Philosophy (20 mars 2026)
**MVP Approach:** "Experience MVP" — Une immersion immédiate, esthétique et fonctionnelle qui prouve le concept du "Mouvement" et centralise la communauté, sans accumulation excessive de fonctionnalités techniques complexes (ex: pas d'API Calendar custom, juste un lien/embed sécurisé ; pas de moteur de recommandations vidéo).
**Objectif de Lancement :** Consolidation de l'existant, correctifs sécurité, quick wins SEO.

#### MVP Feature Set (Phase 1)
- Quick wins SEO (meta tags, favicon, SSG pour Open Graph) [🔴 Critique]
- Sécurisation : Page 404, Mots de passe forts, Correctifs sécurité [🔴 Critique]
- Partenaires : Formulaire complet (upload logo/géocoding), Admin Validation, Bouton "Visiter le site" [🔴 Critique]
- Embed Google Calendar (RDV partenaires) [🔴 Critique]
- Acquisition : Inscription/OAuth, Boutons partage social, Formulaires CogniSphère/ECHOLink [🔴 Critique]
- Tracking : Configurer GA4 + UptimeRobot [🔴 Critique]
- Soutien : Boutons de redirection plateforme dons (HelloAsso) [🟡 Important]
- Média : Lecteur bande-annonce externe (marque blanche) [🟡 Important]

### Post-MVP Features

#### Phase 2 — Growth (Printemps/Été 2026)
- Refonte UX de la Hero Section ("Une websérie qui éveille les consciences")
- Auth Context React + ProtectedRoute centralisé
- Skeletons de chargement et Error Boundary React global
- Optimisation fine des images (Lazy loading, srcSet)
- Pagination API (cursor-based)
- Déploiement CI/CD (GitHub Actions) + E2E Tests (Playwright)
- Endpoint analytics vidéo / Tracking clics partenaires

#### Phase 3 — Expansion (Automne 2026+)
- Outil Éducatif interactif (CogniSphère)
- Base de données inter-associative (ECHOLink)
- Gamification transmédia (Énigmes post-épisode)
- Collection `donations` interne + intégration paiement native
- API Google Calendar avancée

### Risk Mitigation Strategy
- **Technical Risks:** Sous-estimation temps intégration fonctionnalités tierces (Calendar). *Mitigation:* Utilisation de liens simples/embeds pour MVP plutôt que des clients API complets.
- **Market Risks:** Mauvais référencement initial au lancement du site. *Mitigation:* Pré-rendu (SSG) imposé pour le SEO dès la Phase 1.
- **Resource Risks:** Délai très court d'ici au 20 mars 2026. *Mitigation:* Périmètre strictement verrouillé sur acquisition et POC de visionnage, optimisations repoussées en Phase 2.

## Functional Requirements"""

text = re.sub(r"## Project Scoping & Phased Development.*?## Functional Requirements", new_scope2, text, flags=re.DOTALL)

fr_replacements = {
    "Les visiteurs peuvent créer un compte via OAuth (Google).": "Les visiteurs peuvent créer un compte via OAuth (Google). *[Trace : Youssef]*",
    "Les utilisateurs peuvent se connecter via email/mot de passe avec validation de format.": "Les utilisateurs peuvent se connecter via email/mot de passe avec validation de format. *[Trace : Youssef, Luna]*",
    "Les utilisateurs isolés (mot de passe oublié) peuvent le réinitialiser via un lien sécurisé envoyé par email.": "Les utilisateurs isolés (mot de passe oublié) peuvent le réinitialiser via un lien sécurisé envoyé par email. *[Trace : Luna]*",
    "Le système intègre une case à cocher stipulant l\'âge (>15 ans ou accord parental) lors de l\'inscription pour conformité RGPD.": "Le système intègre une case à cocher stipulant l\'âge (>15 ans ou accord parental) lors de l\'inscription pour conformité RGPD. *[Trace : Contrainte Légale]*",
    "Les visiteurs non connectés ne peuvent pas accéder aux formulaires d\'alertes (lead gen) ni à l\'espace membre, mais voient systématiquement une incitation à l\'action invitant à rejoindre le Mouvement.": "Les visiteurs non connectés ne peuvent pas accéder aux formulaires d\'alertes (lead gen) ni à l\'espace membre, mais voient systématiquement une incitation à l\'action invitant à rejoindre le Mouvement. *[Trace : Acquisition Lead Gen]*",
    "Les visiteurs peuvent visionner la bande-annonce de la série sans créer de compte (lecteur média externe intégré).": "Les visiteurs peuvent visionner la bande-annonce de la série sans créer de compte (lecteur média externe intégré). *[Trace : Youssef]*",
    "Le système affiche \"Bientôt disponible\" ou une étiquette spécifique sur les Épisodes 1 à 5 qui n\'entreront en production qu\'en septembre 2026.": "Le système affiche \"Bientôt disponible\" ou une étiquette spécifique sur les Épisodes 1 à 5 qui n\'entreront en production qu\'en septembre 2026. *[Trace : UX Clarification]*",
    "Les visiteurs peuvent cliquer sur les cartes \"Épisodes 1 à 5\" pour afficher une modale (ou pop-up/page) décrivant le titre, le synopsis et les thématiques couvertes.": "Les visiteurs peuvent cliquer sur les cartes \"Épisodes 1 à 5\" pour afficher une modale (ou pop-up/page) décrivant le titre, le synopsis et les thématiques couvertes. *[Trace : Youssef]*",
    "Les utilisateurs inscrits peuvent s\'inscrire aux notifications/alertes email concernant la future sortie (Automne 2026) des épisodes de la Saison 1.": "Les utilisateurs inscrits peuvent s\'inscrire aux notifications/alertes email concernant la future sortie (Automne 2026) des épisodes de la Saison 1. *[Trace : Stratégie Rétention]*",
    "Les visiteurs peuvent consulter la carte interactive ou la liste ECHOSystem affichant l\'ensemble des partenaires actuels et validés.": "Les visiteurs peuvent consulter la carte interactive ou la liste ECHOSystem affichant l\'ensemble des partenaires actuels et validés. *[Trace : Marc]*",
    "Les candidats partenaires peuvent remplir un \"Formulaire de Candidature\" complet (incluant coordonnées, description, localisation géographique, et upload d\'un fichier image Logo).": "Les candidats partenaires peuvent remplir un \"Formulaire de Candidature\" complet (incluant coordonnées, description, localisation géographique, et upload d\'un fichier image Logo). *[Trace : Marc]*",
    "Le système envoie un email transactionnel récapitulatif (\"Demande reçue\") au candidat partenaire lors de la soumission de sa candidature.": "Le système envoie un email transactionnel récapitulatif (\"Demande reçue\") au candidat partenaire lors de la soumission de sa candidature. *[Trace : Marc]*",
    "Le système envoie un email d\'alerte à l\'adresse de contact interne Mouvement ECHO pour chaque nouvelle candidature partenaire reçue.": "Le système envoie un email d\'alerte à l\'adresse de contact interne Mouvement ECHO pour chaque nouvelle candidature partenaire reçue. *[Trace : Sarah]*",
    "Les partenaires ayant un compte peuvent consulter le statut actuel de leur candidature (ex : \"En cours d\'étude\", \"Validé\") dans un Tableau de Bord Membre (Dashboard).": "Les partenaires ayant un compte peuvent consulter le statut actuel de leur candidature (ex : \"En cours d\'étude\", \"Validé\") dans un Tableau de Bord Membre (Dashboard). *[Trace : Marc]*",
    "Les partenaires peuvent accéder via leur menu à un bouton ou widget (embed/URL redirect) \"Prendre Rendez-vous\" pointant vers l\'agenda Google du Mouvement.": "Les partenaires peuvent accéder via leur menu à un bouton ou widget (embed/URL redirect) \"Prendre Rendez-vous\" pointant vers l\'agenda Google du Mouvement. *[Trace : Marc]*",
    "Les visiteurs publics de la page ECHOSystem peuvent cliquer sur le bouton \"Visiter le site\" de chaque partenaire individuel pour ouvrir leur URL dans un nouvel onglet.": "Les visiteurs publics de la page ECHOSystem peuvent cliquer sur le bouton \"Visiter le site\" de chaque partenaire individuel pour ouvrir leur URL dans un nouvel onglet. *[Trace : UX Visiteur]*",
    "Les développeurs ou technophiles intéressés peuvent soumettre leur profil via les formulaires de candidature spécifiques aux projets CogniSphère et ECHOLink.": "Les développeurs ou technophiles intéressés peuvent soumettre leur profil via les formulaires de candidature spécifiques aux projets CogniSphère et ECHOLink. *[Trace : Alex]*",
    "Tous les formulaires de collecte (recrutement tech et partenaires) intègrent une vérification anti-spam basique frontend/backend.": "Tous les formulaires de collecte (recrutement tech et partenaires) intègrent une vérification anti-spam basique frontend/backend. *[Trace : Sécurité]*",
    "Toute section appelant au don financier (ex: \"Soutenir le Mouvement\") propose au clic un ou plusieurs liens de redirection HTTPS sortants vers les prestataires retenus par l\'association (ex: Campagne HelloAsso).": "Toute section appelant au don financier (ex: \"Soutenir le Mouvement\") propose au clic un ou plusieurs liens de redirection HTTPS sortants vers les prestataires retenus par l\'association (ex: Campagne HelloAsso). *[Trace : Luna]*",
    "Les utilisateurs détenant le rôle \"Administrateur\" (via vérification stricte en Base de Données) détiennent de manière exclusive l\'accès au Panel d\'Administration (Dashboard Admin).": "Les utilisateurs détenant le rôle \"Administrateur\" (via vérification stricte en Base de Données) détiennent de manière exclusive l\'accès au Panel d\'Administration (Dashboard Admin). *[Trace : Sarah]*",
    "Les Administrateurs peuvent basculer le statut d\'un partenaire candidat de \"En Attente\" à \"Approuvé\" dans l\'interface CRUD du Panel d\'Administration, déclenchant son affichage public immédiat.": "Les Administrateurs peuvent basculer le statut d\'un partenaire candidat de \"En Attente\" à \"Approuvé\" dans l\'interface CRUD du Panel d\'Administration, déclenchant son affichage public immédiat. *[Trace : Sarah]*",
    "Les Administrateurs peuvent modifier, supprimer ou mettre en avant (ordre d\'affichage préférentiel) les partenaires existants.": "Les Administrateurs peuvent modifier, supprimer ou mettre en avant (ordre d\'affichage préférentiel) les partenaires existants. *[Trace : Sarah]*",
    "Les Administrateurs peuvent créer, supprimer ou modifier les textes, statuts et dates des événements publiés dans l\'Agenda public (\"Épisodes IRL\" ou projections).": "Les Administrateurs peuvent créer, supprimer ou modifier les textes, statuts et dates des événements publiés dans l\'Agenda public (\"Épisodes IRL\" ou projections). *[Trace : Sarah]*",
    "Les Administrateurs peuvent exporter et/ou visualiser toute la base email des utilisateurs inscrits ayant coché leur consentement aux campagnes d\'information liées à la série.": "Les Administrateurs peuvent exporter et/ou visualiser toute la base email des utilisateurs inscrits ayant coché leur consentement aux campagnes d\'information liées à la série. *[Trace : Analyse Données]*"
}

for old, new in fr_replacements.items():
    text = text.replace(old, new)

with open(r"c:\Users\JeReM\OneDrive\Bureau\sitewebecho by emergent\_bmad-output\planning-artifacts\prd.md", "w", encoding="utf-8") as f:
    f.write(text)
