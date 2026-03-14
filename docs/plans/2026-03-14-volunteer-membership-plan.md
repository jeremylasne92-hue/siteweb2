# Volunteer Membership Form — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow any visitor to apply as a volunteer member of Mouvement ECHO via a 4-step modal form on the Mouvement page, with admin management and CSV export for association declarations.

**Architecture:** New `volunteer_applications` MongoDB collection with dedicated Pydantic models, FastAPI routes (public submit + admin CRUD + CSV export), frontend modal form component triggered from the existing "Rejoindre le Mouvement" button, dedicated admin page, and 4 transactional emails. Follows existing candidatures pattern exactly.

**Tech Stack:** FastAPI + Motor (backend), React + TypeScript + Tailwind (frontend), SendGrid (emails)

---

### Task 1: Backend models

**Files:**
- Modify: `backend/models.py` (append after line 291)

**Step 1: Add volunteer models to models.py**

Append these models at the end of `backend/models.py`:

```python
class VolunteerApplication(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    city: str
    motivation: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    experience_level: Literal["professional", "student", "self_taught", "motivated"]
    availability: Literal["punctual", "regular", "active"]
    values_accepted: bool = True
    message: Optional[str] = None
    status: Literal["pending", "entretien", "accepted", "rejected"] = "pending"
    status_note: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None


class VolunteerApplicationRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    city: str = Field(min_length=2, max_length=100)
    motivation: list[str] = Field(default_factory=list, max_length=10)
    skills: list[str] = Field(min_length=1, max_length=50)
    experience_level: Literal["professional", "student", "self_taught", "motivated"]
    availability: Literal["punctual", "regular", "active"]
    values_accepted: bool
    message: Optional[str] = Field(None, max_length=2000)
    website: str = ""  # honeypot field

    @field_validator("values_accepted")
    @classmethod
    def validate_values(cls, v):
        if not v:
            raise ValueError("L'adhésion aux valeurs est obligatoire")
        return v


class VolunteerStatusUpdate(BaseModel):
    status: Literal["pending", "entretien", "accepted", "rejected"]
    status_note: Optional[str] = None


class VolunteerBatchStatusUpdate(BaseModel):
    ids: list[str] = Field(min_length=1)
    status: Literal["pending", "entretien", "accepted", "rejected"]
    status_note: Optional[str] = None
```

**Step 2: Run backend tests to verify no regression**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All existing tests pass (81+)

**Step 3: Commit**

```bash
git add backend/models.py
git commit -m "feat: add volunteer application Pydantic models"
```

---

### Task 2: Backend routes + email functions

**Files:**
- Create: `backend/routes/volunteers.py`
- Modify: `backend/email_service.py` (append volunteer email functions)
- Modify: `backend/server.py` (register router, line 14 and ~47)

**Step 1: Create `backend/routes/volunteers.py`**

Follow the exact same pattern as `backend/routes/candidatures.py`. The file should contain:

