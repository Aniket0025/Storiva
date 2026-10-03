# Database Design

## Collections

### users
```text
_id
name
email
passwordHash
avatar
emailVerified
createdAt
updatedAt
```

### sessions
```text
_id
userId
session/token identifier
device metadata
ip metadata where policy permits
expiresAt
createdAt
lastUsedAt
revokedAt
```

### cloudAccounts
```text
_id
userId
provider
providerAccountId
email
encrypted access credential
encrypted refresh credential
tokenExpiresAt
status
storage.total
storage.used
storage.available
lastStorageSyncAt
createdAt
updatedAt
```

Sensitive credential fields must never be returned by normal API serializers.

### files
```text
_id
userId
cloudAccountId
provider
providerFileId
name
size
mimeType
parentId
createdAt
updatedAt
```

### folders
```text
_id
userId
cloudAccountId
provider
providerFolderId
name
parentId
createdAt
updatedAt
```

### activities
```text
_id
userId
type
resourceType
resourceId
metadata
createdAt
```

### notifications
```text
_id
userId
type
title
message
readAt
createdAt
```

## Relationships

```text
User 1 ─── * Session
User 1 ─── * CloudAccount
User 1 ─── * File
User 1 ─── * Folder
User 1 ─── * Activity
User 1 ─── * Notification

CloudAccount 1 ─── * File
CloudAccount 1 ─── * Folder
```

## Invariants
- Every cloud account belongs to exactly one Storiva user.
- Every file/folder belongs to exactly one Storiva user.
- Provider IDs are unique within the relevant provider/account namespace.
- Never trust a client-supplied `userId`.
- Query resources with authenticated user ownership constraints.

## Indexing
Indexes should be added based on query patterns, including:
- user email
- cloudAccount user/provider
- file user/parent
- providerFileId within provider/account
- activity user/createdAt
- notification user/read status

Do not add indexes blindly; verify query needs.
