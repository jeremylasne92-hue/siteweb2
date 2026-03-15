# Navigation Sub-Menus + Home Overview Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add dropdown hover sub-menus to the main navigation pointing to page sections, and enrich the Home page pilier cards with sub-links to those same sections.

**Architecture:** Extend the flat `navLinks` array in Header.tsx to support optional `children` with anchor targets. Add a `DropdownMenu` component for desktop hover and accordion for mobile. Add section `id` attributes to pages missing them. Enrich Home.tsx pilier cards with sub-link lists reusing the same anchor data.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, react-router-dom Link

---

### Task 1: Add section IDs to Mouvement.tsx

**Files:**
- Modify: `frontend/src/pages/Mouvement.tsx:192` (timeline section)
- Modify: `frontend/src/pages/Mouvement.tsx:268` (équipe section)
- Modify: `frontend/src/pages/Mouvement.tsx:306` (CTA section)

**Step 1: Add id="etapes" to the timeline section**

In `Mouvement.tsx`, find line 192:
```tsx
<section className="relative py-20 sm:py-28 overflow-hidden">
```
Change to:
```tsx
<section id="etapes" className="relative py-20 sm:py-28 overflow-hidden">
```

**Step 2: Add id="equipe" to the équipe section**

Find line 268:
```tsx
<section className="py-24 relative overflow-hidden">
```
Change to:
```tsx
<section id="equipe" className="py-24 relative overflow-hidden">
```

**Step 3: Add id="rejoindre" to the CTA section**

Find line 306:
```tsx
<section className="py-24 px-4 container mx-auto">
```
Change to:
```tsx
<section id="rejoindre" className="py-24 px-4 container mx-auto">
```

**Step 4: Verify IDs work**

Run: `cd frontend && npx eslint src/pages/Mouvement.tsx`
Expected: No errors

**Step 5: Commit**

```bash
git add frontend/src/pages/Mouvement.tsx
git commit -m "feat: add section IDs to Mouvement page for nav sub-menus"
```

---

### Task 2: Add section IDs to Serie.tsx (candidature CTA)

Serie.tsx already has `id="apercu"`, `id="prologue"`, `id="saisons"`, `id="personnages"`. No additional IDs needed — the existing sub-nav sections are sufficient.

**Step 1: Verify existing IDs**

Run: `cd frontend && grep -n 'id="apercu"\|id="prologue"\|id="saisons"\|id="personnages"' src/pages/Serie.tsx`
Expected: 4 matches confirming all IDs exist

No commit needed — this is verification only.

---

### Task 3: Refactor Header.tsx navLinks to support children

**Files:**
- Modify: `frontend/src/components/layout/Header.tsx:39-48`

**Step 1: Define the NavLink type and update navLinks array**

Replace the current `navLinks` array (lines 39-48) with:

```tsx
type NavChild = { name: string; anchor: string };
type NavLink = { name: string; path: string; children?: NavChild[] };

const navLinks: NavLink[] = [
    {
        name: 'La Série', path: '/serie',
        children: [
            { name: 'Aperçu', anchor: '#apercu' },
            { name: 'Prologue', anchor: '#prologue' },
            { name: 'Saisons', anchor: '#saisons' },
            { name: 'Personnages', anchor: '#personnages' },
        ]
    },
    {
        name: 'Le Mouvement', path: '/mouvement',
        children: [
            { name: 'Les 7 Étapes', anchor: '#etapes' },
            { name: 'L\'Équipe', anchor: '#equipe' },
            { name: 'Rejoindre', anchor: '#rejoindre' },
        ]
    },
    {
        name: 'Cognisphère', path: '/cognisphere',
        children: [
            { name: 'Le Constat', anchor: '#le-constat' },
            { name: 'Aperçu', anchor: '#apercu' },
            { name: 'Candidature', anchor: '#candidature' },
        ]
    },
    {
        name: 'ECHOLink', path: '/echolink',
        children: [
            { name: 'Fonctionnalités', anchor: '#fonctionnalites' },
            { name: 'Candidature', anchor: '#candidature' },
        ]
    },
    { name: 'Partenaires', path: '/partenaires' },
    { name: 'Événements', path: '/agenda' },
    { name: 'Ressources', path: '/ressources' },
    { name: 'Contact', path: '/contact' },
];
```

