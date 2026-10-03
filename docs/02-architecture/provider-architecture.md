# Provider Architecture

## Goal
Allow Storiva to support Google Drive first and additional providers later without rewriting core storage logic.

## Interface

Conceptual interface:

```text
StorageProvider
├── connect()
├── disconnect()
├── getStorageInfo()
├── listFiles()
├── getFile()
├── uploadFile()
├── downloadFile()
├── deleteFile()
├── renameFile()
├── createFolder()
├── moveFile()
└── searchFiles()
```

## GoogleDriveProvider
Responsibilities:
- communicate with Google Drive API
- manage provider-specific authorization/token use
- translate provider responses into Storiva's normalized models
- translate provider errors into normalized provider errors
- never leak provider SDK objects into unrelated modules

## Future providers
Possible:
- OneDrive
- Dropbox
- Box

They must implement the same normalized contract where semantics permit.

## Provider context
Provider methods should receive enough context to identify:
- authenticated Storiva user
- connected cloud account
- operation parameters

Never let a request select an arbitrary provider account belonging to another user.

## Provider limitations
Not every provider supports exactly the same capabilities. Capabilities should be explicit rather than silently emulated.

Example:

```text
capabilities:
- upload
- download
- search
- move
- preview
- share
```

## Important rule
Do not make the common interface so abstract that it becomes meaningless. Normalize only behavior that genuinely exists across providers.
