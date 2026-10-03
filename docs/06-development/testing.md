# Testing Strategy

## Unit tests
Test:
- storage allocation
- validation
- auth services
- token lifecycle helpers
- error mapping
- provider response normalization

## Integration tests
Test:
- authentication routes
- cloud account routes
- file routes
- authorization/ownership
- database behavior

## Provider tests
Mock Google APIs at the provider boundary.

Do not make normal automated tests depend on live Google accounts.

## Frontend tests
React Testing Library for:
- login/register
- protected routes
- cloud account cards
- storage dashboard
- file list
- upload states
- errors/loading/empty states

## End-to-end tests
Later, add E2E coverage for critical flows:
- register/login
- connect provider using a test strategy
- upload
- browse
- rename
- delete
- disconnect

## Security tests
Include:
- unauthorized access
- cross-user resource access
- invalid OAuth state
- rate-limit behavior
- malformed input
- oversized uploads
- token leakage checks
- session revocation

## Rule
A bug fix should normally include a regression test when practical.