**Step 2: Verify lint passes**

Run: `cd frontend && npx eslint src/components/layout/Header.tsx`
Expected: No errors (navLinks is still used the same way — children are just ignored for now)

**Step 3: Commit**

```bash
git add frontend/src/components/layout/Header.tsx
git commit -m "feat: add children structure to navLinks for sub-menus"
```

---

### Task 4: Implement desktop dropdown hover sub-menus

**Files:**
- Modify: `frontend/src/components/layout/Header.tsx` (desktop nav section, lines 64-77)

**Step 1: Add state for open dropdown**

Add at the top of the `Header` component (after existing useState calls):

```tsx
const [openDropdown, setOpenDropdown] = useState<string | null>(null);
const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
```

Add `useRef` to the React import at top of file.

**Step 2: Add dropdown handlers**

Add after the `handleLogout` function:

```tsx
const handleDropdownEnter = (path: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(path);
};

const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 150);
};
```

**Step 3: Replace the desktop nav rendering**

Replace the desktop nav section (lines 64-77) with:

```tsx
<nav className="hidden lg:flex items-center gap-6">
    {navLinks.map((link) => (
        <div
            key={link.path}
            className="relative"
            onMouseEnter={() => link.children && handleDropdownEnter(link.path)}
            onMouseLeave={() => link.children && handleDropdownLeave()}
        >
            <Link
                to={link.path}
                className={cn(
                    'text-sm uppercase tracking-wider transition-colors hover:text-echo-gold py-2 block',
                    location.pathname === link.path ? 'text-echo-gold' : 'text-echo-textMuted'
                )}
            >
                {link.name}
            </Link>
            {link.children && openDropdown === link.path && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-echo-darker border border-white/10 rounded-lg shadow-xl overflow-hidden animate-fade-in z-50">
                    {link.children.map((child) => (
                        <Link
                            key={child.anchor}
                            to={`${link.path}${child.anchor}`}
                            className="block px-4 py-2.5 text-sm text-echo-textMuted hover:bg-white/5 hover:text-white transition-colors"
                            onClick={() => setOpenDropdown(null)}
                        >
                            {child.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    ))}
</nav>
```

**Step 4: Verify lint passes**

Run: `cd frontend && npx eslint src/components/layout/Header.tsx`
Expected: No errors

**Step 5: Verify build passes**

Run: `cd frontend && npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add frontend/src/components/layout/Header.tsx
git commit -m "feat: add desktop dropdown hover sub-menus to navigation"
```

---

### Task 5: Implement mobile accordion sub-menus

**Files:**
- Modify: `frontend/src/components/layout/Header.tsx` (mobile menu section, lines 159-219)

**Step 1: Add ChevronDown to imports**

Add `ChevronDown` to the lucide-react import at line 3.

**Step 2: Add mobile accordion state**

Add to the Header component state:

```tsx
const [openMobileAccordion, setOpenMobileAccordion] = useState<string | null>(null);
```

**Step 3: Replace mobile navLinks rendering**

Replace the mobile menu navLinks.map section (lines 161-170) with:

```tsx
{navLinks.map((link) => (
    <div key={link.path}>
        <div className="flex items-center justify-between border-b border-white/5">
            <Link
                to={link.path}
                className="text-white hover:text-echo-gold py-2 flex-1"
                onClick={() => setIsMobileMenuOpen(false)}
            >
                {link.name}
            </Link>
            {link.children && (
                <button
                    onClick={() => setOpenMobileAccordion(
                        openMobileAccordion === link.path ? null : link.path
                    )}
                    className="p-2 text-echo-textMuted hover:text-white transition-colors"
                    aria-label={`Voir les sous-sections de ${link.name}`}
                >
                    <ChevronDown
                        size={16}
                        className={cn(
                            'transition-transform duration-200',
                            openMobileAccordion === link.path && 'rotate-180'
                        )}
                    />
                </button>
            )}
        </div>
        {link.children && openMobileAccordion === link.path && (
            <div className="pl-4 pb-2 animate-fade-in">
                {link.children.map((child) => (
                    <Link
                        key={child.anchor}
                        to={`${link.path}${child.anchor}`}
                        className="block py-1.5 text-sm text-echo-textMuted hover:text-echo-gold transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {child.name}
                    </Link>
                ))}
            </div>
        )}
    </div>
))}
```

