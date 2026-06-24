# EmailsController.searchPost

Brief overview: Validates the POST search body, queries `EmailsRepository` directly, and returns `200 OK` when the paginated email search completes successfully.

## Method

- Route: `POST /v1/emails/search`
- Signature: `EmailsController.searchPost(query: {}, body: EmailSearchParamsInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant EmailSearchWithPostParamsValidator
    participant EmailsRepository
    participant Email

    Client->>EmailsController: searchPost(body)
    EmailsController->>EmailSearchWithPostParamsValidator: validate(body)
    EmailSearchWithPostParamsValidator-->>EmailsController: valid
    EmailsController->>EmailsRepository: search(body)
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
    participant EmailSearchWithPostParamsValidator

    Client->>EmailsController: searchPost(body)
    EmailsController->>EmailSearchWithPostParamsValidator: validate(body)
    EmailSearchWithPostParamsValidator-->>EmailsController: throws ValidationError
    EmailsController-->>Client: 422 Validation Error
```
