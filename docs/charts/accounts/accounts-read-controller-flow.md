# AccountsController.get

Brief overview: Validates the account id, reads the account through `AccountRepository`, checks for a missing record in the controller, and returns the account through the final public response.

## Method

- Route: `GET /v1/accounts/:accountId`
- Signature: `AccountsController.get(accountId: number)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant AccountsController
    participant AccountReadParamsValidator
    participant AccountRepository
    participant Account

    Client->>AccountsController: get(accountId)
    AccountsController->>AccountReadParamsValidator: validate({ accountId })
    AccountReadParamsValidator-->>AccountsController: valid
    AccountsController->>AccountRepository: read(accountId)
    AccountRepository->>Account: findByPk(accountId, { attributes, rejectOnEmpty: false })
    Account-->>AccountRepository: account
    AccountRepository-->>AccountsController: account
    AccountsController-->>Client: 200 OK
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant AccountsController
    participant AccountReadParamsValidator
    participant AccountRepository
    participant Account

    Client->>AccountsController: get(accountId)
    AccountsController->>AccountReadParamsValidator: validate({ accountId })
    AccountReadParamsValidator-->>AccountsController: valid
    AccountsController->>AccountRepository: read(accountId)
    AccountRepository->>Account: findByPk(accountId, { attributes, rejectOnEmpty: false })
    Account-->>AccountRepository: null
    AccountRepository-->>AccountsController: null
    AccountsController-->>Client: 404 Not Found
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant AccountsController
    participant AccountReadParamsValidator

    Client->>AccountsController: get(accountId)
    AccountsController->>AccountReadParamsValidator: validate({ accountId })
    AccountReadParamsValidator-->>AccountsController: throws ValidationError
    AccountsController-->>Client: 422 Validation Error
```
