# Diagnostic : Site OVH affiche "Site en construction"

**Date** : 19 mars 2026
**Statut** : ❌ NON RÉSOLU — En investigation
**Impact** : Site inaccessible sur tous les navigateurs (PC et mobile)
**Urgence** : CRITIQUE — Lancement prévu le 20 mars 2026

---

## Résumé du problème

Le site **mouvementecho.fr** affiche la page par défaut OVH ("Site en construction") au lieu du site React déployé, et ce sur **tous les navigateurs** et **tous les réseaux** testés.

---

## Environnement

| Composant | Détail |
|-----------|--------|
| Hébergement | OVH mutualisé — cluster121 |
| URL FTP | `ftp.cluster121.hosting.ovh.net` |
| Login FTP | `mouvemd` |
| IP serveur | `213.186.33.5` |
| Domaine | `mouvementecho.fr` / `www.mouvementecho.fr` |
| DNS (NS) | `dns200.anycast.me` + `ns200.anycast.me` (Anycast, Actif) |
| Backend | Render — `echo-api-kfre.onrender.com` ✅ Fonctionne |
| Base de données | MongoDB Atlas ✅ Connectée |

---

## Ce qui fonctionne ✅

- **Fichiers FTP** : Tous les fichiers du build React sont bien présents dans `/www/` (vérifié via FileZilla)
- **DNS A records** : `@` et `www` pointent vers `213.186.33.5` (correct pour cluster121)
- **DNS CNAME api** : `api` → `echo-api-kfre.onrender.com` (correct)
- **Backend Render** : `GET /api/health` → `{"status":"healthy","database":"connected"}`
- **Multisite OVH** : Les deux domaines sont configurés → dossier racine `/www/`
- **Google Search Console** : Enregistrement TXT de vérification ajouté dans la zone DNS

---

## Ce qui ne fonctionne pas ❌

### Symptôme principal
Toute requête HTTP vers le site retourne la page OVH "Site en construction" (19 796 octets) au lieu de notre `index.html` (4 427 octets).

### Tests effectués

| Test | Résultat | Conclusion |
|------|----------|------------|
| `curl -H "Host: www.mouvementecho.fr" http://213.186.33.5` | 200 OK — Page OVH par défaut (19 796 octets) | Même l'IP directe ne sert pas nos fichiers |
| `curl -H "Host: mouvemd.cluster121.hosting.ovh.net" http://213.186.33.5` | 200 OK — Page OVH par défaut (32 259 octets) | Même le hostname du cluster ne marche pas |
| `curl -H "Host: www.mouvementecho.fr" http://213.186.33.5/logo-echo.jpg` | 200 OK — Page OVH (text/html) au lieu de l'image | Aucun fichier statique n'est servi |
| `curl -H "Host: www.mouvementecho.fr" http://213.186.33.5/test.html` | Page OVH par défaut | Même un fichier HTML basique n'est pas servi |
| Navigation privée `http://mouvementecho.fr` | Page "Site en construction" | Pas un problème de cache navigateur |
| Navigation privée `http://mouvementecho.fr/test.html` | Page "Site en construction" | Confirme que le serveur web ne route pas vers `/www/` |
| `nslookup mouvementecho.fr 8.8.8.8` | Timeout DNS | DNS Google ne résout pas le domaine depuis cette machine |

### Diagnostic multisite OVH
- Diagnostic **A** (IPv4) : 🟢 Vert (correct)
- Diagnostic **AAAA** (IPv6) : 🟡 Jaune (avertissement — pas d'enregistrement AAAA dans la zone DNS)

---

## Chronologie des actions

| Heure (approx.) | Action | Résultat |
|------------------|--------|----------|
| 18h00 | Site fonctionne pour un membre de l'équipe (à confirmer si c'est toujours le cas) | ✅ |
| 18h30 | Constat : site affiche "Site en construction" depuis le PC et le téléphone du propriétaire | ❌ |
| 19h00 | Vérification DNS : A records corrects (`213.186.33.5`) | ✅ |
| 19h30 | Suspicion SSL : certificats "Actifs" mais HTTPS échoue (handshake error) | ❌ |
| 20h00 | Suppression des certificats SSL pour tester en HTTP pur | - |
| 20h15 | Recréation des certificats Let's Encrypt | Statut "En création" |
| 20h30 | `.htaccess` : désactivation de la redirection HTTPS | Uploadé via FTP |
| 21h00 | Ajout fichier `.ovhconfig` + `test.html` pour diagnostic | ❌ Toujours page OVH |
| 21h30 | Certificats SSL toujours "En création" — site toujours inaccessible | ❌ |

