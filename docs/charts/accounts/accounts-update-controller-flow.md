# AccountsController.update

Brief overview: Validates the update request, delegates to `AccountRepository.update`, reads the target account, mutates its attributes, validates custom fields against the current organization, saves the model, publishes an event, and returns the updated account in the final public response.

## Method

- Route: `PUT /v1/accounts/:accountId`
- Signature: `AccountsController.update(accountId: number, query: {}, body: AccountUpdateBodyInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant AccountsController
    participant AccountUpdateParamsValidator
    participant AccountRepository
    participant CustomFieldService
    participant Account
    participant EventBus

    Client->>AccountsController: update(accountId, query, body)
    AccountsController->>AccountUpdateParamsValidator: validate({ accountId, query, body })
    AccountUpdateParamsValidator-->>AccountsController: valid
    AccountsController->>AccountRepository: update(accountId, body)
    AccountRepository->>AccountRepository: read(accountId)
    AccountRepository->>Account: findByPk(accountId)
    Account-->>AccountRepository: account
    AccountRepository->>Account: setAttributes(params)
    AccountRepository->>CustomFieldService: validate("Account", metadata, orgId)
    CustomFieldService-->>AccountRepository: { valid: true }
    AccountRepository->>Account: save()
    Account-->>AccountRepository: account
    AccountRepository-->>AccountsController: account
    AccountsController->>EventBus: publish(new EventMutation(...))
    EventBus-->>AccountsController: published
    AccountsController-->>Client: 200 OK
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant AccountsController
    participant AccountUpdateParamsValidator

    Client->>AccountsController: update(accountId, query, body)
    AccountsController->>AccountUpdateParamsValidator: validate({ accountId, query, body })
    AccountUpdateParamsValidator-->>AccountsController: throws ValidationError
    AccountsController-->>Client: 422 Validation Error
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant AccountsController
    participant AccountUpdateParamsValidator
    participant AccountRepository
    participant Account

    Client->>AccountsController: update(accountId, query, body)
    AccountsController->>AccountUpdateParamsValidator: validate({ accountId, query, body })
    AccountUpdateParamsValidator-->>AccountsController: valid
    AccountsController->>AccountRepository: update(accountId, body)
    AccountRepository->>AccountRepository: read(accountId)
    AccountRepository->>Account: findByPk(accountId)
    Account-->>AccountRepository: null
    AccountRepository-->>AccountsController: throws NotFoundError
    AccountsController-->>Client: 404 Not Found
```

## 422 Custom Field Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant AccountsController
    participant AccountUpdateParamsValidator
    participant AccountRepository
    participant CustomFieldService
    participant Account

    Client->>AccountsController: update(accountId, query, body)
    AccountsController->>AccountUpdateParamsValidator: validate({ accountId, query, body })
    AccountUpdateParamsValidator-->>AccountsController: valid
    AccountsController->>AccountRepository: update(accountId, body)
    AccountRepository->>AccountRepository: read(accountId)
    AccountRepository->>Account: findByPk(accountId)
    Account-->>AccountRepository: account
    AccountRepository->>Account: setAttributes(params)
    AccountRepository->>CustomFieldService: validate("Account", metadata, orgId)
    CustomFieldService-->>AccountRepository: throws ValidationError
    AccountRepository-->>AccountsController: throws ValidationError
    AccountsController-->>Client: 422 Validation Error
```
