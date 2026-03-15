# Procédure de gestion des violations de données personnelles

> Articles 33 et 34 du Règlement Général sur la Protection des Données (RGPD)

| Champ | Valeur |
|-------|--------|
| **Responsable de traitement** | Mouvement ECHO |
| **Date de création** | 2026-03-15 |
| **Date de dernière mise à jour** | 2026-03-15 |
| **Version** | 1.0 |

---

## 1. Définition d'une violation de données personnelles

Une violation de données personnelles est une faille de sécurité entraînant, de manière accidentelle ou illicite, la destruction, la perte, l'altération, la divulgation non autorisée ou l'accès non autorisé à des données personnelles transmises, conservées ou traitées.

**Exemples de violations :**
- Accès non autorisé à la base de données utilisateurs
- Fuite d'adresses email ou de données de candidature
- Perte de données suite à une défaillance technique sans sauvegarde
- Envoi d'emails contenant des données personnelles au mauvais destinataire
- Compromission d'un compte administrateur
- Attaque par ransomware chiffrant les données

**Types de violations :**
- **Confidentialité** : divulgation ou accès non autorisé aux données
- **Intégrité** : altération non autorisée des données
- **Disponibilité** : perte d'accès ou destruction des données

---

## 2. Détection et signalement interne

### Qui peut détecter une violation ?
Toute personne impliquée dans le projet (développeur, administrateur, bénévole) ayant connaissance d'un incident de sécurité affectant des données personnelles.

### Procédure de signalement interne