```python
from fastapi import APIRouter, Request, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from models import VolunteerApplication, VolunteerApplicationRequest, VolunteerStatusUpdate, VolunteerBatchStatusUpdate, User
from routes.auth import get_db, require_admin, get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta
from email_service import send_volunteer_confirmation, send_volunteer_interview, send_volunteer_accepted, send_volunteer_rejected, send_email
from core.config import settings
from utils.rate_limit import anonymize_ip
import csv
import io
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/volunteers", tags=["Volunteers"])

RATE_LIMIT_MAX = 3
RATE_LIMIT_WINDOW_HOURS = 1


@router.post("/apply")
async def submit_volunteer_application(
    data: VolunteerApplicationRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Submit a volunteer membership application (public, anti-spam protected)"""
    client_ip = request.client.host if request.client else "unknown"

    if data.website:
        logger.info(f"Honeypot triggered from {client_ip}")
        return {"message": "Candidature envoyée avec succès"}

    window_start = datetime.utcnow() - timedelta(hours=RATE_LIMIT_WINDOW_HOURS)
    recent_count = await db.volunteer_applications.count_documents({
        "ip_address": client_ip,
        "created_at": {"$gte": window_start}
    })
    if recent_count >= RATE_LIMIT_MAX:
        logger.warning(f"Rate limit exceeded for {client_ip}")
        return {"message": "Trop de soumissions récentes. Réessayez plus tard.", "rate_limited": True}

    application = VolunteerApplication(
        name=data.name,
        email=data.email,
        phone=data.phone,
        city=data.city,
        motivation=data.motivation,
        skills=data.skills,
        experience_level=data.experience_level,
        availability=data.availability,
        values_accepted=data.values_accepted,
        message=data.message,
        ip_address=anonymize_ip(client_ip),
    )
    await db.volunteer_applications.insert_one(application.model_dump())
    logger.info(f"New volunteer application from {data.name}")

    email_body = f"Nom: {data.name}\nEmail: {data.email}\nVille: {data.city}\nDisponibilité: {data.availability}\nCompétences: {', '.join(data.skills)}"
    if data.phone:
        email_body += f"\nTéléphone: {data.phone}"
    if data.message:
        email_body += f"\n\nMessage:\n{data.message}"
    background_tasks.add_task(
        send_email,
        "mouvement.echo.france@gmail.com",
        "Nouvelle candidature bénévole",
        email_body,
    )
    background_tasks.add_task(send_volunteer_confirmation, data.email, data.name)

    return {"message": "Candidature envoyée avec succès"}


@router.get("/admin/all")
async def list_volunteer_applications(
    status: str = "all",
    availability: str = "all",
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List all volunteer applications (admin only)."""
    query = {}
    if status in ("pending", "entretien", "accepted", "rejected"):
        query["status"] = status
    if availability in ("punctual", "regular", "active"):
        query["availability"] = availability

    cursor = db.volunteer_applications.find(query).sort("created_at", -1)
    applications = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        applications.append(doc)
    return applications


@router.delete("/admin/{application_id}")
async def delete_volunteer_application(
    application_id: str,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Delete a volunteer application (admin only)."""
    result = await db.volunteer_applications.delete_one({"id": application_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    logger.info(f"Admin {admin.id} deleted volunteer application {application_id}")
    return {"message": "Candidature supprimée"}


@router.get("/admin/export")
async def export_volunteer_applications(
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Export all volunteer applications as CSV (admin only)."""
    cursor = db.volunteer_applications.find().sort("created_at", -1)
    applications = []
    async for doc in cursor:
        applications.append(doc)

    output = io.StringIO()
    output.write("\ufeff")
    writer = csv.writer(output)
    writer.writerow(["id", "name", "email", "phone", "city", "skills", "experience_level", "availability", "motivation", "message", "status", "status_note", "created_at"])
    for a in applications:
        created = a.get("created_at", "")
        if hasattr(created, "isoformat"):
            created = created.isoformat()
        writer.writerow([
            a.get("id", ""),
            a.get("name", ""),
            a.get("email", ""),
            a.get("phone", ""),
            a.get("city", ""),
            ", ".join(a.get("skills", [])),
            a.get("experience_level", ""),
            a.get("availability", ""),
            ", ".join(a.get("motivation", [])),
            a.get("message", ""),
            a.get("status", "pending"),
            a.get("status_note", ""),
            created,
        ])

    output.seek(0)
    logger.info(f"Admin {admin.id} exported {len(applications)} volunteer records")

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=benevoles-export.csv"},
    )


@router.put("/admin/{application_id}/status")
async def update_volunteer_status(
    application_id: str,
    data: VolunteerStatusUpdate,
    background_tasks: BackgroundTasks,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update a volunteer application status (admin only)."""
    update_fields = {"status": data.status, "updated_at": datetime.utcnow()}
    if data.status_note is not None:
        update_fields["status_note"] = data.status_note
    result = await db.volunteer_applications.update_one(
        {"id": application_id},
        {"$set": update_fields},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    logger.info(f"Admin {admin.id} updated volunteer {application_id} to {data.status}")

    application = await db.volunteer_applications.find_one({"id": application_id})
    if application:
        v_email = application["email"]
        v_name = application["name"]
        if data.status == "entretien":
            background_tasks.add_task(send_volunteer_interview, v_email, v_name, settings.BOOKING_URL)
        elif data.status == "accepted":
            background_tasks.add_task(send_volunteer_accepted, v_email, v_name)
        elif data.status == "rejected":
            background_tasks.add_task(send_volunteer_rejected, v_email, v_name, data.status_note)

    return {"message": f"Statut mis à jour : {data.status}"}


@router.put("/admin/batch-status")
async def batch_update_volunteer_status(
    data: VolunteerBatchStatusUpdate,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Batch update volunteer application statuses (admin only)."""
    update_fields = {"status": data.status, "updated_at": datetime.utcnow()}
    if data.status_note is not None:
        update_fields["status_note"] = data.status_note
    result = await db.volunteer_applications.update_many(
        {"id": {"$in": data.ids}},
        {"$set": update_fields},
    )
    logger.info(f"Admin {admin.id} batch-updated {result.modified_count} volunteers to {data.status}")
    return {"message": f"{result.modified_count} candidature(s) mise(s) à jour", "count": result.modified_count}


@router.get("/me")
async def get_my_volunteer_application(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get volunteer application for the current authenticated user (matched by email)."""
    cursor = db.volunteer_applications.find(
        {"email": current_user.email},
        {"_id": 0, "ip_address": 0},
    ).sort("created_at", -1)
    applications = []
    async for doc in cursor:
        applications.append(doc)
    return applications
```

