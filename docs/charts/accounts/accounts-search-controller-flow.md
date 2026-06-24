# AccountsController.search

Brief overview: Validates the GET search query, queries `AccountRepository` directly, and returns the paginated account search result using only the public response fields `id`, `orgId`, `region`, `createdAt`, `updatedAt`, `status`, `arn`, and `metadata`.

## Method

- Route: `GET /v1/accounts`
- Signature: `AccountsController.search(query: AccountSearchParamsInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant AccountsController
    participant AccountSearchParamsValidator
    participant AccountRepository
    participant Account

    Client->>AccountsController: search(query)
    AccountsController->>AccountSearchParamsValidator: validate({ query })
    AccountSearchParamsValidator-->>AccountsController: valid
    AccountsController->>AccountRepository: search(query)
    AccountRepository->>Account: findAndCountAll({ where, offset, limit, order })
    Account-->>AccountRepository: { rows, count }
    AccountRepository-->>AccountsController: { data, total, limit, page }
    AccountsController-->>Client: 200 OK
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant AccountsController
    participant AccountSearchParamsValidator

    Client->>AccountsController: search(query)
    AccountsController->>AccountSearchParamsValidator: validate({ query })
    AccountSearchParamsValidator-->>AccountsController: throws ValidationError
    AccountsController-->>Client: 422 Validation Error
```
