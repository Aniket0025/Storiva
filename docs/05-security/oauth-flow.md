# Google OAuth Flow

## Goal
Connect one Google Drive account at a time to an existing Storiva user.

## Flow

```text
Storiva UI
   |
   | Start connect
   v
Backend OAuth initiation
   |
   | state + scopes + redirect
   v
Google authorization
   |
   | user selects Google account
   v
Google callback
   |
   | authorization code
   v
Backend exchanges code
   |
   v
Store protected provider credentials
   |
   v
Create/update CloudAccount
   |
   v
Fetch provider identity/storage as allowed
   |
   v
Return user to Storiva UI
```

## Multiple accounts
The same Storiva user can repeat the flow for multiple Google accounts.

Each connection must be stored as a separate `CloudAccount` record.

Uniqueness should prevent accidental duplicate records for the same provider account under the same Storiva user.

## Security rules
- Do not send provider refresh tokens to the browser.
- Protect OAuth initiation against CSRF.
- Validate callback state.
- Never trust an arbitrary client-provided account ID during provider operations.
- Encrypt sensitive tokens/credentials at rest where appropriate.
- Handle refresh-token rotation and revocation according to provider behavior.
- Mark accounts as `reauthorization_required` when credentials are no longer usable.

## Disconnect
Disconnect behavior must be explicit:
- stop using the account
- optionally revoke provider authorization where supported/appropriate
- preserve/delete metadata according to product policy
- record an activity event

Do not silently delete user files from the provider unless the product explicitly defines that behavior.