**Step 2: Add volunteer email functions to `backend/email_service.py`**

Append at end of `email_service.py`, after the `send_candidature_rejected` function:

```python
# --- Volunteer email functions ---

async def send_volunteer_confirmation(email: str, name: str) -> bool:
    """Send confirmation email when a volunteer application is submitted."""
    subject = "Candidature bénévole reçue — Mouvement ECHO"
    html = (
        f"<h2>Bonjour {name},</h2>"
        f"<p>Nous avons bien reçu votre candidature pour rejoindre le Mouvement ECHO "
        f"en tant que membre bénévole et nous vous remercions pour votre engagement.</p>"
        f"<p>Notre équipe prendra le temps d'examiner votre profil avec attention. "
        f"Nous reviendrons vers vous dans les meilleurs délais pour vous tenir "
        f"informé(e) de la suite donnée à votre candidature.</p>"
        f"<p>En attendant, n'hésitez pas à suivre nos actualités sur notre site.</p>"
        f"<p>Bien cordialement,<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, f"Confirmation candidature bénévole pour {name}")


async def send_volunteer_interview(email: str, name: str, booking_url: str) -> bool:
    """Send interview invitation for volunteer application."""
    subject = "Invitation à un entretien — Mouvement ECHO"
    html = (
        f"<h2>Bonjour {name},</h2>"
        f"<p>Bonne nouvelle ! Votre candidature bénévole a retenu toute notre attention "
        f"et nous aimerions échanger avec vous lors d'un court entretien.</p>"
        f"<p>Cet échange nous permettra de mieux comprendre vos motivations "
        f"et de vous présenter le projet plus en détail. "
        f"C'est avant tout une discussion ouverte et bienveillante.</p>"
        f"<p style='text-align:center;margin:24px 0;'>"
        f"<a href='{booking_url}' style='background:#D4AF37;color:#fff;padding:12px 32px;"
        f"text-decoration:none;border-radius:6px;font-weight:bold;'>Réserver mon créneau d'entretien</a></p>"
        f"<p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>"
        f"<p>{booking_url}</p>"
        f"<p>Si aucun créneau ne vous convient, répondez simplement à cet email "
        f"et nous trouverons un moment adapté.</p>"
        f"<p>À très bientôt,<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, f"Invitation entretien bénévole pour {name} — {booking_url}")


async def send_volunteer_accepted(email: str, name: str) -> bool:
    """Send acceptance notification for volunteer application."""
    subject = "Bienvenue dans l'équipe — Mouvement ECHO"
    html = (
        f"<h2>Bonjour {name},</h2>"
        f"<p>Nous avons le plaisir de vous confirmer que votre candidature bénévole "
        f"a été retenue. Bienvenue dans l'aventure ECHO !</p>"
        f"<p>Un membre de notre équipe vous contactera très prochainement "
        f"pour vous présenter les prochaines étapes et faciliter votre intégration.</p>"
        f"<p>Nous sommes ravis de vous compter parmi nous "
        f"et avons hâte de collaborer avec vous.</p>"
        f"<p>Chaleureusement,<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, f"Candidature bénévole acceptée pour {name}")


async def send_volunteer_rejected(email: str, name: str, status_note: str | None) -> bool:
    """Send rejection notification for volunteer application."""
    subject = "Retour sur votre candidature — Mouvement ECHO"
    reason_html = ""
    reason_text = ""
    if status_note:
        reason_html = f"<p><strong>Motif :</strong> {status_note}</p>"
        reason_text = f"\nMotif : {status_note}"
    html = (
        f"<h2>Bonjour {name},</h2>"
        f"<p>Nous tenons à vous remercier pour le temps que vous avez consacré "
        f"à votre candidature auprès du Mouvement ECHO.</p>"
        f"<p>Après un examen attentif de votre profil, nous ne sommes malheureusement "
        f"pas en mesure d'y donner une suite favorable pour le moment.</p>"
        f"{reason_html}"
        f"<p>Cette décision ne remet en aucun cas en question vos compétences. "
        f"Nous vous encourageons à rester attentif(ve) à nos prochains appels "
        f"à candidatures — nos besoins évoluent et votre profil pourrait "
        f"correspondre à de futures opportunités.</p>"
        f"<p>Nous vous souhaitons le meilleur dans vos projets.</p>"
        f"<p>Cordialement,<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, f"Candidature bénévole non retenue pour {name}{reason_text}")
```

