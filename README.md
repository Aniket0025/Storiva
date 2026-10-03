# Storiva

**All Your Storage. One Place.**

Storiva is a cloud-storage aggregation platform. A user creates one Storiva account, connects multiple Google Drive accounts, and manages their storage and files through one unified interface.

## Why Storiva?
Users may have storage distributed across multiple Google accounts. Storiva aims to provide one interface for:
- connecting multiple cloud accounts
- seeing aggregate and per-account storage
- uploading files using available capacity
- browsing, searching, renaming, moving, downloading, and deleting files
- understanding where each file is physically stored

## Core concept

Example:

Google Drive A → 15 GB
Google Drive B → 15 GB
Google Drive C → 15 GB

Storiva can present the connected accounts as one logical storage pool, while internally retaining account/provider boundaries.

## Architecture

React/Vite UI → Express REST API → modular business modules → provider abstraction → Google Drive API

MongoDB stores users, sessions, cloud-account metadata, file metadata, folders, activities, and notifications.

## V1 principles
- modular monolith
- provider-agnostic core
- secure OAuth
- server-side authorization
- metadata in MongoDB
- file content remains with providers where possible
- production-quality error handling and tests

## Documentation
Start with:
1. `AGENTS.md` — Codex operating instructions
2. `docs/01-product/product-requirements.md`
3. `docs/02-architecture/system-architecture.md`
4. `docs/03-data/database-design.md`
5. `docs/04-api/api-contracts.md`
6. `docs/05-security/security.md`
7. `docs/06-development/development-workflow.md`
8. `docs/07-roadmap/roadmap.md`

## Current implementation milestone
Phase 1: project foundation.

Target:
- React/Vite app runs
- Express API runs
- MongoDB connects
- environment configuration exists
- Git repository exists
- `GET /api/v1/health` works
- base error handling exists

## Important disclaimer
Storage capacity shown by Storiva is an aggregation of separately connected provider accounts. It is not a transfer of quota between Google accounts.
