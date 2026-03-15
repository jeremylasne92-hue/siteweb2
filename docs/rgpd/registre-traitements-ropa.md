# Registre des activités de traitement (RoPA)

> Article 30 du Règlement Général sur la Protection des Données (RGPD)

## Informations générales

| Champ | Valeur |
|-------|--------|
| **Responsable de traitement** | Mouvement ECHO |
| **Date de création** | 2026-03-15 |
| **Date de dernière mise à jour** | 2026-03-15 |

---

## Activités de traitement

### 1. Inscription utilisateur

| Champ | Description |
|-------|-------------|
| **Finalité** | Gestion des comptes utilisateurs |
| **Base légale** | Consentement (art. 6.1.a) |
| **Catégories de données** | Email, nom d'utilisateur, mot de passe (hashé) |
| **Catégories de personnes** | Utilisateurs de la plateforme |
| **Durée de conservation** | Compte actif + 3 ans d'inactivité |
| **Destinataires** | Hébergeur (OVH) |
| **Transferts hors UE** | Non |
| **Mesures de sécurité** | Hashage bcrypt du mot de passe, HTTPS, cookie httpOnly |

### 2. Authentification

| Champ | Description |
|-------|-------------|
| **Finalité** | Sécurité d'accès aux comptes |
| **Base légale** | Intérêt légitime (art. 6.1.f) |
| **Catégories de données** | Cookie session httpOnly, token 2FA |
| **Catégories de personnes** | Utilisateurs authentifiés |
| **Durée de conservation** | Durée de la session |
| **Destinataires** | Hébergeur (OVH) |
| **Transferts hors UE** | Non |
| **Mesures de sécurité** | Cookie httpOnly, 2FA avec CSPRNG (secrets.choice), rate limiting (5 tentatives/15 min) |

### 3. Formulaire de contact

