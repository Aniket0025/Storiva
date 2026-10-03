# Storiva Roadmap

## Phase 0 — Product & Architecture
- requirements
- use cases
- user flows
- architecture
- database design
- API contracts
- security/OAuth design

## Phase 1 — Foundation
- repository
- client
- server
- React/Vite
- Express
- MongoDB
- environment config
- Git
- health endpoint
- base error handling

## Phase 2 — Authentication
- register
- login
- logout
- password hashing
- email verification
- forgot/reset password
- change password

## Phase 3 — Security
- validation
- rate limiting
- Helmet
- CORS
- secure cookies/session architecture
- centralized errors
- security logging

## Phase 4 — User & Sessions
- current-user endpoint
- sessions/devices
- logout current session
- logout all sessions

## Phase 5 — Google Cloud
- create/configure project
- enable Drive API
- OAuth consent configuration
- credentials
- redirect URIs
- test users
- scope review

## Phase 6 — Google OAuth
- connect endpoint
- callback
- state protection
- account identity
- secure credential storage
- multiple accounts

## Phase 7 — Token Management
- access-token refresh
- expiration
- revocation detection
- reauthorization flow

## Phase 8 — Google Drive Provider
- storage info
- list files
- file metadata
- upload
- download
- delete
- rename
- folder operations
- search

## Phase 9 — Single-Drive File Manager
- UI
- list/grid
- folders
- upload
- download
- rename/delete
- loading/error/empty states

## Phase 10 — Multiple Drives
- account switch/overview
- aggregate file view
- per-account storage
- account status

## Phase 11 — Storage Manager
- total/used/available
- allocation strategy
- capacity validation
- failure handling
- storage alerts

## Phase 12 — Unified File System
- logical folders
- normalized metadata
- provider mappings
- move operations
- unified navigation

## Phase 13 — Search
- global search
- filters
- sorting
- provider-aware search

## Phase 14 — Dashboard
- storage cards
- recent files
- connected accounts
- alerts
- activity summary

## Phase 15 — Activities & Notifications
- upload events
- account connection events
- deletion/rename events
- authorization alerts
- storage warnings

## Phase 16 — Advanced Features
- drag/drop
- multi-upload
- bulk operations
- favorites
- trash
- richer previews
- provider sharing where supported

## Phase 17 — Testing
- unit
- integration
- provider mocks
- frontend
- E2E
- security tests

## Phase 18 — Security Audit
- dependency audit
- OAuth review
- token handling review
- authorization review
- rate-limit review
- file-upload review
- secret scanning
- production checklist

## Phase 19 — Deployment
- frontend deployment
- backend deployment
- MongoDB Atlas production configuration
- Google OAuth production configuration
- environment secrets
- monitoring/logging
- backups/recovery
- final smoke tests
