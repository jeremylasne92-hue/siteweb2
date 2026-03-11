# RGPD Compliance Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the ECHO platform GDPR/RGPD compliant before the March 20, 2026 launch.

**Architecture:** 5 blocs — legal pages (static React pages), cookie consent banner (localStorage + gtag consent API), form consent checkboxes, user data rights (delete UI + export endpoint), email unsubscribe. All frontend-first, minimal backend changes.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, FastAPI, MongoDB (Motor)

**Design doc:** `docs/plans/2026-03-11-rgpd-compliance-design.md`

**Important:** File writes may fail with EEXIST on OneDrive. Use `node -e "fs.writeFileSync(...)"` via Bash if Edit/Write tools fail.

---

## Task 1: Privacy Policy Page

**Files:**
- Create: `frontend/src/pages/PrivacyPolicy.tsx`
- Modify: `frontend/src/App.tsx` (add route + lazy import)

**Step 1: Create PrivacyPolicy.tsx**

Static page component using `Layout` wrapper. French content covering:
- Responsable: Association Mouvement ECHO (loi 1901)
- Donnees collectees: email, nom, adresse (partenaires), IP (rate limiting)
- Finalites: gestion comptes, candidatures partenariat, analytics anonymes
- Base legale: consentement (formulaires), interet legitime (securite), execution contrat (partenariat)
- Duree conservation: comptes actifs + 3 ans apres suppression, logs 1 an
- Droits: acces, rectification, suppression, portabilite, opposition — contact: mouvement.echo.france@gmail.com
- Cookies: session auth (necessaire), GA4 cookieless (optionnel, consent required)
- Hebergeur: Webstrator

Pattern: same as other static pages (e.g., `Mouvement.tsx`). Import `Layout`, `SEO`. Use prose-invert Tailwind classes.

**Step 2: Add route in App.tsx**

Add lazy import (after line ~14 in App.tsx):
```tsx
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
```

Add Route (after line ~57 in App.tsx routes):
```tsx
<Route path="/politique-de-confidentialite" element={<PrivacyPolicy />} />
```

**Step 3: Build check**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: No errors

**Step 4: Commit**

```bash
git add frontend/src/pages/PrivacyPolicy.tsx frontend/src/App.tsx
git commit -m "feat(rgpd): add privacy policy page"
```

---

## Task 2: Legal Notice Page

**Files:**
- Create: `frontend/src/pages/LegalNotice.tsx`
- Modify: `frontend/src/App.tsx` (add route + lazy import)

**Step 1: Create LegalNotice.tsx**

Mentions legales content:
- Editeur: Association Mouvement ECHO, loi 1901
- Directeur de publication: [nom du president]
- Hebergeur: Webstrator
- Propriete intellectuelle: contenu protege
- Contact: mouvement.echo.france@gmail.com

**Step 2: Add route in App.tsx**

```tsx
const LegalNotice = lazy(() => import('./pages/LegalNotice'));
// ...
<Route path="/mentions-legales" element={<LegalNotice />} />
```

**Step 3: Build check**

Run: `cd frontend && npx tsc --noEmit && npm run build`

**Step 4: Commit**

```bash
git add frontend/src/pages/LegalNotice.tsx frontend/src/App.tsx
git commit -m "feat(rgpd): add legal notice page"
```

---

## Task 3: Terms of Service Page

**Files:**
- Create: `frontend/src/pages/TermsOfService.tsx`
- Modify: `frontend/src/App.tsx` (add route + lazy import)

**Step 1: Create TermsOfService.tsx**

CGU content:
- Objet et acceptation
- Conditions d'inscription (15 ans minimum, email valide)
- Regles d'utilisation (pas de contenu illegal, respect communaute)
- Responsabilites (ECHO non responsable contenu tiers)
- Propriete intellectuelle
- Modification des CGU (notification par email)
- Droit applicable: droit francais, tribunal de Paris