**Step 3: Register the router in `backend/server.py`**

Add to import line 14:
```python
from routes import auth, episodes, progress, videos, users, thematics, resources, partners, candidatures, events, analytics, contact, volunteers
```

Add after line 47 (`api_router.include_router(contact.router)`):
```python
api_router.include_router(volunteers.router)
```

**Step 4: Run backend tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests pass

**Step 5: Commit**

```bash
git add backend/routes/volunteers.py backend/email_service.py backend/server.py
git commit -m "feat: add volunteer application routes and email functions"
```

---

### Task 3: Backend tests

**Files:**
- Create: `backend/tests/test_volunteers.py`

**Step 1: Write tests**

```python
import pytest
from httpx import AsyncClient, ASGITransport
from server import app

transport = ASGITransport(app=app)


@pytest.mark.asyncio
async def test_submit_volunteer_application():
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.post("/api/volunteers/apply", json={
            "name": "Test Bénévole",
            "email": "benevole@test.com",
            "city": "Paris",
            "skills": ["Vidéo", "Montage"],
            "experience_level": "student",
            "availability": "regular",
            "values_accepted": True,
            "motivation": ["La cause écologique"],
        })
    assert resp.status_code == 200
    assert "succès" in resp.json()["message"]


@pytest.mark.asyncio
async def test_submit_volunteer_honeypot_reject():
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.post("/api/volunteers/apply", json={
            "name": "Bot",
            "email": "bot@test.com",
            "city": "Nowhere",
            "skills": ["Dev"],
            "experience_level": "motivated",
            "availability": "punctual",
            "values_accepted": True,
            "website": "http://spam.com",
        })
    assert resp.status_code == 200
    assert "succès" in resp.json()["message"]


@pytest.mark.asyncio
async def test_submit_volunteer_values_required():
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.post("/api/volunteers/apply", json={
            "name": "Test",
            "email": "test@test.com",
            "city": "Lyon",
            "skills": ["Dev"],
            "experience_level": "professional",
            "availability": "active",
            "values_accepted": False,
        })
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_submit_volunteer_skills_required():
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.post("/api/volunteers/apply", json={
            "name": "Test",
            "email": "test@test.com",
            "city": "Lyon",
            "skills": [],
            "experience_level": "professional",
            "availability": "active",
            "values_accepted": True,
        })
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_admin_list_volunteers_unauthorized():
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/volunteers/admin/all")
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_admin_export_volunteers_unauthorized():
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/volunteers/admin/export")
    assert resp.status_code in (401, 403)
```

**Step 2: Run tests**

Run: `cd backend && python -m pytest tests/test_volunteers.py -p no:recording -v`
Expected: 6 tests pass

**Step 3: Run all backend tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests pass (87+)

