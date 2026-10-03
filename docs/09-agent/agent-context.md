# Codex Agent Context

## What you are building
You are working on Storiva, a cloud-storage aggregation application.

The central concept is:

> One Storiva user + multiple separately authorized Google Drive accounts + one unified management interface.

## What Storiva is not
- not a Google password manager
- not a way to transfer Google storage quota
- not a replacement Google account
- not a microservice platform
- not a frontend-only application

## Your responsibilities
When implementing a feature:
1. understand the product requirement
2. inspect the existing architecture
3. preserve module boundaries
4. implement backend authorization
5. validate inputs
6. handle provider failures
7. add tests
8. update documentation

## Decision hierarchy
When instructions conflict, prefer:
1. explicit current task requirement
2. security/data-integrity requirements
3. documented architecture decisions
4. existing project conventions
5. convenience

## Never assume
- Google API scopes
- provider capabilities
- token lifetime
- storage semantics
- production URLs
- deployment secrets
- user permissions

Verify these against the relevant implementation/configuration and current official provider documentation when necessary.

## Change protocol
For an architectural change:
- explain why
- update ADR/documentation
- update affected interfaces
- update tests
- avoid hidden breaking changes

For an API change:
- update API docs
- update validation
- update tests
- update frontend callers

For schema change:
- update database docs
- update models
- consider migration/backfill needs
- update tests

For security change:
- update security docs
- test abuse/failure paths
- verify logs do not expose secrets
