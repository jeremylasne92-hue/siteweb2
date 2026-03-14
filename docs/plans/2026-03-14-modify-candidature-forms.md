# Modifier formulaires candidature — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enrich the tech and scenarist candidature forms with structured skills, experience levels, and a dedicated scenarist endpoint — aligning them with the quality standard of the new VolunteerApplicationForm.

**Architecture:** Keep the single `tech_candidatures` MongoDB collection with `project` field for filtering. Add `experience_level` field to the model. Create a dedicated `POST /candidatures/scenariste` endpoint with scenarist-specific validation. Update both frontend forms with structured checkboxes/tags instead of free-text fields.

**Tech Stack:** FastAPI, Pydantic, MongoDB (Motor), React 19, TypeScript, Tailwind CSS 4

---

## Context for implementer

**Existing code to understand:**
- `backend/models.py:156-203` — `TechCandidature`, `TechCandidatureRequest` models
- `backend/routes/candidatures.py` — All candidature endpoints (POST, GET admin, PUT status, DELETE, export CSV, GET /me)
- `frontend/src/components/forms/TechApplicationForm.tsx` — 3-step form for CogniSphère/ECHOLink
- `frontend/src/components/forms/ScenaristApplicationForm.tsx` — 4-step form, currently posts to wrong endpoint `/candidatures/tech`
- `frontend/src/components/forms/VolunteerApplicationForm.tsx` — Reference pattern (4-step, structured skills, tags)
- `frontend/src/pages/AdminCandidatures.tsx` — Admin page with project/status filters
- `backend/tests/routes/test_candidatures.py` — 11 existing tests

**Key pattern:** The `VolunteerApplicationForm.tsx` is the gold standard — collapsible skill categories, radio cards, tags. Replicate this pattern.

**Current bugs:**
- `ScenaristApplicationForm.tsx:39` posts to `/candidatures/tech` instead of a dedicated endpoint
- `TechCandidature.skills` is free-text `str`, not structured

---

### Task 1: Add experience_level field to backend model

**Files:**
- Modify: `backend/models.py:156-203`

**Step 1: Update TechCandidature model**

In `backend/models.py`, add `experience_level` to `TechCandidature` (line ~163):

```python
class TechCandidature(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    project: Literal["cognisphere", "echolink", "scenariste"]
    skills: str
    message: str
    status: Literal["pending", "entretien", "accepted", "rejected"] = "pending"
    status_note: Optional[str] = None
    portfolio_url: Optional[str] = None
    creative_interests: Optional[str] = None
    experience_level: Optional[str] = None  # NEW
    ip_address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
```

**Step 2: Update TechCandidatureRequest model**

Add `experience_level` to `TechCandidatureRequest` (line ~172):

```python
class TechCandidatureRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    project: Literal["cognisphere", "echolink", "scenariste"]
    skills: str = Field(min_length=2, max_length=500)
    message: str = Field(min_length=10, max_length=2000)
    website: str = ""  # honeypot field
    portfolio_url: Optional[str] = Field(None, max_length=500)
    creative_interests: Optional[str] = Field(None, max_length=500)
    experience_level: Optional[Literal["professional", "student", "self_taught", "motivated"]] = None  # NEW

    @field_validator("portfolio_url")
    @classmethod
    def validate_portfolio_url(cls, v):
        if v is None or v == "":
            return v
        from urllib.parse import urlparse
        parsed = urlparse(v)
        if parsed.scheme not in ("http", "https"):
            raise ValueError("L'URL doit commencer par http:// ou https://")
        return v
```

**Step 3: Update the route handler to pass experience_level**

In `backend/routes/candidatures.py:48-58`, add `experience_level` to the `TechCandidature()` creation:

```python
    candidature = TechCandidature(
        name=data.name,
        email=data.email,
        project=data.project,
        skills=data.skills,
        message=data.message,
        portfolio_url=data.portfolio_url,
        creative_interests=data.creative_interests,
        experience_level=data.experience_level,  # NEW
        ip_address=anonymize_ip(client_ip),
    )
```

**Step 4: Update CSV export to include experience_level**

