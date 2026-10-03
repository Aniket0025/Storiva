# Development Workflow

## Local prerequisites
- Node.js
- npm
- Git
- MongoDB Atlas account
- Google Cloud project for Drive integration when Phase 5 begins

## Environment
Use separate environment files/configuration for local, test, and production.

Never commit `.env`.

Example variables will include concepts such as:
```text
NODE_ENV
PORT
MONGODB_URI
CLIENT_URL
SESSION/JWT secrets
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
```

Use the exact variable names defined by the implementation.

## Coding principles
- Prefer clear code over clever code.
- Keep functions focused.
- Avoid unnecessary abstraction.
- Use async/await consistently.
- Handle external failures explicitly.
- Validate at boundaries.
- Keep provider-specific logic inside providers.
- Keep controllers thin.
- Keep business rules in services.
- Keep database access isolated where useful.

## Git
Commit prefixes:
```text
feat:
fix:
refactor:
test:
docs:
chore:
security:
```

Examples:
```text
feat: add Storiva health endpoint
feat: add Google Drive account connection
fix: handle expired Google refresh token
test: add cloud account authorization tests
docs: update OAuth flow
```

## Branching
Suggested:
```text
main
develop
feature/*
fix/*
```

Use pull requests for meaningful changes.

## Definition of done
Before calling a task complete:
- implementation works
- tests pass
- lint/format passes
- no secrets leaked
- error cases considered
- docs updated
- API behavior documented if changed
- Git diff reviewed
