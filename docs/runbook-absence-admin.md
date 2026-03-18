# Runbook — Absence administrateur principal

**Version** : 1.0
**Date** : 2026-03-18
**Auteur** : Revue qualité ECHO
**Public cible** : Backup admin (Duc Ha Duong ou toute personne de confiance désignée)

---

## 1. Pré-requis (avant le départ de Jérémy)

Jérémy DOIT effectuer ces actions **avant toute absence supérieure à 5 jours**.

### 1.1 Promouvoir le backup admin

1. Se connecter au site en tant qu'admin
2. Ouvrir un terminal ou utiliser un client HTTP (Postman, curl)
3. Exécuter la requête suivante (remplacer `USER_ID` par l'identifiant du backup) :

```
PUT /api/users/admin/{USER_ID}/role
Content-Type: application/json

{"role": "admin"}
```

4. Vérifier que la réponse contient `"new_role": "admin"`
5. Demander au backup de se connecter et de vérifier qu'il voit la page `/admin`

**Pour trouver le USER_ID du backup** :

```
GET /api/users/admin?role=user
```

Chercher l'email du backup dans la liste retournée. Le champ `id` est le USER_ID.

### 1.2 Configurer les emails d'alerte

Vérifier que la variable d'environnement `ALERT_EMAILS` sur le serveur de production contient les emails de toutes les personnes à alerter, séparés par des virgules :

```
ALERT_EMAILS=mouvement.echo.france@gmail.com,email-du-backup@example.com
```

### 1.3 Partager les accès d'urgence

Déposer dans le coffre-fort de mots de passe partagé (ou tout support sécurisé convenu) :

- [ ] URL de connexion MongoDB de production (`MONGO_URL`)
- [ ] Identifiants d'accès au panneau Webstrator
- [ ] Identifiants SendGrid (consultation uniquement, pour vérifier les envois)
- [ ] Mot de passe du compte email `mouvement.echo.france@gmail.com`

### 1.4 Tester le watchdog

1. Vérifier que le watchdog tourne : ouvrir `https://mouvement-echo.fr/api/health`
2. La réponse doit contenir `"watchdog": "healthy"`
3. Si `"watchdog": "never_run"` ou `"watchdog": "stale"` : contacter un développeur avant de partir

### 1.5 Checklist de départ

- [ ] Backup admin promu et connexion testée
- [ ] `ALERT_EMAILS` configuré avec l'email du backup
- [ ] Accès d'urgence déposés dans le coffre-fort partagé
- [ ] Watchdog vérifié via `/api/health`
- [ ] Backup informé oralement de son rôle et de ce runbook

---

## 2. Procédure d'urgence (si le backup admin reçoit une alerte)

### 2.1 Vous recevez un email du watchdog

L'email ressemble à ceci :

> **Objet** : ECHO — X élément(s) en attente de traitement
>
> - 2 candidature(s) partenaire en attente depuis plus de 5 jours
> - 1 message(s) contact non lu(s) depuis plus de 48h
> - Aucun admin connecté depuis 7 jours

### 2.2 Si vous avez un compte admin (Jérémy vous a promu avant de partir)

**Étape 1** — Connectez-vous sur `https://mouvement-echo.fr/login` avec vos identifiants habituels.

**Étape 2** — Allez sur `https://mouvement-echo.fr/admin`. Vous devez voir le tableau de bord avec les compteurs.

**Étape 3** — Traitez les éléments en attente dans l'ordre de priorité :

| Priorité | Section | URL | Action |
|----------|---------|-----|--------|
| 1 | Messages contact | `/admin` → section contacts | Lire les messages. Si sujet "Presse & Média" : répondre manuellement par email depuis `mouvement.echo.france@gmail.com`. Si sujet "Partenariat" : orienter vers le formulaire `/partenaires`. |
| 2 | Candidatures partenaires | `/admin/partenaires` | Examiner chaque candidature pending. Approuver si : description claire + au moins 1 thématique + logo présent + site web cohérent. En cas de doute : ne pas rejeter, laisser en pending pour Jérémy. |
| 3 | Candidatures tech | `/admin/candidatures` | Examiner chaque candidature pending. Si le profil est clairement pertinent (expérience + compétences alignées) : passer en "entretien" (un email avec lien de réservation sera envoyé automatiquement). Ne PAS accepter ni rejeter — seul Jérémy conduit les entretiens. |
| 4 | Candidatures bénévoles | `/admin/benevoles` | Même logique que les candidatures tech. |

**Étape 4** — Après traitement, vérifiez que le prochain cycle du watchdog ne renvoie plus d'alerte pour les éléments traités.

### 2.3 Si vous n'avez PAS de compte admin (Jérémy n'a pas fait la promotion)

**Étape 1** — Essayez de joindre Jérémy (téléphone, SMS, email personnel). S'il répond, demandez-lui d'exécuter la section 1.1 à distance depuis n'importe quel appareil connecté.

**Étape 2** — Si Jérémy est injoignable : récupérez le `MONGO_URL` de production dans le coffre-fort partagé (section 1.3).

**Étape 3** — Installez MongoDB Compass (gratuit, téléchargeable sur `https://www.mongodb.com/products/compass`) ou utilisez le terminal MongoDB Atlas si le serveur est hébergé sur Atlas.

**Étape 4** — Connectez-vous à la base avec le `MONGO_URL`.

**Étape 5** — Dans la collection `users`, trouvez votre compte par email :

```
db.users.findOne({email: "votre-email@example.com"})
```

Copiez la valeur du champ `id`.

**Étape 6** — Exécutez la promotion :

```
db.users.updateOne({email: "votre-email@example.com"}, {$set: {role: "admin"}})
```

**Étape 7** — Connectez-vous au site. Vous avez maintenant accès à `/admin`. Suivez les étapes de la section 2.2.

### 2.4 Si les accès d'urgence ne sont pas disponibles

Vous ne pouvez pas agir sur le site. Actions de mitigation manuelles :

1. **Messages contact** : vérifiez la boîte `mouvement.echo.france@gmail.com` — les alertes de nouveau message y sont envoyées automatiquement. Répondez manuellement depuis cette boîte.
2. **Candidatures** : les candidats ont reçu un email de confirmation automatique. Envoyez un email manuel depuis `mouvement.echo.france@gmail.com` : "Merci pour votre candidature. Notre équipe revient vers vous très prochainement."
3. **Événements** : aucun moyen de créer ou modifier des événements sans accès admin. Si un événement doit être annulé, communiquez via les réseaux sociaux.

---

## 3. Limites (ce que le backup admin NE PEUT PAS faire)

Même avec un accès admin complet, certaines actions nécessitent Jérémy :

| Action | Raison | Workaround |
|--------|--------|------------|
| Publier un épisode de la série | Le contenu vidéo est produit par Jérémy. La publication nécessite le fichier vidéo + les métadonnées éditoriales. | Aucun. Attendre le retour de Jérémy. |
| Conduire un entretien de recrutement | Le lien booking (`BOOKING_URL`) pointe vers le calendrier de Jérémy. Les entretiens évaluent l'alignement avec la vision du projet. | Passer la candidature en "entretien" pour envoyer le lien, mais prévenir le candidat que l'entretien sera reprogrammé. |
| Modifier la configuration serveur | Variables d'environnement, DNS, certificats SSL, SendGrid. | Contacter l'hébergeur Webstrator en cas de panne. |
| Supprimer un compte utilisateur | Irréversible. Ne pas prendre cette décision sans Jérémy. | Suspendre le partenaire (`status: "suspended"`) au lieu de supprimer. |
| Modifier le code source et déployer | Nécessite accès GitHub + pipeline de déploiement. | Aucun. Les bugs doivent attendre le retour de Jérémy ou d'un développeur. |
| Gérer les finances / HelloAsso | Compte HelloAsso géré par Jérémy. Les dons sont reçus indépendamment du site. | Aucun. |

---

## 4. Contacts d'escalade

*Ce tableau doit être rempli par Jérémy avant chaque absence.*

| Rôle | Nom | Email | Téléphone | Accès |
|------|-----|-------|-----------|-------|
| Administrateur principal | Jérémy Lasne | __________ | __________ | Tous |
| Backup admin | __________ | __________ | __________ | Site admin (si promu) |
| Co-directeur / Producteur | Clément Grandmontagne | __________ | __________ | __________ |
| Coordinatrice | Déborah Prévaud | __________ | __________ | __________ |
| Resp. partenariats | Thierry Korutos-Chatam | __________ | __________ | __________ |
| Hébergeur (Webstrator) | __________ | __________ | __________ | Support technique |
| Développeur de garde | __________ | __________ | __________ | Code + déploiement |

### En cas d'urgence absolue (site down, faille de sécurité, violation de données)

1. Contacter Jérémy par tous les moyens
2. Si injoignable sous 2h : contacter le développeur de garde
3. Si injoignable sous 4h : contacter l'hébergeur Webstrator pour mettre le site en maintenance
4. Documenter l'incident (date, heure, symptômes, actions prises) pour le post-mortem

---

## Annexe — Vérifications rapides

| Vérification | URL | Réponse attendue |
|-------------|-----|-----------------|
| Le site est en ligne | `https://mouvement-echo.fr` | Page d'accueil visible |
| L'API fonctionne | `https://mouvement-echo.fr/api/health` | `{"status": "healthy", "database": "connected", "watchdog": "healthy"}` |
| Le watchdog tourne | `https://mouvement-echo.fr/api/health` | `"watchdog": "healthy"` (pas `"stale"` ni `"never_run"`) |
| SendGrid fonctionne | Vérifier réception d'un email de test | Email reçu dans les 5 minutes |
