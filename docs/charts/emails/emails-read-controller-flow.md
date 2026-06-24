# EmailsController.get

Brief overview: Validates the path parameter, reads one email from `EmailsRepository`, and returns `200 OK` when the record exists.

## Method

- Route: `GET /v1/emails/:emailId`
- Signature: `EmailsController.get(emailId: number)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant EmailReadParamsValidator
    participant EmailsRepository
    participant Email

    Client->>EmailsController: get(emailId)
    EmailsController->>EmailReadParamsValidator: validate(emailId)
    EmailReadParamsValidator-->>EmailsController: valid
    EmailsController->>EmailsRepository: read(emailId)
    EmailsRepository->>Email: findByPk(emailId, { attributes, rejectOnEmpty: false })
    Email-->>EmailsRepository: email
    EmailsRepository-->>EmailsController: email
    EmailsController-->>Client: 200 OK
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant EmailReadParamsValidator
    participant EmailsRepository
    participant Email

    Client->>EmailsController: get(emailId)
    EmailsController->>EmailReadParamsValidator: validate(emailId)
    EmailReadParamsValidator-->>EmailsController: valid
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
    participant EmailReadParamsValidator

    Client->>EmailsController: get(emailId)
    EmailsController->>EmailReadParamsValidator: validate(emailId)
    EmailReadParamsValidator-->>EmailsController: throws ValidationError
    EmailsController-->>Client: 422 Validation Error
```
