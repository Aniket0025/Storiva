# Product Requirements

## 1. Product
Storiva is a unified cloud-storage management application.

## 2. Primary user
An individual user with one or more Google Drive accounts who wants to manage those accounts from one Storiva interface.

## 3. Core problem
Files and available storage may be spread across multiple accounts. Users otherwise need to switch accounts and manually track capacity.

## 4. Core solution
Storiva connects separately authorized Google Drive accounts and creates a unified logical storage layer.

## 5. Authentication
Storiva authentication:
- registration
- login
- logout
- email verification
- forgot password
- reset password
- change password
- session/device management
- logout all devices

Google Drive authorization:
- connect Google account
- reconnect/reauthorize
- disconnect
- detect revoked/expired authorization

These are separate flows.

## 6. Storage
Storiva should show:
- total capacity across eligible connected accounts
- total used capacity
- total available capacity
- per-account capacity
- per-account used/available values
- storage warnings

Aggregate calculations must be based on provider-reported values and clearly handle unavailable/stale data.

## 7. File management
V1 target:
- list files
- upload
- download
- delete
- rename
- search
- create folder
- rename folder
- delete folder
- move file/folder
- file details
- recent files
- sort/filter

Later:
- drag and drop
- bulk operations
- favorites
- trash
- richer previews
- sharing
- provider expansion

## 8. Upload behavior
The Storage Manager decides where a file should be uploaded.

Initial strategy:
`MOST_AVAILABLE_SPACE`

The selected account must:
- belong to the authenticated user
- be connected
- be in a usable authorization state
- satisfy provider/API requirements
- have sufficient reported available capacity when capacity validation is possible

The system must handle races and provider rejection; a pre-check alone is not sufficient.

## 9. Unified file model
A Storiva file record maps:
- Storiva user
- provider
- cloud account
- provider file ID
- name
- size
- MIME type
- logical parent
- timestamps

The provider remains the source of truth for provider-side file state.

## 10. Non-functional requirements
- secure by default
- observable
- testable
- maintainable
- modular
- responsive
- accessible
- production deployable
- documented

## 11. Out of scope for initial V1
- direct Google account password handling
- pretending separate provider quotas are literally merged at Google level
- microservices
- client-side secret storage
- uncontrolled background synchronization of all provider data
