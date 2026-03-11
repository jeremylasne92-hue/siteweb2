# Consolidation MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all critical security, robustness, and SEO issues before the March 20 launch.

**Architecture:** Backend security hardening (CAPTCHA, cookies, logging) + frontend auth refactor (cookie-only, no localStorage) + frontend UX additions (ErrorBoundary, 404 page) + SEO meta tags.

**Tech Stack:** FastAPI, httpx, React 19, TypeScript, Vite, Tailwind CSS

---

## Task 1: Clean up 2FA plaintext logging

**Files:**
- Modify: `backend/routes/auth.py:144`
- Modify: `backend/email_service.py:21`

**Step 1: Remove plaintext 2FA code from auth.py**

In `backend/routes/auth.py`, line 144, replace:
```python
logger.info(f"2FA code for {user.email}: {code}")
```
with:
```python
logger.info(f"2FA code sent to {user.email}")
```

**Step 2: Remove plaintext 2FA code from email_service.py**

In `backend/email_service.py`, line 21, replace:
```python
logger.info(f"    {code}")
```
with:
```python
logger.info(f"    [CODE REDACTED]")
```

**Step 3: Run backend tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests pass (no test depends on log content)

**Step 4: Commit**

```bash
git add backend/routes/auth.py backend/email_service.py
git commit -m "sec: remove plaintext 2FA codes from logs"
```

---

## Task 2: Add secure cookie flag with environment detection

**Files:**
- Modify: `backend/core/config.py`
- Modify: `backend/routes/auth.py` (4 occurrences of set_cookie)

**Step 1: Add ENVIRONMENT setting to config.py**

In `backend/core/config.py`, add after line 32 (after `OAUTH_STATE_SECRET`):
```python
    # Environment
    ENVIRONMENT: str = os.environ.get("ENVIRONMENT", "development")

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"
```

**Step 2: Update all 4 set_cookie calls in auth.py**

At the top of `backend/routes/auth.py`, add import:
```python
from core.config import settings
```

Then update each `set_cookie()` call (lines 88-94, 165-171, 236-242, 282-288) to include `secure`:

Pattern — replace every occurrence of:
```python
    response.set_cookie(
        key="session_token",
        value=...,
        httponly=True,
        max_age=7 * 24 * 60 * 60,
        samesite="lax"
    )
```
with:
```python
    response.set_cookie(
        key="session_token",
        value=...,
        httponly=True,
        secure=settings.is_production,
        max_age=7 * 24 * 60 * 60,
        samesite="lax"
    )
```

There are 4 locations:
1. Line ~88 (login-local)
2. Line ~165 (login legacy)
3. Line ~236 (verify-2fa)
4. Line ~282 (google callback)

**Step 3: Run backend tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests pass

**Step 4: Commit**

```bash
git add backend/core/config.py backend/routes/auth.py
git commit -m "sec: add secure flag to session cookies (production-only)"
```

---

## Task 3: Implement server-side reCAPTCHA v3 validation

**Files:**
- Modify: `backend/models.py:45-48` (UserLogin model)
- Modify: `backend/routes/auth.py:100-110` (login endpoint)
- Modify: `backend/core/config.py` (add RECAPTCHA_SECRET_KEY)
- Test: `backend/tests/routes/test_captcha.py` (new)

**Step 1: Write the failing test**

