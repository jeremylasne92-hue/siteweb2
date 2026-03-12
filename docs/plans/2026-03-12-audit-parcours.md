# Audit Parcours Utilisateurs — 2026-03-12

Audit exhaustif des liens placeholder (`href="#"`), boutons non-fonctionnels et liens
sociaux manquants dans le frontend ECHO (React + TypeScript).

---

## Liens placeholder (href="#")

| Fichier | Ligne(s) | Contexte | Action requise |
|---------|----------|----------|----------------|
| `src/components/layout/Footer.tsx` | 19 | `<SocialIcon icon={<Youtube />} href="#" />` | URL YouTube a fournir par l'utilisateur |
| `src/components/layout/Footer.tsx` | 20 | `<SocialIcon icon={<Instagram />} href="#" />` | URL Instagram a fournir par l'utilisateur |
| `src/components/layout/Footer.tsx` | 21 | `<SocialIcon icon={<Facebook />} href="#" />` | URL Facebook a fournir par l'utilisateur |
| `src/components/layout/Footer.tsx` | 22 | `<SocialIcon icon={<Twitter />} href="#" />` | URL Twitter/X a fournir par l'utilisateur |
| `src/pages/Contact.tsx` | 60 | Boucle `.map()` sur `[Instagram, Twitter, Linkedin, Facebook]` avec `href="#"` | 4 URLs de reseaux sociaux a fournir |
| `src/pages/Serie.tsx` | 410 | Lien Instagram `href="#"` (section serie documentaire) | URL Instagram serie a fournir |
| `src/pages/Serie.tsx` | 413 | Lien Facebook `href="#"` (section serie documentaire) | URL Facebook serie a fournir |
| `src/pages/Serie.tsx` | 416 | Lien LinkedIn `href="#"` (section serie documentaire) | URL LinkedIn serie a fournir |
| `src/pages/Serie.tsx` | 419 | Lien Twitter `href="#"` (section serie documentaire) | URL Twitter/X serie a fournir |

**Total : 12 liens placeholder `href="#"`** (4 Footer + 4 Contact + 4 Serie)

---

## Boutons non-fonctionnels / comportement temporaire

| Fichier | Ligne | Contexte | Action requise |
|---------|-------|----------|----------------|
| `src/pages/Partners.tsx` | 78 | `PartnersHero onApplyClick={() => alert("Le formulaire sera disponible prochainement ! (LOT 3)")}` | Fichier mort — non importe dans App.tsx. Le fichier actif est `PartnersPage.tsx` (ligne 91) qui ouvre correctement le formulaire modal. **Supprimer `Partners.tsx` (code mort).** |

**Note :** Les `alert()` dans `AdminPartners.tsx` (lignes 163, 167) sont des validations de fichier upload (format et taille) — comportement attendu, pas un placeholder.

---

## Fichier mort detecte

| Fichier | Raison |
|---------|--------|
| `src/pages/Partners.tsx` | Non importe dans `App.tsx` ni ailleurs. Doublon de `PartnersPage.tsx` avec un handler `alert()` placeholder au lieu du vrai formulaire modal. A supprimer. |

---

## Liens sociaux a fournir (par l'utilisateur)

Les URLs des reseaux sociaux du projet ECHO doivent etre fournis pour remplacer les `href="#"`.

| Reseau | Fichiers concernes | Nombre d'occurrences |
|--------|-------------------|---------------------|
| YouTube | `Footer.tsx` | 1 |
| Instagram | `Footer.tsx`, `Contact.tsx`, `Serie.tsx` | 3 |
| Facebook | `Footer.tsx`, `Contact.tsx`, `Serie.tsx` | 3 |
| Twitter/X | `Footer.tsx`, `Contact.tsx`, `Serie.tsx` | 3 |
| LinkedIn | `Contact.tsx`, `Serie.tsx` | 2 |

**Total : 12 URLs a fournir**

### Liens sociaux des personnages (Serie.tsx, lignes 773-800)

Les liens sociaux des personnages de la serie (section "Personnages") sont generes dynamiquement
a partir du pseudo du personnage (`https://instagram.com/${pseudo}_echo`, etc.). Ces liens
pointent vers des comptes Instagram/Facebook/TikTok qui doivent exister pour etre fonctionnels.
**Verifier que ces comptes ont ete crees avant le lancement.**

---

## Elements fonctionnels verifies (OK)

Les elements suivants ont ete verifies et sont fonctionnels :

- **Footer.tsx** : liens de navigation internes (`/serie`, `/mouvement`, `/echolink`, `/partenaires`, `/ressources`, `/agenda`, `/soutenir`, `/contact`, `/politique-de-confidentialite`, `/mentions-legales`, `/cgu`) — tous correspondent a des routes definies dans `App.tsx`
- **Footer.tsx** : bouton "Gerer mes cookies" — appelle `resetCookieConsent()` (fonctionnel)
- **Header.tsx** : menu utilisateur toggle, liens profil, deconnexion — fonctionnels
- **PartnersPage.tsx** : bouton "Devenir partenaire" ouvre le formulaire modal (fonctionnel)
- **Support.tsx** : liens HelloAsso avec `DONATION_URL` + tracking analytics (fonctionnel)
- **ECHOLink.tsx** : lien GitHub `https://github.com/MouvementECHO` (fonctionnel)
- **ErrorBoundary.tsx** : bouton "Recharger" — `window.location.reload()` (fonctionnel)
- **Pages admin** : boutons "Retour a l'accueil" via `window.location.href` (fonctionnel)
- **Liens target="_blank"** : tous avec `rel="noopener noreferrer"` (securise)

---

## Resume des actions

| Priorite | Action | Responsable |
|----------|--------|-------------|
| **HAUTE** | Fournir les 12 URLs de reseaux sociaux (YouTube, Instagram, Facebook, Twitter/X, LinkedIn) | Utilisateur |
| **HAUTE** | Verifier l'existence des comptes sociaux des personnages avant le lancement | Utilisateur |
| **BASSE** | Supprimer `src/pages/Partners.tsx` (fichier mort, doublon de `PartnersPage.tsx`) | Developpeur |

---

*Audit realise le 2026-03-12. Aucun lien interne casse detecte. Aucun bouton non-fonctionnel
detecte (hors liens sociaux placeholder). Le frontend est pret pour le lancement une fois
les URLs sociales fournies.*