**Step 4: Commit**

```bash
git add backend/tests/test_volunteers.py
git commit -m "test: add volunteer application endpoint tests"
```

---

### Task 4: Frontend form component

**Files:**
- Create: `frontend/src/components/forms/VolunteerApplicationForm.tsx`

**Step 1: Create the 4-step volunteer form**

Build `VolunteerApplicationForm.tsx` following the exact pattern of `ScenaristApplicationForm.tsx`:
- Uses `useState` for step (1-4), form state, loading, error, submitted
- Uses `StepProgress` component with 4 steps: Identité, Compétences, Engagement, Validation
- Uses `Button`, `Input` from `../ui/`
- Posts to `${API_URL}/volunteers/apply`
- Honeypot field hidden with `website`
- RGPD consent checkbox on step 4

**Skill categories (step 2)** — organized in 5 collapsible groups with checkboxes:
```typescript
const SKILL_CATEGORIES = {
    'Création audiovisuelle': ['Vidéo', 'Montage', 'Réalisation', 'Production', "Jeu d'acteur", 'Voix off', 'Mise en scène', 'Sound design'],
    'Création artistique': ['Marketing', 'Graphisme', 'Illustration', 'Fresque', 'Animation', 'Écriture', 'Narration', 'Scénarisation', 'Poésie', 'Musique', 'Analyse des paroles'],
    'Tech & développement': ['Dev Web & App', 'Automatisation', 'Agents IA', 'Architecture & BDD'],
    'Organisation & communication': ['Gestion de projet', 'Réseaux sociaux', 'Recherche', 'Documentation', 'Événementiel', 'Escape game', 'Jeux vidéo'],
    'Administration': ['Relations partenaires & presse', 'Comptabilité', 'Finance', 'Levée de fonds', 'Juridique', 'Logistique'],
};
```

**Experience levels (step 2):**
```typescript
const EXPERIENCE_LEVELS = [
    { value: 'professional', label: "C'est mon métier" },
    { value: 'student', label: "Je suis étudiant(e)" },
    { value: 'self_taught', label: "Autodidacte" },
    { value: 'motivated', label: "Motivé(e), j'apprends vite" },
];
```

**Motivations (step 3):**
```typescript
const MOTIVATION_TAGS = [
    'La cause écologique', 'Le projet artistique', "L'innovation technologique",
    "L'aventure collective", 'Le développement personnel',
];
```

**Availability (step 3):**
```typescript
const AVAILABILITY_OPTIONS = [
    { value: 'punctual', label: 'Soutien ponctuel', desc: 'Je participe selon mes disponibilités' },
    { value: 'regular', label: 'Engagement régulier', desc: 'Je consacre du temps chaque semaine' },
    { value: 'active', label: 'Membre moteur', desc: 'Je souhaite représenter ECHO et être force de proposition' },
];
```

**Values displayed (step 3) before the checkbox:**
```typescript
const ECHO_VALUES = [
    { name: 'Coopération', desc: 'Travailler en intelligence collective' },
    { name: 'Respect', desc: "Valoriser la diversité, l'inclusion et le respect mutuel" },
    { name: 'Responsabilité', desc: 'Agir de manière responsable et avec autonomie' },
    { name: 'Intégrité', desc: 'Agir avec honnêteté, équité et transparence' },
    { name: 'Innovation', desc: 'Encourager la créativité et la résolution de problèmes' },
];
```

**Step 2: Run lint**

Run: `cd frontend && npx eslint src/components/forms/VolunteerApplicationForm.tsx`
Expected: No errors

**Step 3: Run frontend build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add frontend/src/components/forms/VolunteerApplicationForm.tsx
git commit -m "feat: add volunteer application 4-step form component"
```

---

### Task 5: Wire form into Mouvement page

**Files:**
- Modify: `frontend/src/pages/Mouvement.tsx` (lines 193-196)

**Step 1: Add modal state and import**

At top of `Mouvement.tsx`, add imports:
```typescript
import { useState } from 'react';
import { VolunteerApplicationForm } from '../components/forms/VolunteerApplicationForm';
```

Inside the `Mouvement` component, add state:
```typescript
const [showVolunteerForm, setShowVolunteerForm] = useState(false);
```

**Step 2: Replace the "Rejoindre le Mouvement" Link+Button**

Replace lines 193-196 (the `<Link to="/register">` wrapping the button) with:
```tsx
<Button
    variant="primary"
    size="lg"
    className="rounded-full px-8 bg-amber-600 hover:bg-amber-700 text-white border-none shadow-lg shadow-amber-900/20"
    onClick={() => setShowVolunteerForm(true)}
