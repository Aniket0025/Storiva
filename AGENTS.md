# Storiva — Codex Agent Instructions

## Mission
Build and maintain Storiva as a production-quality modular monolith. Storiva is a cloud-storage aggregation platform that lets one Storiva user connect multiple Google Drive accounts and manage them through one unified interface.

Tagline: **All Your Storage. One Place.**

## Non-negotiable rules
1. Never expose, log, commit, or return OAuth access tokens, refresh tokens, passwords, JWT secrets, API keys, or other secrets.
2. Never ask a user for their Google password. Google accounts are connected only through OAuth 2.0.
3. Treat Google Drive authorization and Storiva authentication as separate concerns.
4. Do not assume a connected Google account grants access to every existing Drive file. Respect the scopes and Google API behavior actually configured.
5. Do not silently broaden OAuth scopes. Any scope change must be documented and reviewed for Google verification requirements.
6. Use provider abstractions. Business logic must not depend directly on Google Drive SDK details.
7. Keep actual file binaries in the cloud provider; Storiva stores metadata and provider mappings unless an explicit feature requires temporary streaming.
8. Validate all external input at API boundaries.
9. Enforce authentication and authorization server-side. Never trust frontend-only checks.
10. Use centralized error handling and stable machine-readable error codes.
11. Add or update tests when behavior changes.
12. Update the relevant documentation when architecture, API, schema, security, or behavior changes.
13. Prefer small, reviewable changes over large rewrites.
14. Do not introduce microservices for V1. Keep the system a modular monolith.
15. Do not invent missing requirements. If a requirement is ambiguous and materially affects architecture/security/data integrity, stop and ask.

## Working style
Before changing code:
- Read the relevant module and its documentation.
- Identify dependencies and existing conventions.
- Make the smallest coherent change.
- Run relevant tests/lint/type checks.
- Update docs if needed.
- Summarize changed files, tests, and any follow-up risks.

## Product principle
Storiva presents one logical storage experience while preserving provider/account boundaries internally.

## Preferred upload strategy
Initial storage allocation strategy: `MOST_AVAILABLE_SPACE`.
Choose an eligible connected account with the greatest available capacity, subject to provider/API rules and upload constraints.

## Architecture
Frontend: React + Vite + Tailwind CSS + React Router + Zustand + Axios + Lucide React.

Backend: Node.js + Express.js.

Database: MongoDB + Mongoose + MongoDB Atlas.

Integrations: Google OAuth 2.0 + Google Drive API.

Security: secure cookies/session or JWT architecture as documented, bcrypt or Argon2, Helmet, CORS, rate limiting, Zod validation, centralized errors, OAuth state protection.

Testing: Vitest/Jest, Supertest, React Testing Library.

Deployment target: Vercel frontend + Render/Railway-style backend + MongoDB Atlas.

## Repository layout
client/   frontend
server/   backend
docs/     living engineering documentation
README.md project overview
.env.example environment contract

## Definition of done
A feature is not complete merely because the happy path works. Consider:
- validation
- authentication/authorization
- error handling
- rate limiting where relevant
- tests
- logging without secrets
- documentation
- edge cases
- provider/API failure behavior
- cleanup/rollback behavior
- production configuration

## Important product boundary
Storiva does not merge Google accounts into one Google account. It maintains multiple separately authorized provider accounts and exposes a unified Storiva abstraction over them.
