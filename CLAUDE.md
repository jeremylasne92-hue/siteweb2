# CLAUDE.md - Mouvement ECHO Platform

## Project Overview

Full-stack web platform for **Mouvement ECHO**, a French educational web series. Client-server architecture with a React SPA frontend and FastAPI REST API backend using MongoDB.

## Tech Stack

| Layer    | Technology                                                    |
|----------|---------------------------------------------------------------|
| Frontend | React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, React Router 7 |
| Backend  | FastAPI 0.110, Python 3.11+, Motor (async MongoDB), Pydantic 2 |
| Database | MongoDB (async via Motor 3.3)                                 |
| Auth     | PyJWT, bcrypt, passlib, pyotp (2FA TOTP)                      |
| UI       | Framer Motion, Lucide React icons, Leaflet maps               |

## Repository Structure

```
siteweb2/
├── backend/                 # FastAPI backend
│   ├── server.py            # Entry point (FastAPI app, CORS, MongoDB connection)
│   ├── routes/              # API route modules
│   │   ├── auth.py          # Authentication (login, register, 2FA, sessions)
│   │   ├── episodes.py      # Episode CRUD
│   │   ├── partners.py      # Partners system
│   │   ├── progress.py      # Video progress tracking
│   │   ├── resources.py     # Resources & actors CRUD
│   │   ├── thematics.py     # Thematic CRUD
│   │   ├── users.py         # User management (admin)
│   │   └── videos.py        # Video upload/streaming
│   ├── models.py            # Core Pydantic models (User, Episode)
│   ├── models_extended.py   # Extended models (Thematic, Resource, Actor)
│   ├── models_partner.py    # Partner model
│   ├── auth_utils.py        # Password hashing, session tokens, 2FA helpers
│   ├── email_service.py     # Email service (stub)
│   ├── requirements.txt     # Python dependencies (pinned versions)
│   ├── uploads/             # Uploaded files (logos, etc.)
│   └── .env                 # Environment variables (DO NOT COMMIT)
├── frontend/                # React TypeScript SPA
│   ├── src/
│   │   ├── main.tsx         # React entry point
│   │   ├── App.tsx          # Router & route definitions
│   │   ├── index.css        # Tailwind CSS design system tokens
│   │   ├── config/api.ts    # API base URL configuration
│   │   ├── components/
│   │   │   ├── layout/      # Layout, Header, Footer
│   │   │   ├── ui/          # Button, Card, Input, Modal
│   │   │   └── partners/    # Partner-specific components (9 files)
│   │   ├── pages/           # 10 page components (Home, Serie, Cognisphere, etc.)
│   │   └── assets/          # Images, logos
│   ├── package.json         # Node dependencies
│   ├── vite.config.ts       # Vite config
│   ├── tsconfig.json        # TypeScript project references
│   ├── tsconfig.app.json    # App TS config (strict mode)
│   ├── eslint.config.js     # ESLint with TS + React plugins
│   └── postcss.config.js    # PostCSS + Tailwind + autoprefixer
├── docs/                    # Technical documentation
│   ├── architecture.md      # Full architecture reference
│   ├── api-contracts.md     # All 30+ API endpoints documented
│   ├── data-models.md       # Pydantic model schemas
│   └── development-guide.md # Local setup guide
├── .agent/                  # BMAD multi-agent AI config
├── _bmad/                   # BMAD framework (v6.0.2)
├── _bmad-output/            # BMAD generated outputs
└── frontend_backup/         # Old frontend backup (pre-Vite migration)
```

## Quick Start

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Ensure MongoDB is running and .env is configured
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # Dev server (Vite)
npm run build      # Production build (tsc -b && vite build)
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Environment Variables

**Backend (.env):**
- `MONGO_URL` - MongoDB connection string (default: `mongodb://localhost:27017`)
- `DB_NAME` - Database name (default: `test_database`)
- `CORS_ORIGINS` - Comma-separated allowed origins (default: `*`)

**Frontend:**
- `VITE_API_URL` - Backend API URL (default: `http://localhost:8000`)

