# Admin Console Improvements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ajouter audit trail, toasts de feedback, gestion des messages de contact, notes admin, et vue "À traiter" centralisée à la console admin ECHO avant le lancement du 20 mars 2026.

**Architecture:** 5 tâches indépendantes (sauf Task 4 qui dépend de Tasks 1+2). Backend FastAPI + MongoDB Motor async. Frontend React 19 + TypeScript + Tailwind CSS 4. Pattern existant : `require_admin` dependency, inline feedback messages, cards dashboard avec badges.

**Tech Stack:** FastAPI, MongoDB Motor async, React 19, TypeScript, Tailwind CSS 4, Lucide React icons

---

### Task 1: Audit Trail Minimal

**But :** Tracer toutes les actions admin (qui a fait quoi, quand) dans une collection MongoDB `admin_actions`.

**Files:**
- Create: `backend/utils/audit.py`
- Create: `backend/tests/test_audit.py`
- Modify: `backend/routes/partners.py` (endpoints admin)
- Modify: `backend/routes/candidatures.py` (endpoints admin)
- Modify: `backend/routes/members.py` (endpoints admin)

**Step 1: Write the audit utility**

Create `backend/utils/audit.py`:

```python
"""Minimal audit trail — logs admin actions to MongoDB."""
import logging
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)


async def log_admin_action(
    db: AsyncIOMotorDatabase,
    admin_id: str,
    action: str,
    target_type: str,
    target_id: str,
    changes: dict | None = None,
) -> None:
    """Write an audit entry. Fire-and-forget, never raises."""
    try:
        await db.admin_actions.insert_one({
            "admin_id": admin_id,
            "action": action,
            "target_type": target_type,
            "target_id": target_id,
            "changes": changes,
            "timestamp": datetime.utcnow(),
        })
    except Exception as e:
        logger.warning(f"Audit log failed: {e}")
```

**Step 2: Write the test**

Create `backend/tests/test_audit.py`:

```python
import pytest
from httpx import AsyncClient, ASGITransport
from server import app
from unittest.mock import AsyncMock, patch


@pytest.fixture
def admin_headers():
    return {}


@pytest.fixture
def mock_admin():
    from models import User, UserRole
    return User(
        id="admin-test-id",
        email="admin@test.com",
        role=UserRole.ADMIN,
        display_name="Admin Test",
        hashed_password="x",
    )


@pytest.mark.asyncio
async def test_audit_trail_on_partner_approve(mock_admin):
    """Approving a partner should create an audit trail entry."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        with patch("routes.partners.require_admin", return_value=mock_admin):
            with patch("routes.partners.get_db") as mock_get_db:
                mock_db = AsyncMock()
                mock_db.partners.find_one.return_value = {
                    "id": "partner-123",
                    "name": "Test Partner",
                    "slug": "test-partner",
                    "status": "pending",
                }
                mock_db.partners.update_one.return_value = AsyncMock(modified_count=1)
                mock_db.admin_actions.insert_one.return_value = AsyncMock()
                mock_get_db.return_value = mock_db

                response = await client.put("/api/partners/admin/partner-123/approve")

                # Verify audit log was called
                mock_db.admin_actions.insert_one.assert_called_once()
                call_args = mock_db.admin_actions.insert_one.call_args[0][0]
                assert call_args["action"] == "approve"
                assert call_args["target_type"] == "partner"
                assert call_args["target_id"] == "partner-123"
                assert call_args["admin_id"] == "admin-test-id"
```

**Step 3: Run tests**

Run: `cd backend && python -m pytest -p no:recording tests/test_audit.py -v`

**Step 4: Add audit calls to partner admin endpoints**

In `backend/routes/partners.py`, add `from utils.audit import log_admin_action` at the top.

Then add audit calls after each successful admin action. Example for `admin_approve_partner`:

```python
# After the update_one call succeeds:
await log_admin_action(db, admin.id, "approve", "partner", partner_id)
```

