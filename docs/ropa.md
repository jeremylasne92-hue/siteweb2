# Registre des activités de traitement — RGPD art. 30

**Responsable de traitement** : Association Mouvement ECHO
**SIRET** : 933 682 510 00013
**Représentant** : Jérémy LASNE, Président
**Contact DPO** : contact@mouvementecho.fr
**Date de mise à jour** : 2026-03-21

---

## Traitements

| # | Traitement | Finalite | Donnees collectees | Base legale | Duree de conservation | Destinataires | Transferts hors UE | Mesures de securite |
|---|---|---|---|---|---|---|---|---|
| 1 | Inscription utilisateur | Acces espace membre, personnalisation | Email, username, mot de passe (hashe bcrypt 12 rounds), avatar, interets | Consentement (art. 6.1.a) | 3 ans apres derniere connexion | Hebergeurs (Render, MongoDB Atlas) | Non — MongoDB Atlas Paris (eu-west-3), Render Francfort | Bcrypt 12 rounds, cookies httpOnly, 2FA TOTP optionnel, TTL auto-purge |
| 2 | Connexion OAuth Google | Authentification simplifiee | Email, nom, photo profil Google, OAuth ID | Consentement (art. 6.1.a) | 3 ans apres derniere connexion | Google (OAuth), Hebergeurs | Non — OAuth UE | OAuth 2.0 standard, pas de stockage token Google |
| 3 | Candidature benevole | Recrutement benevoles | Nom, email, telephone, motivation, competences | Consentement (art. 6.1.a) | 2 ans (TTL MongoDB) | Hebergeurs | Non — UE | Rate limiting IP, honeypot anti-spam, TTL auto-suppression |
| 4 | Candidature technique | Recrutement technique | Nom, email, portfolio, competences, CV | Consentement (art. 6.1.a) | 2 ans (TTL MongoDB) | Hebergeurs | Non — UE | Rate limiting IP, honeypot anti-spam, TTL auto-suppression |
| 5 | Candidature stagiaire | Recrutement stagiaires | Nom, email, ecole, motivation, competences | Consentement (art. 6.1.a) | 2 ans (TTL MongoDB) | Hebergeurs | Non — UE | Rate limiting IP, honeypot anti-spam, TTL auto-suppression |
| 6 | Formulaire contact | Support utilisateur, reponse aux demandes | Nom, email, sujet, message, IP anonymisee | Interet legitime (art. 6.1.f) | 6 mois (TTL MongoDB sur created_at) | Hebergeurs, SendGrid (notification equipe) | Oui — SendGrid US (clauses contractuelles types) | Rate limiting 3/h, honeypot, IP anonymisee, TTL 180 jours |
| 7 | Newsletter | Communication projet, actualites | Email, opt-in explicite | Consentement explicite (art. 6.1.a) | Jusqu'a desinscription | SendGrid | Oui — SendGrid US (clauses contractuelles types, DPA) | Lien desinscription HMAC signe, DKIM/SPF/DMARC |
| 8 | Partenaires | Vitrine projet, mise en relation | Nom organisation, logo, description, email contact | Interet legitime (art. 6.1.f) | Duree du partenariat + 1 an | Hebergeurs | Non — UE | Validation Pydantic, acces admin uniquement |
| 9 | Analytics (GA4 cookieless) | Statistiques de frequentation anonymisees | Donnees anonymisees, IP tronquee, pages visitees | Interet legitime (art. 6.1.f) | 14 mois (retention Google) | Google Analytics | Non — mode cookieless UE | Pas de cookies, donnees anonymisees, pas de donnees personnelles |
| 10 | Sessions utilisateur | Maintien de la connexion | Token de session httpOnly, user_id, date expiration | Execution du contrat (art. 6.1.b) | 24h (TTL MongoDB) | Hebergeurs | Non — UE | Cookies httpOnly + Secure + SameSite=Lax, TTL auto-expiration |
| 11 | Logs serveur | Securite, diagnostic technique | IP, user-agent, methode HTTP, chemin, code reponse | Interet legitime (art. 6.1.f) | 30 jours (retention Render) | Render | Non — Render Francfort (UE) | IP non stockee en base, logs stdout uniquement, rotation automatique |

---

## Sous-traitants (art. 28)

| Sous-traitant | Service | Localisation | Garanties | DPA |
|---|---|---|---|---|
| OVHcloud | Hebergement frontend | France | Serveurs en France, certifie ISO 27001 | Inclus dans CGV |
| Render | Backend API | Francfort (UE) | Infrastructure UE, chiffrement en transit | DPA standard |
| MongoDB Atlas | Base de donnees | Paris eu-west-3 (UE) | Chiffrement au repos AES-256 + en transit TLS, replicas UE | DPA standard |
| SendGrid / Twilio | Envoi d'emails transactionnels | US | Clauses contractuelles types (SCC), DPA signe | DPA en place |
| Google | OAuth + Analytics | UE | Mode cookieless, donnees anonymisees | DPA standard Google |

---

## Mesures de securite

Voir `docs/security-measures.md` pour le detail des mesures techniques et organisationnelles (art. 32).

## Procedure de notification

Voir `docs/incident-response.md` pour la procedure de gestion des violations de donnees (art. 33-34).

## Droits des personnes (art. 15-22)

Les droits suivants sont exercables par email a contact@mouvementecho.fr :

- **Acces** (art. 15) : obtenir une copie de ses donnees personnelles
- **Rectification** (art. 16) : corriger des donnees inexactes
- **Effacement** (art. 17) : demander la suppression de ses donnees (auto-purge 30 jours apres demande)
- **Portabilite** (art. 20) : recevoir ses donnees dans un format structure
- **Opposition** (art. 21) : s'opposer au traitement base sur l'interet legitime
- **Limitation** (art. 18) : restreindre le traitement dans certains cas

**Delai de reponse** : 1 mois maximum (prolongeable de 2 mois si complexe).
**Reclamation** : en cas de litige, saisine possible de la CNIL sur https://www.cnil.fr.