## Architecture & Patterns

### Backend
- All routes under `/api` prefix via `APIRouter`
- Async everywhere: Motor for MongoDB, async route handlers
- Pydantic models for request/response validation
- Session-based auth: tokens in cookies with Bearer header fallback
- Role-based access control: User, Admin, Partner roles
- MongoDB collections: `users`, `episodes`, `thematics`, `resources`, `actors`, `video_progress`, `user_sessions`, `pending_2fa`, `partners`
- UUID primary keys on all entities, timestamps on all documents
- File uploads served at `/api/uploads/`

### Frontend
- React Router v7 SPA routing (defined in `App.tsx`)
- Tailwind CSS 4 for styling (design tokens in `index.css`)
- Component hierarchy: Layout wraps all pages, reusable UI components in `components/ui/`
- Framer Motion for page transitions and animations
- No global state management library (prop passing)
- `clsx` + `tailwind-merge` for conditional class composition

## Coding Conventions

### File Naming
- React components/pages: **PascalCase** (`PartnersPage.tsx`, `Button.tsx`)
- Python modules: **snake_case** (`auth_utils.py`, `models_extended.py`)
- Config files: **lowercase** (`api.ts`, `vite.config.ts`)

### Frontend
- TypeScript strict mode enabled
- Functional components with typed props interfaces
- `React.forwardRef` for components accepting refs (see `Button.tsx`)
- Spread `...props` for HTML attribute passthrough on UI components
- ESLint enforced: no unused locals/parameters, React Hooks rules

### Backend
- Async `def` for all route handlers
- Pydantic `BaseModel` subclasses for all request/response schemas
- Direct Motor `db["collection"]` access in routes (no ORM/repository layer)
- `logging` module for structured logs

## Code Quality Tools

### Frontend
- **ESLint**: `npm run lint` — TypeScript + React Hooks + React Refresh rules
- **TypeScript**: Strict mode, checked during `npm run build`

### Backend (available but no config files)
- **black**: Code formatter
- **flake8**: Linter
- **mypy**: Type checker
- **isort**: Import sorter
- **pytest**: Test runner

Run backend tests:
```bash
pytest backend_test.py
pytest test_video_progress.py
```

## API Structure

All endpoints prefixed with `/api`. Key route groups:

| Route prefix        | Module          | Description                        |
|---------------------|-----------------|------------------------------------|
| `/api/auth`         | `auth.py`       | Login, register, 2FA, sessions     |
| `/api/episodes`     | `episodes.py`   | Episode CRUD                       |
| `/api/progress`     | `progress.py`   | Video progress tracking            |
| `/api/videos`       | `videos.py`     | Video upload & streaming           |
| `/api/users`        | `users.py`      | User management (admin)            |
| `/api/thematics`    | `thematics.py`  | Thematic categories                |
| `/api/resources`    | `resources.py`  | Resources & actors                 |
| `/api/partners`     | `partners.py`   | Partner directory & management     |

Full endpoint docs: `docs/api-contracts.md`

## Key Documentation

- `docs/architecture.md` — Full architecture reference
- `docs/api-contracts.md` — All API endpoints with request/response examples
- `docs/data-models.md` — Database schema and Pydantic models
- `docs/development-guide.md` — Local development setup
- `docs/deep-dive-auth-securite.md` — Authentication & security details
- `contracts.md` — Condensed API contracts (root)

## Important Notes

- **Language**: The project is in French (UI text, some comments, documentation). Keep new user-facing content in French.
- **No CI/CD pipeline**: No GitHub Actions or similar configured.
- **No frontend tests**: Only backend tests exist (`pytest`). No Jest/Vitest configured.
- **MongoDB required**: Backend will fail without a running MongoDB instance.
- **BMAD framework**: The `.agent/` and `_bmad/` directories contain multi-agent AI orchestration configs — do not modify unless specifically working on agent workflows.
- **frontend_backup/**: Legacy pre-Vite frontend. Reference only, do not develop in it.
