# Security Requirements

## Authentication
- Hash passwords with a modern password hashing algorithm.
- Never store plaintext passwords.
- Prefer secure, HTTP-only cookies for browser session credentials where compatible with the selected architecture.
- Never store long-lived secrets in localStorage.
- Expire/revoke sessions.
- Support logout-all-devices.

## Authorization
Every protected operation must establish:
1. authenticated user
2. ownership of target resource
3. allowed action

Frontend route guards are UX only; backend authorization is authoritative.

## OAuth
- Use OAuth 2.0.
- Use `state` protection against CSRF.
- Validate callback state.
- Validate redirect URI configuration.
- Store provider credentials securely.
- Encrypt sensitive credentials at rest where appropriate.
- Never return provider refresh tokens to the frontend.
- Handle expiration and revocation.
- Keep requested scopes minimal for required functionality.
- Document scope changes because Google may require verification/security review for sensitive or restricted scopes.

## Google Drive scope caution
Do not hard-code a broad scope merely because it is convenient. Select the smallest scope that supports the actual product requirements. Before public production release, verify Google's current scope classification, verification, and security-assessment requirements.

## Rate limiting
Use endpoint-specific limits:
- general API
- login
- registration
- password reset
- OAuth initiation/callback
- uploads
- expensive search/provider operations

Do not rely on one global number for every endpoint.

## Input validation
Validate:
- JSON bodies
- query parameters
- path parameters
- multipart metadata
- file size
- MIME type
- names
- pagination/sorting values

Use Zod or the project's chosen validation library.

## File security
- Enforce request/body size limits.
- Validate MIME/type and size.
- Do not trust client filenames or MIME types.
- Normalize/sanitize names where needed.
- Prevent path traversal in any temporary/local file handling.
- Never execute uploaded files.
- Use streaming where practical.
- Avoid unnecessary local persistence.

## Web security
Use:
- Helmet/security headers
- strict CORS configuration
- secure cookies
- CSRF protection where the chosen cookie architecture requires it
- request IDs
- safe error responses

## Secrets
Secrets belong in environment/secret management, never source code.

`.env` must be ignored by Git.

`.env.example` contains names and safe placeholders only.

## Logging
Never log:
- passwords
- access tokens
- refresh tokens
- authorization codes
- session secrets
- raw sensitive request bodies

## Security incidents
Provider revocation, suspicious session activity, repeated authentication failures, and token errors should be observable and handled without exposing sensitive information.