**Step 2: Add route in App.tsx**

```tsx
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
// ...
<Route path="/cgu" element={<TermsOfService />} />
```

**Step 3: Build check**

Run: `cd frontend && npx tsc --noEmit && npm run build`

**Step 4: Commit**

```bash
git add frontend/src/pages/TermsOfService.tsx frontend/src/App.tsx
git commit -m "feat(rgpd): add terms of service page"
```

---

## Task 4: Footer Links to Legal Pages

**Files:**
- Modify: `frontend/src/components/layout/Footer.tsx` (lines 47-54, Legal section)

**Step 1: Update Footer legal section**

Replace the current "Legal" section (lines 47-54) which has "Nous Contacter" and "Soutenir ECHO" with:

```tsx
<FooterLink to="/politique-de-confidentialite">Confidentialité</FooterLink>
<FooterLink to="/mentions-legales">Mentions légales</FooterLink>
<FooterLink to="/cgu">CGU</FooterLink>
<FooterLink to="/contact">Contact</FooterLink>
```

**Step 2: Build check**

Run: `cd frontend && npm run build`

**Step 3: Visual verification**

Start dev server, check footer renders 4 legal links, each navigates correctly.

**Step 4: Commit**

```bash
git add frontend/src/components/layout/Footer.tsx
git commit -m "feat(rgpd): add legal page links in footer"
```

---

## Task 5: Cookie Consent Banner

**Files:**
- Create: `frontend/src/components/ui/CookieBanner.tsx`
- Modify: `frontend/src/components/layout/Layout.tsx` (mount banner)

**Step 1: Create CookieBanner.tsx**

Component logic:
- On mount: check `localStorage.getItem('echo-cookie-consent')`
- If value exists ('accepted' or 'refused'): don't show banner
- If 'accepted': call `gtag('consent', 'update', { analytics_storage: 'granted' })`
- Show fixed banner at bottom of page with:
  - Text: "Ce site utilise des cookies necessaires et des cookies analytics optionnels."
  - Link to `/politique-de-confidentialite`
  - Button "Accepter" (green) — sets localStorage to 'accepted', calls gtag update, hides banner
  - Button "Refuser" (gray) — sets localStorage to 'refused', hides banner
- Styling: fixed bottom-0, bg-echo-dark/95 backdrop-blur, border-t border-white/10, z-50

Declare `gtag` for TypeScript:
```tsx
declare function gtag(...args: unknown[]): void;
```

**Step 2: Mount in Layout.tsx**

After `<Footer />` (line 16 of Layout.tsx), add:
```tsx
<CookieBanner />
```

**Step 3: Build check**

Run: `cd frontend && npm run build`

**Step 4: Visual verification**

Start dev server:
- Banner appears on first visit
- Click "Accepter" — banner disappears, localStorage set
- Refresh page — banner doesn't reappear
- Clear localStorage — banner reappears

**Step 5: Commit**

```bash
git add frontend/src/components/ui/CookieBanner.tsx frontend/src/components/layout/Layout.tsx
git commit -m "feat(rgpd): add cookie consent banner"
```

---

## Task 6: Consent Checkbox on Partner Form

**Files:**
- Modify: `frontend/src/components/partners/PartnerFormModal.tsx`

**Step 1: Add consent state and checkbox**

Add to the form state (near other form fields):
```tsx
const [consentRGPD, setConsentRGPD] = useState(false);
```

Add checkbox before the submit button (around line 427):
```tsx
<label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer">
    <input
        type="checkbox"
        checked={consentRGPD}
        onChange={(e) => setConsentRGPD(e.target.checked)}
        className="mt-1 accent-echo-gold"
        required
    />
    <span>
        J'accepte que mes données soient traitées conformément à la{' '}
        <a href="/politique-de-confidentialite" target="_blank" className="text-echo-gold hover:underline">
            politique de confidentialité
        </a>.
    </span>
</label>
```