Create `backend/tests/routes/test_captcha.py`:
```python
"""Tests for server-side reCAPTCHA validation on /login endpoint."""
import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi.testclient import TestClient
from server import app
from routes.auth import get_db, get_current_user

mock_db = MagicMock()

# Mock user in DB
mock_user = {
    "id": "user-1",
    "username": "testuser",
    "email": "test@example.com",
    "password_hash": "$2b$12$LJ3m4ys3Lk0TSwHjQF3wLePRkOqXnGPvHQhUKqK6mOmMqPZ2oLbq6",  # "Password1!"
    "role": "user",
    "is_2fa_enabled": False,
    "oauth_provider": None,
    "oauth_id": None,
    "picture": None,
    "totp_secret": None,
    "created_at": "2025-01-01T00:00:00",
    "last_login": None,
}


def setup_mock_db():
    mock_db.users = MagicMock()
    mock_db.users.find_one = AsyncMock(return_value=mock_user)
    mock_db.users.update_one = AsyncMock()
    mock_db.user_sessions = MagicMock()
    mock_db.user_sessions.insert_one = AsyncMock()
    mock_db.rate_limits = MagicMock()
    mock_db.rate_limits.count_documents = AsyncMock(return_value=0)
    mock_db.rate_limits.insert_one = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db


def teardown():
    app.dependency_overrides.clear()


client = TestClient(app)


def test_login_rejects_missing_captcha_token():
    """Login should fail without captcha_token."""
    setup_mock_db()
    try:
        res = client.post("/api/auth/login", json={
            "username": "testuser",
            "password": "Password1!",
        })
        assert res.status_code == 400
        assert "captcha" in res.json()["detail"].lower()
    finally:
        teardown()


@patch("routes.auth.httpx.AsyncClient")
def test_login_rejects_failed_captcha(mock_httpx_class):
    """Login should fail when reCAPTCHA verification fails."""
    setup_mock_db()

    # Mock reCAPTCHA API returning failure
    mock_response = MagicMock()
    mock_response.json.return_value = {"success": False, "score": 0.1}
    mock_client_instance = AsyncMock()
    mock_client_instance.post = AsyncMock(return_value=mock_response)
    mock_client_instance.__aenter__ = AsyncMock(return_value=mock_client_instance)
    mock_client_instance.__aexit__ = AsyncMock(return_value=False)
    mock_httpx_class.return_value = mock_client_instance

    try:
        res = client.post("/api/auth/login", json={
            "username": "testuser",
            "password": "Password1!",
            "captcha_token": "fake-token",
        })
        assert res.status_code == 400
        assert "captcha" in res.json()["detail"].lower()
    finally:
        teardown()


@patch("routes.auth.httpx.AsyncClient")
def test_login_accepts_valid_captcha(mock_httpx_class):
    """Login should succeed when reCAPTCHA verification passes."""
    setup_mock_db()

    # Mock reCAPTCHA API returning success
    mock_response = MagicMock()
    mock_response.json.return_value = {"success": True, "score": 0.9}
    mock_client_instance = AsyncMock()
    mock_client_instance.post = AsyncMock(return_value=mock_response)
    mock_client_instance.__aenter__ = AsyncMock(return_value=mock_client_instance)
    mock_client_instance.__aexit__ = AsyncMock(return_value=False)
    mock_httpx_class.return_value = mock_client_instance

    try:
        res = client.post("/api/auth/login", json={
            "username": "testuser",
            "password": "Password1!",
            "captcha_token": "valid-token",
        })
        # Should not fail on captcha (may fail on password hash mismatch, that's OK)
        assert res.status_code != 400 or "captcha" not in res.json().get("detail", "").lower()
    finally:
        teardown()
```

**Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/routes/test_captcha.py -p no:recording -v`
Expected: FAIL (model still has `captcha_verified: bool`)

**Step 3: Update UserLogin model**

In `backend/models.py`, lines 45-48, replace:
```python
class UserLogin(BaseModel):
    username: str
    password: str
    captcha_verified: bool = False
```
with:
```python
class UserLogin(BaseModel):
    username: str
    password: str
    captcha_token: str = ""
```

**Step 4: Add RECAPTCHA_SECRET_KEY to config**

In `backend/core/config.py`, add after `OAUTH_STATE_SECRET`:
```python
    RECAPTCHA_SECRET_KEY: str = os.environ.get("RECAPTCHA_SECRET_KEY", "")