**Step 4: Verify lint and build pass**

Run: `cd frontend && npx eslint src/components/layout/Header.tsx && npm run build`
Expected: No errors

**Step 5: Commit**

```bash
git add frontend/src/components/layout/Header.tsx
git commit -m "feat: add mobile accordion sub-menus to navigation"
```

---

### Task 6: Enrich Home page pilier cards with sub-links

**Files:**
- Modify: `frontend/src/pages/Home.tsx:66-130`

**Step 1: Define pilier sub-links data**

Add before the `return` in `Home()`:

```tsx
const pilierLinks = {
    serie: [
        { name: 'Épisodes', to: '/serie#saisons' },
        { name: 'Personnages', to: '/serie#personnages' },
        { name: 'Prologue', to: '/serie#prologue' },
    ],
    ecosysteme: [
        { name: 'Partenaires', to: '/partenaires' },
        { name: 'Événements', to: '/agenda' },
        { name: 'Rejoindre le mouvement', to: '/mouvement#rejoindre' },
    ],
    plateformes: [
        { name: 'Cognisphère', to: '/cognisphere' },
        { name: 'ECHOLink', to: '/echolink' },
        { name: 'Fonctionnalités', to: '/echolink#fonctionnalites' },
    ],
};
```

**Step 2: Add sub-links to Pilier 1 (La Série)**

In the Pilier 1 card, after the `</p>` tag (line 75) and before the closing `</div>` (line 76), add:

```tsx
<div className="flex flex-col gap-1.5 mt-2 mb-4">
    {pilierLinks.serie.map((link) => (
        <Link
            key={link.to}
            to={link.to}
            className="text-sm text-[#D1D5DB]/70 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5"
        >
            <span className="text-[#D4AF37]/50">→</span> {link.name}
        </Link>
    ))}
</div>
```

**Step 3: Add sub-links to Pilier 2 (ECHOSystem)**

Same pattern after the `</p>` (line 97), using `pilierLinks.ecosysteme`.

**Step 4: Add sub-links to Pilier 3 (Plateformes)**

Same pattern after the `</p>` (line 119), using `pilierLinks.plateformes`.

**Step 5: Verify lint and build pass**

Run: `cd frontend && npx eslint src/pages/Home.tsx && npm run build`
Expected: No errors

**Step 6: Commit**

```bash
git add frontend/src/pages/Home.tsx
git commit -m "feat: add section sub-links to Home page pilier cards"
```

---

### Task 7: Visual verification and final cleanup

**Step 1: Start dev server**

Run: `cd frontend && npm run dev`

**Step 2: Verify desktop dropdown hover**

- Hover over "La Série" in nav → dropdown with 4 sub-links appears
- Hover over "Le Mouvement" → dropdown with 3 sub-links
- Hover over "Cognisphère" → dropdown with 3 sub-links
- Hover over "ECHOLink" → dropdown with 2 sub-links
- "Partenaires", "Événements", "Ressources", "Contact" → no dropdown
- Click sub-link → navigates to page and scrolls to section

**Step 3: Verify mobile accordion**

- Open mobile menu → tap chevron on "La Série" → sub-links expand
- Tap sub-link → menu closes, navigates to page#section
- Tap chevron again → accordion closes

**Step 4: Verify Home pilier cards**

- Scroll to "L'Expérience ECHO" section
- Each card shows 3 sub-links with → arrows
- Click any sub-link → navigates correctly

**Step 5: Verify section anchors work**

- Navigate to `/mouvement#etapes` → scrolls to timeline
- Navigate to `/mouvement#equipe` → scrolls to team
- Navigate to `/mouvement#rejoindre` → scrolls to CTA

**Step 6: Run full quality checks**

```bash
cd frontend && npx eslint . && npx vitest run && npm run build
```
Expected: All pass

**Step 7: Final commit (if any cleanup needed)**

```bash
git add -A
git commit -m "fix: visual adjustments for nav sub-menus and home overview"
```
