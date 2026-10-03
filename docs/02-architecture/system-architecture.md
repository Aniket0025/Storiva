# System Architecture

## Architecture style
Storiva V1 is a **modular monolith**.

This keeps deployment and development simple while preserving clear module boundaries.

```text
                    STORIVA
                       |
              React + Vite UI
                       |
                   REST API
                       |
              Node.js + Express
                       |
      +----------------+----------------+
      |                |                |
     Auth         Cloud Accounts    File/Folder
      |                |                |
      +----------------+----------------+
                       |
                Storage Manager
                       |
              StorageProvider API
                       |
              +--------+--------+
              |                 |
        Google Drive       Future Providers
              |
          Google APIs
                       |
                   MongoDB
```

## Major modules
- Auth
- Users
- Sessions
- Cloud Accounts
- Storage
- Files
- Folders
- Search
- Activities
- Notifications

## Dependency direction
HTTP/controllers → application services → domain/business logic → provider/data infrastructure.

Controllers should not contain complex business rules.

## Provider boundary
Google Drive-specific SDK calls belong inside the Google Drive provider implementation.

Business modules should depend on provider interfaces, not Google SDK objects.

## Data ownership
MongoDB:
- user identity
- Storiva sessions
- connected-account metadata
- provider mapping
- file metadata
- folder metadata
- activity/notification records

Google Drive:
- actual provider file bytes
- provider-native file state
- provider-native IDs

## Failure philosophy
External APIs fail. Design for:
- expired tokens
- revoked authorization
- rate limits
- timeouts
- partial upload failures
- provider conflicts
- missing provider files
- stale metadata
- insufficient capacity
- network failures

Never convert every provider failure into HTTP 500. Map failures to stable application errors.

## Scalability direction
V1 remains a modular monolith. If scale later requires workers/queues, extract specific workloads only after measuring bottlenecks.
