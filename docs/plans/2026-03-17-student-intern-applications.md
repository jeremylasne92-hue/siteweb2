# Candidatures Étudiants & Stagiaires — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Créer un système complet de candidatures pour étudiants/stagiaires souhaitant participer à la production de la série ECHO, avec formulaire dédié, backend CRUD, admin monitoring, emails automatiques et export CSV.

**Architecture:** Pattern identique aux systèmes `tech_candidatures` et `volunteer_applications` existants. Collection MongoDB `student_applications`, routes CRUD admin, formulaire multi-étapes React, emails de notification, intégration dashboard admin. Le formulaire est spécifique à la production (ville, école, compétences production) et le bouton "Nous contacter" actuel sur la page Série est remplacé par un bouton ouvrant ce formulaire en modale.

**Tech Stack:** FastAPI + Motor (backend), React 19 + TypeScript + Tailwind CSS 4 (frontend), MongoDB (storage), SendGrid (emails)

---

## Leçons tirées des implémentations précédentes

| Leçon | Source | Application |
|-------|--------|-------------|
| Utiliser `_id` natif MongoDB pour les lookups admin | Bug contact.py (Audit #3) | Utiliser `id: str (uuid4)` comme les autres systèmes |
| Sanitiser les exports CSV | Audit #4 fix 3.2 | Inclure `_sanitize_csv_cell()` dès le départ |
| `html.escape()` dans les emails | Audit #3 fix #2 | Appliquer sur tous les champs utilisateur |
| Rate limit namespace distinct | Pattern existant | Namespace `"student_application"` |
| Honeypot silencieux | Pattern existant | Champ `website` qui retourne succès si rempli |
| `hmac.compare_digest` pour comparaisons | Audit #4 fix 1.2 | Non applicable ici mais bonne pratique |
| Normaliser email/phone dès l'insertion | Pattern volunteers.py | `normalize_email()`, `normalize_phone()` |
| Géocoder la ville | Pattern volunteers.py | `geocode_city()` pour cartographie future |
| `expireAfterSeconds` pour RGPD | Pattern server.py | TTL index sur `created_at` (3 ans) |

---

## Task 1: Modèles Pydantic

**Files:**
- Modify: `backend/models.py`

**Step 1: Ajouter les modèles au fichier models.py**

Ajouter à la fin du fichier, après les modèles VolunteerApplication :

```python
# ── Student/Intern Applications ──────────────────────────────────────

class StudentApplicationRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    city: str = Field(..., min_length=2, max_length=100)
    school: str = Field(..., min_length=2, max_length=200)
    study_field: str = Field(..., min_length=2, max_length=200)
    skills: list[str] = Field(..., min_length=1)
    availability: Literal["stage_court", "stage_long", "alternance", "temps_partiel"]
    start_date: Optional[str] = None
    message: Optional[str] = Field(None, max_length=2000)
    website: Optional[str] = None  # honeypot

    @field_validator("portfolio_url", mode="before", check_fields=False)
    @classmethod
    def validate_portfolio(cls, v: str | None) -> str | None:
        if v and not v.startswith(("http://", "https://")):
            raise ValueError("L'URL doit commencer par http:// ou https://")
        return v


class StudentApplication(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    city: str
    school: str
    study_field: str
    skills: list[str] = []
    availability: Literal["stage_court", "stage_long", "alternance", "temps_partiel"]
    start_date: Optional[str] = None
    message: Optional[str] = None
    status: Literal["pending", "entretien", "accepted", "rejected"] = "pending"
    status_note: Optional[str] = None
    admin_notes: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    ip_address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None


class StudentStatusUpdate(BaseModel):
    status: Literal["pending", "entretien", "accepted", "rejected"]
    status_note: Optional[str] = None


class StudentBatchStatusUpdate(BaseModel):
    ids: list[str]
    status: Literal["pending", "entretien", "accepted", "rejected"]
    status_note: Optional[str] = None


class StudentEditUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    school: Optional[str] = None
    study_field: Optional[str] = None
    skills: Optional[list[str]] = None
    availability: Optional[Literal["stage_court", "stage_long", "alternance", "temps_partiel"]] = None
    start_date: Optional[str] = None
    message: Optional[str] = None
    admin_notes: Optional[str] = None
```

**Step 2: Vérifier que les tests existants passent toujours**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: 183/183 PASS (ajout de modèles seulement, pas de changement de logique)

**Step 3: Commit**

```bash
git add backend/models.py
git commit -m "feat: add StudentApplication Pydantic models"
```

---

## Task 2: Emails étudiants

**Files:**
- Modify: `backend/email_service.py`

**Step 1: Ajouter 4 fonctions email pour étudiants**

Ajouter après les fonctions `send_volunteer_*`, en suivant exactement le même pattern HTML avec `html.escape()` :

```python
# ── Student/Intern Application Emails ────────────────────────────────

def send_student_confirmation(to_email: str, name: str) -> None:
    """Confirmation email sent to student applicant."""
    import html as html_mod
    safe_name = html_mod.escape(name)
    send_email(
        to_email,
        "Candidature stage reçue — Mouvement ECHO",
        f"""<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#D4AF37;">Bonjour {safe_name},</h2>
            <p>Nous avons bien reçu votre candidature pour participer à la production de la série ECHO.</p>
            <p>Notre équipe examinera votre profil et reviendra vers vous dans les meilleurs délais.</p>
            <p style="margin-top:30px;">Cordialement,<br><strong>L'équipe Mouvement ECHO</strong></p>
        </div>""",
    )


def send_student_interview(to_email: str, name: str, booking_url: str) -> None:
    """Interview invitation for student applicant."""
    import html as html_mod
    safe_name = html_mod.escape(name)
    send_email(
        to_email,
        "Invitation à un entretien — Mouvement ECHO",
        f"""<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#D4AF37;">Bonjour {safe_name},</h2>
            <p>Votre candidature pour la production de la série ECHO a retenu notre attention !</p>
            <p>Nous aimerions échanger avec vous lors d'un court entretien.</p>
            <p style="margin:20px 0;"><a href="{booking_url}" style="background:#D4AF37;color:#000;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Réserver un créneau</a></p>
            <p style="margin-top:30px;">Cordialement,<br><strong>L'équipe Mouvement ECHO</strong></p>
        </div>""",
    )


def send_student_accepted(to_email: str, name: str) -> None:
    """Acceptance email for student applicant."""
    import html as html_mod
    safe_name = html_mod.escape(name)
    send_email(
        to_email,
        "Bienvenue dans l'équipe — Mouvement ECHO",
        f"""<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#D4AF37;">Félicitations {safe_name} !</h2>
            <p>Nous avons le plaisir de vous informer que votre candidature pour la production de la série ECHO a été acceptée.</p>
            <p>Nous vous contacterons très prochainement pour les prochaines étapes.</p>
            <p style="margin-top:30px;">Cordialement,<br><strong>L'équipe Mouvement ECHO</strong></p>
        </div>""",
    )


def send_student_rejected(to_email: str, name: str, status_note: str = "") -> None:
    """Rejection email for student applicant."""
    import html as html_mod
    safe_name = html_mod.escape(name)
    safe_note = html_mod.escape(status_note) if status_note else ""
    note_block = f"<p><strong>Motif :</strong> {safe_note}</p>" if safe_note else ""
    send_email(
        to_email,
        "Retour sur votre candidature — Mouvement ECHO",
        f"""<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#D4AF37;">Bonjour {safe_name},</h2>
            <p>Nous avons examiné votre candidature avec attention. Malheureusement, nous ne sommes pas en mesure de vous intégrer à l'équipe de production pour le moment.</p>
            {note_block}
            <p>Nous vous encourageons à suivre le projet ECHO et à repostuler ultérieurement si l'opportunité se présente.</p>
            <p style="margin-top:30px;">Cordialement,<br><strong>L'équipe Mouvement ECHO</strong></p>
        </div>""",
    )
```

**Step 2: Vérifier**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: PASS

**Step 3: Commit**

```bash
git add backend/email_service.py
git commit -m "feat: add student application email functions"
```

---

## Task 3: Route backend — soumission + CRUD admin

**Files:**
- Create: `backend/routes/students.py`
- Modify: `backend/server.py` (register router)

**Step 1: Créer le fichier routes/students.py**

Suivre le pattern exact de `volunteers.py` avec les adaptations étudiants :

```python
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks, Depends, status
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import PyMongoError
import logging
import csv
import io

from models import (
    StudentApplicationRequest, StudentApplication,
    StudentStatusUpdate, StudentBatchStatusUpdate, StudentEditUpdate, User,
)
from email_service import (
    send_email, send_student_confirmation, send_student_interview,
    send_student_accepted, send_student_rejected,
)
from utils.rate_limit import anonymize_ip, check_rate_limit
from utils.normalize import normalize_email, normalize_phone, normalize_skills
from utils.geocoding import geocode_city
from routes.auth import get_db, require_admin, get_current_user
from core.config import settings

router = APIRouter(tags=["students"])
logger = logging.getLogger(__name__)

ALERT_EMAIL = "stages@mouvementecho.fr"

AVAILABILITY_LABELS = {
    "stage_court": "Stage court (< 3 mois)",
    "stage_long": "Stage long (3-6 mois)",
    "alternance": "Alternance",
    "temps_partiel": "Temps partiel",
}


def _sanitize_csv_cell(value) -> str:
    """Escape CSV injection characters for Excel safety."""
    s = str(value) if value is not None else ""
    if s and s[0] in ("=", "+", "-", "@", "\t", "\r"):
        return "'" + s
    return s


# ── PUBLIC ───────────────────────────────────────────────────────────

@router.post("/students/apply")
async def apply_student(
    data: StudentApplicationRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Submit a student/intern application for series production."""
    # Honeypot — silent accept
    if data.website:
        return {"message": "Candidature envoyée avec succès"}

    await check_rate_limit(db, request, "student_application", max_requests=3, window_minutes=60)

    email = normalize_email(data.email)
    phone = normalize_phone(data.phone) if data.phone else None
    skills = normalize_skills(data.skills)
    geo = await geocode_city(data.city)

    doc = StudentApplication(
        name=data.name.strip(),
        email=email,
        phone=phone,
        city=data.city.strip(),
        school=data.school.strip(),
        study_field=data.study_field.strip(),
        skills=skills,
        availability=data.availability,
        start_date=data.start_date,
        message=data.message,
        latitude=geo.get("lat") if geo else None,
        longitude=geo.get("lon") if geo else None,
        ip_address=anonymize_ip(request.client.host if request.client else "unknown"),
    )

    try:
        await db.student_applications.insert_one(doc.model_dump())
    except PyMongoError as e:
        logger.error(f"Failed to save student application: {e}")
        raise HTTPException(status_code=503, detail="Impossible d'envoyer votre candidature.")

    # Emails
    background_tasks.add_task(send_student_confirmation, email, data.name.strip())
    background_tasks.add_task(
        send_email,
        ALERT_EMAIL,
        f"Nouvelle candidature stage — {data.city.strip()}",
        f"Nom : {data.name}\nEmail : {email}\nÉcole : {data.school}\n"
        f"Formation : {data.study_field}\nVille : {data.city}\n"
        f"Disponibilité : {AVAILABILITY_LABELS.get(data.availability, data.availability)}\n\n"
        f"Message :\n{data.message or '(aucun)'}",
    )

    return {"message": "Candidature envoyée avec succès"}


@router.get("/students/me")
async def get_my_student_applications(
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get current user's student applications."""
    cursor = db.student_applications.find(
        {"email": user.email}, {"_id": 0}
    ).sort("created_at", -1)
    return await cursor.to_list(length=50)


# ── ADMIN ────────────────────────────────────────────────────────────

@router.get("/students/admin/all")
async def get_all_student_applications(
    status: str | None = None,
    city: str | None = None,
    availability: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """List all student applications (admin)."""
    query: dict = {}
    if status:
        query["status"] = status
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if availability:
        query["availability"] = availability
    cursor = db.student_applications.find(query, {"_id": 0}).sort("created_at", -1)
    return await cursor.to_list(length=500)


@router.delete("/students/admin/{application_id}")
async def delete_student_application(
    application_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Delete a student application (admin)."""
    result = await db.student_applications.delete_one({"id": application_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    return {"success": True}


@router.put("/students/admin/{application_id}/edit")
async def edit_student_application(
    application_id: str,
    data: StudentEditUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Edit a student application (admin)."""
    update_fields = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Re-geocode if city changed
    if "city" in update_fields:
        geo = await geocode_city(update_fields["city"])
        if geo:
            update_fields["latitude"] = geo.get("lat")
            update_fields["longitude"] = geo.get("lon")

    update_fields["updated_at"] = datetime.utcnow()
    result = await db.student_applications.update_one(
        {"id": application_id}, {"$set": update_fields}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    return {"success": True}


@router.put("/students/admin/{application_id}/status")
async def update_student_status(
    application_id: str,
    data: StudentStatusUpdate,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update student application status with automatic emails."""
    app = await db.student_applications.find_one({"id": application_id})
    if not app:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")

    update: dict = {"status": data.status, "updated_at": datetime.utcnow()}
    if data.status_note is not None:
        update["status_note"] = data.status_note

    await db.student_applications.update_one({"id": application_id}, {"$set": update})

    # Automatic emails based on status change
    if data.status == "entretien":
        booking_url = getattr(settings, "BOOKING_URL", "https://mouvementecho.fr/contact")
        background_tasks.add_task(send_student_interview, app["email"], app["name"], booking_url)
    elif data.status == "accepted":
        background_tasks.add_task(send_student_accepted, app["email"], app["name"])
    elif data.status == "rejected":
        background_tasks.add_task(
            send_student_rejected, app["email"], app["name"], data.status_note or ""
        )

    return {"success": True}


@router.put("/students/admin/batch-status")
async def batch_update_student_status(
    data: StudentBatchStatusUpdate,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Batch update student application statuses."""
    apps = await db.student_applications.find({"id": {"$in": data.ids}}).to_list(length=500)
    if not apps:
        raise HTTPException(status_code=404, detail="Aucune candidature trouvée")

    update: dict = {"status": data.status, "updated_at": datetime.utcnow()}
    if data.status_note is not None:
        update["status_note"] = data.status_note

    await db.student_applications.update_many({"id": {"$in": data.ids}}, {"$set": update})

    # Emails for each updated application
    for app in apps:
        if data.status == "entretien":
            booking_url = getattr(settings, "BOOKING_URL", "https://mouvementecho.fr/contact")
            background_tasks.add_task(send_student_interview, app["email"], app["name"], booking_url)
        elif data.status == "accepted":
            background_tasks.add_task(send_student_accepted, app["email"], app["name"])
        elif data.status == "rejected":
            background_tasks.add_task(
                send_student_rejected, app["email"], app["name"], data.status_note or ""
            )

    return {"success": True, "updated": len(apps)}


@router.get("/students/admin/export")
async def export_student_applications(
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Export student applications as CSV."""
    from starlette.responses import StreamingResponse

    cursor = db.student_applications.find({}, {"_id": 0}).sort("created_at", -1)
    apps = await cursor.to_list(length=5000)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Nom", "Email", "Téléphone", "Ville", "École",
        "Formation", "Compétences", "Disponibilité", "Date début souhaitée",
        "Statut", "Message", "Notes admin", "Date candidature",
    ])

    for a in apps:
        created = a.get("created_at", "")
        if hasattr(created, "strftime"):
            created = created.strftime("%Y-%m-%d %H:%M")
        writer.writerow([
            _sanitize_csv_cell(a.get("id", "")),
            _sanitize_csv_cell(a.get("name", "")),
            _sanitize_csv_cell(a.get("email", "")),
            _sanitize_csv_cell(a.get("phone", "")),
            _sanitize_csv_cell(a.get("city", "")),
            _sanitize_csv_cell(a.get("school", "")),
            _sanitize_csv_cell(a.get("study_field", "")),
            _sanitize_csv_cell(", ".join(a.get("skills", []))),
            _sanitize_csv_cell(AVAILABILITY_LABELS.get(a.get("availability", ""), a.get("availability", ""))),
            _sanitize_csv_cell(a.get("start_date", "")),
            _sanitize_csv_cell(a.get("status", "")),
            _sanitize_csv_cell(a.get("message", "")),
            _sanitize_csv_cell(a.get("admin_notes", "")),
            created,
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=student_applications.csv"},
    )
```

**Step 2: Enregistrer le router dans server.py**

Dans `backend/server.py`, ajouter l'import et l'inclusion :

```python
# Import (ligne 18, ajouter students)
from routes import auth, episodes, progress, videos, users, thematics, resources, partners, candidatures, events, analytics, contact, volunteers, members, mediatheque, students

# Inclusion (après volunteers.router, vers ligne 149)
api_router.include_router(students.router)
```

**Step 3: Ajouter les index MongoDB dans le lifespan**

Dans `backend/server.py`, dans le bloc `lifespan`, ajouter après les index volunteer :

```python
# Student applications indexes
await db.student_applications.create_index("email")
await db.student_applications.create_index("status")
await db.student_applications.create_index([(\"ip_address\", 1), (\"created_at\", 1)])
await db.student_applications.create_index("created_at", expireAfterSeconds=94608000)  # 3 years RGPD
```

**Step 4: Vérifier**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/routes/students.py backend/server.py
git commit -m "feat: add student application backend routes + CRUD admin"
```

---

## Task 4: Formulaire frontend — StudentApplicationForm

**Files:**
- Create: `frontend/src/components/forms/StudentApplicationForm.tsx`

**Step 1: Créer le composant**

Pattern identique à `VolunteerApplicationForm.tsx` avec 4 steps adaptés :
- Step 1 "Identité" : name, email, phone, city (CityAutocomplete)
- Step 2 "Formation" : school, study_field, skills (checkboxes groupées)
- Step 3 "Disponibilité" : availability (radio), start_date, message
- Step 4 "Validation" : récapitulatif, RGPD, honeypot

**Compétences production proposées :**
```typescript
const SKILL_GROUPS = {
    "Image": ["Caméra / Cadrage", "Éclairage", "Photographie", "Drone"],
    "Son": ["Prise de son", "Mixage", "Sound design"],
    "Post-production": ["Montage vidéo", "Étalonnage", "Motion design", "VFX"],
    "Régie & Logistique": ["Régie", "Direction de production", "Assistanat réalisation", "Décors & accessoires"],
    "Communication": ["Réseaux sociaux", "Graphisme", "Rédaction", "Community management"],
};
```

**Disponibilités :**
```typescript
const AVAILABILITY_OPTIONS = [
    { value: "stage_court", label: "Stage court (< 3 mois)" },
    { value: "stage_long", label: "Stage long (3-6 mois)" },
    { value: "alternance", label: "Alternance" },
    { value: "temps_partiel", label: "Temps partiel" },
];
```

**API call :** `POST ${API_URL}/students/apply`

Le composant complet suit le même pattern que VolunteerApplicationForm :
- 4 étapes avec StepProgress
- Validation par étape dans handleNext
- isValidEmail, isValidPhone, sanitizePhone
- CityAutocomplete pour la ville
- Honeypot website
- RGPD checkbox
- ApplicationSuccessCTA post-soumission
- Gestion loading/error/submitted

**Step 2: Vérifier**

Run: `cd frontend && npx eslint src/components/forms/StudentApplicationForm.tsx`
Run: `cd frontend && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/src/components/forms/StudentApplicationForm.tsx
git commit -m "feat: add StudentApplicationForm component (4-step)"
```

---

## Task 5: Intégration page Série — remplacer "Nous contacter" par modale

**Files:**
- Modify: `frontend/src/pages/Serie.tsx`

**Step 1: Ajouter import et state**

```typescript
import { StudentApplicationForm } from '../components/forms/StudentApplicationForm';

// Dans le composant Serie(), ajouter :
const [showStudentForm, setShowStudentForm] = useState(false);
```

**Step 2: Remplacer le bouton "Nous contacter" dans la carte Production**

Remplacer :
```tsx
<Link to="/contact">
    <Button variant="outline" ...>Nous contacter</Button>
</Link>
```

Par :
```tsx
<Button
    className="bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#FFD700] hover:shadow-[0_0_24px_rgba(212,175,55,0.6)] px-6 py-3 text-sm font-bold tracking-widest uppercase rounded-lg transition-all w-full sm:w-auto"
    onClick={() => { trackEvent('cta_click', 'serie_candidature_stage'); setShowStudentForm(true); }}
>
    Postuler
</Button>
```

**Step 3: Ajouter la modale (avant la fermeture de `</div>` principal)**

Après la modale scénariste existante :
```tsx
{/* MODALE CANDIDATURE ÉTUDIANT/STAGIAIRE */}
{showStudentForm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowStudentForm(false)}>
        <div
            className="bg-[#121212] border border-[#D4AF37]/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif text-white">Candidature Stage Production</h2>
                <button onClick={() => setShowStudentForm(false)} className="p-1 text-[#D1D5DB] hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>
            <StudentApplicationForm />
        </div>
    </div>
)}
```

**Step 4: Supprimer l'import Link si plus utilisé ailleurs dans le fichier**

Vérifier si `Link` est encore utilisé. Si non, retirer de l'import.

**Step 5: Vérifier**

Run: `cd frontend && npx eslint src/pages/Serie.tsx`
Run: `cd frontend && npm run build`
Expected: PASS

**Step 6: Commit**

```bash
git add frontend/src/pages/Serie.tsx
git commit -m "feat: integrate StudentApplicationForm modal in Serie page"
```

---

## Task 6: Admin Dashboard — compteur + page admin

**Files:**
- Modify: `backend/routes/admin_dashboard.py` (ajouter compteur)
- Create: `frontend/src/pages/AdminStudents.tsx` (page admin)
- Modify: `frontend/src/App.tsx` (ajouter route)
- Modify: layout admin sidebar (ajouter lien)

**Step 1: Ajouter le compteur dans admin_dashboard.py**

Dans la route `GET /admin/pending`, ajouter :
```python
students = await db.student_applications.count_documents({"status": "pending"}),
```
Et l'inclure dans le retour.

**Step 2: Créer AdminStudents.tsx**

Copier le pattern de `AdminVolunteers.tsx` en adaptant :
- Colonnes : Nom, Email, Ville, École, Formation, Disponibilité, Statut, Date
- Filtres : status, city, availability
- Détail expandable avec édition inline
- Export CSV, sélection multiple, batch status
- Routes API : `/students/admin/*`

**Step 3: Ajouter la route dans App.tsx**

```tsx
<Route path="/admin/students" element={<AdminStudents />} />
```

**Step 4: Ajouter le lien dans la sidebar admin**

Trouver le composant de navigation admin et ajouter "Stages" ou "Étudiants" dans la liste.

**Step 5: Vérifier**

Run: `cd frontend && npx eslint .`
Run: `cd frontend && npm run build`
Expected: PASS

**Step 6: Commit**

```bash
git add backend/routes/admin_dashboard.py frontend/src/pages/AdminStudents.tsx frontend/src/App.tsx [sidebar file]
git commit -m "feat: add admin page for student applications + dashboard counter"
```

---

## Task 7: Tests backend

**Files:**
- Create: `backend/tests/routes/test_students.py`

**Step 1: Écrire les tests**

Tester :
- `POST /students/apply` — soumission valide (201)
- `POST /students/apply` — honeypot rempli (retourne 200 sans insertion)
- `POST /students/apply` — validation champs requis (422)
- `GET /students/admin/all` — nécessite admin (401/403)
- `PUT /students/admin/{id}/status` — changement statut
- `DELETE /students/admin/{id}` — suppression
- `GET /students/admin/export` — CSV valide

Pattern de mocking identique aux tests existants (`test_volunteers.py`, `test_candidatures.py`).

**Step 2: Lancer**

Run: `cd backend && python -m pytest tests/routes/test_students.py -p no:recording -v`
Expected: tous PASS

**Step 3: Lancer la suite complète**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: tous PASS (ancien + nouveau)

**Step 4: Commit**

```bash
git add backend/tests/routes/test_students.py
git commit -m "test: add student application route tests"
```

---

## Task 8: Tests frontend

**Files:**
- Create: `frontend/src/components/forms/__tests__/StudentApplicationForm.test.tsx`

**Step 1: Écrire les tests**

Tester :
- Rendu initial (step 1 visible)
- Navigation entre steps
- Validation champs requis (name, email, city, school, study_field)
- Soumission et affichage succès
- Honeypot (champ caché)

Pattern identique aux tests existants des formulaires.

**Step 2: Lancer**

Run: `cd frontend && npx vitest run src/components/forms/__tests__/StudentApplicationForm.test.tsx`
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/src/components/forms/__tests__/StudentApplicationForm.test.tsx
git commit -m "test: add StudentApplicationForm component tests"
```

---

## Résumé des fichiers

| Action | Fichier |
|--------|---------|
| Modify | `backend/models.py` |
| Modify | `backend/email_service.py` |
| Create | `backend/routes/students.py` |
| Modify | `backend/server.py` |
| Create | `frontend/src/components/forms/StudentApplicationForm.tsx` |
| Modify | `frontend/src/pages/Serie.tsx` |
| Modify | `backend/routes/admin_dashboard.py` |
| Create | `frontend/src/pages/AdminStudents.tsx` |
| Modify | `frontend/src/App.tsx` |
| Modify | Layout admin sidebar |
| Create | `backend/tests/routes/test_students.py` |
| Create | `frontend/src/components/forms/__tests__/StudentApplicationForm.test.tsx` |

## Vérification finale

```bash
cd frontend && npx eslint .           # 0 errors
cd frontend && npx vitest run         # all pass
cd backend && python -m pytest -p no:recording -q  # all pass
cd frontend && npm run build          # success
```
