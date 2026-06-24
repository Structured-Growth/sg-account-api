# AccountsController.delete

Brief overview: Validates the account id, reads the target account before deletion, deletes it through `AccountRepository`, publishes a delete event, and finishes with an empty `204 No Content` response.

## Method

- Route: `DELETE /v1/accounts/:accountId`
- Signature: `AccountsController.delete(accountId: number)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant AccountsController
    participant AccountDeleteParamsValidator
    participant AccountRepository
    participant Account
    participant EventBus

    Client->>AccountsController: delete(accountId)
    AccountsController->>AccountDeleteParamsValidator: validate({ accountId })
    AccountDeleteParamsValidator-->>AccountsController: valid
    AccountsController->>AccountRepository: read(accountId)
    AccountRepository->>Account: findByPk(accountId, { attributes, rejectOnEmpty: false })
    Account-->>AccountRepository: account
    AccountRepository-->>AccountsController: account
    AccountsController->>AccountRepository: delete(accountId)
    AccountRepository->>Account: destroy({ where: { id: accountId } })
    Account-->>AccountRepository: n = 1
    AccountRepository-->>AccountsController: void
    AccountsController->>EventBus: publish(new EventMutation(...))
    EventBus-->>AccountsController: published
    AccountsController->>AccountsController: set response.status(204)
    AccountsController-->>Client: 204 No Content
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant AccountsController
    participant AccountDeleteParamsValidator
    participant AccountRepository
    participant Account

    Client->>AccountsController: delete(accountId)
    AccountsController->>AccountDeleteParamsValidator: validate({ accountId })
    AccountDeleteParamsValidator-->>AccountsController: valid
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
    participant AccountDeleteParamsValidator

    Client->>AccountsController: delete(accountId)
    AccountsController->>AccountDeleteParamsValidator: validate({ accountId })
    AccountDeleteParamsValidator-->>AccountsController: throws ValidationError
    AccountsController-->>Client: 422 Validation Error
```
