# API Contracts

Base URL:

```text
/api/v1
```

## Response conventions

Success:
```json
{
  "success": true,
  "data": {}
}
```

Error:
```json
{
  "success": false,
  "error": {
    "code": "STORAGE_LIMIT_EXCEEDED",
    "message": "No connected storage account has enough available space."
  }
}
```

Do not return stack traces or secrets in production.

## Authentication

```text
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/me
POST /auth/verify-email
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/change-password
GET  /auth/sessions
DELETE /auth/sessions/:id
DELETE /auth/sessions
```

## Cloud accounts

```text
GET    /cloud-accounts
POST   /cloud-accounts/google/connect
GET    /cloud-accounts/google/callback
POST   /cloud-accounts/:id/refresh
DELETE /cloud-accounts/:id
```

OAuth callback should be treated as a protocol endpoint, not a normal JSON API.

## Storage

```text
GET /storage
GET /storage/accounts
```

## Files

```text
GET    /files
POST   /files/upload
GET    /files/:id
GET    /files/:id/download
PATCH  /files/:id
DELETE /files/:id
POST   /files/:id/move
```

## Folders

```text
GET    /folders
POST   /folders
PATCH  /folders/:id
DELETE /folders/:id
POST   /folders/:id/move
```

## Search

```text
GET /search?q=<query>
```

## Health

```text
GET /health
```

Expected:
```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

## HTTP status guidance
- 200 successful read/update
- 201 successful creation
- 204 successful deletion where appropriate
- 400 malformed/invalid request
- 401 unauthenticated
- 403 authenticated but forbidden
- 404 resource not found
- 409 conflict
- 413 payload too large
- 422 semantically invalid input when used by project convention
- 429 rate limited
- 502/503 external provider unavailable
- 500 unexpected internal error