In `backend/routes/candidatures.py:131`, add `experience_level` to the CSV header and row:

Header:
```python
writer.writerow(["id", "name", "email", "project", "skills", "message", "portfolio_url", "creative_interests", "experience_level", "status", "status_note", "created_at"])
```

Row (add after `creative_interests`):
```python
            c.get("experience_level", ""),
```

**Step 5: Run backend tests**

Run: `cd backend && python -m pytest -p no:recording tests/routes/test_candidatures.py -v`
Expected: All 11 tests PASS (new field is optional, backward compatible)

**Step 6: Commit**

```bash
git add backend/models.py backend/routes/candidatures.py
git commit -m "feat: add experience_level field to candidature model"
```

---

### Task 2: Create dedicated scenariste endpoint

**Files:**
- Modify: `backend/routes/candidatures.py`
- Modify: `backend/tests/routes/test_candidatures.py`

**Step 1: Add POST /scenariste endpoint**

In `backend/routes/candidatures.py`, add after the existing `POST /tech` handler (after line 78):

```python
@router.post("/scenariste")
async def submit_scenariste_candidature(
    data: TechCandidatureRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Submit a scenarist candidature (public, anti-spam protected)"""
    # Force project to scenariste regardless of input
    data_dict = data.model_dump()
    data_dict["project"] = "scenariste"

    client_ip = request.client.host if request.client else "unknown"

    # Anti-spam: honeypot check
    if data.website:
        logger.info(f"Honeypot triggered from {client_ip}")
        return {"message": "Candidature envoyée avec succès"}

    # Anti-spam: rate limiting
    window_start = datetime.utcnow() - timedelta(hours=RATE_LIMIT_WINDOW_HOURS)
    recent_count = await db.tech_candidatures.count_documents({
        "ip_address": client_ip,
        "created_at": {"$gte": window_start}
    })
    if recent_count >= RATE_LIMIT_MAX:
        logger.warning(f"Rate limit exceeded for {client_ip}")
        return {"message": "Trop de soumissions récentes. Réessayez plus tard.", "rate_limited": True}

    candidature = TechCandidature(
        name=data.name,
        email=data.email,
        project="scenariste",
        skills=data.skills,
        message=data.message,
        portfolio_url=data.portfolio_url,
        creative_interests=data.creative_interests,
        experience_level=data.experience_level,
        ip_address=anonymize_ip(client_ip),
    )
    await db.tech_candidatures.insert_one(candidature.model_dump())
    logger.info(f"New scenarist candidature from {data.name}")

    email_body = f"Nom: {data.name}\nEmail: {data.email}\nProjet: Scénariste\nCompétences: {data.skills}"
    if data.portfolio_url:
        email_body += f"\nPortfolio: {data.portfolio_url}"
    if data.creative_interests:
        email_body += f"\nIntérêts créatifs: {data.creative_interests}"
    email_body += f"\n\nMessage:\n{data.message}"
    background_tasks.add_task(
        send_email,
        "mouvement.echo.france@gmail.com",
        "Nouvelle candidature — Scénariste",
        email_body,
    )
    background_tasks.add_task(send_candidature_confirmation, data.email, data.name, "scenariste")

    return {"message": "Candidature envoyée avec succès"}
```

**Step 2: Add test for scenariste endpoint**

In `backend/tests/routes/test_candidatures.py`, add:

```python
def test_scenariste_dedicated_endpoint():
    """POST /candidatures/scenariste stores candidature with project=scenariste."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    data = {
        "name": "Marie Dupont",
        "email": "marie@example.com",
        "project": "scenariste",
        "skills": "Écriture créative, dramaturgie",
        "message": "Je souhaite contribuer à l'écriture de la série ECHO.",
        "website": "",
        "portfolio_url": "https://marie-portfolio.com",
        "creative_interests": "Fiction, Écologie",
        "experience_level": "professional",
    }

    with patch("routes.candidatures.send_email", new_callable=AsyncMock):
        response = client.post("/api/candidatures/scenariste", json=data)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["message"] == "Candidature envoyée avec succès"
    db.tech_candidatures.insert_one.assert_called_once()
    stored = db.tech_candidatures.insert_one.call_args[0][0]
    assert stored["project"] == "scenariste"
    assert stored["experience_level"] == "professional"
```