Update submit button disabled condition to include `!consentRGPD`:
```tsx
disabled={!isStep4Valid || isSubmitting || !consentRGPD}
```

**Step 2: Build check**

Run: `cd frontend && npm run build`

**Step 3: Commit**

```bash
git add frontend/src/components/partners/PartnerFormModal.tsx
git commit -m "feat(rgpd): add consent checkbox to partner application form"
```

---

## Task 7: Consent Checkbox on Contact Form

**Files:**
- Modify: `frontend/src/pages/Contact.tsx`

**Step 1: Add consent state and checkbox**

Add state:
```tsx
const [consentRGPD, setConsentRGPD] = useState(false);
```

Add checkbox before submit button (around line 110):
```tsx
<label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer">
    <input type="checkbox" checked={consentRGPD} onChange={(e) => setConsentRGPD(e.target.checked)}
        className="mt-1 accent-echo-gold" required />
    <span>J'accepte que mes données soient traitées conformément à la{' '}
        <a href="/politique-de-confidentialite" target="_blank" className="text-echo-gold hover:underline">
            politique de confidentialité</a>.</span>
</label>
```

Disable submit if consent not given. Reset `consentRGPD` to false when form resets.

**Step 2: Build check**

Run: `cd frontend && npm run build`

**Step 3: Commit**

```bash
git add frontend/src/pages/Contact.tsx
git commit -m "feat(rgpd): add consent checkbox to contact form"
```

---

## Task 8: Consent Checkbox on Tech Application Form

**Files:**
- Modify: `frontend/src/components/forms/TechApplicationForm.tsx`

**Step 1: Add consent state and checkbox**

Same pattern as Tasks 6-7. Add consent state, checkbox before submit button (around line 157), disable submit without consent.

**Step 2: Build check**

Run: `cd frontend && npm run build`

**Step 3: Commit**

```bash
git add frontend/src/components/forms/TechApplicationForm.tsx
git commit -m "feat(rgpd): add consent checkbox to tech application form"
```

---

## Task 9: User Data Export Endpoint

**Files:**
- Modify: `backend/routes/auth.py` (add endpoint)

**Step 1: Add GET /me/export endpoint**

After the existing delete endpoint (~line 355), add:

```python
@router.get("/me/export")
async def export_my_data(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Export all user data (RGPD right to data portability)"""
    user_data = await db.users.find_one({"id": current_user.id}, {"_id": 0, "password_hash": 0, "totp_secret": 0})
    sessions = await db.user_sessions.find({"user_id": current_user.id}, {"_id": 0}).to_list(None)
    optins = await db.episode_optins.find({"user_id": current_user.id}, {"_id": 0}).to_list(None)
    partner = await db.partners.find_one({"user_id": current_user.id}, {"_id": 0, "ip_address": 0})

    # Convert datetime objects to ISO strings
    from bson.json_util import default
    import json

    export = {
        "user": user_data,
        "sessions": sessions,
        "episode_optins": optins,
        "partner": partner,
        "exported_at": datetime.utcnow().isoformat(),
    }

    return export
```

**Step 2: Test backend syntax**

Run: `cd backend && python -c "import ast; ast.parse(open('routes/auth.py').read()); print('OK')"`

