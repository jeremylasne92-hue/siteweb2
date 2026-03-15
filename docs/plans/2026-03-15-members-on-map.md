# Members on Map — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Display members as blue glowing markers on the existing Leaflet partners map, geocoding their city at volunteer registration time via Nominatim.

**Architecture:** Add `latitude`/`longitude` optional fields to MemberProfile and VolunteerApplication models. Geocode city→coordinates via Nominatim when a volunteer applies. Propagate coordinates to member profile on acceptance. Expose a lightweight public endpoint `/api/members/map`. Extend PartnersMap to render member markers as small blue glowing circles.

**Tech Stack:** FastAPI, MongoDB (Motor), httpx (Nominatim), React 19, TypeScript, Leaflet/react-leaflet, Tailwind CSS 4

---

### Task 1: Add geocoding utility to backend

**Files:**
- Create: `backend/utils/geocode.py`

**Step 1: Create the geocoding helper**

```python
"""Geocode a French city name to GPS coordinates via Nominatim."""
import httpx
import logging

logger = logging.getLogger(__name__)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "MouvementECHO/1.0 (mouvement.echo.france@gmail.com)"


async def geocode_city(city: str) -> tuple[float, float] | None:
    """Return (latitude, longitude) for a French city, or None on failure."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                NOMINATIM_URL,
                params={"city": city, "country": "France", "format": "json", "limit": "1"},
                headers={"User-Agent": USER_AGENT},
            )
            resp.raise_for_status()
            data = resp.json()
            if data:
                return float(data[0]["lat"]), float(data[0]["lon"])
    except Exception as e:
        logger.warning("Geocoding failed for city '%s': %s", city, e)
    return None
```

**Step 2: Verify httpx is available**

Run: `cd backend && python -c "import httpx; print(httpx.__version__)"`
Expected: Version prints (httpx is already used by FastAPI test client). If missing:
Run: `cd backend && pip install httpx`

**Step 3: Commit**

```bash
git add backend/utils/geocode.py
git commit -m "feat: add Nominatim geocoding utility for city→GPS"
```

---

### Task 2: Add latitude/longitude to backend models

**Files:**
- Modify: `backend/models.py:303-319` (VolunteerApplication)
- Modify: `backend/models_member.py:133-169` (MemberProfile)
- Modify: `backend/models_member.py:60-93` (MemberProfileCreate)
- Modify: `backend/models_member.py:96-124` (MemberProfileUpdate)

**Step 1: Add lat/lng to VolunteerApplication**

In `backend/models.py`, add after `city: str` (line 308):

```python
    latitude: Optional[float] = None
    longitude: Optional[float] = None
```

**Step 2: Add lat/lng to MemberProfile**

In `backend/models_member.py`, in the `MemberProfile` class, add after `department: Optional[str] = None` (line 144):

```python
    latitude: Optional[float] = None
    longitude: Optional[float] = None
```

**Step 3: Add lat/lng to MemberProfileCreate**

In `backend/models_member.py`, in the `MemberProfileCreate` class, add after `department: Optional[str] = None` (line 68):

```python
    latitude: Optional[float] = None
    longitude: Optional[float] = None
```

**Step 4: Add lat/lng to MemberProfileUpdate**

In `backend/models_member.py`, in the `MemberProfileUpdate` class, add after `department: Optional[str] = None` (line 104):

```python
    latitude: Optional[float] = None
    longitude: Optional[float] = None
```

**Step 5: Verify no lint errors**

Run: `cd backend && python -c "from models import VolunteerApplication; from models_member import MemberProfile; print('OK')"`
Expected: `OK`

**Step 6: Commit**

```bash
git add backend/models.py backend/models_member.py
git commit -m "feat: add latitude/longitude fields to volunteer and member models"
```

---

### Task 3: Geocode city on volunteer application submit

**Files:**
- Modify: `backend/routes/volunteers.py:23-84` (submit_volunteer_application)

**Step 1: Import geocode_city**

Add at the top of `backend/routes/volunteers.py`:

```python
from utils.geocode import geocode_city
```

**Step 2: Add geocoding after application creation, before insert**

