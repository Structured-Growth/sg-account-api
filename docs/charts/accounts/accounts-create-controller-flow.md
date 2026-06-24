# AccountsController.create

Brief overview: Validates the create request, delegates to `AccountsService` for organization lookup and account creation, performs custom field validation inside `AccountRepository.create`, publishes an event, and returns the created account with public fields only.

## Method

- Route: `POST /v1/accounts`
- Signature: `AccountsController.create(query: {}, body: AccountCreateBodyInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant AccountsController
    participant AccountCreateParamsValidator
    participant AccountsService
    participant OrganizationRepository
    participant AccountRepository
    participant CustomFieldService
    participant Account
    participant EventBus

    Client->>AccountsController: create(query, body)
    AccountsController->>AccountCreateParamsValidator: validate({ query, body })
    AccountCreateParamsValidator-->>AccountsController: valid
    AccountsController->>AccountsService: create(body)
    AccountsService->>OrganizationRepository: read(params.orgId)
    OrganizationRepository-->>AccountsService: organization
    AccountsService->>AccountRepository: create(params)
    AccountRepository->>CustomFieldService: validate("Account", metadata, orgId)
    CustomFieldService-->>AccountRepository: { valid: true }
    AccountRepository->>Account: create(params)
    Account-->>AccountRepository: account
    AccountRepository-->>AccountsService: account
    AccountsService-->>AccountsController: account
    AccountsController->>EventBus: publish(new EventMutation(...))
    EventBus-->>AccountsController: published
    AccountsController-->>Client: 201 Created
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant AccountsController
    participant AccountCreateParamsValidator

    Client->>AccountsController: create(query, body)
    AccountsController->>AccountCreateParamsValidator: validate({ query, body })
    AccountCreateParamsValidator-->>AccountsController: throws ValidationError
    AccountsController-->>Client: 422 Validation Error
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant AccountsController
    participant AccountCreateParamsValidator
    participant AccountsService
    participant OrganizationRepository

    Client->>AccountsController: create(query, body)
    AccountsController->>AccountCreateParamsValidator: validate({ query, body })
    AccountCreateParamsValidator-->>AccountsController: valid
    AccountsController->>AccountsService: create(body)
    AccountsService->>OrganizationRepository: read(params.orgId)
    OrganizationRepository-->>AccountsService: null
    AccountsService-->>AccountsController: throws NotFoundError
    AccountsController-->>Client: 404 Not Found
```

## 422 Custom Field Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant AccountsController
    participant AccountCreateParamsValidator
    participant AccountsService
    participant OrganizationRepository
    participant AccountRepository
    participant CustomFieldService

    Client->>AccountsController: create(query, body)
    AccountsController->>AccountCreateParamsValidator: validate({ query, body })
    AccountCreateParamsValidator-->>AccountsController: valid
    AccountsController->>AccountsService: create(body)
    AccountsService->>OrganizationRepository: read(params.orgId)
    OrganizationRepository-->>AccountsService: organization
    AccountsService->>AccountRepository: create(params)
    AccountRepository->>CustomFieldService: validate("Account", metadata, orgId)
    CustomFieldService-->>AccountRepository: throws ValidationError
    AccountRepository-->>AccountsService: throws ValidationError
    AccountsService-->>AccountsController: throws ValidationError
    AccountsController-->>Client: 422 Validation Error
```