>
    Rejoindre le Mouvement
</Button>
```

**Step 3: Add the modal before the closing `</div>`**

Before the final `</div>` of the component (line 208), add:
```tsx
{showVolunteerForm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
         onClick={(e) => e.target === e.currentTarget && setShowVolunteerForm(false)}>
        <div className="relative bg-stone-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <button
                onClick={() => setShowVolunteerForm(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-white text-xl"
            >
                ✕
            </button>
            <VolunteerApplicationForm />
        </div>
    </div>
)}
```

**Step 4: Run lint + build**

Run: `cd frontend && npx eslint . && npm run build`
Expected: No errors

**Step 5: Commit**

```bash
git add frontend/src/pages/Mouvement.tsx
git commit -m "feat: wire volunteer form modal into Mouvement page"
```

---

### Task 6: Admin page + dashboard link

**Files:**
- Create: `frontend/src/pages/AdminVolunteers.tsx`
- Modify: `frontend/src/App.tsx` (add route)
- Modify: `frontend/src/pages/AdminDashboard.tsx` (add card link)

**Step 1: Create `AdminVolunteers.tsx`**

Follow the exact pattern of the existing `AdminCandidatures.tsx` page. Display:
- Filter bar: status (all/pending/entretien/accepted/rejected), availability (all/punctual/regular/active)
- Table: Nom, Email, Ville, Compétences (first 3 + count), Disponibilité (badge), Statut (colored badge), Date
- Detail modal on row click (all fields)
- Status change dropdown in modal
- Batch selection with checkboxes + batch status update
- Delete button
- Export CSV button
- Fetch from `${API_URL}/volunteers/admin/all?status=X&availability=Y`

**Step 2: Add lazy route in `App.tsx`**

Add lazy import:
```typescript
const AdminVolunteers = lazy(() => import('./pages/AdminVolunteers'));
```

Add route inside admin routes:
```tsx
<Route path="/admin/benevoles" element={<ProtectedRoute adminOnly><AdminVolunteers /></ProtectedRoute>} />
```

**Step 3: Add link in `AdminDashboard.tsx`**

Add a card for "Candidatures bénévoles" linking to `/admin/benevoles` with a `Users` icon from lucide-react.

**Step 4: Run lint + build**

Run: `cd frontend && npx eslint . && npm run build`
Expected: No errors

**Step 5: Commit**

```bash
git add frontend/src/pages/AdminVolunteers.tsx frontend/src/App.tsx frontend/src/pages/AdminDashboard.tsx
git commit -m "feat: add admin volunteers page with filters and CSV export"
```

---

### Task 7: Profile page — volunteer candidature display

**Files:**
- Modify: `frontend/src/pages/Profile.tsx`

**Step 1: Add volunteer candidature fetch and display**

In `Profile.tsx`, alongside the existing tech candidatures fetch (`/api/candidatures/me`), add a fetch to `/api/volunteers/me`. Display volunteer candidatures in the "Mes candidatures" section with:
- Green badge (`#10B981`) with `Heart` icon from lucide-react
- Label: "Bénévole"
- Status badge (same colors as tech candidatures)
- Booking button if status is "entretien"

**Step 2: Run lint + build**

Run: `cd frontend && npx eslint . && npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add frontend/src/pages/Profile.tsx
git commit -m "feat: display volunteer candidature in user profile"
```

---

### Task 8: Full quality check

**Step 1: Run all backend tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests pass (87+)

**Step 2: Run frontend lint**

Run: `cd frontend && npx eslint .`
Expected: No errors

**Step 3: Run frontend tests**

Run: `cd frontend && npx vitest run`
Expected: All tests pass

**Step 4: Run frontend build**

Run: `cd frontend && npm run build`
Expected: Build succeeds
