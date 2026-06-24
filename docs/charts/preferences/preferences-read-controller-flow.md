# PreferencesController.read

Brief overview: Validates the path parameter, verifies that the account exists through `AccountRepository`, searches preferences through `PreferencesRepository`, creates a default preferences record on first read when none exists yet, and returns `200 OK` with public attributes `id`, `orgId`, `createdAt`, `updatedAt`, `arn`, `preferences`, and `metadata`.

## Method

- Route: `GET /v1/preferences/:accountId`
- Signature: `PreferencesController.read(accountId)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant PreferencesController
    participant PreferencesReadParamsValidator
    participant PreferencesService
    participant AccountRepository
    participant PreferencesRepository
    participant Preferences

    Client->>PreferencesController: read(accountId)
    PreferencesController->>PreferencesReadParamsValidator: validate(accountId)
    PreferencesReadParamsValidator-->>PreferencesController: valid
    PreferencesController->>PreferencesService: read(accountId)
    PreferencesService->>AccountRepository: read(accountId)
    AccountRepository-->>PreferencesService: account
    PreferencesService->>PreferencesRepository: search(params)
    PreferencesRepository->>Preferences: findAndCountAll(...)
    Preferences-->>PreferencesRepository: { rows, count }
    PreferencesRepository-->>PreferencesService: search result
    opt no existing preferences record
        PreferencesService->>PreferencesRepository: create(params)
        PreferencesRepository->>Preferences: create(...)
        Preferences-->>PreferencesRepository: preferences
        PreferencesRepository-->>PreferencesService: preferences
    end
    PreferencesService-->>PreferencesController: preferences
    PreferencesController-->>Client: 200 OK
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant PreferencesController
    participant PreferencesReadParamsValidator

    Client->>PreferencesController: read(accountId)
    PreferencesController->>PreferencesReadParamsValidator: validate(accountId)
    PreferencesReadParamsValidator-->>PreferencesController: throws ValidationError
    PreferencesController-->>Client: 422 Validation Error
```

## 404 Not Found Account Not Found

```mermaid
sequenceDiagram
    actor Client
    participant PreferencesController
    participant PreferencesReadParamsValidator
    participant PreferencesService
    participant AccountRepository

    Client->>PreferencesController: read(accountId)
    PreferencesController->>PreferencesReadParamsValidator: validate(accountId)
    PreferencesReadParamsValidator-->>PreferencesController: valid
    PreferencesController->>PreferencesService: read(accountId)
    PreferencesService->>AccountRepository: read(accountId)
    AccountRepository-->>PreferencesService: null
    PreferencesService-->>PreferencesController: throws NotFoundError
    PreferencesController-->>Client: 404 Not Found
```