---

## Hypothèses classées par probabilité

### H1 — Régénération SSL bloque l'hébergement (70%)
**Théorie** : La suppression puis recréation des certificats SSL a déclenché une régénération de la configuration Apache/nginx côté OVH. Pendant cette opération, tout l'hébergement est en mode "maintenance" et sert la page par défaut.
**Preuve** : Les certificats sont en statut "En création". Même le hostname du cluster retourne la page par défaut.
**Action** : Supprimer les certificats "En création" + désactiver SSL sur le multisite pour débloquer le HTTP.

### H2 — Configuration multisite cassée (20%)
**Théorie** : Les virtual hosts Apache pour `mouvementecho.fr` et `www.mouvementecho.fr` ne sont pas correctement configurés ou ont été corrompus lors des modifications SSL.
**Preuve** : Le diagnostic AAAA jaune pourrait indiquer un problème de configuration.
**Action** : Supprimer les entrées multisite puis les recréer (sans SSL).

### H3 — Problème infrastructure OVH (5%)
**Théorie** : Le serveur cluster121 a un problème temporaire.
**Action** : Contacter le support OVH.

### H4 — Cache DNS réseau (5%)
**Théorie** : Le DNS résout vers une mauvaise IP sur certains réseaux.
**Preuve** : Peu probable car le curl direct vers la bonne IP échoue aussi.
**Action** : Éliminé par les tests curl.

---

## Plan de résolution (dans l'ordre)

### Étape 1 — Débloquer HTTP immédiat
1. Aller dans **Certificats SSL** → Supprimer les deux certificats "En création"
2. Aller dans **Multisite** → Modifier chaque domaine → Décocher SSL
3. Attendre 5-10 minutes
4. Tester `http://mouvementecho.fr` en navigation privée

### Étape 2 — Si Étape 1 ne fonctionne pas : recréer le multisite
1. Supprimer les entrées multisite `mouvementecho.fr` et `www.mouvementecho.fr`
2. Attendre 10 minutes
3. Recréer : `mouvementecho.fr` → `/www/` (sans SSL)
4. Recréer : `www.mouvementecho.fr` → `/www/` (sans SSL)
5. Tester à nouveau

### Étape 3 — Si Étape 2 ne fonctionne pas : support OVH
1. Contacter le support OVH avec ce diagnostic
2. Référence ticket : hébergement `mouvemd` sur `cluster121`
3. Fournir les résultats des tests curl ci-dessus

### Étape 4 — Une fois le site accessible en HTTP
1. Réactiver SSL : cocher les 2 domaines → Activer Let's Encrypt
2. Attendre que les certificats passent à "Actif"
3. Réactiver la redirection HTTPS dans `.htaccess` (décommenter lignes 9-10)
4. Re-téléverser `.htaccess` via FileZilla
5. Tester `https://mouvementecho.fr`

---

## Fichiers modifiés pendant le diagnostic

| Fichier | Modification |
|---------|-------------|
| `frontend/dist/.htaccess` | Lignes 9-10 commentées (redirection HTTPS désactivée) |
| `frontend/dist/.ovhconfig` | Créé (configuration moteur OVH) |
| `frontend/dist/test.html` | Créé (fichier de test diagnostic) |
| `frontend/public/.htaccess` | NON modifié (source originale intacte) |

**Note** : Le `frontend/public/.htaccess` contient toujours la redirection HTTPS active. Chaque `npm run build` copiera cette version dans `dist/`. Il faudra soit modifier `public/.htaccess`, soit re-commenter après chaque build.

---

## Commandes de test rapide

```bash
# Test direct sur l'IP OVH (contourne le DNS)
curl -sI -H "Host: www.mouvementecho.fr" http://213.186.33.5

# Test backend Render
curl -s https://echo-api-kfre.onrender.com/api/health

# Test DNS via Google
nslookup mouvementecho.fr 8.8.8.8

# Test DNS via Cloudflare
nslookup mouvementecho.fr 1.1.1.1

# Test HTTPS (quand SSL sera actif)
curl -sI https://mouvementecho.fr
```

---

## Pour tester avec un autre outil (Antigravity / autre agent)

1. Lire ce document en premier
2. Exécuter les commandes de test ci-dessus pour vérifier l'état actuel
3. Suivre le plan de résolution étape par étape
4. Mettre à jour la section "Chronologie des actions" avec les résultats
5. Si résolu, mettre à jour le statut en haut du document
