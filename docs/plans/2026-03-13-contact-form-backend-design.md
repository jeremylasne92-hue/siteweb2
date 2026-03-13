# Design — Connexion formulaire Contact au backend

**Date** : 2026-03-13
**Niveau** : STANDARD
**Statut** : Validé

## Contexte

Le formulaire de contact (`Contact.tsx`) capture nom, email, sujet et message mais ne les envoie nulle part — `handleSubmit` fait seulement `setSubmitted(true)`. L'infrastructure email SendGrid est déjà prête dans `backend/email_service.py`.

## Décisions

- **Stockage** : MongoDB collection `contact_messages` + envoi email
- **Pattern** : aligné sur `POST /api/partners/apply` (rate limit IP, honeypot, double email)
- **Pas de CAPTCHA** : honeypot + rate limit suffisent pour un formulaire contact

## Backend

### Nouveau fichier `backend/routes/contact.py`

**Endpoint** : `POST /api/contact`

**Payload** :
```json
{
  "name": "string (required, 2-100 chars)",
  "email": "EmailStr (required)",
  "subject": "string (required, enum: question_generale|presse_media|partenariat|autre)",
  "message": "string (required, 10-5000 chars)",
  "consent_rgpd": "bool (required, must be true)",
  "website": "string (honeypot, must be empty)"
}
```

**Réponses** :
- `200` : `{ "message": "Message envoyé avec succès" }`
- `422` : validation error
- `429` : rate limit exceeded (3 messages / heure / IP)

**Logique** :
1. Valider payload (Pydantic)
2. Rejeter silencieusement si honeypot rempli (200 quand même)
3. Rate limit : 3 messages / heure / IP (pattern partners.py)
4. Anonymiser IP (masquer dernier octet)
5. Insert dans `contact_messages`
6. Email confirmation à l'expéditeur
7. Email alerte à `mouvement.echo.france@gmail.com` avec contenu

### Nouveau modèle dans `backend/models.py`

```python
class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str
    ip_address: str  # anonymisé
    created_at: datetime
    read: bool = False
```

### Registration dans `backend/server.py`

```python
from routes import contact
api_router.include_router(contact.router)
```

## Frontend

### Modification de `frontend/src/pages/Contact.tsx`

- Passer en controlled inputs (useState par champ)
- `handleSubmit` → `fetch(API_URL + '/contact', { method: 'POST', body })`
- États : `idle` | `loading` | `success` | `error`
- Gestion erreur 429 (message "Trop de messages, réessayez plus tard")
- Champ honeypot caché (`<input name="website" style="display:none">`)

## Fichiers impactés

| Fichier | Action |
|---------|--------|
| `backend/routes/contact.py` | Créer |
| `backend/models.py` | Ajouter ContactMessage |
| `backend/server.py` | Ajouter router contact |
| `frontend/src/pages/Contact.tsx` | Modifier handleSubmit + controlled inputs |

## Tests

- Backend : test soumission OK, test rate limit, test honeypot, test validation
- Frontend : test existant à adapter si nécessaire

## Hors scope

- Page admin pour consulter les messages (futur)
- Filtrage anti-spam avancé
