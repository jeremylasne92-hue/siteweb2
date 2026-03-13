# Responsive Mobile Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the entire ECHO platform mobile-responsive (375px+) for the March 20 launch.

**Architecture:** Page-by-page fixes using only Tailwind responsive classes. No new CSS, no new components. Fix what's broken at 375px viewport.

**Tech Stack:** Tailwind CSS 4, React 19, TypeScript

---

### Task 1: Cookie Banner + Layout fixes

**Files:**
- Modify: `frontend/src/components/ui/CookieBanner.tsx`
- Modify: `frontend/src/components/layout/Layout.tsx`

**Step 1: Fix CookieBanner button layout on mobile**
- Buttons container: add responsive text sizing `text-xs sm:text-sm`
- Ensure buttons `flex-col sm:flex-row` stacking
- Add `gap-2 sm:gap-3` for tighter mobile spacing

**Step 2: Fix Layout top padding**
- Change `pt-20` to `pt-16 sm:pt-20` for smaller mobile header

**Step 3: Verify with preview_resize mobile + screenshot**

---

### Task 2: Header + Footer responsive

**Files:**
- Modify: `frontend/src/components/layout/Header.tsx`
- Modify: `frontend/src/components/layout/Footer.tsx`

**Step 1: Header fixes**
- Logo: `h-8 sm:h-10 md:h-12` instead of fixed `h-12`
- User dropdown: add `max-w-[calc(100vw-2rem)]` or `right-0` positioning
- Mobile menu padding: tighten for small screens

**Step 2: Footer fixes**
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-5` (1 col on mobile)
- Brand col-span: `col-span-1 sm:col-span-2 lg:col-span-2`
- Logo text: `text-2xl sm:text-3xl`

**Step 3: Verify mobile layout**

---

### Task 3: Home page

**Files:**
- Modify: `frontend/src/pages/Home.tsx`

**Step 1: Hero responsive**
- h1: `text-3xl sm:text-5xl md:text-7xl lg:text-8xl`
- Subtitle: `text-base sm:text-lg md:text-xl`
- Section titles: `text-3xl sm:text-4xl md:text-[48px]`

**Step 2: Cards/sections padding**
- Card padding: `p-6 sm:p-8 md:p-10`
- Grid gaps: `gap-4 sm:gap-6 md:gap-8`

**Step 3: Verify**

---

### Task 4: Serie page

**Files:**
- Modify: `frontend/src/pages/Serie.tsx`

**Step 1: Hero + nav**
- h1: `text-3xl sm:text-5xl md:text-7xl lg:text-8xl`
- Sticky nav: verify top offset for mobile header

**Step 2: Grids**
- Characters: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`
- Character name: `text-lg sm:text-2xl`
- Episodes: keep current responsive grid

**Step 3: Verify**

---

### Task 5: Mouvement page

**Files:**
- Modify: `frontend/src/pages/Mouvement.tsx`

**Step 1: Hero**
- Logo: `h-20 sm:h-28 md:h-44`
- h1: `text-3xl sm:text-5xl md:text-7xl lg:text-8xl`

**Step 2: Team + CTA**
- Team gap: `gap-6 sm:gap-8 md:gap-12`
- Team avatars: `w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32`
- CTA padding: `p-6 sm:p-8 md:p-12 lg:p-20`
- CTA h2: `text-2xl sm:text-3xl md:text-4xl lg:text-5xl`

**Step 3: Verify**

---

### Task 6: Contact + Support + Events

**Files:**
- Modify: `frontend/src/pages/Contact.tsx`
- Modify: `frontend/src/pages/Support.tsx`
- Modify: `frontend/src/pages/Events.tsx`

**Step 1: Contact**
- Container: `px-3 sm:px-4`
- Form spacing: `space-y-4 sm:space-y-6`

**Step 2: Support**
- Hero h1: `text-3xl sm:text-5xl md:text-6xl`
- Card padding: `p-6 sm:p-8`

**Step 3: Events**
- Filter gaps: `gap-2 sm:gap-4`
- Metadata gaps: `gap-2 sm:gap-4`

**Step 4: Verify all three**

---

