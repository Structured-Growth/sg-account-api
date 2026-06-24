# EmailsController.delete

Brief overview: Validates the path parameter, reads the email before deletion through `EmailsRepository`, deletes it, publishes an event, and finishes with `204 No Content`.

## Method

- Route: `DELETE /v1/emails/:emailId`
- Signature: `EmailsController.delete(emailId: number)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant EmailDeleteParamsValidator
    participant EmailsRepository
    participant Email
    participant EventBus

    Client->>EmailsController: delete(emailId)
    EmailsController->>EmailDeleteParamsValidator: validate(emailId)
    EmailDeleteParamsValidator-->>EmailsController: valid
    EmailsController->>EmailsRepository: read(emailId)
    EmailsRepository->>Email: findByPk(emailId, { attributes, rejectOnEmpty: false })
    Email-->>EmailsRepository: email
    EmailsRepository-->>EmailsController: email
    EmailsController->>EmailsRepository: delete(emailId)
    EmailsRepository->>Email: destroy({ where: { id } })
    Email-->>EmailsRepository: deleted count
    EmailsRepository-->>EmailsController: deleted
    EmailsController->>EventBus: publish(new EventMutation(...))
    EventBus-->>EmailsController: published
    EmailsController-->>Client: 204 No Content
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant EmailDeleteParamsValidator
    participant EmailsRepository
    participant Email

    Client->>EmailsController: delete(emailId)
    EmailsController->>EmailDeleteParamsValidator: validate(emailId)
    EmailDeleteParamsValidator-->>EmailsController: valid
    EmailsController->>EmailsRepository: read(emailId)
    EmailsRepository->>Email: findByPk(emailId, { attributes, rejectOnEmpty: false })
    Email-->>EmailsRepository: null
    EmailsRepository-->>EmailsController: null
    EmailsController-->>Client: 404 Not Found
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant EmailDeleteParamsValidator

    Client->>EmailsController: delete(emailId)
    EmailsController->>EmailDeleteParamsValidator: validate(emailId)
    EmailDeleteParamsValidator-->>EmailsController: throws ValidationError
    EmailsController-->>Client: 422 Validation Error
```