In `submit_volunteer_application`, after `application = VolunteerApplication(...)` and before `await db.volunteer_applications.insert_one(...)`, add:

```python
    # Geocode city → GPS coordinates (non-blocking, failure is acceptable)
    coords = await geocode_city(data.city)
    if coords:
        application.latitude = coords[0]
        application.longitude = coords[1]
```

**Step 3: Verify**

Run: `cd backend && python -c "from routes.volunteers import router; print('Import OK')"`
Expected: `Import OK`

**Step 4: Commit**

```bash
git add backend/routes/volunteers.py
git commit -m "feat: geocode volunteer city on application submit"
```

---

### Task 4: Propagate coordinates to member profile on seed

**Files:**
- Modify: `backend/routes/members.py:283-384` (auto_seed_member_profile)

**Step 1: Add lat/lng to profile dict in auto_seed_member_profile**

In `auto_seed_member_profile`, in the `profile = {` dict (around line 332), add after `"department": candidature.get("department"),`:

```python
        "latitude": candidature.get("latitude"),
        "longitude": candidature.get("longitude"),
```

**Step 2: Verify**

Run: `cd backend && python -c "from routes.members import auto_seed_member_profile; print('OK')"`
Expected: `OK`

**Step 3: Commit**

```bash
git add backend/routes/members.py
git commit -m "feat: propagate GPS coordinates from candidature to member profile"
```

---

### Task 5: Add public GET /api/members/map endpoint

**Files:**
- Modify: `backend/routes/members.py` (add endpoint before `/{slug}`)

**Step 1: Add the map endpoint**

Add this endpoint in `backend/routes/members.py` after the `list_members` endpoint (line 137) and before `@router.get("/{slug}")`:

```python
@router.get("/map")
async def list_members_for_map(
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Return geocoded members for map display (public, minimal data)."""
    cursor = db.member_profiles.find(
        {
            "visible": True,
            "membership_status": "active",
            "latitude": {"$ne": None},
            "longitude": {"$ne": None},
        },
        {"_id": 0, "city": 1, "latitude": 1, "longitude": 1},
    )
    members = await cursor.to_list(length=500)
    return members
```

**Important:** This endpoint MUST be defined before `/{slug}` to avoid route conflict (FastAPI matches routes in order, "map" would be caught by `{slug}`).

**Step 2: Verify backend tests pass**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests pass

**Step 3: Commit**

```bash
git add backend/routes/members.py
git commit -m "feat: add GET /api/members/map endpoint for map markers"
```

---

### Task 6: Add MemberProfile latitude/longitude to frontend types

**Files:**
- Modify: `frontend/src/types/member.ts`

**Step 1: Add optional lat/lng to MemberProfile interface**

In `frontend/src/types/member.ts`, add after `city?: string;` (line 22):

```typescript
    latitude?: number;
    longitude?: number;
```

**Step 2: Create MapMember type**

Add at the end of the file:

```typescript
export interface MapMember {
    city: string;
    latitude: number;
    longitude: number;
}
```

**Step 3: Verify lint passes**

Run: `cd frontend && npx eslint src/types/member.ts`
Expected: No errors

**Step 4: Commit**

```bash
git add frontend/src/types/member.ts
git commit -m "feat: add GPS coordinates to frontend member types"
```

---

### Task 7: Extend PartnersMap to display member markers

**Files:**
- Modify: `frontend/src/components/partners/PartnersMap.tsx`

**Step 1: Import MapMember type**

Add to imports at top:

```typescript
import type { MapMember } from '../../types/member';
```

**Step 2: Update PartnersMapProps**

Change the interface to:

```typescript
interface PartnersMapProps {
    partners: Partner[];
    onPartnerClick: (partner: Partner) => void;
    members?: MapMember[];
}
```

**Step 3: Create blue glow member marker icon**

Add after `createCustomIcon` function:

