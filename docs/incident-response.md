# Procedure de reponse aux incidents de securite — RGPD art. 33-34

**Responsable** : Jeremy LASNE, President
**Contact** : contact@mouvementecho.fr
**Association** : Mouvement ECHO — SIRET 933 682 510 00013
**Date de mise a jour** : 2026-03-21

---

## 1. Definition d'un incident

Un incident de securite des donnees personnelles est toute violation entrainant, de maniere accidentelle ou illicite :

- **Acces non autorise** : un tiers accede a des donnees personnelles sans autorisation
- **Fuite de donnees** : des donnees personnelles sont divulguees ou rendues accessibles involontairement
- **Perte de donnees** : des donnees personnelles sont detruites ou rendues indisponibles
- **Alteration de donnees** : des donnees personnelles sont modifiees sans autorisation

### Exemples concrets pour ECHO

- Acces non autorise a la base MongoDB Atlas
- Fuite d'emails utilisateurs via une faille API
- Compromission d'un compte administrateur
- Envoi d'emails en masse non autorise via SendGrid
- Exposition de logs contenant des donnees personnelles

---

## 2. Responsabilites

| Role | Personne | Contact |
|---|---|---|
| Responsable de traitement | Jeremy LASNE (President) | contact@mouvementecho.fr |
| Evaluation technique | Jeremy LASNE | contact@mouvementecho.fr |
| Communication utilisateurs | Jeremy LASNE | via SendGrid |
| Notification CNIL | Jeremy LASNE | https://notifications.cnil.fr |

---

## 3. Etapes de reponse

### Etape 1 — Detection (T+0)

- Surveillance des logs serveur (Render) et des alertes MongoDB Atlas
- Signalement par un utilisateur, un membre de l'equipe ou un partenaire
- Detection automatique (tentatives de connexion anormales, rate limiting declenche)
- Alertes endpoint `/api/health` (monitoring externe)

**Action immediate** : consigner l'heure de detection et les premiers elements constates.

### Etape 2 — Evaluation (T+4h max)

Evaluer dans les 4 heures suivant la detection :

- **Nature de l'incident** : type de violation (confidentialite, integrite, disponibilite)
- **Donnees concernees** : quelles categories de donnees personnelles sont affectees
- **Personnes concernees** : nombre approximatif et categories (utilisateurs, benevoles, partenaires)
- **Gravite** : risque pour les droits et libertes des personnes (faible, modere, eleve)
- **Cause probable** : faille technique, erreur humaine, attaque externe

### Etape 3 — Confinement (immediat)

- Revoquer les acces compromis (tokens, sessions, mots de passe)
- Isoler les systemes affectes si necessaire
- Bloquer les adresses IP suspectes (rate limiting)
- Sauvegarder les preuves (logs, captures)
- Si compromission MongoDB Atlas : rotation des credentials, restriction IP

### Etape 4 — Notification CNIL (72 heures max)

Si l'incident presente un risque pour les droits et libertes des personnes :

- **Delai** : 72 heures maximum apres la prise de connaissance
- **Portail** : https://notifications.cnil.fr/notifications/index
- **Contact CNIL** : https://www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles
- **Contenu** : voir le template ci-dessous (section 4)

Si la notification ne peut etre faite dans les 72h, joindre une justification du retard.

### Etape 5 — Notification des personnes concernees (si risque eleve)

Si l'incident presente un risque eleve pour les droits et libertes :

- Informer les personnes concernees dans les meilleurs delais
- Moyens : email individuel via SendGrid
- Contenu obligatoire :
  - Nature de la violation en termes clairs
  - Nom et coordonnees du contact (contact@mouvementecho.fr)
  - Consequences probables de la violation
  - Mesures prises ou envisagees pour remedier a la violation
  - Recommandations (changer mot de passe, surveiller activite)

### Etape 6 — Remediation

- Corriger la faille ou la vulnerabilite identifiee
- Mettre a jour les mesures de securite (voir `docs/security-measures.md`)
- Deployer les correctifs en production
- Verifier que l'incident est resolu
- Tester les corrections

### Etape 7 — Post-mortem

- Completer le registre des incidents (section 5)
- Documenter les lecons apprises
- Mettre a jour les procedures si necessaire
- Planifier les actions preventives
- Informer l'equipe des changements

---

## 4. Template de notification CNIL

```
NOTIFICATION DE VIOLATION DE DONNEES PERSONNELLES (RGPD art. 33)

Responsable de traitement :
  Association Mouvement ECHO
  SIRET : 933 682 510 00013
  Contact : Jeremy LASNE — contact@mouvementecho.fr

1. Date et heure de la violation : _______________
2. Date et heure de la prise de connaissance : _______________
3. Nature de la violation :
   [ ] Confidentialite (acces non autorise)
   [ ] Integrite (alteration)
   [ ] Disponibilite (perte, destruction)

4. Categories de donnees concernees :
   [ ] Email  [ ] Nom/Prenom  [ ] Mot de passe (hashe)
   [ ] Telephone  [ ] Competences  [ ] Autre : _______________

5. Nombre approximatif de personnes concernees : _______________

6. Categories de personnes :
   [ ] Utilisateurs inscrits  [ ] Candidats benevoles
   [ ] Candidats techniques   [ ] Contacts formulaire
   [ ] Partenaires             [ ] Abonnes newsletter
   [ ] Autre : _______________

7. Consequences probables : _______________

8. Mesures prises pour remedier a la violation : _______________

9. Mesures prises pour attenuer les consequences : _______________

10. Communication aux personnes concernees :
    [ ] Oui — Date : _______________
    [ ] Non — Motif : _______________
```

---

## 5. Registre des incidents

| Date | Description | Donnees concernees | Personnes impactees | Gravite | Notification CNIL | Mesures correctives | Statut |
|---|---|---|---|---|---|---|---|
| — | Aucun incident a ce jour | — | — | — | — | — | — |

---

## 6. Contacts d'urgence

| Role | Nom | Contact |
|---|---|---|
| President / Responsable de traitement | Jeremy LASNE | contact@mouvementecho.fr |
| Hebergeur frontend | OVHcloud | support.ovh.net |
| Hebergeur backend | Render | support@render.com |
| Base de donnees | MongoDB Atlas | support.mongodb.com |
| Emails transactionnels | SendGrid / Twilio | support@sendgrid.com |
| CNIL | — | https://notifications.cnil.fr |
