# Candidatures Scénaristes — Plan d'Implémentation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permettre aux scénaristes de postuler depuis la page Série, avec gestion admin dans l'interface existante.

**Architecture:** Extension du système `tech_candidatures` existant — ajout du type `"scenariste"`, nouveaux champs `portfolio_url` et `creative_interests`, formulaire dédié sur la page Série, adaptation de l'admin.

**Tech Stack:** FastAPI + Pydantic (backend) / React 19 + TypeScript + Tailwind (frontend) / MongoDB

**Design doc:** `docs/plans/2026-03-13-candidatures-scenaristes-design.md`

---

### Task 1: Backend — Étendre les modèles Pydantic

**Files:**
- Modify: `backend/models.py:156-188`

**Step 1: Modifier `TechCandidature` (ligne 156-167)**

Ajouter `"scenariste"` au Literal et les nouveaux champs :

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
    ip_address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
```

**Step 2: Modifier `TechCandidatureRequest` (ligne 170-176)**

Ajouter `"scenariste"`, les nouveaux champs optionnels + validation URL :

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

Note: ajouter `from pydantic import field_validator` en haut du fichier si pas déjà importé.

**Step 3: Vérifier que les tests existants passent**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: tous les tests passent (les tests existants utilisent `project: "cognisphere"` qui reste valide)

**Step 4: Commit**

```bash
git add backend/models.py
git commit -m "feat: extend TechCandidature model with scenariste type + portfolio_url + creative_interests"
```

---

### Task 2: Backend — Adapter la route de soumission et l'export CSV

**Files:**
- Modify: `backend/routes/candidatures.py:21-65` (soumission)
- Modify: `backend/routes/candidatures.py:68-87` (filtre admin)
- Modify: `backend/routes/candidatures.py:104-142` (export CSV)

**Step 1: Adapter la soumission (ligne 46-63)**

Dans `submit_tech_candidature`, après la construction du `TechCandidature`, ajouter les nouveaux champs :

```python
    candidature = TechCandidature(
        name=data.name,
        email=data.email,
        project=data.project,
        skills=data.skills,
        message=data.message,
        portfolio_url=data.portfolio_url,
        creative_interests=data.creative_interests,
        ip_address=anonymize_ip(client_ip),
    )
```

Adapter le label email (ligne 58) :

```python
    project_labels = {
        "cognisphere": "CogniSphère",
        "echolink": "ECHOLink",
        "scenariste": "Scénariste",
    }
    project_label = project_labels.get(data.project, data.project)
```

Et enrichir le corps de l'email de notification avec les nouveaux champs (si présents) :

```python
    email_body = f"Nom: {data.name}\nEmail: {data.email}\nProjet: {project_label}\nCompétences: {data.skills}"
    if data.portfolio_url:
        email_body += f"\nPortfolio: {data.portfolio_url}"
    if data.creative_interests:
        email_body += f"\nIntérêts créatifs: {data.creative_interests}"
    email_body += f"\n\nMessage:\n{data.message}"
```

**Step 2: Adapter le filtre admin (ligne 77)**

Remplacer :
```python
    if project in ("cognisphere", "echolink"):
```
Par :
```python
    if project in ("cognisphere", "echolink", "scenariste"):
```

**Step 3: Étendre l'export CSV (ligne 118-133)**

Ajouter les colonnes `portfolio_url` et `creative_interests` :

```python
    writer.writerow(["id", "name", "email", "project", "skills", "message", "portfolio_url", "creative_interests", "status", "status_note", "created_at"])
    for c in candidatures:
        created = c.get("created_at", "")
        if hasattr(created, "isoformat"):
            created = created.isoformat()
        writer.writerow([
            c.get("id", ""),
            c.get("name", ""),
            c.get("email", ""),
            c.get("project", ""),
            c.get("skills", ""),
            c.get("message", ""),
            c.get("portfolio_url", ""),
            c.get("creative_interests", ""),
            c.get("status", "pending"),
            c.get("status_note", ""),
            created,
        ])