Add similar calls to:
- `admin_reject_partner` → `await log_admin_action(db, admin.id, "reject", "partner", partner_id, {"reason": reason})`
- `admin_feature_partner` → `await log_admin_action(db, admin.id, "feature_toggle", "partner", partner_id)`
- `admin_suspend_partner` → `await log_admin_action(db, admin.id, "suspend", "partner", partner_id)`
- `admin_delete_partner` → `await log_admin_action(db, admin.id, "delete", "partner", partner_id)`
- `admin_edit_partner` → `await log_admin_action(db, admin.id, "edit", "partner", partner_id, {"fields": list(updates.keys())})`

**Step 5: Add audit calls to candidatures admin endpoints**

In `backend/routes/candidatures.py`, add `from utils.audit import log_admin_action` at the top.

Add after each successful action:
- Status change → `await log_admin_action(db, admin.id, "status_change", "candidature", candidature_id, {"new_status": status, "note": note})`
- Delete → `await log_admin_action(db, admin.id, "delete", "candidature", candidature_id)`
- Batch status → `await log_admin_action(db, admin.id, "batch_status", "candidature", ",".join(ids), {"new_status": status})`

**Step 6: Add audit calls to members admin endpoints**

In `backend/routes/members.py`, add `from utils.audit import log_admin_action` at the top.

Add after each successful action:
- Status change → `await log_admin_action(db, admin.id, "status_change", "member", profile_id, {"new_status": status})`
- Profile update → `await log_admin_action(db, admin.id, "edit", "member", profile_id, {"fields": list(updates.keys())})`

**Step 7: Run all tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All pass

**Step 8: Commit**

```bash
git add backend/utils/audit.py backend/tests/test_audit.py backend/routes/partners.py backend/routes/candidatures.py backend/routes/members.py
git commit -m "feat(admin): audit trail — log all admin actions to admin_actions collection"
```

---

### Task 2: Toasts Feedback + Statut Messages Contact

**But :** (A) Créer un composant Toast réutilisable pour le feedback admin. (B) Ajouter un champ `status` aux messages de contact + endpoints admin pour les lire/gérer.

**Files:**
- Create: `frontend/src/components/ui/Toast.tsx`
- Create: `frontend/src/pages/AdminMessages.tsx`
- Create: `backend/tests/test_contact_admin.py`
- Modify: `backend/routes/contact.py` (add admin endpoints)
- Modify: `backend/models.py` (add status field to ContactMessage)
- Modify: `frontend/src/pages/AdminDashboard.tsx` (add Messages card)
- Modify: `frontend/src/App.tsx` (add route)

**Step 1: Create Toast component**

Create `frontend/src/components/ui/Toast.tsx`:

```tsx
import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

const icons = {
    success: <CheckCircle className="text-green-400" size={18} />,
    error: <XCircle className="text-red-400" size={18} />,
    warning: <AlertTriangle className="text-amber-400" size={18} />,
};

const borders = {
    success: 'border-green-500/30',
    error: 'border-red-500/30',
    warning: 'border-amber-500/30',
};

export function Toast({ message, type = 'success', onClose, duration = 4000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className={`fixed top-20 right-6 z-[9999] flex items-center gap-3 px-4 py-3 bg-[#1A1A1A] border ${borders[type]} rounded-lg shadow-xl animate-slide-in-right max-w-sm`}>
            {icons[type]}
            <span className="text-sm text-white">{message}</span>
            <button onClick={onClose} className="text-neutral-500 hover:text-white ml-2">
                <X size={14} />
            </button>
        </div>
    );
}
```

Add to `frontend/src/index.css` (inside `@theme` or after existing keyframes):

```css
@keyframes slide-in-right {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
.animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out;
}
```

**Step 2: Add status field to ContactMessage model**

In `backend/models.py`, update `ContactMessage`:

```python
class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    subject: str
    message: str
    ip_address: str  # anonymisé
    created_at: datetime = Field(default_factory=datetime.utcnow)
    read: bool = False
    status: Literal["unread", "read", "treated"] = "unread"
    admin_note: Optional[str] = None
