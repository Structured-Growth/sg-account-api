# PreferencesController.update

Brief overview: Validates the request, reuses `PreferencesService.read(accountId)` to load or create the preferences record, optionally merges nested `preferences`, optionally validates and merges `metadata`, saves the model, publishes an event, and returns `200 OK` with public attributes `id`, `orgId`, `createdAt`, `updatedAt`, `arn`, `preferences`, and `metadata`.

## Method

- Route: `POST /v1/preferences/:accountId`
- Signature: `PreferencesController.update(accountId, body)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant PreferencesController
    participant PreferencesUpdateParamsValidator
    participant PreferencesService
    participant AccountRepository
    participant PreferencesRepository
    participant CustomFieldService
    participant Preferences
    participant EventBus

    Client->>PreferencesController: update(accountId, body)
    PreferencesController->>PreferencesUpdateParamsValidator: validate(accountId, body)
    PreferencesUpdateParamsValidator-->>PreferencesController: valid
    PreferencesController->>PreferencesService: update(accountId, body)
    PreferencesService->>PreferencesService: read(accountId)
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
    PreferencesService-->>PreferencesService: preferences
    opt params.preferences is present
        PreferencesService->>Preferences: set("preferences", mergedPreferences)
        Preferences-->>PreferencesService: preferences updated
    end
    opt params.metadata is present
        PreferencesService->>CustomFieldService: validate("Preferences", metadata, orgId)
        CustomFieldService-->>PreferencesService: valid
        PreferencesService->>Preferences: set("metadata", mergedMetadata)
        Preferences-->>PreferencesService: metadata updated
    end
    PreferencesService->>Preferences: save()
    Preferences-->>PreferencesService: preferences
    PreferencesService-->>PreferencesController: preferences
    PreferencesController->>EventBus: publish(new EventMutation(...))
    EventBus-->>PreferencesController: published
    PreferencesController-->>Client: 200 OK
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant PreferencesController
    participant PreferencesUpdateParamsValidator

    Client->>PreferencesController: update(accountId, body)
    PreferencesController->>PreferencesUpdateParamsValidator: validate(accountId, body)
    PreferencesUpdateParamsValidator-->>PreferencesController: throws ValidationError
    PreferencesController-->>Client: 422 Validation Error
```

## 404 Not Found Account Not Found

```mermaid
sequenceDiagram
    actor Client
    participant PreferencesController
    participant PreferencesUpdateParamsValidator
    participant PreferencesService
    participant AccountRepository

    Client->>PreferencesController: update(accountId, body)
    PreferencesController->>PreferencesUpdateParamsValidator: validate(accountId, body)
    PreferencesUpdateParamsValidator-->>PreferencesController: valid
    PreferencesController->>PreferencesService: update(accountId, body)
    PreferencesService->>PreferencesService: read(accountId)
    PreferencesService->>AccountRepository: read(accountId)
    AccountRepository-->>PreferencesService: null
    PreferencesService-->>PreferencesController: throws NotFoundError
    PreferencesController-->>Client: 404 Not Found
```

## 422 Custom Field Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant PreferencesController
    participant PreferencesUpdateParamsValidator
    participant PreferencesService
    participant AccountRepository
    participant PreferencesRepository
    participant CustomFieldService
    participant Preferences

    Client->>PreferencesController: update(accountId, body)
    PreferencesController->>PreferencesUpdateParamsValidator: validate(accountId, body)
    PreferencesUpdateParamsValidator-->>PreferencesController: valid
    PreferencesController->>PreferencesService: update(accountId, body)
    PreferencesService->>PreferencesService: read(accountId)
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
    PreferencesService-->>PreferencesService: preferences
    PreferencesService->>CustomFieldService: validate("Preferences", metadata, orgId)
    CustomFieldService-->>PreferencesService: throws ValidationError
    PreferencesService-->>PreferencesController: throws ValidationError
    PreferencesController-->>Client: 422 Validation Error
```