```

**Step 5: Implement server-side CAPTCHA verification in auth.py**

In `backend/routes/auth.py`, replace lines 100-110 (the login endpoint CAPTCHA section):

Replace:
```python
    # TODO SECURITY: Implement server-side CAPTCHA verification (reCAPTCHA v3)
    # Currently trusts client-side boolean - must validate with Google reCAPTCHA API in production
    if not credentials.captcha_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Captcha verification required"
        )
```
with:
```python
    # Server-side reCAPTCHA v3 verification
    if not credentials.captcha_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Captcha token required"
        )
    recaptcha_secret = settings.RECAPTCHA_SECRET_KEY
    if recaptcha_secret:
        async with httpx.AsyncClient() as client:
            recaptcha_resp = await client.post(
                "https://www.google.com/recaptcha/api/siteverify",
                data={"secret": recaptcha_secret, "response": credentials.captcha_token}
            )
            recaptcha_data = recaptcha_resp.json()
            if not recaptcha_data.get("success") or recaptcha_data.get("score", 0) < 0.5:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Captcha verification failed"
                )
    else:
        logger.warning("RECAPTCHA_SECRET_KEY not set — skipping verification in dev")
```

**Step 6: Run tests**

Run: `cd backend && python -m pytest tests/routes/test_captcha.py -p no:recording -v`
Expected: All 3 tests pass

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests pass

**Step 7: Commit**

```bash
git add backend/models.py backend/core/config.py backend/routes/auth.py backend/tests/routes/test_captcha.py
git commit -m "sec: implement server-side reCAPTCHA v3 validation on /login"
```

---

## Task 4: Migrate frontend auth from localStorage to cookie-only

**Files:**
- Modify: `frontend/src/features/auth/store.ts` (remove localStorage)
- Modify: `frontend/src/pages/AdminDashboard.tsx` (credentials: include)
- Modify: `frontend/src/pages/AdminEvents.tsx` (credentials: include)
- Modify: `frontend/src/pages/AdminPartners.tsx` (credentials: include)
- Modify: `frontend/src/pages/AdminExports.tsx` (credentials: include)
- Modify: `frontend/src/pages/MyPartnerAccount.tsx` (credentials: include)
- Modify: `frontend/src/pages/Serie.tsx` (credentials: include, remove Bearer)
- Modify: `frontend/src/pages/auth/GoogleCallback.tsx` (remove setToken)

**Important discovery:** Admin pages currently use `localStorage.getItem('token')` (key `'token'`) but the store uses `'session_token'` — the admin Bearer headers already send empty strings. Everything works via cookies only. This refactor just makes it explicit and removes dead code.

**Step 1: Rewrite auth store to cookie-only**

Replace entire `frontend/src/features/auth/store.ts`:
```typescript
import { create } from 'zustand';
import { API_URL } from '../../config/api';

interface UserInfo {
    id: string;
    username: string;
    email: string;
    role: string;
    picture: string | null;
}

interface AuthState {
    user: UserInfo | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: UserInfo) => void;
    logout: () => void;
    checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    setUser: (user) => {
        set({ user, isAuthenticated: true });
    },

    logout: () => {
        set({ user: null, isAuthenticated: false });
        fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        }).catch(() => { /* silent */ });
    },

    checkSession: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                credentials: 'include',
            });
            if (res.ok) {
                const user = await res.json();
                set({ user, isAuthenticated: true, isLoading: false });
            } else {
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        } catch {
            set({ isLoading: false });
        }
    },
}));
```

**Step 2: Update GoogleCallback.tsx — remove setToken**

In `frontend/src/pages/auth/GoogleCallback.tsx`, change line 8 from:
```typescript
    const setToken = useAuthStore((state) => state.setToken);
```
to:
```typescript
    const setUser = useAuthStore((state) => state.setUser);
```

And change line 31 from:
```typescript
                    setToken(userData.id);
```
to:
```typescript
                    setUser(userData);
```

Also update the dependency array at line 44 from:
```typescript
    }, [searchParams, navigate, setToken]);
```
to:
```typescript
    }, [searchParams, navigate, setUser]);
