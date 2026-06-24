# AccountsController.searchPost

Brief overview: Validates the POST search body, passes the body directly to `AccountRepository.search(body)`, and returns the paginated account search result using only the public response fields `id`, `orgId`, `region`, `createdAt`, `updatedAt`, `status`, `arn`, and `metadata`.

## Method

- Route: `POST /v1/accounts/search`
- Signature: `AccountsController.searchPost(query: {}, body: AccountSearchParamsInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant AccountsController
    participant AccountSearchWithPostParamsValidator
    participant AccountRepository
    participant Account

    Client->>AccountsController: searchPost(query, body)
    AccountsController->>AccountSearchWithPostParamsValidator: validate({ query, body })
    AccountSearchWithPostParamsValidator-->>AccountsController: valid
    AccountsController->>AccountRepository: search(body)
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
    participant AccountSearchWithPostParamsValidator

    Client->>AccountsController: searchPost(query, body)
    AccountsController->>AccountSearchWithPostParamsValidator: validate({ query, body })
    AccountSearchWithPostParamsValidator-->>AccountsController: throws ValidationError
    AccountsController-->>Client: 422 Validation Error
```