**Step 3: Run tests**

Run: `cd backend && python -m pytest -p no:recording tests/routes/test_candidatures.py -v`
Expected: All tests PASS (12 total now)

**Step 4: Commit**

```bash
git add backend/routes/candidatures.py backend/tests/routes/test_candidatures.py
git commit -m "feat: add dedicated POST /candidatures/scenariste endpoint"
```

---

### Task 3: Enrich TechApplicationForm frontend

**Files:**
- Modify: `frontend/src/components/forms/TechApplicationForm.tsx`

**Step 1: Rewrite TechApplicationForm with structured skills**

Replace the entire content of `frontend/src/components/forms/TechApplicationForm.tsx`:

```tsx
import { useState, useRef } from 'react';
import { Send, CheckCircle, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StepProgress } from '../ui/StepProgress';
import { API_URL } from '../../config/api';

interface TechApplicationFormProps {
    project: 'cognisphere' | 'echolink';
    accentColor: string;
    accentHex: string;
}

const SKILL_CATEGORIES: Record<string, Record<string, string[]>> = {
    cognisphere: {
        'Développement': ['React / Next.js', 'TypeScript', 'Python', 'Node.js', 'Base de données', 'DevOps / CI-CD'],
        'IA & Data': ['Machine Learning', 'NLP', 'Data Engineering', 'Prompt Engineering', 'Agents IA'],
        'Design & UX': ['UI Design', 'UX Research', 'Design System', 'Accessibilité', 'Prototypage'],
        'Gestion de projet': ['Agile / Scrum', 'Documentation technique', 'Tests & QA'],
    },
    echolink: {
        'Développement': ['React / Next.js', 'TypeScript', 'Python', 'Node.js', 'API REST', 'WebSockets'],
        'Infrastructure': ['Architecture cloud', 'Base de données', 'DevOps / CI-CD', 'Automatisation'],
        'Design & UX': ['UI Design', 'UX Research', 'Design System', 'Accessibilité'],
        'Gestion de projet': ['Agile / Scrum', 'Documentation technique', 'Tests & QA'],
    },
};

const EXPERIENCE_LEVELS = [
    { value: 'professional', label: 'Professionnel', desc: 'Expérience en entreprise ou freelance' },
    { value: 'student', label: 'Étudiant·e', desc: 'En formation ou récemment diplômé·e' },
    { value: 'self_taught', label: 'Autodidacte', desc: 'Apprentissage personnel, projets perso' },
    { value: 'motivated', label: 'Motivé·e sans expérience', desc: 'Prêt·e à apprendre et contribuer' },
];

export function TechApplicationForm({ project, accentHex }: TechApplicationFormProps) {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    const [consentRGPD, setConsentRGPD] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [experienceLevel, setExperienceLevel] = useState('');
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const categories = SKILL_CATEGORIES[project] || SKILL_CATEGORIES.cognisphere;

    const toggleSkill = (skill: string) => {
        setSelectedSkills(prev =>
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const res = await fetch(`${API_URL}/candidatures/tech`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    skills: selectedSkills.join(', '),
                    message: formData.get('message'),
                    project,
                    website: formData.get('website') || '',
                    portfolio_url: formData.get('portfolio_url') || null,
                    experience_level: experienceLevel || null,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.rate_limited) {
                    setError('Trop de soumissions récentes. Réessayez plus tard.');
                } else {
                    setSubmitted(true);
                }
            } else {
                setError('Une erreur est survenue. Veuillez réessayer.');
            }
        } catch {
            setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
        }
        setLoading(false);
    };

    const handleNext = () => {
        const form = formRef.current;
        if (!form) return;

        if (step === 1) {
            const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
            const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
            if (!nameInput?.checkValidity()) { nameInput?.reportValidity(); return; }
            if (!emailInput?.checkValidity()) { emailInput?.reportValidity(); return; }
        }
        if (step === 2) {
            if (selectedSkills.length === 0) {
                setError('Sélectionnez au moins une compétence.');
                return;
            }
            if (!experienceLevel) {
                setError('Sélectionnez votre niveau d\'expérience.');
                return;
            }
            setError('');
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${accentHex}20` }}>
                    <CheckCircle className="w-8 h-8" style={{ color: accentHex }} />
                </div>
                <h3 className="text-2xl font-serif text-white mb-3">Candidature envoyée !</h3>
                <p className="text-neutral-400 max-w-md">
                    Merci pour votre intérêt. Notre équipe examinera votre profil et vous contactera prochainement.
                </p>
            </div>
        );
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <StepProgress currentStep={step} totalSteps={3} labels={['Identité', 'Compétences', 'Motivation']} />

            {/* Step 1: Identity */}
            <div className={`space-y-5 flex flex-col ${step !== 1 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div className="grid grid-cols-1 gap-5">
                    <Input label="Nom complet" name="name" placeholder="Votre prénom et nom" required minLength={2} maxLength={100} />
                    <Input label="Email de contact" name="email" type="email" placeholder="votre@email.com" required />
                    <Input label="Portfolio / GitHub (optionnel)" name="portfolio_url" type="url" placeholder="https://github.com/votre-profil" />
                </div>
                <div className="text-sm text-neutral-400 p-4 border border-white/5 rounded-md bg-white/5 mt-2">
                    Votre adresse email sera utilisée pour vous recontacter concernant votre candidature pour contribuer à <strong>{project === 'cognisphere' ? 'CogniSphère' : 'ECHOLink'}</strong>.
                </div>
            </div>

            {/* Step 2: Skills + Experience */}
            <div className={`space-y-5 ${step !== 2 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-3">Compétences techniques</label>
                    <div className="space-y-2">
                        {Object.entries(categories).map(([category, skills]) => (
                            <div key={category} className="border border-white/10 rounded-lg overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <span className="text-sm font-medium text-white">
                                        {category}
                                        {selectedSkills.filter(s => skills.includes(s)).length > 0 && (
                                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accentHex}30`, color: accentHex }}>
                                                {selectedSkills.filter(s => skills.includes(s)).length}
                                            </span>
                                        )}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${expandedCategory === category ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedCategory === category && (
                                    <div className="p-3 flex flex-wrap gap-2">
                                        {skills.map(skill => (
                                            <button
                                                key={skill}
                                                type="button"
                                                onClick={() => toggleSkill(skill)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                                                    selectedSkills.includes(skill)
                                                        ? 'border-transparent text-white'
                                                        : 'bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10 hover:text-white'
                                                }`}
                                                style={selectedSkills.includes(skill) ? { backgroundColor: `${accentHex}30`, color: accentHex, borderColor: `${accentHex}50` } : {}}
                                            >
                                                {skill}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-3">Niveau d'expérience</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {EXPERIENCE_LEVELS.map(level => (
                            <button
                                key={level.value}
                                type="button"
                                onClick={() => setExperienceLevel(level.value)}
                                className={`p-3 rounded-lg border text-left transition-all ${
                                    experienceLevel === level.value
                                        ? 'border-transparent'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                                }`}
                                style={experienceLevel === level.value ? { backgroundColor: `${accentHex}15`, borderColor: `${accentHex}50` } : {}}
                            >
                                <span className={`text-sm font-medium ${experienceLevel === level.value ? '' : 'text-white'}`} style={experienceLevel === level.value ? { color: accentHex } : {}}>
                                    {level.label}
                                </span>
                                <p className="text-xs text-neutral-500 mt-0.5">{level.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20">{error}</p>
                )}
            </div>

            {/* Step 3: Motivation */}
            <div className={`space-y-5 ${step !== 3 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Lettre de motivation rapide</label>
                    <textarea
                        name="message"
                        className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 text-sm resize-y min-h-[140px]"
                        placeholder={`Pourquoi souhaitez-vous intégrer l'équipe de développement de ${project === 'cognisphere' ? 'CogniSphère' : 'ECHOLink'} ?`}
                        required
                        minLength={10}
                        maxLength={2000}
                    />
                </div>

                {/* Honeypot */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20">{error}</p>
                )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t border-white/10 mt-6 md:flex-row flex-col-reverse gap-3">
                {step > 1 ? (
                    <Button type="button" variant="outline" onClick={handleBack} disabled={loading} className="md:w-auto w-full">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
                    </Button>
                ) : <div className="hidden md:block"></div>}

                {step < 3 ? (
                    <Button type="button" onClick={handleNext} className="md:w-auto w-full">
                        Suivant <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <div className="flex flex-col items-stretch sm:items-end gap-3 w-full sm:w-auto">
                        <label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={consentRGPD}
                                onChange={(e) => setConsentRGPD(e.target.checked)}
                                className="mt-1 accent-echo-gold shrink-0"
                                required
                            />
                            <span>
                                J'accepte que mes données soient traitées conformément à la{' '}
                                <a href="/politique-de-confidentialite" target="_blank" rel="noopener noreferrer"
                                   className="hover:underline" style={{ color: accentHex }}>
                                    politique de confidentialité
                                </a>.
                            </span>
                        </label>
                        <Button
                            variant="primary"
                            className="flex items-center justify-center gap-2 hover:opacity-90 md:w-auto w-full"
                            style={{ backgroundColor: accentHex }}
                            disabled={loading || !consentRGPD}
                        >
                            {loading ? 'Envoi...' : 'Soumettre'} <Send className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </form>
    );
}
```

**Step 2: Run frontend build to verify**

Run: `cd frontend && npx eslint src/components/forms/TechApplicationForm.tsx && npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add frontend/src/components/forms/TechApplicationForm.tsx
git commit -m "feat: enrich TechApplicationForm with structured skills and experience level"
```

---

### Task 4: Enrich ScenaristApplicationForm frontend

**Files:**
- Modify: `frontend/src/components/forms/ScenaristApplicationForm.tsx`

**Step 1: Rewrite ScenaristApplicationForm with structured genres and dedicated endpoint**

Replace the entire content of `frontend/src/components/forms/ScenaristApplicationForm.tsx`:

```tsx
import { useState, useRef } from 'react';
import { Send, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StepProgress } from '../ui/StepProgress';
import { API_URL } from '../../config/api';

const WRITING_GENRES = [
    'Scénario', 'Fiction', 'Documentaire', 'Poésie',
    'Narration', 'Dialogue', 'Dramaturgie', 'Analyse littéraire',
];

const INTEREST_TAGS = [
    'Écologie', 'Sciences', 'Philosophie', 'Société',
    'Technologie', 'Arts', 'Politique', 'Spiritualité',
];

const EXPERIENCE_LEVELS = [
    { value: 'professional', label: 'Professionnel·le', desc: 'Publication, production ou commande professionnelle' },
    { value: 'student', label: 'Étudiant·e', desc: 'En formation écriture, lettres ou cinéma' },
    { value: 'self_taught', label: 'Autodidacte', desc: 'Écriture régulière, ateliers, projets personnels' },
    { value: 'motivated', label: 'Passionné·e', desc: 'Envie de se lancer dans l\'écriture' },
];

const accentHex = '#D4AF37';

export function ScenaristApplicationForm() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    const [consentRGPD, setConsentRGPD] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [experienceLevel, setExperienceLevel] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

    const toggleTag = (tag: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(list.includes(tag) ? list.filter(t => t !== tag) : [...list, tag]);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const res = await fetch(`${API_URL}/candidatures/scenariste`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    skills: selectedGenres.join(', '),
                    message: formData.get('message'),
                    project: 'scenariste',
                    website: formData.get('website') || '',
                    portfolio_url: formData.get('portfolio_url') || null,
                    creative_interests: selectedInterests.length > 0 ? selectedInterests.join(', ') : null,
                    experience_level: experienceLevel || null,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.rate_limited) {
                    setError('Trop de soumissions récentes. Réessayez plus tard.');
                } else {
                    setSubmitted(true);
                }
            } else {
                setError('Une erreur est survenue. Veuillez réessayer.');
            }
        } catch {
            setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
        }
        setLoading(false);
    };

    const handleNext = () => {
        const form = formRef.current;
        if (!form) return;

        if (step === 1) {
            const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
            const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
            if (!nameInput?.checkValidity()) { nameInput?.reportValidity(); return; }
            if (!emailInput?.checkValidity()) { emailInput?.reportValidity(); return; }
        }
        if (step === 2) {
            if (selectedGenres.length === 0) {
                setError('Sélectionnez au moins un genre d\'écriture.');
                return;
            }
            if (!experienceLevel) {
                setError('Sélectionnez votre niveau d\'expérience.');
                return;
            }
            setError('');
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${accentHex}20` }}>
                    <CheckCircle className="w-8 h-8" style={{ color: accentHex }} />
                </div>
                <h3 className="text-2xl font-serif text-white mb-3">Candidature envoyée !</h3>
                <p className="text-neutral-400 max-w-md">
                    Merci pour votre intérêt. Notre équipe examinera votre profil créatif et vous contactera prochainement.
                </p>
            </div>
        );
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <StepProgress currentStep={step} totalSteps={4} labels={['Identité', 'Profil créatif', 'Thématiques', 'Motivation']} />

            {/* Step 1: Identity */}
            <div className={`space-y-5 flex flex-col ${step !== 1 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div className="grid grid-cols-1 gap-5">
                    <Input label="Nom complet" name="name" placeholder="Votre prénom et nom" required minLength={2} maxLength={100} />
                    <Input label="Email de contact" name="email" type="email" placeholder="votre@email.com" required />
                    <Input label="Portfolio / travaux en ligne (optionnel)" name="portfolio_url" type="url" placeholder="https://votre-site.com, Wattpad, blog..." />
                </div>
                <div className="text-sm text-neutral-400 p-4 border border-white/5 rounded-md bg-white/5 mt-2">
                    Votre adresse email sera utilisée pour vous recontacter concernant votre candidature comme <strong>scénariste</strong> pour la série ECHO.
                </div>
            </div>

            {/* Step 2: Creative Profile — Genres + Experience */}
            <div className={`space-y-5 ${step !== 2 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-3">Genres d'écriture</label>
                    <div className="flex flex-wrap gap-2">
                        {WRITING_GENRES.map(genre => (
                            <button
                                key={genre}
                                type="button"
                                onClick={() => toggleTag(genre, selectedGenres, setSelectedGenres)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                                    selectedGenres.includes(genre)
                                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                        : 'bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">Sélectionnez un ou plusieurs genres.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-3">Niveau d'expérience</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {EXPERIENCE_LEVELS.map(level => (
                            <button
                                key={level.value}
                                type="button"
                                onClick={() => setExperienceLevel(level.value)}
                                className={`p-3 rounded-lg border text-left transition-all ${
                                    experienceLevel === level.value
                                        ? 'bg-amber-500/15 border-amber-500/50'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                                }`}
                            >
                                <span className={`text-sm font-medium ${experienceLevel === level.value ? 'text-amber-400' : 'text-white'}`}>
                                    {level.label}
                                </span>
                                <p className="text-xs text-neutral-500 mt-0.5">{level.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20">{error}</p>
                )}
            </div>

            {/* Step 3: Thematic Interests */}
            <div className={`space-y-5 ${step !== 3 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-3">Quelles thématiques vous passionnent ?</label>
                    <div className="flex flex-wrap gap-2">
                        {INTEREST_TAGS.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag, selectedInterests, setSelectedInterests)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                                    selectedInterests.includes(tag)
                                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                        : 'bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">Sélectionnez une ou plusieurs thématiques (optionnel).</p>
                </div>
            </div>

            {/* Step 4: Motivation */}
            <div className={`space-y-5 ${step !== 4 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Votre motivation</label>
                    <textarea
                        name="message"
                        className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 text-sm resize-y min-h-[140px]"
                        placeholder="Pourquoi souhaitez-vous participer à l'écriture de la série ECHO ? Que souhaitez-vous apporter au Mouvement ?"
                        required
                        minLength={10}
                        maxLength={2000}
                    />
                </div>

                {/* Honeypot */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20">{error}</p>
                )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t border-white/10 mt-6 md:flex-row flex-col-reverse gap-3">
                {step > 1 ? (
                    <Button type="button" variant="outline" onClick={handleBack} disabled={loading} className="md:w-auto w-full">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
                    </Button>
                ) : <div className="hidden md:block"></div>}

                {step < 4 ? (
                    <Button type="button" onClick={handleNext} className="md:w-auto w-full">
                        Suivant <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <div className="flex flex-col items-stretch sm:items-end gap-3 w-full sm:w-auto">
                        <label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={consentRGPD}
                                onChange={(e) => setConsentRGPD(e.target.checked)}
                                className="mt-1 accent-echo-gold shrink-0"
                                required
                            />
                            <span>
                                J'accepte que mes données soient traitées conformément à la{' '}
                                <a href="/politique-de-confidentialite" target="_blank" rel="noopener noreferrer"
                                   className="text-echo-gold hover:underline">
                                    politique de confidentialité
                                </a>.
                            </span>
                        </label>
                        <Button
                            variant="primary"
                            className="flex items-center justify-center gap-2 hover:opacity-90 md:w-auto w-full"
                            style={{ backgroundColor: accentHex }}
                            disabled={loading || !consentRGPD}
                        >
                            {loading ? 'Envoi...' : 'Soumettre'} <Send className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </form>
    );
}
```

**Step 2: Run frontend build to verify**

Run: `cd frontend && npx eslint src/components/forms/ScenaristApplicationForm.tsx && npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add frontend/src/components/forms/ScenaristApplicationForm.tsx
git commit -m "feat: enrich ScenaristApplicationForm with genres, experience level, and fix endpoint"
```

---

### Task 5: Update AdminCandidatures to display new fields

**Files:**
- Modify: `frontend/src/pages/AdminCandidatures.tsx`

**Step 1: Add experience_level to TechCandidature interface and detail modal**

In `AdminCandidatures.tsx`, add `experience_level` to the `TechCandidature` interface (line ~13):

```typescript
interface TechCandidature {
    id: string;
    name: string;
    email: string;
    project: 'cognisphere' | 'echolink' | 'scenariste';
    skills: string;
    message: string;
    status: CandidatureStatus;
    status_note?: string;
    portfolio_url?: string;
    creative_interests?: string;
    experience_level?: string;  // NEW
    ip_address?: string;
    created_at: string;
    updated_at?: string;
}
```

**Step 2: Add experience level labels map and display in detail modal**

Find the detail modal section that shows `portfolio_url` and `creative_interests` and add experience_level display alongside. Add this constant near the `projectConfig`:

```typescript
const experienceLabelMap: Record<string, string> = {
    professional: 'Professionnel',
    student: 'Étudiant·e',
    self_taught: 'Autodidacte',
    motivated: 'Motivé·e',
};
```

In the detail modal, add after the existing `creative_interests` display:

```tsx
{selected.experience_level && (
    <div>
        <h4 className="text-sm font-medium text-neutral-400 mb-1">Niveau d'expérience</h4>
        <p className="text-white text-sm">{experienceLabelMap[selected.experience_level] || selected.experience_level}</p>
    </div>
)}
```

**Step 3: Run build to verify**

Run: `cd frontend && npm run build`
Expected: No errors

**Step 4: Commit**

```bash
git add frontend/src/pages/AdminCandidatures.tsx
git commit -m "feat: display experience_level in admin candidatures detail"
```

---

### Task 6: Run full test suite and verify

**Step 1: Run backend tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests pass

**Step 2: Run frontend lint**

Run: `cd frontend && npx eslint .`
Expected: No errors

**Step 3: Run frontend build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

**Step 4: Commit any fixes if needed, then update backlog**

Update `.agent/memory/shared-context.md` to mark task #10 as Done:
```
| 10 | ~~Modifier formulaires candidature~~ | Moyenne | ✅ Done (TechForm enrichi compétences structurées + expérience, ScenaristForm genres/expérience + endpoint dédié) |
```

```bash
git add .agent/memory/shared-context.md
git commit -m "chore: mark task #10 as done in backlog"
```