### Task 7: FAQ + Resources

**Files:**
- Modify: `frontend/src/pages/FAQ.tsx`
- Modify: `frontend/src/pages/Resources.tsx`

**Step 1: FAQ**
- Accordion padding: `p-4 sm:p-6`
- Answer padding: `px-4 pb-4 sm:px-6 sm:pb-6`

**Step 2: Resources**
- Filter pill gap: `gap-2 sm:gap-4`

**Step 3: Verify**

---

### Task 8: CogniSphère + ECHOLink

**Files:**
- Modify: `frontend/src/pages/Cognisphere.tsx`
- Modify: `frontend/src/pages/ECHOLink.tsx`

**Step 1: CogniSphère**
- Hero: `h-[60vh] sm:h-[70vh] md:h-[80vh]`
- Grid gaps: `gap-4 md:gap-8`
- Device mockup gaps: `gap-6 md:gap-12`
- Stats grid: `grid-cols-1 sm:grid-cols-2 md:grid-cols-4`

**Step 2: ECHOLink**
- Hero: `h-[60vh] sm:h-[70vh] md:h-[80vh]`
- Grid gaps: `gap-4 md:gap-8`, `gap-6 md:gap-12`, `gap-6 md:gap-16`
- Stat cards gap: `gap-2 sm:gap-4`

**Step 3: Verify both**

---

### Task 9: Partners page

**Files:**
- Modify: `frontend/src/pages/Partners.tsx`
- Possibly: `frontend/src/components/partners/PartnersHero.tsx`
- Possibly: `frontend/src/components/partners/PartnersFilters.tsx`

**Step 1: Container padding**
- `px-4 sm:px-6 lg:px-8`

**Step 2: Check subcomponents for responsive issues**

**Step 3: Verify**

---

### Task 10: Auth pages (Login + Register)

**Files:**
- Modify: `frontend/src/pages/auth/Login.tsx`
- Modify: `frontend/src/pages/auth/Register.tsx`

**Step 1: Card padding**
- Both: `p-6 sm:p-8 lg:p-10` instead of `p-8 sm:p-10`

**Step 2: Verify**

---

### Task 11: Profile page

**Files:**
- Modify: `frontend/src/pages/Profile.tsx`

**Step 1: Spacing adjustments**
- Avatar gap: `gap-3 sm:gap-5`
- Interest pills: `gap-1.5 sm:gap-2`
- Candidature badges: `gap-1 sm:gap-2`

**Step 2: Verify**

---

### Task 12: Admin pages (5 pages)

**Files:**
- Modify: `frontend/src/pages/AdminDashboard.tsx`
- Modify: `frontend/src/pages/AdminCandidatures.tsx`
- Modify: `frontend/src/pages/AdminPartners.tsx`
- Modify: `frontend/src/pages/AdminEvents.tsx`
- Modify: `frontend/src/pages/AdminExports.tsx`

**Step 1: Container padding on ALL admin pages**
- `px-4 sm:px-6 lg:px-8` (replace `px-6 lg:px-8`)

**Step 2: AdminCandidatures table**
- Wrap table in `overflow-x-auto` div
- Hide "Compétences" column on mobile: `hidden md:table-cell`
- Add `min-w-[600px]` to table for horizontal scroll
- Batch bar: `flex-col sm:flex-row gap-2 sm:gap-3`
- Modal: add `max-h-[90vh] overflow-y-auto`

**Step 3: AdminPartners table**
- Same overflow-x-auto pattern
- Modal: `max-h-[90vh] overflow-y-auto`

**Step 4: AdminEvents**
- Header: `flex flex-col sm:flex-row gap-4`
- Button group: `flex flex-col sm:flex-row gap-2 sm:gap-3`

**Step 5: AdminExports**
- Container padding only

**Step 6: Verify all admin pages**

---

### Task 13: QA finale

**Step 1:** `cd frontend && npx eslint .`
**Step 2:** `cd frontend && npx vitest run`
**Step 3:** `cd backend && python -m pytest -p no:recording -q`
**Step 4:** `cd frontend && npm run build`
**Step 5:** Preview mobile screenshots of key pages
**Step 6:** Commit
