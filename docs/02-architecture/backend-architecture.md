# Backend Architecture

Suggested structure:

```text
server/
└── src/
    ├── config/
    ├── modules/
    │   ├── auth/
    │   ├── users/
    │   ├── sessions/
    │   ├── cloudAccounts/
    │   ├── files/
    │   ├── folders/
    │   ├── storage/
    │   ├── activities/
    │   └── notifications/
    ├── providers/
    │   ├── interfaces/
    │   └── googleDrive/
    ├── middleware/
    ├── validators/
    ├── utils/
    ├── app.js
    └── server.js
```

## Module pattern

Each business module may contain:
- routes
- controller
- service
- repository/data access
- validator
- model where appropriate
- tests

Do not create layers that add no value.

## Controllers
Controllers:
- parse validated request data
- call services
- choose HTTP response
- do not implement provider algorithms

## Services
Services:
- contain business rules
- coordinate repositories/providers
- enforce invariants

## Repositories
Repositories isolate persistence from business logic.

## Middleware
Examples:
- authentication
- authorization
- request ID
- rate limiting
- validation
- error handling
- upload limits

## Error handling
Use one centralized error middleware and typed/stable application error codes.