```

**Step 3: Update all admin pages — remove Bearer, add credentials: include**

For each of these files, apply the same pattern:

**AdminDashboard.tsx** — Remove line 12 (`const token = ...`), remove `headers: { 'Authorization': ... }`, add `credentials: 'include'`:
```typescript
// Line 12: DELETE the line "const token = localStorage.getItem('token') || '';"
// Line 17-18: Change fetch to:
const res = await fetch(`${PARTNERS_API}/admin/all`, {
    credentials: 'include',
});
// Line 30: Remove [token] dependency, use [] instead
```

**AdminExports.tsx** — Remove line 12 (`const token = ...`), update fetch:
```typescript
// Line 12: DELETE
// Lines 20-22: Change to:
const res = await fetch(`${EPISODES_API}/admin/export-optins`, {
    credentials: 'include',
});
```

**AdminEvents.tsx** — Remove line 45 (`const token = ...`), update all 3 fetch calls:
- Line ~51: Add `credentials: 'include'`, remove `headers: { 'Authorization': ... }`
- Line ~84-87: Add `credentials: 'include'`, keep `'Content-Type': 'application/json'` header only
- Line ~120-121: Add `credentials: 'include'`, remove Authorization header

**AdminPartners.tsx** — Remove line 61 (`const token = ...`), update all 4 fetch calls:
- Line ~74: Add `credentials: 'include'`, remove Authorization header
- Line ~95-98: Add `credentials: 'include'`, remove Authorization header
- Line ~114-117: Add `credentials: 'include'`, keep Content-Type header only
- Line ~136-139: Add `credentials: 'include'`, remove Authorization header

**MyPartnerAccount.tsx** — Remove line 81 (`const token = ...`), update all fetch calls:
- Line ~92: Add `credentials: 'include'`, remove Authorization header
- Line ~168: Add `credentials: 'include'`, keep Content-Type header only

**Serie.tsx** — Change from using store token to credentials only:
- Line ~141: Remove `const token = useAuthStore((s) => s.token);`
- Lines 147-148: Keep `credentials: 'include'`, remove `headers: { 'Authorization': ... }`
- Lines 165-168: Keep `credentials: 'include'`, keep Content-Type, remove Authorization

**Step 4: Run frontend build to check for TypeScript errors**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors (token property removed from store interface)

**Step 5: Run frontend tests**

Run: `cd frontend && npx vitest run`
Expected: All tests pass

**Step 6: Commit**

```bash
git add frontend/src/features/auth/store.ts frontend/src/pages/AdminDashboard.tsx frontend/src/pages/AdminEvents.tsx frontend/src/pages/AdminPartners.tsx frontend/src/pages/AdminExports.tsx frontend/src/pages/MyPartnerAccount.tsx frontend/src/pages/Serie.tsx frontend/src/pages/auth/GoogleCallback.tsx
git commit -m "sec: migrate auth from localStorage to httpOnly cookie-only"
```

---

## Task 5: Add React Error Boundary

**Files:**
- Create: `frontend/src/components/ErrorBoundary.tsx`
- Modify: `frontend/src/App.tsx`

**Step 1: Create ErrorBoundary component**

Create `frontend/src/components/ErrorBoundary.tsx`:
```tsx
import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
                    <AlertTriangle className="h-16 w-16 text-echo-gold mb-6" />
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Une erreur est survenue
                    </h1>
                    <p className="text-echo-textMuted mb-8 max-w-md">
                        Nous sommes desoles, quelque chose s'est mal passe.
                        Veuillez recharger la page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-echo-gold text-echo-darkBg font-semibold rounded-lg hover:bg-echo-gold/90 transition-colors"
                    >
                        Recharger la page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
```

**Step 2: Wrap Routes in App.tsx**

In `frontend/src/App.tsx`, add import:
```typescript
import { ErrorBoundary } from './components/ErrorBoundary';
```

Then wrap `<Suspense>` with `<ErrorBoundary>`:
```tsx
<Layout>
    <ErrorBoundary>
        <Suspense fallback={<RouteLoader />}>
            <Routes>
                {/* ... existing routes ... */}
            </Routes>
        </Suspense>
    </ErrorBoundary>
