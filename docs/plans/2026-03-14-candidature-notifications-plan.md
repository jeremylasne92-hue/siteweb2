# Candidature Notifications & Mon Compte Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Send email notifications on candidature status changes and enhance the Profile page with booking link for interview convocations.

**Architecture:** Add 4 email functions to `email_service.py`, wire them into existing candidature routes via `BackgroundTasks`, add `BOOKING_URL` to backend config, update `Profile.tsx` to handle Scénariste project and show booking button on "entretien" status.

**Tech Stack:** FastAPI + BackgroundTasks, SendGrid (email_service.py), React + TypeScript (Profile.tsx)

---

### Task 1: Add BOOKING_URL to backend config

**Files:**
- Modify: `backend/core/config.py:35-42`

**Step 1: Add BOOKING_URL setting**

In `backend/core/config.py`, add after line 41 (UNSUBSCRIBE_SECRET):

```python
    # Booking
    BOOKING_URL: str = os.environ.get("BOOKING_URL", "https://calendar.app.google/GSpXrQq72uqWhhSx9")
```

**Step 2: Verify backend starts**

Run: `cd backend && python -c "from core.config import settings; print(settings.BOOKING_URL)"`
Expected: `https://calendar.app.google/GSpXrQq72uqWhhSx9`

**Step 3: Commit**

```bash
git add backend/core/config.py
git commit -m "feat: add BOOKING_URL to backend settings"
```

---

### Task 2: Add candidature email functions

**Files:**
- Modify: `backend/email_service.py`
- Test: `backend/tests/test_email_candidature.py`

**Step 1: Write failing tests**

Create `backend/tests/test_email_candidature.py`:

```python
import pytest
from unittest.mock import patch, AsyncMock

@pytest.mark.asyncio
async def test_send_candidature_confirmation():
    with patch("email_service._log_email", new_callable=AsyncMock, return_value=True) as mock_log:
        from email_service import send_candidature_confirmation
        result = await send_candidature_confirmation("test@test.com", "Alice", "scenariste")
        assert result is True
        mock_log.assert_called_once()
        call_args = mock_log.call_args
        assert "test@test.com" in call_args[0]
        assert "Alice" in call_args[0][2]

@pytest.mark.asyncio
async def test_send_candidature_interview():
    with patch("email_service._log_email", new_callable=AsyncMock, return_value=True) as mock_log:
        from email_service import send_candidature_interview
        result = await send_candidature_interview("test@test.com", "Alice", "https://cal.example.com")
        assert result is True
        mock_log.assert_called_once()
        assert "https://cal.example.com" in mock_log.call_args[0][2]

@pytest.mark.asyncio
async def test_send_candidature_accepted():
    with patch("email_service._log_email", new_callable=AsyncMock, return_value=True) as mock_log:
        from email_service import send_candidature_accepted
        result = await send_candidature_accepted("test@test.com", "Alice", "echolink")
        assert result is True
        mock_log.assert_called_once()

@pytest.mark.asyncio
async def test_send_candidature_rejected():
    with patch("email_service._log_email", new_callable=AsyncMock, return_value=True) as mock_log:
        from email_service import send_candidature_rejected
        result = await send_candidature_rejected("test@test.com", "Alice", "Profil incompatible")
        assert result is True
        assert "Profil incompatible" in mock_log.call_args[0][2]

@pytest.mark.asyncio
async def test_send_candidature_rejected_no_note():
    with patch("email_service._log_email", new_callable=AsyncMock, return_value=True) as mock_log:
        from email_service import send_candidature_rejected
        result = await send_candidature_rejected("test@test.com", "Alice", None)
        assert result is True
```

**Step 2: Run tests to verify they fail**

