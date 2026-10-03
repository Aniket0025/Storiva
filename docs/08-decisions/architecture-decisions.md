# Architecture Decisions

## ADR-001: Modular monolith
Decision: Use a modular monolith for V1.

Reason:
- simpler development/deployment
- clear module boundaries
- easier local debugging
- avoids premature distributed-system complexity

## ADR-002: Provider abstraction
Decision: Business logic uses a normalized StorageProvider interface.

Reason:
- Google Drive is first provider
- future OneDrive/Dropbox/Box should not require rewriting core modules

## ADR-003: MongoDB for metadata
Decision: MongoDB stores application metadata rather than provider file bytes.

Reason:
- flexible file/folder metadata
- natural document model
- provider files remain in provider infrastructure

## ADR-004: Storage allocation
Decision: Initial upload allocation strategy is MOST_AVAILABLE_SPACE.

Reason:
- simple
- deterministic
- uses available capacity efficiently

This is replaceable through the Storage Manager.

## ADR-005: Separate Storiva auth and Google authorization
Decision: Storiva account identity is independent from connected Google Drive identities.

Reason:
- one Storiva user may connect multiple Google accounts
- provider connection is a resource belonging to the Storiva user

## ADR-006: Documentation as code
Decision: Markdown files in the repository are the living source of truth.

Reason:
- versioned with code
- reviewable in Git
- Codex can consume the same context
- prevents architecture docs from becoming stale
