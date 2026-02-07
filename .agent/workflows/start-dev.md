---
description: Démarre le frontend (Vite) et le backend (Flask) pour le développement local
---
# Start Development Servers

Ce workflow démarre simultanément les serveurs frontend et backend.

## Étapes

1. Ouvrir un terminal pour le **frontend** et exécuter :
```powershell
cd frontend
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm run dev
```

// turbo
2. Ouvrir un second terminal pour le **backend** et exécuter :
```powershell
cd backend
uvicorn server:app --reload
```

3. Le frontend sera accessible sur `http://localhost:5173`
4. Le backend sera accessible sur `http://localhost:8000`

## Notes
- Assurez-vous que les dépendances sont installées (`npm install` pour frontend, `pip install -r requirements.txt` pour backend)
- Le frontend utilise Vite avec hot reload activé