| Champ | Description |
|-------|-------------|
| **Finalité** | Répondre aux demandes des utilisateurs |
| **Base légale** | Intérêt légitime (art. 6.1.f) |
| **Catégories de données** | Nom, email, message |
| **Catégories de personnes** | Visiteurs du site |
| **Durée de conservation** | 3 ans |
| **Destinataires** | SendGrid (envoi d'email), Hébergeur (OVH) |
| **Transferts hors UE** | Oui — SendGrid (Twilio Inc., clauses contractuelles types) |
| **Mesures de sécurité** | reCAPTCHA v3, validation serveur, HTTPS |

### 4. Candidature bénévole

| Champ | Description |
|-------|-------------|
| **Finalité** | Gestion des candidatures bénévoles |
| **Base légale** | Consentement (art. 6.1.a) |
| **Catégories de données** | Nom, email, compétences, motivations |
| **Catégories de personnes** | Candidats bénévoles |
| **Durée de conservation** | 3 ans après décision |
| **Destinataires** | Hébergeur (OVH) |
| **Transferts hors UE** | Non |
| **Mesures de sécurité** | HTTPS, contrôle d'accès administrateur |

### 5. Candidature scénariste

| Champ | Description |
|-------|-------------|
| **Finalité** | Recrutement créatif pour la série documentaire |
| **Base légale** | Consentement (art. 6.1.a) |
| **Catégories de données** | Nom, email, portfolio, expérience |
| **Catégories de personnes** | Candidats scénaristes |
| **Durée de conservation** | 3 ans après décision |
| **Destinataires** | Hébergeur (OVH) |
| **Transferts hors UE** | Non |
| **Mesures de sécurité** | HTTPS, contrôle d'accès administrateur |

### 6. Candidature partenaire

| Champ | Description |
|-------|-------------|
| **Finalité** | Gestion des partenariats |
| **Base légale** | Consentement (art. 6.1.a) |
| **Catégories de données** | Nom de l'organisme, email, description, logo |
| **Catégories de personnes** | Organismes partenaires |
| **Durée de conservation** | Durée du partenariat + 3 ans |
| **Destinataires** | Hébergeur (OVH) |
| **Transferts hors UE** | Non |
| **Mesures de sécurité** | HTTPS, contrôle d'accès administrateur |

### 7. Analytics internes

| Champ | Description |
|-------|-------------|
| **Finalité** | Mesure d'audience interne |
| **Base légale** | Intérêt légitime (art. 6.1.f) |
| **Catégories de données** | Session ID (sessionStorage), pages vues, paramètres UTM, referrer |
| **Catégories de personnes** | Visiteurs du site |
| **Durée de conservation** | 1 an (TTL MongoDB) |
| **Destinataires** | Hébergeur (OVH) |
| **Transferts hors UE** | Non |
| **Mesures de sécurité** | Données anonymisées, sessionStorage (non persistant), HTTPS |

### 8. Google Analytics 4

| Champ | Description |
|-------|-------------|
| **Finalité** | Mesure d'audience |
| **Base légale** | Consentement (art. 6.1.a) |
| **Catégories de données** | Données cookieless GA4 (identifiants techniques, pages vues, interactions) |
| **Catégories de personnes** | Visiteurs ayant consenti |
| **Durée de conservation** | Selon politique de conservation Google |
| **Destinataires** | Google Ireland Ltd |
| **Transferts hors UE** | Possible — Google Ireland Ltd (décision d'adéquation UE-US DPF) |
| **Mesures de sécurité** | Mode cookieless, consentement préalable requis |

### 9. reCAPTCHA v3

| Champ | Description |
|-------|-------------|
| **Finalité** | Protection anti-spam des formulaires |
| **Base légale** | Intérêt légitime (art. 6.1.f) |
| **Catégories de données** | Adresse IP, comportement de navigation |
| **Catégories de personnes** | Visiteurs soumettant un formulaire |
| **Durée de conservation** | Selon politique de conservation Google |
| **Destinataires** | Google Ireland Ltd |
| **Transferts hors UE** | Possible — Google Ireland Ltd (décision d'adéquation UE-US DPF) |
| **Mesures de sécurité** | Vérification serveur uniquement, skip si clé absente |

### 10. Dons HelloAsso

| Champ | Description |
|-------|-------------|
| **Finalité** | Collecte de fonds pour le projet |
| **Base légale** | Exécution d'un contrat (art. 6.1.b) |
| **Catégories de données** | Redirection vers HelloAsso — aucune donnée bancaire stockée sur la plateforme |
| **Catégories de personnes** | Donateurs |
| **Durée de conservation** | N/A (aucune donnée stockée localement) |
| **Destinataires** | HelloAsso |
| **Transferts hors UE** | Non (HelloAsso est basé en France) |
| **Mesures de sécurité** | Redirection HTTPS, aucun stockage local de données de paiement |

---

## Tableau récapitulatif

| # | Traitement | Finalité | Base légale | Données | Durée conservation | Destinataires |
|---|-----------|----------|-------------|---------|-------------------|---------------|
| 1 | Inscription utilisateur | Gestion des comptes | Consentement (art. 6.1.a) | Email, nom d'utilisateur, mot de passe (hashé) | Compte actif + 3 ans inactivité | Hébergeur (OVH) |
| 2 | Authentification | Sécurité d'accès | Intérêt légitime (art. 6.1.f) | Cookie session httpOnly, token 2FA | Durée session | Hébergeur (OVH) |
| 3 | Formulaire de contact | Répondre aux demandes | Intérêt légitime (art. 6.1.f) | Nom, email, message | 3 ans | SendGrid, Hébergeur (OVH) |
| 4 | Candidature bénévole | Gestion des bénévoles | Consentement (art. 6.1.a) | Nom, email, compétences, motivations | 3 ans après décision | Hébergeur (OVH) |
| 5 | Candidature scénariste | Recrutement créatif | Consentement (art. 6.1.a) | Nom, email, portfolio, expérience | 3 ans après décision | Hébergeur (OVH) |
| 6 | Candidature partenaire | Gestion partenariats | Consentement (art. 6.1.a) | Nom organisme, email, description, logo | Durée partenariat + 3 ans | Hébergeur (OVH) |
| 7 | Analytics internes | Mesure d'audience | Intérêt légitime (art. 6.1.f) | Session ID, pages vues, UTM, referrer | 1 an (TTL) | Hébergeur (OVH) |
| 8 | Google Analytics 4 | Mesure d'audience | Consentement (art. 6.1.a) | Données cookieless GA4 | Selon Google | Google Ireland Ltd |
| 9 | reCAPTCHA v3 | Anti-spam | Intérêt légitime (art. 6.1.f) | IP, comportement navigation | Selon Google | Google Ireland Ltd |
| 10 | Dons HelloAsso | Collecte de fonds | Exécution contrat (art. 6.1.b) | Redirection — aucune donnée bancaire stockée | N/A | HelloAsso |