</Layout>
```

**Step 3: Run frontend build**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add frontend/src/components/ErrorBoundary.tsx frontend/src/App.tsx
git commit -m "feat: add React ErrorBoundary for graceful error handling"
```

---

## Task 6: Add 404 Not Found page

**Files:**
- Create: `frontend/src/pages/NotFound.tsx`
- Modify: `frontend/src/App.tsx`

**Step 1: Create NotFound page**

Create `frontend/src/pages/NotFound.tsx`:
```tsx
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <p className="text-8xl font-bold text-echo-gold mb-4">404</p>
            <h1 className="text-2xl font-bold text-white mb-2">
                Page introuvable
            </h1>
            <p className="text-echo-textMuted mb-8 max-w-md">
                La page que vous recherchez n'existe pas ou a ete deplacee.
            </p>
            <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-echo-gold text-echo-darkBg font-semibold rounded-lg hover:bg-echo-gold/90 transition-colors"
            >
                <Home size={18} />
                Retour a l'accueil
            </Link>
        </div>
    );
}
```

**Step 2: Add catch-all route in App.tsx**

In `frontend/src/App.tsx`, add lazy import:
```typescript
const NotFound = lazy(() => import('./pages/NotFound'));
```

Add catch-all route as last route inside `<Routes>`:
```tsx
<Route path="*" element={<NotFound />} />
```

**Step 3: Run frontend build**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add frontend/src/pages/NotFound.tsx frontend/src/App.tsx
git commit -m "feat: add 404 Not Found page with catch-all route"
```

---

## Task 7: Fix SEO meta tags and HTML lang

**Files:**
- Modify: `frontend/index.html`

**Step 1: Replace index.html content**

Replace the entire `frontend/index.html`:
```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>ECHO — Mouvement citoyen & serie documentaire</title>
    <meta name="description" content="ECHO est un mouvement citoyen ne d'une serie documentaire evenement. Decouvrez la serie, rejoignez le mouvement, soutenez le changement." />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="ECHO — Mouvement citoyen & serie documentaire" />
    <meta property="og:description" content="Decouvrez ECHO, un mouvement citoyen ne d'une serie documentaire evenement." />
    <meta property="og:image" content="/src/assets/logo-echo.jpg" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="ECHO — Mouvement citoyen & serie documentaire" />
    <meta name="twitter:description" content="Decouvrez ECHO, un mouvement citoyen ne d'une serie documentaire evenement." />

    <!-- Favicon -->
    <link rel="icon" type="image/jpeg" href="/src/assets/logo-echo.jpg" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 2: Run frontend build to verify**

Run: `cd frontend && npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add frontend/index.html
git commit -m "seo: add meta tags, Open Graph, lang=fr, and favicon"
```

---

## Task 8: Final verification

**Step 1: Run all backend tests**

Run: `cd backend && python -m pytest -p no:recording -v`
Expected: All tests pass

**Step 2: Run all frontend tests**

Run: `cd frontend && npx vitest run`
Expected: All tests pass

**Step 3: Run production build**

Run: `cd frontend && npm run build`
Expected: Build succeeds without errors

**Step 4: Final commit with updated HANDOFF.md**

Update `HANDOFF.md` to reflect Epic 4 completion and consolidation work done, then commit.

---

## Summary

| Task | Description | Estimated Time |
|------|-------------|---------------|
| 1 | Clean 2FA logs | 5 min |
| 2 | Secure cookie flag | 10 min |
| 3 | Server-side reCAPTCHA | 20 min |
| 4 | Cookie-only auth migration | 30 min |
| 5 | Error Boundary | 10 min |
| 6 | 404 page | 10 min |
| 7 | SEO meta tags | 5 min |
| 8 | Final verification | 10 min |
| **Total** | | **~100 min** |
