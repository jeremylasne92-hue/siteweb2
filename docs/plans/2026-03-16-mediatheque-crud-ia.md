# Médiathèque CRUD + IA — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permettre à l'admin ECHO d'ajouter, modifier, supprimer et publier des ressources (documents PDF, vidéos YouTube, livres, outils) dans la médiathèque, avec enrichissement IA optionnel via Claude Haiku.

**Architecture:** Collection unique `media_resources` en MongoDB avec discriminant `resource_type`. Backend FastAPI avec 6 endpoints (2 publics + 4 admin). Frontend : page admin `AdminMediatheque.tsx` avec formulaire adaptatif par type + page publique `Resources.tsx` convertie en fetch API avec cartes polymorphes et modale vidéo. Enrichissement IA via endpoint dédié qui extrait métadonnées YouTube + appel Claude Haiku pour résumé/tags/catégorie.

**Tech Stack:** FastAPI 0.110, Motor 3.3 async, Pydantic v2, React 19, TypeScript 5.9, Tailwind CSS 4, Lucide Icons, Anthropic SDK (AsyncAnthropic), YouTube Data API v3 (optionnel)

---

## Task 1: Modèle Pydantic `MediaResource`

**Files:**
- Create: `backend/models_mediatheque.py`
- Test: `backend/tests/models/test_models_mediatheque.py`

**Step 1: Write the failing test**

```python
# backend/tests/models/test_models_mediatheque.py
import pytest
from models_mediatheque import MediaResourceCreate, MediaResource, ResourceType

def test_resource_type_enum():
    assert ResourceType.DOCUMENT == "document"
    assert ResourceType.VIDEO == "video"
    assert ResourceType.LIVRE == "livre"
    assert ResourceType.OUTIL == "outil"

def test_create_minimal_resource():
    r = MediaResourceCreate(resource_type=ResourceType.VIDEO, title="Test", description="Desc")
    assert r.title == "Test"
    assert r.is_published is False
    assert r.tags == []

def test_create_video_resource():
    r = MediaResourceCreate(
        resource_type=ResourceType.VIDEO,
        title="Comprendre le GIEC",
        description="Une vidéo essentielle pour comprendre les rapports du GIEC.",
        external_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        source="GIEC",
        year=2024,
        tags=["climat", "science"]
    )
    assert r.external_url == "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    assert r.year == 2024

def test_create_document_resource():
    r = MediaResourceCreate(
        resource_type=ResourceType.DOCUMENT,
        title="Manifeste ECHO",
        description="Le document fondateur du mouvement.",
        file_url="/uploads/media/manifeste.pdf",
        file_name="manifeste-echo.pdf",
        file_size=2500000,
        source="Mouvement ECHO"
    )
    assert r.file_size == 2500000

def test_create_livre_resource():
    r = MediaResourceCreate(
        resource_type=ResourceType.LIVRE,
        title="Sapiens",
        description="Un livre qui change la perspective sur l'humanité.",
        author="Yuval Noah Harari",
        year=2015,
        external_url="https://www.fnac.com/sapiens"
    )
    assert r.author == "Yuval Noah Harari"

def test_title_too_short():
    with pytest.raises(Exception):
        MediaResourceCreate(resource_type=ResourceType.VIDEO, title="", description="Desc")

def test_full_media_resource_model():
    r = MediaResource(
        id="abc123",
        resource_type=ResourceType.OUTIL,
        title="Calculateur Carbone",
        description="Un outil pour mesurer son empreinte.",
        external_url="https://nosgestesclimat.fr",
        is_published=True,
        sort_order=1,
        created_at="2026-03-16T00:00:00",
        updated_at="2026-03-16T00:00:00"
    )
    assert r.id == "abc123"
    assert r.is_published is True
```

**Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/models/test_models_mediatheque.py -p no:recording -v`
Expected: FAIL with "ModuleNotFoundError: No module named 'models_mediatheque'"

**Step 3: Write minimal implementation**

```python
# backend/models_mediatheque.py
"""Pydantic models for the Médiathèque (media resources)."""
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class ResourceType(str, Enum):
    DOCUMENT = "document"
    VIDEO = "video"
    LIVRE = "livre"
    OUTIL = "outil"


class MediaResourceCreate(BaseModel):
    """Schema for creating/updating a media resource."""
    resource_type: ResourceType
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=5000)
    thumbnail_url: Optional[str] = None
    external_url: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    tags: list[str] = Field(default_factory=list)
    source: Optional[str] = None
    author: Optional[str] = None
    year: Optional[int] = Field(None, ge=1900, le=2100)
    is_featured: bool = False
    is_published: bool = False
    sort_order: int = 0


class MediaResource(BaseModel):
    """Schema for reading a media resource from the database."""
    id: str
    resource_type: ResourceType
    title: str
    description: str
    thumbnail_url: Optional[str] = None
    external_url: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    tags: list[str] = Field(default_factory=list)
    source: Optional[str] = None
    author: Optional[str] = None
    year: Optional[int] = None
    is_featured: bool = False
    is_published: bool = False
    sort_order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**Step 4: Run test to verify it passes**

Run: `cd backend && python -m pytest tests/models/test_models_mediatheque.py -p no:recording -v`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add backend/models_mediatheque.py backend/tests/models/test_models_mediatheque.py
git commit -m "feat(mediatheque): add MediaResource Pydantic models"
```

---

## Task 2: Routes CRUD Backend

**Files:**
- Create: `backend/routes/mediatheque.py`
- Modify: `backend/server.py` (add route registration, ~line 126-142)
- Test: `backend/tests/routes/test_mediatheque.py`

**Step 1: Write the failing tests**

```python
# backend/tests/routes/test_mediatheque.py
import pytest
from httpx import AsyncClient, ASGITransport
from server import app

@pytest.fixture
def admin_headers():
    """Get admin auth headers (reuse existing pattern from test_events.py)."""
    # Use the same auth pattern as existing tests
    return {}

@pytest.mark.asyncio
async def test_create_resource_admin(admin_headers):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # First login as admin (follow existing test pattern)
        login = await ac.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
        cookies = login.cookies

        response = await ac.post("/api/admin/mediatheque", json={
            "resource_type": "video",
            "title": "Test Video",
            "description": "A test video resource",
            "external_url": "https://www.youtube.com/watch?v=test123",
            "tags": ["test", "ecology"]
        }, cookies=cookies)
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Video"
        assert data["resource_type"] == "video"
        assert "id" in data

@pytest.mark.asyncio
async def test_list_resources_public():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/mediatheque")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

@pytest.mark.asyncio
async def test_list_resources_filter_by_type():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/mediatheque?type=video")
        assert response.status_code == 200

@pytest.mark.asyncio
async def test_update_resource_admin():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login = await ac.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
        cookies = login.cookies

        # Create first
        create = await ac.post("/api/admin/mediatheque", json={
            "resource_type": "document",
            "title": "Original Title",
            "description": "Original description"
        }, cookies=cookies)
        resource_id = create.json()["id"]

        # Update
        response = await ac.put(f"/api/admin/mediatheque/{resource_id}", json={
            "resource_type": "document",
            "title": "Updated Title",
            "description": "Updated description"
        }, cookies=cookies)
        assert response.status_code == 200
        assert response.json()["title"] == "Updated Title"

@pytest.mark.asyncio
async def test_delete_resource_admin():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login = await ac.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
        cookies = login.cookies

        create = await ac.post("/api/admin/mediatheque", json={
            "resource_type": "outil",
            "title": "To Delete",
            "description": "Will be deleted"
        }, cookies=cookies)
        resource_id = create.json()["id"]

        response = await ac.delete(f"/api/admin/mediatheque/{resource_id}", cookies=cookies)
        assert response.status_code == 200