Run: `cd backend && python -m pytest tests/test_email_candidature.py -p no:recording -v`
Expected: FAIL (functions don't exist yet)

**Step 3: Implement the 4 email functions**

Add at the end of `backend/email_service.py` (before the closing of the file):

```python
async def send_candidature_confirmation(email: str, name: str, project: str) -> bool:
    """Send confirmation email when a candidature is submitted."""
    project_labels = {"cognisphere": "CogniSphère", "echolink": "ECHOLink", "scenariste": "Scénariste"}
    project_label = project_labels.get(project, project)
    subject = "Candidature reçue — Mouvement ECHO"
    html = (
        f"<h2>Bonjour {name},</h2>"
        f"<p>Nous avons bien reçu votre candidature pour le projet <strong>{project_label}</strong>.</p>"
        f"<p>Notre équipe l'examinera dans les meilleurs délais. "
        f"Vous recevrez un email dès qu'une décision sera prise.</p>"
        f"<p>Si vous avez créé un compte sur notre plateforme avec cette adresse email, "
        f"vous pourrez également suivre l'avancement de votre candidature dans votre profil.</p>"
        f"<p>À bientôt,<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, html)


async def send_candidature_interview(email: str, name: str, booking_url: str) -> bool:
    """Send interview invitation with booking link."""
    subject = "Entretien — Mouvement ECHO"
    html = (
        f"<h2>Bonjour {name},</h2>"
        f"<p>Bonne nouvelle ! Votre candidature a retenu notre attention et nous souhaitons "
        f"vous rencontrer lors d'un entretien.</p>"
        f"<p>Veuillez réserver un créneau qui vous convient en cliquant sur le lien ci-dessous :</p>"
        f"<p><a href='{booking_url}' style='display:inline-block;padding:12px 24px;"
        f"background-color:#D4AF37;color:#000;text-decoration:none;border-radius:8px;"
        f"font-weight:bold;'>Réserver mon créneau</a></p>"
        f"<p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>"
        f"<a href='{booking_url}'>{booking_url}</a></p>"
        f"<p>À bientôt,<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, html)


async def send_candidature_accepted(email: str, name: str, project: str) -> bool:
    """Send acceptance email."""
    project_labels = {"cognisphere": "CogniSphère", "echolink": "ECHOLink", "scenariste": "Scénariste"}
    project_label = project_labels.get(project, project)
    subject = "Candidature acceptée — Mouvement ECHO"
    html = (
        f"<h2>Bonjour {name},</h2>"
        f"<p>Félicitations ! Votre candidature pour le projet <strong>{project_label}</strong> "
        f"a été acceptée.</p>"
        f"<p>Nous vous contacterons prochainement pour les prochaines étapes.</p>"
        f"<p>Bienvenue dans l'aventure ECHO !<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, html)


async def send_candidature_rejected(email: str, name: str, status_note: str | None) -> bool:
    """Send rejection email with optional reason."""
    subject = "Candidature — Mouvement ECHO"
    reason = ""
    if status_note:
        reason = f"<p><em>Motif : {status_note}</em></p>"
    html = (
        f"<h2>Bonjour {name},</h2>"
        f"<p>Après étude de votre candidature, nous ne sommes malheureusement pas en mesure "
        f"d'y donner une suite favorable pour le moment.</p>"
        f"{reason}"
        f"<p>Nous vous remercions pour l'intérêt que vous portez au Mouvement ECHO "
        f"et vous souhaitons bonne continuation.</p>"
        f"<p>Cordialement,<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, html)
```

**Step 4: Run tests to verify they pass**

Run: `cd backend && python -m pytest tests/test_email_candidature.py -p no:recording -v`
Expected: 5 PASSED

**Step 5: Commit**

```bash
git add backend/email_service.py backend/tests/test_email_candidature.py
git commit -m "feat: add 4 candidature email functions (confirmation, interview, accepted, rejected)"
```

---

### Task 3: Wire emails into candidature routes

**Files:**
- Modify: `backend/routes/candidatures.py`
- Test: `backend/tests/routes/test_candidatures.py`

**Step 1: Write failing test for confirmation email on submission**

Add to `backend/tests/routes/test_candidatures.py`:

```python
@pytest.mark.asyncio
async def test_submit_candidature_sends_confirmation_email(client, mock_db):
    """Verify confirmation email is sent on candidature submission."""
    with patch("routes.candidatures.send_candidature_confirmation", new_callable=AsyncMock) as mock_email:
        response = client.post("/api/candidatures/tech", json={
            "name": "Test User",
            "email": "test@example.com",
            "project": "scenariste",
            "skills": "Writing, storytelling",
            "message": "I want to join the scenariste team for ECHO.",
        })
        assert response.status_code == 200
        # BackgroundTasks runs synchronously in test client
        mock_email.assert_called_once_with("test@example.com", "Test User", "scenariste")
```

**Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/routes/test_candidatures.py::test_submit_candidature_sends_confirmation_email -p no:recording -v`
Expected: FAIL

**Step 3: Implement — update `routes/candidatures.py`**

Add `BackgroundTasks` import and wire emails:

At the top of `backend/routes/candidatures.py`, update imports:
```python
from fastapi import APIRouter, Request, Depends, HTTPException, BackgroundTasks
from email_service import send_email, send_candidature_confirmation, send_candidature_interview, send_candidature_accepted, send_candidature_rejected
from core.config import settings
```

Update `submit_tech_candidature` signature to accept `background_tasks: BackgroundTasks` and add after the team notification email (line 72):
```python
    # Confirmation email to candidate
    background_tasks.add_task(send_candidature_confirmation, data.email, data.name, data.project)
```

Update `update_candidature_status` to accept `background_tasks: BackgroundTasks` and add after the status update (after line 173):
```python
    # Fetch candidature to get email and name
    candidature = await db.tech_candidatures.find_one({"id": candidature_id})
    if candidature:
        email = candidature["email"]
        name = candidature["name"]
        project = candidature.get("project", "")
        if data.status == "entretien":
            background_tasks.add_task(send_candidature_interview, email, name, settings.BOOKING_URL)
        elif data.status == "accepted":
            background_tasks.add_task(send_candidature_accepted, email, name, project)
        elif data.status == "rejected":
            background_tasks.add_task(send_candidature_rejected, email, name, data.status_note)
```

Also convert team notification in `submit_tech_candidature` to use `background_tasks.add_task` instead of direct `await`:
```python
    background_tasks.add_task(
        send_email,
        "mouvement.echo.france@gmail.com",
        f"Nouvelle candidature — {project_label}",
        email_body
    )
```

**Step 4: Run all candidature tests**

Run: `cd backend && python -m pytest tests/routes/test_candidatures.py -p no:recording -v`
Expected: ALL PASSED

**Step 5: Commit**

```bash
git add backend/routes/candidatures.py backend/tests/routes/test_candidatures.py
git commit -m "feat: wire candidature emails into submission and status update routes"
```

---

### Task 4: Update Profile.tsx — add Scénariste support and booking button

**Files:**
- Modify: `frontend/src/pages/Profile.tsx:359-412`

**Step 1: Update the candidatures section**

In `Profile.tsx`, the current `statusMap` and `projectLabel` logic (lines 368-377) only handles CogniSphère and ECHOLink. Update:

Replace the project label/color/icon logic (lines 368-371):
```typescript
const projectLabels: Record<string, string> = {
    cognisphere: 'CogniSphère',
    echolink: 'ECHOLink',
    scenariste: 'Scénariste',
};
const projectColors: Record<string, string> = {
    cognisphere: '#A78BFA',
    echolink: '#60A5FA',
    scenariste: '#F59E0B',
};
const projectIcons: Record<string, React.ReactNode> = {
    cognisphere: <Brain size={12} />,
    echolink: <Share2 size={12} />,
    scenariste: <FileText size={12} />,
};
const projectLabel = projectLabels[c.project] || c.project;
const projectColor = projectColors[c.project] || '#888';
const ProjectIconNode = projectIcons[c.project] || <FileText size={12} />;
```

Update the badge to use `ProjectIconNode` instead of `<ProjectIcon size={12} />`.

Add a booking button after the status badge when status is "entretien":
```tsx
{c.status === 'entretien' && (
    <a
        href="https://calendar.app.google/GSpXrQq72uqWhhSx9"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-echo-gold/20 text-echo-gold border border-echo-gold/30 hover:bg-echo-gold/30 transition-colors mt-2"
    >
        <Calendar size={12} />
        Réserver un créneau d'entretien
    </a>
)}
```

Also show the section even when `myCandidatures.length === 0` — remove the conditional wrapper and show an empty state message instead:
```tsx
{myCandidatures.length === 0 ? (
    <p className="text-sm text-neutral-400 italic">Vous n'avez pas encore soumis de candidature.</p>
) : (
    <div className="space-y-3">
        {/* existing map */}
    </div>
)}
```

Import `Calendar` from lucide-react (already imported at line 6).

**Step 2: Run frontend lint and build**

Run: `cd frontend && npx eslint . && npx vitest run && npm run build`
Expected: 0 errors, all tests pass, build succeeds

**Step 3: Commit**

```bash
git add frontend/src/pages/Profile.tsx
git commit -m "feat: add Scénariste support and booking button to Profile candidatures"
```

---

### Task 5: Run full quality checks

**Step 1: Backend tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests pass

**Step 2: Frontend lint + tests + build**

Run: `cd frontend && npx eslint . && npx vitest run && npm run build`
Expected: 0 lint errors, all tests pass, build succeeds

**Step 3: Update shared-context.md**

Update `.agent/memory/shared-context.md`:
- Add entry in "Décisions Récentes" for candidature notifications
- Update backlog items
- Add backlog item: "Rédiger les emails définitifs pour les 4 notifications candidature"

**Step 4: Final commit**

```bash
git add .agent/memory/shared-context.md
git commit -m "chore: update BMAD shared context with candidature notifications"
```
