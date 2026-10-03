# Use Cases

## UC-01 Register
User creates a Storiva account with validated credentials.

## UC-02 Verify email
User verifies ownership of the Storiva email address.

## UC-03 Login
User authenticates and receives a secure authenticated session/token.

## UC-04 Connect Google Drive
User starts OAuth, selects a Google account, grants requested permissions, and returns to Storiva.

## UC-05 Connect another Google account
User repeats the OAuth flow for another Google account. Existing connections remain intact.

## UC-06 View storage
User sees aggregate and per-account storage.

## UC-07 Upload
User uploads a file. Storiva validates the request, asks Storage Manager for an eligible destination, and sends the upload through the provider abstraction.

## UC-08 Browse
User browses the unified file system.

## UC-09 Search
User searches across indexed/available Storiva file metadata and provider data according to supported scope.

## UC-10 Download
User requests a file download. Authorization is checked before provider access.

## UC-11 Rename/move/delete
User changes a file/folder. Storiva verifies ownership and delegates the operation to the correct provider.

## UC-12 Disconnect
User disconnects a cloud account. Storiva revokes/invalidates authorization where appropriate and preserves or removes metadata according to documented policy.

## UC-13 Recover authorization
A provider token is revoked/expired. Storiva marks the account as requiring reauthorization and guides the user through reconnection.