@pytest.mark.asyncio
async def test_toggle_publish_admin():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login = await ac.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
        cookies = login.cookies

        create = await ac.post("/api/admin/mediatheque", json={
            "resource_type": "livre",
            "title": "A Book",
            "description": "A great book",
            "author": "Author Name"
        }, cookies=cookies)
        resource_id = create.json()["id"]
        assert create.json()["is_published"] is False

        response = await ac.patch(f"/api/admin/mediatheque/{resource_id}/publish", cookies=cookies)
        assert response.status_code == 200
        assert response.json()["is_published"] is True
```

**Step 2: Run tests to verify they fail**

Run: `cd backend && python -m pytest tests/routes/test_mediatheque.py -p no:recording -v`
Expected: FAIL

**Step 3: Write the routes implementation**

```python
# backend/routes/mediatheque.py
"""Routes for the Médiathèque (media resources CRUD)."""
from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query

from models_mediatheque import MediaResource, MediaResourceCreate, ResourceType
from services.auth_service import require_admin

router = APIRouter(prefix="/mediatheque", tags=["Médiathèque"])
admin_router = APIRouter(prefix="/admin/mediatheque", tags=["Médiathèque Admin"])


def _doc_to_resource(doc: dict) -> dict:
    """Convert MongoDB document to API response."""
    doc["id"] = str(doc.pop("_id"))
    return doc


# --- Public endpoints ---

@router.get("")
async def list_resources(
    type: Optional[ResourceType] = Query(None),
    tag: Optional[str] = Query(None),
):
    """List published media resources, optionally filtered by type or tag."""
    from server import db
    query = {"is_published": True}
    if type:
        query["resource_type"] = type.value
    if tag:
        query["tags"] = tag

    cursor = db.media_resources.find(query).sort([
        ("is_featured", -1),
        ("sort_order", 1),
        ("created_at", -1)
    ])
    resources = []
    async for doc in cursor:
        resources.append(_doc_to_resource(doc))
    return resources


@router.get("/{resource_id}")
async def get_resource(resource_id: str):
    """Get a single published resource by ID."""
    from server import db
    doc = await db.media_resources.find_one({
        "_id": ObjectId(resource_id),
        "is_published": True
    })
    if not doc:
        raise HTTPException(status_code=404, detail="Resource not found")
    return _doc_to_resource(doc)


# --- Admin endpoints ---

@admin_router.get("")
async def admin_list_resources(admin=Depends(require_admin)):
    """List ALL resources (including unpublished) for admin."""
    from server import db
    cursor = db.media_resources.find().sort([("sort_order", 1), ("created_at", -1)])
    resources = []
    async for doc in cursor:
        resources.append(_doc_to_resource(doc))
    return resources


@admin_router.post("", status_code=201)
async def create_resource(resource: MediaResourceCreate, admin=Depends(require_admin)):
    """Create a new media resource."""
    from server import db
    now = datetime.utcnow()
    doc = resource.model_dump()
    doc["created_at"] = now
    doc["updated_at"] = now

    result = await db.media_resources.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _doc_to_resource(doc)