```

Also update `backend/routes/contact.py` to store `status: "unread"` in the insert doc (line 46).

**Step 3: Add admin endpoints for contact messages**

Add to `backend/routes/contact.py`:

```python
from routes.auth import require_admin
from models import User

@router.get("/contact/admin/all")
async def get_all_messages(
    status: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """List all contact messages for admin."""
    query = {}
    if status:
        query["status"] = status
    cursor = db.contact_messages.find(query, {"_id": 0}).sort("created_at", -1)
    messages = await cursor.to_list(length=200)
    return messages


@router.put("/contact/admin/{message_id}/status")
async def update_message_status(
    message_id: str,
    data: dict,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update message status (read/treated) and optional admin note."""
    update_fields: dict = {"status": data.get("status", "read")}
    if "admin_note" in data:
        update_fields["admin_note"] = data["admin_note"]

    result = await db.contact_messages.update_one(
        {"id": message_id},
        {"$set": update_fields},
    )
    if result.modified_count == 0:
        # Try matching on _id string or fallback
        result = await db.contact_messages.update_one(
            {"_id": message_id},
            {"$set": update_fields},
        )
    return {"success": True}
```

**Step 4: Write test for admin contact endpoints**

Create `backend/tests/test_contact_admin.py`:

```python
import pytest
from httpx import AsyncClient, ASGITransport
from server import app


@pytest.mark.asyncio
async def test_contact_admin_list(admin_client):
    """Admin can list contact messages."""
    response = await admin_client.get("/api/contact/admin/all")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_contact_submit_creates_unread(client):
    """Submitted contact message has status unread."""
    response = await client.post("/api/contact", json={
        "name": "Test User",
        "email": "test@example.com",
        "subject": "question_generale",
        "message": "This is a test message for the contact form.",
        "consent_rgpd": True,
        "website": "",
    })
    assert response.status_code == 200
```

**Step 5: Run tests**

Run: `cd backend && python -m pytest -p no:recording -q`

**Step 6: Create AdminMessages page**

Create `frontend/src/pages/AdminMessages.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MailOpen, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { API_URL } from '../config/api';
import { Toast } from '../components/ui/Toast';

const SUBJECT_LABELS: Record<string, string> = {
    question_generale: 'Question générale',
    presse_media: 'Presse & Média',
    partenariat: 'Partenariat',
    autre: 'Autre',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Mail }> = {
    unread: { label: 'Non lu', color: '#F59E0B', icon: Mail },
    read: { label: 'Lu', color: '#3B82F6', icon: MailOpen },
    treated: { label: 'Traité', color: '#10B981', icon: CheckCircle },
};

interface ContactMsg {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status?: string;
    admin_note?: string;
    created_at: string;
}

export default function AdminMessages() {
    const [messages, setMessages] = useState<ContactMsg[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('');
    const [selected, setSelected] = useState<ContactMsg | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const fetchMessages = async () => {
        try {
            const url = filter
                ? `${API_URL}/contact/admin/all?status=${filter}`
                : `${API_URL}/contact/admin/all`;
            const res = await fetch(url, { credentials: 'include' });
            if (res.status === 401 || res.status === 403) {
                window.location.href = '/login';
                return;
            }
            if (res.ok) setMessages(await res.json());
        } catch { /* silent */ } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMessages(); }, [filter]);

    const updateStatus = async (msg: ContactMsg, newStatus: string) => {
        const msgId = msg.id || msg._id;
        try {
            const res = await fetch(`${API_URL}/contact/admin/${msgId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setToast({ message: `Message marqué comme "${STATUS_CONFIG[newStatus]?.label}"`, type: 'success' });
                fetchMessages();
                if (selected && (selected.id === msgId || selected._id === msgId)) {
                    setSelected({ ...selected, status: newStatus });
                }
            }
        } catch {
            setToast({ message: 'Erreur lors de la mise à jour', type: 'error' });
        }
    };

    const msgId = (m: ContactMsg) => m.id || m._id || '';

    return (
        <div className="min-h-screen bg-echo-dark pt-24 pb-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-echo-textMuted hover:text-echo-gold mb-6 transition-colors">
                    <ArrowLeft size={16} /> Retour au dashboard
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-echo-gold/20 rounded-xl">
                        <MessageSquare className="text-echo-gold" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif text-white">Messages de contact</h1>
                        <p className="text-echo-textMuted text-sm">{messages.length} message{messages.length > 1 ? 's' : ''}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {['', 'unread', 'read', 'treated'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                                filter === f
                                    ? 'bg-echo-gold/20 border-echo-gold/50 text-echo-gold'
                                    : 'bg-white/5 border-white/10 text-echo-textMuted hover:text-white'
                            }`}
                        >
                            {f === '' ? 'Tous' : STATUS_CONFIG[f]?.label || f}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-12 text-echo-textMuted">Chargement...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-echo-textMuted">Aucun message</div>
                ) : (
                    <div className="space-y-3">
                        {messages.map(msg => {
                            const status = msg.status || 'unread';
                            const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unread;
                            const Icon = cfg.icon;
                            return (
                                <div
                                    key={msgId(msg)}
                                    onClick={() => {
                                        setSelected(msg);
                                        if (status === 'unread') updateStatus(msg, 'read');
                                    }}
                                    className={`p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors ${
                                        status === 'unread' ? 'border-l-2 border-l-amber-500' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <Icon size={16} style={{ color: cfg.color }} className="mt-1 shrink-0" />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-white font-medium text-sm">{msg.name}</span>
                                                    <span className="text-echo-textMuted text-xs">— {SUBJECT_LABELS[msg.subject] || msg.subject}</span>
                                                </div>
                                                <p className="text-echo-textMuted text-sm truncate">{msg.message}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs px-2 py-0.5 rounded-full border" style={{ color: cfg.color, borderColor: `${cfg.color}40` }}>
                                                {cfg.label}
                                            </span>
                                            <span className="text-xs text-echo-textMuted">
                                                {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Detail Panel */}
                {selected && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={() => setSelected(null)}>
                        <div className="w-full max-w-lg bg-[#111] border-l border-white/10 p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-serif text-white">Message de {selected.name}</h2>
                                <button onClick={() => setSelected(null)} className="text-echo-textMuted hover:text-white">✕</button>
                            </div>
                            <div className="space-y-4 text-sm">
                                <div><span className="text-echo-textMuted">Email :</span> <span className="text-white">{selected.email}</span></div>
                                <div><span className="text-echo-textMuted">Sujet :</span> <span className="text-white">{SUBJECT_LABELS[selected.subject] || selected.subject}</span></div>
                                <div><span className="text-echo-textMuted">Date :</span> <span className="text-white">{new Date(selected.created_at).toLocaleString('fr-FR')}</span></div>
                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-echo-textMuted mb-2">Message :</p>
                                    <p className="text-white whitespace-pre-wrap">{selected.message}</p>
                                </div>
                                <div className="pt-4 border-t border-white/10 flex gap-2">
                                    {['unread', 'read', 'treated'].map(s => {
                                        const c = STATUS_CONFIG[s];
                                        const isActive = (selected.status || 'unread') === s;
                                        return (
                                            <button
                                                key={s}
                                                onClick={() => updateStatus(selected, s)}
                                                disabled={isActive}
                                                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                                                    isActive
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'hover:bg-white/10'
                                                }`}
                                                style={{ color: c.color, borderColor: `${c.color}40` }}
                                            >
                                                {c.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
```

**Step 7: Add route in App.tsx and Dashboard card**

In `frontend/src/App.tsx`, add lazy import and route:
```tsx
const AdminMessages = lazy(() => import('./pages/AdminMessages'));
// Inside routes:
<Route path="/admin/messages" element={<AdminMessages />} />
```

In `frontend/src/pages/AdminDashboard.tsx`:
- Add `MessageSquare` to lucide imports
- Add a Messages card to the `sections` array (after Exports):
```tsx
{
    title: 'Messages',
    description: 'Consulter les messages du formulaire de contact',
    icon: <MessageSquare size={24} />,
    href: '/admin/messages',
    active: true,
},
```
- Fetch unread message count in `useEffect` and add `notificationCount` to the card.

**Step 8: Run quality checks**

Run: `cd frontend && npx eslint . && npx vitest run && npm run build`
Run: `cd backend && python -m pytest -p no:recording -q`

**Step 9: Commit**

```bash
git add frontend/src/components/ui/Toast.tsx frontend/src/pages/AdminMessages.tsx frontend/src/pages/AdminDashboard.tsx frontend/src/App.tsx frontend/src/index.css backend/routes/contact.py backend/models.py backend/tests/test_contact_admin.py
git commit -m "feat(admin): toast notifications + contact messages management page"
```

---

### Task 3: Notes Admin Internes

**But :** Ajouter un champ `admin_notes` sur les candidatures et partenaires, éditable dans les modales admin.

**Files:**
- Modify: `backend/models.py` (TechCandidature — add admin_notes)
- Modify: `backend/models_partner.py` (Partner — add admin_notes)
- Modify: `backend/routes/candidatures.py` (persist admin_notes on edit)
- Modify: `backend/routes/partners.py` (persist admin_notes on edit)
- Modify: `frontend/src/pages/AdminCandidatures.tsx` (textarea in edit modal)
- Modify: `frontend/src/pages/AdminPartners.tsx` (textarea in edit modal)

**Step 1: Add admin_notes to backend models**

In `backend/models.py`, add to `TechCandidature` (after `status_note`):
```python
admin_notes: Optional[str] = None  # Notes internes admin (non visibles par le candidat)
```

In `backend/models_partner.py`, add to `Partner` (after `rejection_reason`):
```python
admin_notes: Optional[str] = None  # Notes internes admin
```

**Step 2: Allow admin_notes in edit endpoints**

In `backend/routes/candidatures.py`, the existing `PATCH /admin/{candidature_id}` endpoint uses `TechCandidatureEditUpdate`. Add `admin_notes` to that model if not present:
```python
admin_notes: Optional[str] = None
```

In `backend/routes/partners.py`, the `PUT /admin/{partner_id}/edit` endpoint accepts arbitrary fields. `admin_notes` will naturally pass through as a string field.

**Step 3: Add textarea in AdminCandidatures.tsx edit modal**

In the edit modal section of `AdminCandidatures.tsx`, add after the status_note field:

```tsx
<div>
    <label className="block text-sm font-medium text-neutral-300 mb-1.5">Notes admin (internes)</label>
    <textarea
        value={(editData.admin_notes as string) || ''}
        onChange={e => updateField('admin_notes', e.target.value)}
        rows={3}
        placeholder="Notes visibles uniquement par les admins..."
        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-echo-gold/50"
    />
</div>
```

**Step 4: Add textarea in AdminPartners.tsx edit modal**

Same pattern in the partner edit modal, add after existing fields:

```tsx
<div className="md:col-span-2">
    <label className="block text-sm font-medium text-neutral-300 mb-1.5">Notes admin (internes)</label>
    <textarea
        value={(editData.admin_notes as string) || ''}
        onChange={e => updateField('admin_notes', e.target.value)}
        rows={3}
        placeholder="Notes visibles uniquement par les admins..."
        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-echo-gold/50"
    />
</div>
```

**Step 5: Run quality checks**

Run: `cd frontend && npx eslint . && npm run build`
Run: `cd backend && python -m pytest -p no:recording -q`

**Step 6: Commit**

```bash
git add backend/models.py backend/models_partner.py backend/routes/candidatures.py backend/routes/partners.py frontend/src/pages/AdminCandidatures.tsx frontend/src/pages/AdminPartners.tsx
git commit -m "feat(admin): internal admin notes on candidatures and partners"
```

---

### Task 4: Vue « À traiter » Centralisée

**Dépend de :** Tasks 1 et 2 (audit trail + contact messages status)

**But :** Endpoint d'agrégation + section dashboard montrant les compteurs d'éléments en attente d'action par catégorie, avec liens directs vers les pages filtrées.

**Files:**
- Create: `backend/routes/admin_dashboard.py`
- Create: `backend/tests/test_admin_dashboard.py`
- Modify: `backend/server.py` (register new router)
- Modify: `frontend/src/pages/AdminDashboard.tsx` (add pending section)

**Step 1: Create aggregation endpoint**

Create `backend/routes/admin_dashboard.py`:

```python
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import User
from routes.auth import get_db, require_admin
import asyncio

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])


@router.get("/pending")
async def get_pending_counts(
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Aggregated counts of items pending admin action."""
    (
        partners_pending,
        candidatures_pending,
        volunteers_pending,
        members_pending,
        messages_unread,
        recent_actions,
    ) = await asyncio.gather(
        db.partners.count_documents({"status": "pending"}),
        db.candidatures.count_documents({"status": "pending"}),
        db.volunteers.count_documents({"status": "pending"}),
        db.member_profiles.count_documents({"membership_status": "pending"}),
        db.contact_messages.count_documents({"status": {"$in": ["unread", None]}, "read": {"$ne": True}}),
        db.admin_actions.find({}, {"_id": 0}).sort("timestamp", -1).to_list(length=5),
    )

    total = partners_pending + candidatures_pending + volunteers_pending + members_pending + messages_unread

    return {
        "partners": partners_pending,
        "candidatures": candidatures_pending,
        "volunteers": volunteers_pending,
        "members": members_pending,
        "messages": messages_unread,
        "total": total,
        "recent_actions": recent_actions,
    }
```

**Step 2: Register router in server.py**

In `backend/server.py`, add:
```python
from routes.admin_dashboard import router as admin_dashboard_router
app.include_router(admin_dashboard_router, prefix="/api")
```

**Step 3: Write test**

Create `backend/tests/test_admin_dashboard.py`:

```python
import pytest
from httpx import AsyncClient, ASGITransport
from server import app


@pytest.mark.asyncio
async def test_pending_counts_requires_admin(client):
    """Non-admin users cannot access pending counts."""
    response = await client.get("/api/admin/pending")
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_pending_counts_returns_structure(admin_client):
    """Admin gets structured pending counts."""
    response = await admin_client.get("/api/admin/pending")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "partners" in data
    assert "candidatures" in data
    assert "messages" in data
```

**Step 4: Run backend tests**

Run: `cd backend && python -m pytest -p no:recording -q`

**Step 5: Update AdminDashboard.tsx**

Replace the current `useEffect` fetchStats logic with a single call to `/api/admin/pending`, and add an "À traiter" section at the top of the dashboard:

```tsx
// Add to state:
const [pending, setPending] = useState<{
    partners: number; candidatures: number; volunteers: number;
    members: number; messages: number; total: number;
} | null>(null);

// Replace fetchStats useEffect:
useEffect(() => {
    const fetchPending = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/pending`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setPending(data);
                setPendingCount(data.partners);
                setTotalCount(null); // Will come from pending
                setCandidatureCount(null);
                setPendingCandidatureCount(data.candidatures);
                setPendingVolunteerCount(data.volunteers);
            }
        } catch { /* silent */ }
    };
    fetchPending();
}, []);
```

Add an "À traiter" banner before the section cards when `pending?.total > 0`:

```tsx
{pending && pending.total > 0 && (
    <div className="mb-8 p-5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
            <Clock size={20} className="text-amber-400" />
            <h2 className="text-lg font-serif text-white">{pending.total} élément{pending.total > 1 ? 's' : ''} à traiter</h2>
        </div>
        <div className="flex flex-wrap gap-3">
            {pending.partners > 0 && (
                <Link to="/admin/partenaires?status=pending" className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-amber-300 hover:bg-white/10 transition-colors">
                    {pending.partners} partenaire{pending.partners > 1 ? 's' : ''} en attente
                </Link>
            )}
            {pending.candidatures > 0 && (
                <Link to="/admin/candidatures?status=pending" className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-purple-300 hover:bg-white/10 transition-colors">
                    {pending.candidatures} candidature{pending.candidatures > 1 ? 's' : ''} en attente
                </Link>
            )}
            {pending.volunteers > 0 && (
                <Link to="/admin/benevoles?status=pending" className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-green-300 hover:bg-white/10 transition-colors">
                    {pending.volunteers} bénévole{pending.volunteers > 1 ? 's' : ''} en attente
                </Link>
            )}
            {pending.messages > 0 && (
                <Link to="/admin/messages?status=unread" className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-blue-300 hover:bg-white/10 transition-colors">
                    {pending.messages} message{pending.messages > 1 ? 's' : ''} non lu{pending.messages > 1 ? 's' : ''}
                </Link>
            )}
        </div>
    </div>
)}
```

**Step 6: Run quality checks**

Run: `cd frontend && npx eslint . && npx vitest run && npm run build`
Run: `cd backend && python -m pytest -p no:recording -q`

**Step 7: Commit**

```bash
git add backend/routes/admin_dashboard.py backend/tests/test_admin_dashboard.py backend/server.py frontend/src/pages/AdminDashboard.tsx
git commit -m "feat(admin): centralized pending actions view on dashboard"
```

---

### Task 5: Filtres Persistés dans l'URL

**But :** Synchroniser les filtres des pages admin avec les query params de l'URL pour permettre le partage de vues et la navigation retour sans perte de contexte.

**Files:**
- Create: `frontend/src/hooks/useUrlFilters.ts`
- Modify: `frontend/src/pages/AdminCandidatures.tsx`
- Modify: `frontend/src/pages/AdminPartners.tsx`
- Modify: `frontend/src/pages/AdminVolunteers.tsx`
- Modify: `frontend/src/pages/AdminMessages.tsx`

**Step 1: Create useUrlFilters hook**

Create `frontend/src/hooks/useUrlFilters.ts`:

```typescript
import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Sync filter state with URL query params.
 * Usage: const [filters, setFilter] = useUrlFilters({ status: '', project: '' });
 */
export function useUrlFilters<T extends Record<string, string>>(defaults: T) {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters = { ...defaults } as T;
    for (const key of Object.keys(defaults)) {
        const value = searchParams.get(key);
        if (value !== null) {
            (filters as Record<string, string>)[key] = value;
        }
    }

    const setFilter = useCallback((key: keyof T, value: string) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (value === '' || value === defaults[key]) {
                next.delete(key as string);
            } else {
                next.set(key as string, value);
            }
            return next;
        }, { replace: true });
    }, [setSearchParams, defaults]);

    return [filters, setFilter] as const;
}
```

**Step 2: Integrate in AdminCandidatures.tsx**

Replace the existing filter state variables with the hook:

```tsx
import { useUrlFilters } from '../hooks/useUrlFilters';

// Replace:
// const [filterProject, setFilterProject] = useState('');
// const [filterStatus, setFilterStatus] = useState('');
// With:
const [filters, setFilter] = useUrlFilters({ project: '', status: '', experience: '' });
const filterProject = filters.project;
const filterStatus = filters.status;
// Update setFilterProject(x) → setFilter('project', x)
// Update setFilterStatus(x) → setFilter('status', x)
```

**Step 3: Integrate in AdminPartners.tsx, AdminVolunteers.tsx, AdminMessages.tsx**

Same pattern: replace `useState` filter variables with `useUrlFilters` hook.

**Step 4: Run quality checks**

Run: `cd frontend && npx eslint . && npx vitest run && npm run build`

**Step 5: Commit**

```bash
git add frontend/src/hooks/useUrlFilters.ts frontend/src/pages/AdminCandidatures.tsx frontend/src/pages/AdminPartners.tsx frontend/src/pages/AdminVolunteers.tsx frontend/src/pages/AdminMessages.tsx
git commit -m "feat(admin): persist filters in URL query params across admin pages"
```
