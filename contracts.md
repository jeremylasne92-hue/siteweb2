# API Contracts - Mouvement ECHO Backend

## Base URL
- Backend: `${REACT_APP_BACKEND_URL}/api`

## Authentication Endpoints

### POST /api/auth/register
**Request:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "enable_2fa": "boolean"
}
```
**Response:**
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "requires_2fa": "boolean",
  "message": "string"
}
```

### POST /api/auth/login
**Request:**
```json
{
  "username": "string",
  "password": "string",
  "captcha_verified": "boolean"
}
```
**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string"
  },
  "session_token": "string",
  "requires_2fa": "boolean"
}
```

### POST /api/auth/verify-2fa
**Request:**
```json
{
  "user_id": "string",
  "code": "string"
}
```
**Response:**
```json
{
  "verified": "boolean",
  "session_token": "string"
}
```

### POST /api/auth/google-oauth
**Request:**
```json
{
  "session_id": "string"
}
```
**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "picture": "string"
  },
  "session_token": "string"
}
```

### GET /api/auth/me
**Headers:** `Authorization: Bearer {session_token}`
**Response:**
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "role": "string",
  "picture": "string"
}
```

### POST /api/auth/logout
**Headers:** `Authorization: Bearer {session_token}`
**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## Episode Management Endpoints

### GET /api/episodes
**Query Params:** `?season={number}` (optional)
**Response:**
```json
[
  {
    "id": "string",
    "season": "number",
    "episode": "number",
    "title": "string",
    "description": "string",
    "duration": "string",
    "thumbnail_url": "string",
    "video_url": "string",
    "is_published": "boolean"
  }
]
```

### POST /api/episodes (Admin only)
**Headers:** `Authorization: Bearer {session_token}`
**Request:**
```json
{
  "season": "number",
  "episode": "number",
  "title": "string",
  "description": "string",
  "duration": "string",
  "thumbnail_url": "string",
  "video_url": "string",
  "is_published": "boolean"
}
```

### PUT /api/episodes/{episode_id} (Admin only)
**Headers:** `Authorization: Bearer {session_token}`
**Request:** Same as POST

### DELETE /api/episodes/{episode_id} (Admin only)
**Headers:** `Authorization: Bearer {session_token}`

## Video Progress Endpoints

### GET /api/progress/{episode_id}
**Headers:** `Authorization: Bearer {session_token}`
**Response:**
```json
{
  "episode_id": "string",
  "current_time": "number",
  "duration": "number",
  "progress_percent": "number",
  "last_updated": "datetime"
}
```

### POST /api/progress
**Headers:** `Authorization: Bearer {session_token}`
**Request:**
```json
{
  "episode_id": "string",
  "season": "number",
  "episode": "number",
  "current_time": "number",
  "duration": "number"
}
```

### GET /api/progress/last-watched
**Headers:** `Authorization: Bearer {session_token}`
**Response:**
```json
{
  "episode_id": "string",
  "season": "number",
  "episode": "number",
  "current_time": "number",
  "title": "string"
}
```

## Video Upload Endpoints (Local Storage - Demo)

### POST /api/videos/upload
**Headers:** `Authorization: Bearer {session_token}`, `Content-Type: multipart/form-data`
**Request:** FormData with file
**Response:**
```json
{
  "video_id": "string",
  "filename": "string",
  "file_path": "string",
  "file_size": "number",
  "url": "string"
}
```

### GET /api/videos/{video_id}/stream
**Response:** Video file stream with Range support

## Mock Data to Replace

**Frontend mock.js:**
- FAQ data → Keep in frontend (static)
- Home content → Keep in frontend (static)
- Serie content → Keep in frontend (static)
- Mouvement content → Keep in frontend (static)
- ECHOLink content → Keep in frontend (static)

**Frontend mock-episodes.js:**
- seriesData.seasons[].episodes → GET /api/episodes
- Episode playback → GET /api/videos/{id}/stream

**Frontend videoProgress.js:**
- getEpisodeProgress() → GET /api/progress/{episode_id}
- saveEpisodeProgress() → POST /api/progress
- getLastWatched() → GET /api/progress/last-watched

## Frontend Integration Changes

1. Create `src/api/client.js` with axios instance
2. Create `src/api/auth.js` with auth methods
3. Create `src/api/episodes.js` with episode methods
4. Create `src/api/progress.js` with progress methods
5. Update AuthContext to use real API
6. Update WatchPage to fetch episodes from API
7. Update VideoPlayer to call progress API
8. Update AdminPanel to call episode CRUD APIs

## Database Collections

### users
```javascript
{
  _id: ObjectId,
  id: "string (uuid)",
  username: "string (unique)",
  email: "string (unique)",
  password_hash: "string (bcrypt)",
  oauth_provider: "string (google, discord, null)",
  oauth_id: "string (null if not OAuth)",
  picture: "string (URL)",
  role: "string (user, admin)",
  is_2fa_enabled: "boolean",
  totp_secret: "string (null if 2FA disabled)",
  created_at: "datetime",
  last_login: "datetime"
}
```

### episodes
```javascript
{
  _id: ObjectId,
  id: "string (uuid)",
  season: "number",
  episode: "number",
  title: "string",
  description: "string",
  duration: "string (e.g., '52 min')",
  thumbnail_url: "string",
  video_url: "string (local path or S3 URL)",
  is_published: "boolean",
  created_at: "datetime",
  updated_at: "datetime"
}
```

### video_progress
```javascript
{
  _id: ObjectId,
  id: "string (uuid)",
  user_id: "string",
  episode_id: "string",
  season: "number",
  episode: "number",
  current_time: "number (seconds)",
  duration: "number (seconds)",
  progress_percent: "number",
  last_updated: "datetime"
}
```

### user_sessions
```javascript
{
  _id: ObjectId,
  user_id: "string",
  session_token: "string (uuid)",
  expires_at: "datetime",
  created_at: "datetime"
}
```

### pending_2fa
```javascript
{
  _id: ObjectId,
  user_id: "string",
  code: "string (4 digits)",
  attempts: "number",
  expires_at: "datetime",
  created_at: "datetime"
}
```