```

**Step 4: Vérifier les tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: tous passent

**Step 5: Commit**

```bash
git add backend/routes/candidatures.py
git commit -m "feat: support scenariste in candidature submission, admin filter, CSV export"
```

---

### Task 3: Backend — Tests pour candidature scénariste

**Files:**
- Modify: `backend/tests/routes/test_candidatures.py`

**Step 1: Ajouter les données de test scénariste**

Après `VALID_DATA` (ligne 20) :

```python
VALID_SCENARISTE_DATA = {
    "name": "Marie Dupont",
    "email": "marie@example.com",
    "project": "scenariste",
    "skills": "Écriture créative, dramaturgie, dialogue",
    "message": "Je souhaite contribuer à l'écriture de la série ECHO car je partage les valeurs du Mouvement.",
    "website": "",
    "portfolio_url": "https://marie-portfolio.com",
    "creative_interests": "Fiction, Écologie, Philosophie",
}
```

**Step 2: Test de soumission scénariste réussie**

```python
def test_scenariste_candidature_success():
    """POST /candidatures/tech with scenariste project and portfolio_url stores candidature."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    with patch("routes.candidatures.send_email", new_callable=AsyncMock):
        response = client.post("/api/candidatures/tech", json=VALID_SCENARISTE_DATA)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["message"] == "Candidature envoyée avec succès"
    db.tech_candidatures.insert_one.assert_called_once()
    stored = db.tech_candidatures.insert_one.call_args[0][0]
    assert stored["project"] == "scenariste"
    assert stored["portfolio_url"] == "https://marie-portfolio.com"
    assert stored["creative_interests"] == "Fiction, Écologie, Philosophie"
```

**Step 3: Test validation URL portfolio invalide**

```python
def test_scenariste_invalid_portfolio_url():
    """POST /candidatures/tech with javascript: URL returns 422."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    data = {**VALID_SCENARISTE_DATA, "portfolio_url": "javascript:alert(1)"}
    response = client.post("/api/candidatures/tech", json=data)

    app.dependency_overrides.clear()

    assert response.status_code == 422