@admin_router.put("/{resource_id}")
async def update_resource(resource_id: str, resource: MediaResourceCreate, admin=Depends(require_admin)):
    """Update an existing media resource."""
    from server import db
    doc = resource.model_dump()
    doc["updated_at"] = datetime.utcnow()

    result = await db.media_resources.find_one_and_update(
        {"_id": ObjectId(resource_id)},
        {"$set": doc},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Resource not found")
    return _doc_to_resource(result)


@admin_router.delete("/{resource_id}")
async def delete_resource(resource_id: str, admin=Depends(require_admin)):
    """Delete a media resource."""
    from server import db
    result = await db.media_resources.delete_one({"_id": ObjectId(resource_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"message": "Resource deleted"}


@admin_router.patch("/{resource_id}/publish")
async def toggle_publish(resource_id: str, admin=Depends(require_admin)):
    """Toggle the is_published status of a resource."""
    from server import db
    doc = await db.media_resources.find_one({"_id": ObjectId(resource_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Resource not found")

    new_status = not doc.get("is_published", False)
    result = await db.media_resources.find_one_and_update(
        {"_id": ObjectId(resource_id)},
        {"$set": {"is_published": new_status, "updated_at": datetime.utcnow()}},
        return_document=True
    )
    return _doc_to_resource(result)
```

**Step 4: Register routes in server.py**

Add to `backend/server.py` imports (~line 17-19):
```python
from routes import mediatheque
```

Add to route registration (~line 126-142):
```python
api_router.include_router(mediatheque.router)
api_router.include_router(mediatheque.admin_router)
```

**Step 5: Run tests to verify they pass**

Run: `cd backend && python -m pytest tests/routes/test_mediatheque.py -p no:recording -v`
Expected: ALL PASS

**Step 6: Run full backend test suite**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: ALL PASS (150+ tests)

**Step 7: Commit**

```bash
git add backend/routes/mediatheque.py backend/server.py backend/tests/routes/test_mediatheque.py
git commit -m "feat(mediatheque): add CRUD routes + tests"
```

---

## Task 3: Upload PDF Endpoint

**Files:**
- Modify: `backend/routes/mediatheque.py` (add upload endpoint)
- Test: `backend/tests/routes/test_mediatheque.py` (add upload test)

**Step 1: Add upload endpoint to mediatheque.py**

```python
# Add to backend/routes/mediatheque.py (admin_router)
import os
import uuid
from fastapi import UploadFile, File

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "media")
ALLOWED_MIME_TYPES = {"application/pdf"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


@admin_router.post("/upload")
async def upload_file(file: UploadFile = File(...), admin=Depends(require_admin)):
    """Upload a PDF file for a media resource."""
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 20 MB)")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "file.pdf")[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(content)

    return {
        "file_url": f"/uploads/media/{filename}",
        "file_name": file.filename,
        "file_size": len(content)
    }
```

**Step 2: Add test for upload**

```python
# Add to backend/tests/routes/test_mediatheque.py
@pytest.mark.asyncio
async def test_upload_pdf_admin():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login = await ac.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
        cookies = login.cookies

        pdf_content = b"%PDF-1.4 fake pdf content"
        response = await ac.post("/api/admin/mediatheque/upload",
            files={"file": ("test.pdf", pdf_content, "application/pdf")},
            cookies=cookies
        )
        assert response.status_code == 200
        data = response.json()
        assert data["file_name"] == "test.pdf"
        assert "file_url" in data
        assert data["file_size"] == len(pdf_content)
```

**Step 3: Run tests**

Run: `cd backend && python -m pytest tests/routes/test_mediatheque.py -p no:recording -v`
Expected: ALL PASS

**Step 4: Commit**

```bash
git add backend/routes/mediatheque.py backend/tests/routes/test_mediatheque.py
git commit -m "feat(mediatheque): add PDF upload endpoint"
```

---

## Task 4: TypeScript Types + API Config

**Files:**
- Create: `frontend/src/types/mediatheque.ts`
- Modify: `frontend/src/config/api.ts` (add MEDIATHEQUE_API constant)

**Step 1: Create TypeScript types**

```typescript
// frontend/src/types/mediatheque.ts
export type ResourceType = 'document' | 'video' | 'livre' | 'outil';

export interface MediaResource {
    id: string;
    resource_type: ResourceType;
    title: string;
    description: string;
    thumbnail_url?: string;
    external_url?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
    tags: string[];
    source?: string;
    author?: string;
    year?: number;
    is_featured: boolean;
    is_published: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export type MediaResourceCreate = Omit<MediaResource, 'id' | 'created_at' | 'updated_at'>;

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
    document: 'Documents',
    video: 'Vidéos',
    livre: 'Livres',
    outil: 'Outils',
};

export const RESOURCE_TYPE_COLORS: Record<ResourceType, { border: string; badge: string; text: string }> = {
    document: { border: 'border-l-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400', text: 'text-emerald-400' },
    video: { border: 'border-l-amber-500', badge: 'bg-amber-500/10 text-amber-400', text: 'text-amber-400' },
    livre: { border: 'border-l-sky-500', badge: 'bg-sky-500/10 text-sky-400', text: 'text-sky-400' },
    outil: { border: 'border-l-violet-500', badge: 'bg-violet-500/10 text-violet-400', text: 'text-violet-400' },
};
```

**Step 2: Add API constant**

Add to `frontend/src/config/api.ts`:
```typescript
export const MEDIATHEQUE_API = `${API_BASE_URL}/mediatheque`;
export const ADMIN_MEDIATHEQUE_API = `${API_BASE_URL}/admin/mediatheque`;
```

**Step 3: Commit**

```bash
git add frontend/src/types/mediatheque.ts frontend/src/config/api.ts
git commit -m "feat(mediatheque): add TypeScript types and API config"
```

---

## Task 5: Page Admin `AdminMediatheque.tsx`

**Files:**
- Create: `frontend/src/pages/AdminMediatheque.tsx`
- Modify: `frontend/src/App.tsx` (add route)

**This is the largest task. Key features:**
- Table listing all resources (published + drafts)
- Filters by type
- Modal with adaptive form (fields change based on resource_type)
- PDF upload via drag-and-drop or file picker
- YouTube URL preview (thumbnail auto-extracted)
- Toggle publish/unpublish
- Delete with confirmation

**Step 1: Create AdminMediatheque.tsx**

Follow the existing pattern from AdminEvents.tsx:
- State: `resources`, `isEditing`, `selectedResource`, `form`, `loading`
- `fetchResources()` → `GET /api/admin/mediatheque`
- `handleSubmit()` → `POST` or `PUT`
- `handleDelete()` → `DELETE`
- `handleTogglePublish()` → `PATCH .../publish`
- Form adaptatif: sélecteur `resource_type` en haut, champs conditionnels en dessous
- Pour les vidéos: champ `external_url` avec preview thumbnail YouTube auto
- Pour les documents: zone upload PDF + affichage file_name/file_size
- Pour les livres: champs `author`, `year`, upload PDF optionnel
- Pour les outils: champ `external_url`
- Champs communs: `title`, `description`, `tags` (input avec virgules), `source`, `year`, `is_featured`

Fonction utilitaire pour extraire l'ID YouTube:
```typescript
function extractYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}
```

**Step 2: Add route in App.tsx**

Add lazy import:
```typescript
const AdminMediatheque = lazy(() => import('./pages/AdminMediatheque').then(m => ({ default: m.AdminMediatheque })));
```

Add route (inside ProtectedRoute admin):
```tsx
<Route path="/admin/mediatheque" element={<AdminMediatheque />} />
```

**Step 3: Add link in admin navigation**

Add "Médiathèque" link in the admin navigation (Header.tsx or admin sidebar, following existing pattern).

**Step 4: Verify**

Run: `cd frontend && npx eslint src/pages/AdminMediatheque.tsx`
Run: `cd frontend && npm run build`
Expected: 0 errors, build success

**Step 5: Commit**

```bash
git add frontend/src/pages/AdminMediatheque.tsx frontend/src/App.tsx
git commit -m "feat(mediatheque): add admin page with adaptive form"
```

---

## Task 6: Page Publique `Resources.tsx` → API

**Files:**
- Modify: `frontend/src/pages/Resources.tsx` (replace static data with API fetch)

**Key changes:**
- Remove static `resources` array (lines 7-64)
- Add `useState` + `useEffect` → `fetch(MEDIATHEQUE_API)`
- Keep existing filter UI (onglets par type)
- Replace card rendering with `ResourceCard` component polymorphe
- Add modale vidéo (réutiliser `YouTubeEmbed` existant)
- Pour les PDF: bouton téléchargement avec taille affichée
- Pour les livres: auteur + année + lien
- Pour les outils: lien externe avec domaine
- Description admin mise en valeur (italique, guillemet amber, stone-200)
- Bordure gauche colorée par type
- Grille responsive 1/2/3 colonnes
- Hover: `-translate-y-0.5` + bordure colorée

**Step 1: Implement ResourceCard component and modify Resources.tsx**

Garder la structure SEO existante (hero, titre "Médiathèque").
Remplacer les données statiques par un fetch.
Ajouter le composant `ResourceCard` inline (ou dans un fichier séparé si > 100 lignes).
Ajouter la modale vidéo avec `<dialog>` + `YouTubeEmbed`.

**Step 2: Verify**

Run: `cd frontend && npx eslint src/pages/Resources.tsx`
Run: `cd frontend && npm run build`
Expected: 0 errors, build success

**Step 3: Test visuel**

Ouvrir http://localhost:5173/ressources et vérifier l'affichage.

**Step 4: Commit**

```bash
git add frontend/src/pages/Resources.tsx
git commit -m "feat(mediatheque): convert Resources page to API-driven with polymorphic cards"
```

---

## Task 7: Enrichissement IA (Claude Haiku)

**Files:**
- Create: `backend/services/ai_enrichment.py`
- Modify: `backend/routes/mediatheque.py` (add `/ai-enrich` endpoint)
- Modify: `backend/core/config.py` (add ANTHROPIC_API_KEY setting)
- Test: `backend/tests/services/test_ai_enrichment.py`

**Step 1: Add config**

Add to `backend/core/config.py`:
```python
ANTHROPIC_API_KEY: str = os.environ.get("ANTHROPIC_API_KEY", "")
```

Add to `backend/.env.example`:
```
ANTHROPIC_API_KEY=
```

**Step 2: Create AI enrichment service**

```python
# backend/services/ai_enrichment.py
"""AI enrichment service for media resources using Claude Haiku."""
import re
import logging
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

# YouTube URL patterns
YT_REGEX = re.compile(
    r'(?:youtube\.com/(?:watch\?v=|embed/)|youtu\.be/)([a-zA-Z0-9_-]{11})'
)


def extract_youtube_id(url: str) -> Optional[str]:
    """Extract YouTube video ID from URL."""
    match = YT_REGEX.search(url)
    return match.group(1) if match else None


async def fetch_youtube_metadata(video_id: str) -> dict:
    """Fetch metadata from YouTube oEmbed (no API key needed)."""
    oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            resp = await client.get(oembed_url)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "title": data.get("title", ""),
                    "author": data.get("author_name", ""),
                    "thumbnail_url": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
                    "source": data.get("author_name", ""),
                }
        except Exception as e:
            logger.warning(f"YouTube oEmbed failed for {video_id}: {e}")
    return {}


async def enrich_with_llm(title: str, content: str, url: str) -> dict:
    """Call Claude Haiku to generate description, tags, and category."""
    from core.config import settings

    if not settings.ANTHROPIC_API_KEY:
        logger.info("ANTHROPIC_API_KEY not set, skipping LLM enrichment")
        return {}

    try:
        from anthropic import AsyncAnthropic
        client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

        prompt = f"""Analyse cette ressource sur la transition écologique et retourne un JSON avec :
- "description_fr": un résumé en français de 2-3 phrases (max 300 caractères)
- "tags": une liste de 3-5 tags thématiques parmi [climat, biodiversité, énergie, alimentation, mobilité, habitat, économie-circulaire, justice-climatique, éducation, culture, gouvernance, coopération]
- "category": la catégorie principale (un seul tag de la liste ci-dessus)

Titre : {title}
URL : {url}
Contenu : {content[:2000]}

Réponds UNIQUEMENT avec le JSON, sans markdown ni commentaire."""

        response = await client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=500,
            temperature=0,
            messages=[{"role": "user", "content": prompt}]
        )

        import json
        text = response.content[0].text.strip()
        # Remove potential markdown wrapping
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(text)

    except Exception as e:
        logger.warning(f"LLM enrichment failed: {e}")
        return {}


async def enrich_url(url: str) -> dict:
    """Main enrichment pipeline: URL → metadata + LLM."""
    result = {"external_url": url}

    # Step 1: Detect type and extract metadata
    youtube_id = extract_youtube_id(url)
    if youtube_id:
        result["resource_type"] = "video"
        yt_meta = await fetch_youtube_metadata(youtube_id)
        result.update(yt_meta)

        # Step 2: LLM enrichment (optional)
        llm = await enrich_with_llm(
            title=result.get("title", ""),
            content=result.get("title", ""),
            url=url
        )
        if llm.get("description_fr"):
            result["ai_description"] = llm["description_fr"]
        if llm.get("tags"):
            result["tags"] = llm["tags"]
    else:
        # Non-YouTube URL: try OpenGraph
        result["resource_type"] = "outil"
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(url, follow_redirects=True)
                if resp.status_code == 200:
                    html = resp.text[:5000]
                    # Extract title from og:title or <title>
                    import re
                    og_title = re.search(r'<meta property="og:title" content="([^"]*)"', html)
                    html_title = re.search(r'<title>([^<]*)</title>', html)
                    if og_title:
                        result["title"] = og_title.group(1)
                    elif html_title:
                        result["title"] = html_title.group(1)

                    og_desc = re.search(r'<meta property="og:description" content="([^"]*)"', html)
                    if og_desc:
                        result["ai_description"] = og_desc.group(1)

                    og_image = re.search(r'<meta property="og:image" content="([^"]*)"', html)
                    if og_image:
                        result["thumbnail_url"] = og_image.group(1)
        except Exception as e:
            logger.warning(f"OpenGraph extraction failed for {url}: {e}")

    return result
```

**Step 3: Add endpoint**

Add to `backend/routes/mediatheque.py`:
```python
from services.ai_enrichment import enrich_url

@admin_router.post("/ai-enrich")
async def ai_enrich(data: dict, admin=Depends(require_admin)):
    """Enrich a URL with AI-extracted metadata."""
    url = data.get("url", "").strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
    result = await enrich_url(url)
    return result
```

**Step 4: Write tests**

```python
# backend/tests/services/test_ai_enrichment.py
import pytest
from services.ai_enrichment import extract_youtube_id

def test_extract_youtube_id_watch():
    assert extract_youtube_id("https://www.youtube.com/watch?v=dQw4w9WgXcQ") == "dQw4w9WgXcQ"

def test_extract_youtube_id_short():
    assert extract_youtube_id("https://youtu.be/dQw4w9WgXcQ") == "dQw4w9WgXcQ"

def test_extract_youtube_id_embed():
    assert extract_youtube_id("https://www.youtube.com/embed/dQw4w9WgXcQ") == "dQw4w9WgXcQ"

def test_extract_youtube_id_invalid():
    assert extract_youtube_id("https://www.google.com") is None

def test_extract_youtube_id_nocookie():
    assert extract_youtube_id("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ") is None
    # Note: nocookie uses embed format, handled differently
```

**Step 5: Run tests**

Run: `cd backend && python -m pytest tests/services/test_ai_enrichment.py -p no:recording -v`
Expected: ALL PASS

**Step 6: Commit**

```bash
git add backend/services/ai_enrichment.py backend/routes/mediatheque.py backend/core/config.py backend/tests/services/test_ai_enrichment.py
git commit -m "feat(mediatheque): add AI enrichment service + endpoint"
```

---

## Task 8: Bouton IA dans le formulaire Admin

**Files:**
- Modify: `frontend/src/pages/AdminMediatheque.tsx`

**Key changes:**
- Ajouter un champ "URL" en haut du formulaire avec un bouton "✨ Enrichir avec l'IA"
- Au clic: `POST /api/admin/mediatheque/ai-enrich` → pré-remplit les champs
- Champs pré-remplis en amber (style distinct `border-amber-500/40`)
- L'admin peut modifier tous les champs avant de sauvegarder
- Spinner pendant l'appel IA
- Fallback silencieux si l'IA échoue (formulaire reste vide)

**Step 1: Add AI enrich button and handler**

```typescript
const handleAiEnrich = async () => {
    if (!aiUrl.trim()) return;
    setAiLoading(true);
    try {
        const res = await fetch(`${ADMIN_MEDIATHEQUE_API}/ai-enrich`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ url: aiUrl }),
        });
        if (res.ok) {
            const data = await res.json();
            setForm(prev => ({
                ...prev,
                resource_type: data.resource_type || prev.resource_type,
                title: data.title || prev.title,
                description: data.ai_description || prev.description,
                external_url: data.external_url || prev.external_url,
                thumbnail_url: data.thumbnail_url || prev.thumbnail_url,
                source: data.source || prev.source,
                tags: data.tags || prev.tags,
            }));
        }
    } catch { /* silently fail */ }
    setAiLoading(false);
};
```

**Step 2: Verify**

Run: `cd frontend && npx eslint src/pages/AdminMediatheque.tsx && npm run build`
Expected: 0 errors

**Step 3: Commit**

```bash
git add frontend/src/pages/AdminMediatheque.tsx
git commit -m "feat(mediatheque): add AI enrichment button in admin form"
```

---

## Task 9: Tests Frontend + Qualité Globale

**Files:**
- Create: `frontend/src/__tests__/Resources.test.tsx`
- Run: full test suites

**Step 1: Write frontend test**

```typescript
// frontend/src/__tests__/Resources.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock fetch
globalThis.fetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
    })
) as unknown as typeof fetch;