**Step 3: Run backend tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests pass (no new tests needed for this endpoint, it's a simple read)

**Step 4: Commit**

```bash
git add backend/routes/auth.py
git commit -m "feat(rgpd): add user data export endpoint GET /me/export"
```

---

## Task 10: Delete Account + Export UI on MyPartnerAccount

**Files:**
- Modify: `frontend/src/pages/MyPartnerAccount.tsx`

**Step 1: Add delete and export buttons**

After the edit form section (around line 384), add a "Données personnelles" section:

```tsx
{/* RGPD Section */}
<div className="mt-10 pt-8 border-t border-white/10">
    <h3 className="text-lg font-serif text-white mb-4">Données personnelles</h3>
    <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={handleExportData} disabled={isExporting}>
            <Download size={16} className="mr-2" />
            {isExporting ? 'Export...' : 'Exporter mes données'}
        </Button>
        <Button variant="secondary" className="text-red-400 border-red-400/30 hover:bg-red-400/10"
            onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={16} className="mr-2" />
            Supprimer mon compte
        </Button>
    </div>
</div>
```

Add state variables:
```tsx
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [isExporting, setIsExporting] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
```

Add handlers:
- `handleExportData`: fetch `GET /api/auth/me/export`, create blob download as JSON
- `handleDeleteAccount`: fetch `DELETE /api/auth/user/{userId}`, redirect to home on success

Add confirmation modal for delete (simple div overlay with "Etes-vous sur ?" + two buttons).

Import `Download`, `Trash2` from lucide-react.

**Step 2: Build check**

Run: `cd frontend && npm run build`

**Step 3: Commit**

```bash
git add frontend/src/pages/MyPartnerAccount.tsx
git commit -m "feat(rgpd): add delete account and export data buttons"
```

---

## Task 11: Email Unsubscribe Field + Endpoint

**Files:**
- Modify: `backend/models.py` (add field to User)
- Modify: `backend/routes/auth.py` (add unsubscribe endpoint)
- Modify: `backend/email_service.py` (add unsubscribe link to emails)

**Step 1: Add email_opt_out to User model**

In `backend/models.py`, add to User class (after `last_login` field, ~line 27):
```python
email_opt_out: bool = False
```

**Step 2: Add unsubscribe endpoint in auth.py**

```python
@router.get("/unsubscribe/{user_id}")
async def unsubscribe_emails(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Unsubscribe from non-transactional emails (RGPD)"""
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"email_opt_out": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Vous êtes désinscrit des emails non-transactionnels."}
```

**Step 3: Add unsubscribe link in email templates**

In `backend/email_service.py`, modify `send_email` function to append unsubscribe footer:
```python
async def send_email(email: str, subject: str, message: str, user_id: str = None) -> bool:
    unsubscribe_link = ""
    if user_id:
        base_url = settings.FRONTEND_URL or "https://mouvement-echo.fr"
        unsubscribe_link = f'<p style="margin-top:20px;font-size:12px;color:#666;">Pour vous désinscrire : <a href="{base_url}/api/auth/unsubscribe/{user_id}">cliquez ici</a></p>'
    html = f"<div style='white-space:pre-line;'>{message}</div>{unsubscribe_link}"
    # ... rest unchanged
```

Update callers to pass `user_id` where available.

**Step 4: Verify syntax**

Run: `cd backend && python -c "import ast; ast.parse(open('models.py').read()); ast.parse(open('routes/auth.py').read()); ast.parse(open('email_service.py').read()); print('OK')"`

**Step 5: Run backend tests**

Run: `cd backend && python -m pytest -p no:recording -q`

**Step 6: Commit**

```bash
git add backend/models.py backend/routes/auth.py backend/email_service.py
git commit -m "feat(rgpd): add email unsubscribe endpoint and opt-out field"
```

---

## Task 12: Final Verification

**Step 1: Full build**

Run: `cd frontend && npm run build`

**Step 2: Backend tests**

Run: `cd backend && python -m pytest -p no:recording -q`

**Step 3: Frontend tests**

Run: `cd frontend && npx vitest run`

**Step 4: Visual check**

Start both servers. Verify:
- [ ] Footer shows 4 legal links
- [ ] `/politique-de-confidentialite` renders privacy policy
- [ ] `/mentions-legales` renders legal notice
- [ ] `/cgu` renders terms of service
- [ ] Cookie banner appears on first visit
- [ ] Cookie banner disappears after choice
- [ ] Partner form has consent checkbox
- [ ] Contact form has consent checkbox
- [ ] Tech application form has consent checkbox
- [ ] MyPartnerAccount shows delete + export buttons
