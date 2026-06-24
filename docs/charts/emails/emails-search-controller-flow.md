# EmailsController.search

Brief overview: Validates the GET search query, queries `EmailsRepository` directly, and returns `200 OK` when the paginated email search completes successfully.

## Method

- Route: `GET /v1/emails`
- Signature: `EmailsController.search(query: EmailSearchParamsInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant SearchEmailParamsValidator
    participant EmailsRepository
    participant Email

    Client->>EmailsController: search(query)
    EmailsController->>SearchEmailParamsValidator: validate(query)
    SearchEmailParamsValidator-->>EmailsController: valid
    EmailsController->>EmailsRepository: search(query)
    EmailsRepository->>Email: findAndCountAll({ where, offset, limit, order })
    Email-->>EmailsRepository: { rows, count }
    EmailsRepository-->>EmailsController: search result
    EmailsController-->>Client: 200 OK
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant SearchEmailParamsValidator

    Client->>EmailsController: search(query)
    EmailsController->>SearchEmailParamsValidator: validate(query)
    SearchEmailParamsValidator-->>EmailsController: throws ValidationError
    EmailsController-->>Client: 422 Validation Error
```