1. **Délai** : signaler immédiatement (dans l'heure suivant la découverte) au responsable de traitement.
2. **Canal** : email au responsable de traitement avec l'objet `[VIOLATION DONNEES] - Description courte`.
3. **Informations à fournir** :
   - Date et heure de la découverte
   - Nature de l'incident (type de violation)
   - Données et personnes potentiellement concernées
   - Mesures immédiates prises (ex. : coupure d'accès)
   - Coordonnées de la personne ayant détecté l'incident

### Actions immédiates
- Contenir la violation (couper les accès compromis, isoler les systèmes affectés)
- Préserver les preuves (logs, captures d'écran)
- Ne pas communiquer publiquement avant l'évaluation

---

## 3. Évaluation de la gravité

Le responsable de traitement évalue la gravité selon la grille suivante :

| Niveau | Critères | Exemples | Actions requises |
|--------|----------|----------|-----------------|
| **Faible** | Données non sensibles, peu de personnes, risque minime | Erreur d'envoi d'un email à un mauvais destinataire (sans données sensibles) | Documentation interne uniquement |
| **Moyen** | Données personnelles basiques, nombre limité de personnes | Fuite d'une liste d'emails de contact | Documentation + notification CNIL |
| **Élevé** | Données permettant l'identification, nombre significatif de personnes | Accès non autorisé à la base utilisateurs (emails + noms) | Notification CNIL + communication aux personnes |
| **Critique** | Données sensibles ou grande échelle, risque élevé pour les droits | Compromission des mots de passe (même hashés) + emails | Notification CNIL urgente + communication aux personnes + mesures correctives immédiates |

### Critères d'évaluation
- **Nature des données** : basiques (email, nom) vs sensibles
- **Volume** : nombre de personnes concernées
- **Réversibilité** : possibilité de limiter les conséquences
- **Identification** : facilité d'identifier les personnes à partir des données
- **Circonstances** : attaque malveillante vs erreur humaine

---

## 4. Notification à la CNIL (Art. 33)

### Quand notifier ?
La notification à la CNIL est obligatoire sauf si la violation n'est pas susceptible d'engendrer un risque pour les droits et libertés des personnes (niveau Faible).

**Délai : 72 heures maximum** après avoir pris connaissance de la violation.

Si la notification ne peut pas être effectuée dans les 72 heures, elle doit être accompagnée des motifs du retard.

### Comment notifier ?
- **Portail en ligne** : [notifications.cnil.fr](https://notifications.cnil.fr)
- **Email** : notifications@cnil.fr

### Contenu de la notification

La notification doit contenir :

1. **Nature de la violation** : description, catégories et nombre approximatif de personnes concernées, catégories et nombre approximatif d'enregistrements concernés
2. **Coordonnées du contact** : nom et coordonnées du responsable de traitement
3. **Conséquences probables** : description des conséquences vraisemblables de la violation
4. **Mesures prises** : description des mesures prises ou envisagées pour remédier à la violation et atténuer ses effets

### Template de notification CNIL

```
NOTIFICATION DE VIOLATION DE DONNÉES PERSONNELLES (Art. 33 RGPD)

Date de la notification : [DATE]
Date de découverte de la violation : [DATE + HEURE]

1. RESPONSABLE DE TRAITEMENT
   Nom : Mouvement ECHO
   Contact : [EMAIL RESPONSABLE]

2. NATURE DE LA VIOLATION
   Type : [Confidentialité / Intégrité / Disponibilité]
   Description : [DESCRIPTION DÉTAILLÉE]
   Date/période de la violation : [DATE DÉBUT — DATE FIN]

3. DONNÉES CONCERNÉES
   Catégories de données : [ex. emails, noms d'utilisateur]
   Nombre de personnes concernées : [NOMBRE ou estimation]
   Nombre d'enregistrements concernés : [NOMBRE ou estimation]

4. CONSÉQUENCES PROBABLES
   [DESCRIPTION DES RISQUES POUR LES PERSONNES]

5. MESURES PRISES
   Mesures immédiates : [ex. coupure d'accès, reset des mots de passe]
   Mesures correctives prévues : [ex. audit de sécurité, renforcement des contrôles]

6. COMMUNICATION AUX PERSONNES
   Communication effectuée : [Oui / Non / Prévue le DATE]
   Justification si non : [MOTIF]
```

---

## 5. Communication aux personnes concernées (Art. 34)

### Quand communiquer ?
La communication aux personnes est obligatoire lorsque la violation est susceptible d'engendrer un **risque élevé** pour leurs droits et libertés (niveaux Élevé et Critique).

### Exceptions
La communication n'est pas nécessaire si :
- Les données étaient chiffrées ou inintelligibles pour les tiers
- Des mesures ont été prises rendant le risque élevé non vraisemblable
- La communication exigerait des efforts disproportionnés (dans ce cas, communication publique)

### Contenu de la communication

La communication doit :
- Utiliser un langage clair et simple
- Décrire la nature de la violation
- Indiquer les coordonnées du responsable de traitement
- Décrire les conséquences probables
- Décrire les mesures prises pour remédier à la violation
- Recommander des actions aux personnes (ex. : changer leur mot de passe)

### Template de communication aux personnes

```
Objet : Information importante concernant vos données personnelles — Mouvement ECHO

Bonjour,

Nous vous informons qu'un incident de sécurité a affecté certaines de vos
données personnelles sur la plateforme Mouvement ECHO.

NATURE DE L'INCIDENT
[Description claire et accessible de ce qui s'est passé]

DONNÉES CONCERNÉES
[Liste des catégories de données affectées]

CONSÉQUENCES POSSIBLES
[Risques concrets pour la personne]

MESURES PRISES
[Actions mises en place pour résoudre l'incident]

CE QUE NOUS VOUS RECOMMANDONS
- [Action 1 : ex. modifier votre mot de passe]
- [Action 2 : ex. surveiller vos comptes]

CONTACT
Pour toute question, contactez-nous à : [EMAIL]

Nous vous prions d'accepter nos excuses pour cet incident et restons
à votre disposition.

L'équipe Mouvement ECHO
```

---

## 6. Documentation de l'incident

Chaque violation doit être consignée dans un registre interne des violations, quel que soit son niveau de gravité.

### Registre des violations

Pour chaque incident, documenter :

| Champ | Description |
|-------|-------------|
| **Identifiant** | Numéro séquentiel (ex. VIO-2026-001) |
| **Date de découverte** | Date et heure |
| **Date de la violation** | Date et heure (si différente de la découverte) |
| **Personne ayant signalé** | Nom et rôle |
| **Nature de la violation** | Confidentialité / Intégrité / Disponibilité |
| **Description** | Description détaillée de l'incident |
| **Données concernées** | Catégories de données |
| **Personnes concernées** | Nombre et catégories |
| **Niveau de gravité** | Faible / Moyen / Élevé / Critique |
| **Notification CNIL** | Oui/Non + date + référence |
| **Communication personnes** | Oui/Non + date + moyen |
| **Mesures immédiates** | Actions prises pour contenir |
| **Mesures correctives** | Actions de remédiation |
| **Date de clôture** | Date de résolution |
| **Retour d'expérience** | Leçons apprises |

---

## 7. Mesures correctives et retour d'expérience

### Après chaque incident

1. **Analyse des causes** : identifier la cause racine (technique, humaine, organisationnelle)
2. **Plan d'action correctif** : définir les mesures pour empêcher la récurrence
3. **Mise en oeuvre** : implémenter les corrections avec un responsable et un délai
4. **Vérification** : valider l'efficacité des mesures correctives
5. **Mise à jour des procédures** : adapter les procédures de sécurité si nécessaire

### Retour d'expérience (REX)

Organiser une réunion de retour d'expérience dans les 30 jours suivant la clôture de l'incident pour :
- Partager les enseignements avec l'équipe
- Identifier les améliorations possibles
- Mettre à jour la documentation de sécurité
- Renforcer les mesures préventives

---

## 8. Contacts et références

### Contacts

| Rôle | Contact |
|------|---------|
| **Responsable de traitement** | Mouvement ECHO |
| **CNIL — Notifications** | notifications@cnil.fr |
| **CNIL — Portail** | [notifications.cnil.fr](https://notifications.cnil.fr) |
| **CNIL — Standard** | 01 53 73 22 22 |

### Références réglementaires

- **Article 33 RGPD** : Notification d'une violation de données personnelles à l'autorité de contrôle
- **Article 34 RGPD** : Communication d'une violation de données personnelles à la personne concernée
- **Lignes directrices EDPB 01/2021** : Exemples concernant la notification de violations de données personnelles

### Documents internes liés

- Registre des traitements (RoPA) : `docs/rgpd/registre-traitements-ropa.md`
- Politique de confidentialité : page Mentions Légales du site
