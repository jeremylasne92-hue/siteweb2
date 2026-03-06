# Story 2.3: Candidatures Techniques Anti-Spam

Status: done

## Story

As a Développeur engagé,
I want pouvoir postuler pour rejoindre les équipes techniques de CogniSphère ou ECHOLink,
So that contribuer au développement de ces outils open-source.

## Acceptance Criteria

1. **Given** Je suis sur la page CogniSphère ou ECHOLink **When** Je remplis le formulaire de candidature technique complet **Then** Le système effectue une vérification anti-spam silencieuse (honeypot + rate limit).
2. **And** Une fois soumis et validé en Backend, l'équipe interne ECHO reçoit une notification email.

## Tasks / Subtasks

### Backend

- [x] Task 1: Modèle TechCandidature + TechCandidatureRequest (models.py)
- [x] Task 2: Route POST /candidatures/tech avec anti-spam (candidatures.py)
  - [x] 2.1: Honeypot silencieux (champ website)
  - [x] 2.2: Rate limiting (3/heure par IP via MongoDB)
  - [x] 2.3: Validation Pydantic (nom 2-100, email, message 10-2000)
- [x] Task 3: Enregistrer routeur candidatures dans server.py
- [x] Task 4: Notification email équipe via email_service.send_email()

### Frontend

- [x] Task 5: Composant partagé TechApplicationForm (components/forms/)
  - [x] 5.1: Champs nom, email, compétences, motivation
  - [x] 5.2: Honeypot caché (input website, display:none, tabIndex:-1)
  - [x] 5.3: Feedback succès "Candidature envoyée !"
  - [x] 5.4: Gestion erreur rate limiting
- [x] Task 6: Intégration Cognisphere.tsx (section #candidature)
- [x] Task 7: Intégration ECHOLink.tsx (section #candidature)
- [x] Task 8: CTAs hero redirigent vers #candidature (plus vers /contact)

### Tests

- [x] Task 9: 5 tests backend (succès, honeypot, rate limit, validation nom, validation message)
- [x] Task 10: 3 tests frontend (formulaire visible, honeypot caché, bouton présent)

## Dev Notes

### Anti-spam strategy

- **Honeypot** : champ `website` invisible (position absolute, left -9999px, opacity 0). Les bots remplissent les champs masqués → rejet silencieux (retour 200 pour ne pas informer le bot).
- **Rate limiting** : max 3 soumissions par IP par heure. Vérification via `count_documents` sur `tech_candidatures` avec filtre `created_at >= now - 1h`.
- **Validation** : Pydantic Field avec min_length/max_length + EmailStr.

### Conventions

- Composant `TechApplicationForm` partagé entre Cognisphere et ECHOLink (props: project, accentColor, accentHex)
- Collection MongoDB: `tech_candidatures`
- Email notification: via `email_service.send_email()` (stub en dev, SendGrid en prod)

## Dev Agent Record

### Agent Model Used

- **All tasks**: Claude Code (Opus 4.6)

### Debug Log References

- Backend tests: 5/5 passed (pytest)
- Frontend tests: 14/14 passed (vitest) — 5 AuthPrompt + 6 Serie + 3 Cognisphere
- Frontend build: OK (vite build)

### Code Review (3 correctifs)

1. **`models.py`** : `project: str` → `project: Literal["cognisphere", "echolink"]` — validation Pydantic automatique (422) au lieu d'un check manuel retournant 200
2. **`candidatures.py`** : `.dict()` → `.model_dump()` — supprime le warning Pydantic V2 deprecated
3. **`TechApplicationForm.tsx`** : suppression de `focusRingColor` (CSS invalide) et de `bg-${accentColor}` (Tailwind JIT incompatible, overridé par style inline)

### Completion Notes List

- Formulaires de candidature technique intégrés sur Cognisphere et ECHOLink
- Anti-spam: honeypot + rate limiting (3/h/IP) + validation Pydantic
- Notification email équipe à chaque candidature valide
- CTAs hero redirigent vers la section formulaire (#candidature)
- Composant TechApplicationForm réutilisable
- Code review : 3 correctifs (Literal type, model_dump, CSS cleanup)

### File List

| File | Action | Description |
|------|--------|-------------|
| `backend/models.py` | Modified | Ajout TechCandidature + TechCandidatureRequest |
| `backend/routes/candidatures.py` | Created | Route POST /candidatures/tech + anti-spam |
| `backend/server.py` | Modified | Import + enregistrement routeur candidatures |
| `frontend/src/components/forms/TechApplicationForm.tsx` | Created | Composant formulaire candidature partagé |
| `frontend/src/pages/Cognisphere.tsx` | Modified | Intégration formulaire + CTA #candidature |
| `frontend/src/pages/ECHOLink.tsx` | Modified | Intégration formulaire + CTA #candidature |
| `backend/tests/routes/test_candidatures.py` | Created | 5 tests backend |
| `frontend/src/pages/Cognisphere.test.tsx` | Created | 3 tests frontend |