```typescript
const memberIcon = L.divIcon({
    className: 'member-map-marker',
    html: `<div style="
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #3B82F6;
        box-shadow: 0 0 8px 4px rgba(59,130,246,0.5);
    "></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
    popupAnchor: [0, -8],
});
```

**Step 4: Destructure members prop and render member markers**

Update component signature:

```typescript
export const PartnersMap: React.FC<PartnersMapProps> = ({ partners, onPartnerClick, members = [] }) => {
```

Add member markers after the partner markers block (after the closing `))}`), before `</MapContainer>`:

```tsx
                {members.map((member, i) => (
                    <Marker
                        key={`member-${i}`}
                        position={[member.latitude, member.longitude]}
                        icon={memberIcon}
                    >
                        <Popup className="dark-popup">
                            <div className="min-w-[140px] p-2 bg-echo-darker text-white">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
                                    <span className="text-sm text-neutral-300">Membre à {member.city}</span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
```

**Step 5: Add legend for member markers**

Add after `</MapContainer>` and before `<style>`:

```tsx
            {/* Map Legend */}
            <div className="absolute bottom-4 right-4 z-[1000] bg-[#121212]/90 border border-white/10 rounded-lg px-3 py-2 text-xs">
                <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.5)]" />
                    <span className="text-neutral-400">Membres</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                    <span className="text-neutral-400">Partenaires</span>
                </div>
            </div>
```

**Step 6: Verify lint passes**

Run: `cd frontend && npx eslint src/components/partners/PartnersMap.tsx`
Expected: No errors

**Step 7: Commit**

```bash
git add frontend/src/components/partners/PartnersMap.tsx
git commit -m "feat: add blue glow member markers and legend to partners map"
```

---

### Task 8: Fetch members for map in PartnersPage

**Files:**
- Modify: `frontend/src/pages/PartnersPage.tsx`

**Step 1: Import MapMember type**

Add to imports:

```typescript
import type { MapMember } from '../types/member';
```

**Step 2: Add mapMembers state**

Add after `const [membersCount, setMembersCount] = ...`:

```typescript
const [mapMembers, setMapMembers] = useState<MapMember[]>([]);
```

**Step 3: Fetch map members in useEffect**

In the `fetchInitData` function, add to `Promise.all`:

```typescript
fetch(`${MEMBERS_API}/map`),
```

And handle the response:

```typescript
const [statsRes, thematicsRes, membersRes, mapMembersRes] = await Promise.all([
    fetch(`${PARTNERS_API}/stats`),
    fetch(`${PARTNERS_API}/thematics`),
    fetch(`${MEMBERS_API}?limit=1`),
    fetch(`${MEMBERS_API}/map`),
]);

if (statsRes.ok) setStats(await statsRes.json());
if (thematicsRes.ok) setThematicsList(await thematicsRes.json());
if (membersRes.ok) {
    const data = await membersRes.json();
    setMembersCount(data.total || 0);
}
if (mapMembersRes.ok) setMapMembers(await mapMembersRes.json());
```

**Step 4: Pass members to PartnersMap**

Update the `<PartnersMap>` usage to:

```tsx
<PartnersMap
    partners={partners}
    onPartnerClick={setSelectedPartner}
    members={mapMembers}
/>
```

**Step 5: Verify lint and build pass**

Run: `cd frontend && npx eslint src/pages/PartnersPage.tsx && npm run build`
Expected: No errors

**Step 6: Commit**

```bash
git add frontend/src/pages/PartnersPage.tsx
git commit -m "feat: fetch and pass map members to PartnersMap"
```

---

### Task 9: Quality checks and visual verification

**Step 1: Run backend tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests pass

**Step 2: Run frontend lint**

Run: `cd frontend && npx eslint .`
Expected: No errors

**Step 3: Run frontend tests**

Run: `cd frontend && npx vitest run`
Expected: All tests pass

**Step 4: Build production bundle**

Run: `cd frontend && npm run build`
Expected: Build succeeds

**Step 5: Visual verification**

Start dev servers, navigate to `/partenaires`, switch to map view:
- Partner markers appear as colored pin icons
- Member markers appear as small blue glowing dots
- Legend shows "Membres" (blue) and "Partenaires" (gold)
- Clicking a member marker shows popup "Membre à {city}"
- No members have coordinates yet (that's normal — only new registrations will be geocoded)

**Step 6: Commit if any fixes needed**

```bash
git add -A
git commit -m "fix: visual adjustments for members on map"
```