```

**Step 4: Test scénariste sans portfolio (optionnel)**

```python
def test_scenariste_without_portfolio():
    """POST /candidatures/tech with scenariste and no portfolio_url succeeds."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    data = {**VALID_SCENARISTE_DATA, "portfolio_url": None, "creative_interests": None}

    with patch("routes.candidatures.send_email", new_callable=AsyncMock):
        response = client.post("/api/candidatures/tech", json=data)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["message"] == "Candidature envoyée avec succès"
```

**Step 5: Vérifier que tous les tests passent**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: 12 tests passent (9 existants + 3 nouveaux)

**Step 6: Commit**

```bash
git add backend/tests/routes/test_candidatures.py
git commit -m "test: add scenariste candidature tests (submission, URL validation, optional fields)"
```

---

### Task 4: Frontend — Composant ScenaristApplicationForm

**Files:**
- Create: `frontend/src/components/forms/ScenaristApplicationForm.tsx`

**Step 1: Créer le composant**

Formulaire multi-étapes (4 étapes) inspiré de `TechApplicationForm` :
- Étape 1 : Nom, Email
- Étape 2 : Compétences d'écriture (textarea) + Lien portfolio (input URL, optionnel)
- Étape 3 : Intérêts créatifs (tags cliquables : Fiction, Documentaire, Écologie, Sciences, Philosophie, Société, Technologie, Arts)
- Étape 4 : Motivation (textarea) + Honeypot + RGPD consent

Soumission : `POST /api/candidatures/tech` avec :
```json
{
    "name": "...",
    "email": "...",
    "project": "scenariste",
    "skills": "...",
    "message": "...",
    "website": "",
    "portfolio_url": "...",
    "creative_interests": "Fiction, Écologie"
}
```

**Step 2: Vérifier lint et build**

Run: `cd frontend && npx eslint src/components/forms/ScenaristApplicationForm.tsx`
Run: `cd frontend && npm run build`
Expected: pas d'erreurs

**Step 3: Commit**

```bash
git add frontend/src/components/forms/ScenaristApplicationForm.tsx
git commit -m "feat: add ScenaristApplicationForm component (4-step multi-step form)"
```

---

### Task 5: Frontend — Intégrer le formulaire dans la page Série

**Files:**
- Modify: `frontend/src/pages/Serie.tsx:338-349`

**Step 1: Ajouter l'état de la modale et l'import**

En haut de Serie.tsx, ajouter :
```typescript
import { ScenaristApplicationForm } from '../components/forms/ScenaristApplicationForm';
```

Ajouter un état dans le composant :
```typescript
const [showScenaristForm, setShowScenaristForm] = useState(false);
```

**Step 2: Remplacer le onClick du bouton (ligne 343-348)**

```tsx
<Button
    className="bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#FFD700] hover:shadow-[0_0_24px_rgba(212,175,55,0.6)] px-8 py-4 text-sm font-bold tracking-widest uppercase rounded-lg transition-all transform hover:scale-105"
    onClick={() => setShowScenaristForm(true)}
>
    Rejoindre l'aventure
</Button>
```

**Step 3: Ajouter la modale en fin de composant**

Avant la fermeture `</div>` principale :

```tsx
{showScenaristForm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowScenaristForm(false)}>
        <div
            className="bg-[#121212] border border-[#D4AF37]/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif text-white">Candidature Scénariste</h2>
                <button onClick={() => setShowScenaristForm(false)} className="p-1 text-[#D1D5DB] hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>
            <ScenaristApplicationForm />
        </div>
    </div>
)}
```

Ajouter `X` dans les imports lucide-react.

**Step 4: Vérifier lint et build**

Run: `cd frontend && npx eslint src/pages/Serie.tsx`
Run: `cd frontend && npm run build`
Expected: pas d'erreurs

**Step 5: Commit**

```bash
git add frontend/src/pages/Serie.tsx
git commit -m "feat: integrate ScenaristApplicationForm modal in Serie page"
```

---

### Task 6: Frontend — Adapter AdminCandidatures

**Files:**
- Modify: `frontend/src/pages/AdminCandidatures.tsx`

**Step 1: Étendre les types (ligne 17, 27, 30-33, 187-191)**

Modifier l'interface `TechCandidature` :
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
    ip_address?: string;
    created_at: string;
    updated_at?: string;
}

type ProjectFilter = 'all' | 'cognisphere' | 'echolink' | 'scenariste';
```

Ajouter au `projectConfig` :
```typescript
const projectConfig = {
    cognisphere: { label: 'CogniSphère', color: '#A78BFA', icon: <Brain size={14} /> },
    echolink: { label: 'ECHOLink', color: '#60A5FA', icon: <Share2 size={14} /> },
    scenariste: { label: 'Scénariste', color: '#F59E0B', icon: <PenTool size={14} /> },
};
```

Ajouter `PenTool` aux imports lucide-react.

Ajouter au `projectFilters` :
```typescript
{ key: 'scenariste', label: 'Scénaristes' },
```

**Step 2: Afficher les nouveaux champs dans la modale détail**

Après la section "Compétences" (ligne 452-458), ajouter :

```tsx
{/* Portfolio URL */}
{selected.portfolio_url && (
    <div className="mb-6">
        <h3 className="text-sm font-medium text-white mb-2">Portfolio</h3>
        <a
            href={/^https?:\/\//i.test(selected.portfolio_url) ? selected.portfolio_url : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-echo-gold hover:underline break-all"
        >
            {selected.portfolio_url}
        </a>
    </div>
)}

{/* Creative Interests */}
{selected.creative_interests && (
    <div className="mb-6">
        <h3 className="text-sm font-medium text-white mb-2">Intérêts créatifs</h3>
        <div className="flex flex-wrap gap-2">
            {selected.creative_interests.split(',').map((interest, i) => (
                <span key={i} className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium border border-amber-500/20">
                    {interest.trim()}
                </span>
            ))}
        </div>
    </div>
)}
```

**Step 3: Adapter le mailto (ligne 531)**

```tsx
<a
    href={`mailto:${selected.email}?subject=Candidature ${projectConfig[selected.project]?.label || selected.project} — Mouvement ECHO`}
    className="text-sm text-echo-gold hover:underline"
>
    Répondre par email
</a>
```

**Step 4: Vérifier lint et build**

Run: `cd frontend && npx eslint src/pages/AdminCandidatures.tsx`
Run: `cd frontend && npm run build`
Expected: pas d'erreurs

**Step 5: Commit**

```bash
git add frontend/src/pages/AdminCandidatures.tsx
git commit -m "feat: add scenariste support in AdminCandidatures (filter, portfolio, interests)"
```

---

### Task 7: Vérification finale et mise à jour mémoire

**Step 1: Workflow qualité complet**

```bash
cd frontend && npx eslint .
cd frontend && npx vitest run
cd backend && python -m pytest -p no:recording -q
cd frontend && npm run build
```

Expected: tout passe

**Step 2: Mettre à jour shared-context.md**

- Ajouter une entrée dans "Décisions Récentes"
- Ajouter le niveau dans "Historique des Niveaux"
- Mettre à jour le backlog

**Step 3: Commit final si nécessaire**

```bash
git add .agent/memory/shared-context.md
git commit -m "docs: update shared-context with scenariste candidature feature"
```