describe('Resources page', () => {
    it('renders filter buttons', async () => {
        // Dynamic import to handle lazy loading
        const { Resources } = await import('../pages/Resources');
        render(
            <BrowserRouter>
                <Resources />
            </BrowserRouter>
        );
        expect(screen.getByText('Tous')).toBeDefined();
    });
});
```

**Step 2: Run all quality checks**

```bash
cd frontend && npx eslint .
cd frontend && npx vitest run
cd backend && python -m pytest -p no:recording -q
cd frontend && npm run build
```

Expected: ALL PASS

**Step 3: Commit**

```bash
git add frontend/src/__tests__/Resources.test.tsx
git commit -m "test(mediatheque): add frontend tests for Resources page"
```

---

## Task 10: Documentation + shared-context.md

**Files:**
- Modify: `.agent/memory/shared-context.md` (add decision)
- Verify: all working

**Step 1: Update shared-context.md**

Add to "Décisions Récentes":
```
| 2026-03-16 | Médiathèque CRUD + IA : collection `media_resources` MongoDB, 6 endpoints (2 publics + 4 admin), upload PDF, enrichissement IA optionnel via Claude Haiku (oEmbed YouTube + LLM pour résumé/tags). Admin page avec formulaire adaptatif par type. Resources.tsx converti en API-driven avec cartes polymorphes (bordure colorée par type, modale vidéo, téléchargement PDF). 18 champs dans le modèle. Niveau STANDARD. | Claude Code |
```

**Step 2: Final verification**

```bash
cd frontend && npx eslint . && npx vitest run && npm run build
cd backend && python -m pytest -p no:recording -q
```

**Step 3: Commit all remaining changes**

```bash
git add .agent/memory/shared-context.md
git commit -m "docs(mediatheque): update shared-context with CRUD + IA decision"
```

---

## Ordre d'exécution et dépendances

```
Task 1 (Modèle Pydantic)
    ↓
Task 2 (Routes CRUD) ←── Task 3 (Upload PDF)
    ↓
Task 4 (Types TypeScript)
    ↓
Task 5 (Admin page) ←── Task 8 (Bouton IA)
    ↓
Task 6 (Page publique)
    ↓
Task 7 (Service IA) → Task 8
    ↓
Task 9 (Tests) → Task 10 (Docs)
```

**Parallélisable :** Tasks 1+4 (backend model + frontend types), Tasks 5+7 (admin page + AI service)

**Estimation totale :** ~10h de développement effectif
