# Member Profiles — Design Document

**Date**: 2026-03-14
**Status**: Approved
**Goal**: Allow accepted members to create a clickable public profile with bio, social links, role, and contact info — enabling spectators to discover and contact ECHO members. Support admin analytics for recruitment insights.

## Architecture

**Approach**: Separate MongoDB collection `member_profiles`, linked to `users` via `user_id`.

**Why separate collection**:
- Different access patterns (auth = hot path, profiles = public pages + admin dashboards)
- Security boundary (no risk of leaking auth data through profile queries)
- Clean analytics aggregations without scanning auth documents
- Different write frequencies (auth = rare, profile = regular edits)

## Data Model — Collection `member_profiles`

```python
{
    _id: ObjectId,
    user_id: ObjectId,              # unique, links to users collection

    # === Identity ===
    display_name: str,              # required, max 50 chars
    slug: str,                      # unique, URL-friendly, auto-generated, editable
    bio: str | None,                # max 300 chars
    avatar_url: str | None,         # profile photo path
    city: str | None,
    region: str | None,             # enum: FRENCH_REGIONS
    department: str | None,         # 2-digit code ("75", "69", etc.)

    # === ECHO Role ===
    project: str,                   # enum: "cognisphere" | "echolink" | "scenariste" | "benevole"
    role_title: str | None,         # free text: "Développeur Frontend", etc.
    skills: [str],                  # lowercase, trimmed
    experience_level: str | None,   # enum: "professional" | "student" | "self_taught" | "motivated"
    availability: str | None,       # enum: "punctual" | "regular" | "active"

    # === Demographics (admin analytics only, never public by default) ===
    age_range: str | None,          # enum: "18-25" | "26-35" | "36-45" | "46-55" | "56+"
    professional_sector: str | None, # enum: PROFESSIONAL_SECTORS
    gender: str | None,             # enum: "woman" | "man" | "non_binary" | "prefer_not_to_say"

    # === Contact & Social ===
    contact_email: str | None,      # public-facing email (not auth email)
    social_links: [                 # array of objects, extensible
        {
            platform: str,          # enum: "website" | "instagram" | "linkedin" | "tiktok" |
                                    #        "facebook" | "twitter" | "youtube" | "github" |
                                    #        "behance" | "vimeo" | "other"
            url: str,
            label: str | None       # optional display label
        }
    ],

    # === Visibility ===
    visible: bool,                  # global toggle, default: false
    visibility_overrides: {
        contact_email: bool,        # default: false
        city: bool,                 # default: true
        social_links: bool,         # default: true
        age_range: bool,            # default: false (admin-only)
        professional_sector: bool   # default: false (admin-only)
    },

    # === Provenance & Status ===
    candidature_id: ObjectId | None,
    candidature_type: str | None,   # "tech" | "volunteer"
    membership_status: str,         # "active" | "inactive" | "suspended" | "alumni"
    joined_at: datetime,
    last_active_at: datetime | None,

    # === Meta ===
    created_at: datetime,
    updated_at: datetime
}
```

### Enum Values

**FRENCH_REGIONS** (18):
`auvergne_rhone_alpes`, `bourgogne_franche_comte`, `bretagne`, `centre_val_de_loire`, `corse`, `grand_est`, `hauts_de_france`, `ile_de_france`, `normandie`, `nouvelle_aquitaine`, `occitanie`, `pays_de_la_loire`, `provence_alpes_cote_d_azur`, `outre_mer`

**PROFESSIONAL_SECTORS** (14):
`tech`, `creative`, `audiovisual`, `education`, `health`, `business`, `public_sector`, `environment`, `social_work`, `journalism`, `legal`, `student`, `retired`, `other`

## Index Strategy

```
# Essential (create on day 1)
{ user_id: 1 }                          # unique
{ slug: 1 }                             # unique
{ visible: 1, project: 1 }             # public listing
{ membership_status: 1 }               # filter active members

# Analytics (add when building dashboard)
{ region: 1, project: 1 }
{ skills: 1 }                          # multikey
{ professional_sector: 1, project: 1 }
{ age_range: 1, gender: 1 }
{ joined_at: 1 }
{ last_active_at: 1 }
```

## API Endpoints

```
# Public (no auth)
GET    /api/members                         # list visible profiles (filterable)
GET    /api/members/{slug}                  # single profile by slug

# Authenticated member (own profile)
GET    /api/members/me                      # get own profile
PUT    /api/members/me                      # update own profile
PATCH  /api/members/me/visibility           # toggle visible + overrides
POST   /api/members/me/avatar               # upload profile photo

# Admin
GET    /api/admin/members                   # all profiles with filters
GET    /api/admin/members/analytics         # aggregated dashboard data
PATCH  /api/admin/members/{id}/status       # change membership_status
POST   /api/admin/members/seed/{candidature_id}  # create profile from candidature
GET    /api/admin/members/export            # CSV/JSON export
```

## Data Flow

### Profile Creation
1. Admin accepts candidature -> auto-creates `member_profiles` document
2. Pre-populated from candidature: display_name, project, skills, experience_level, city (if volunteer)
3. `visible: false` by default — member must opt-in
4. `candidature_id` + `candidature_type` set for traceability

### Profile Independence
Once created, the profile is the member's own space. Skills, role_title, etc. are editable independently from the original candidature. No bidirectional sync.

### Member Removal
1. Set `membership_status` to "inactive" or "suspended"
2. Set `visible` to false
3. Keep document for historical analytics
4. Anonymize PII after 3 years (RGPD)

## Frontend Components

### Public (PartnersPage)
- **MemberCard** (existing, enhanced) — clickable, opens modal
- **MemberModal** (new) — full profile view with:
  - Avatar + name + role_title
  - Project badge (color-coded)
  - Bio
  - Skills tags (all, not limited to 3)
  - City + availability
  - Social links (icon row)
  - Contact email (if visible)
  - "Membre depuis [date]" badge
  - Experience level

### Profile Page (authenticated member)
- New section in existing Profile page: "Mon profil public"
- Form to edit all profile fields
- Toggle visibility (global + per-field overrides)
- Avatar upload
- Live preview of public profile

### Admin Dashboard
- Members analytics tab with charts (by region, sector, skills, growth)
- Export CSV button
- Status management (activate/suspend)

## RGPD

- Demographics (age_range, gender, professional_sector) = admin-only, never public by default
- Contact email hidden by default (visibility_overrides.contact_email = false)
- Right to erasure: anonymize PII, keep skeleton for aggregate counts
- Data export: `/api/members/me` returns full profile as JSON
- Retention: 3 years after last activity, then anonymize

## Phase 2 (future)
- `contributions: [str]` — episodes/projects contributed to
- `referral_source: str` — recruitment channel tracking
- `languages: [str]` — for international reach
