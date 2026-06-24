# UsersController.create

Brief overview: Validates the create request, resolves the target account and organization in `UsersService`, optionally validates the image signature, detects whether the new user must be primary, creates the record through `UsersRepository`, validates custom fields inside the repository create path, publishes an event, and returns `201 Created`.

## Method

- Route: `POST /v1/users`
- Signature: `UsersController.create(body)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant UsersController
    participant UserCreateParamsValidator
    participant UsersService
    participant AccountRepository
    participant Account
    participant UsersRepository
    participant CustomFieldService
    participant User
    participant EventBus

    Client->>UsersController: create(body)
    UsersController->>UserCreateParamsValidator: validate({ body })
    UserCreateParamsValidator-->>UsersController: valid
    UsersController->>UsersService: create(body)
    UsersService->>AccountRepository: read(accountId)
    AccountRepository-->>UsersService: account
    UsersService->>Account: $get("org")
    Account-->>UsersService: organization
    opt body.imageBase64 is provided
        UsersService->>UsersService: hasValidImageSignature(Buffer.from(imageBase64, "base64"))
        UsersService-->>UsersService: valid image signature
    end
    UsersService->>UsersRepository: search(params, { onlyTotal: true })
    UsersRepository->>User: count({ where })
    User-->>UsersRepository: count
    UsersRepository-->>UsersService: total
    UsersService->>UsersRepository: create(params)
    UsersRepository->>CustomFieldService: validate("User", metadata, orgId)
    CustomFieldService-->>UsersRepository: valid
    UsersRepository->>User: create(params)
    User-->>UsersRepository: user
    UsersRepository-->>UsersService: user
    UsersService-->>UsersController: user
    UsersController->>UsersController: response.status(201)
    UsersController->>EventBus: publish(new EventMutation(...))
    EventBus-->>UsersController: published
    UsersController-->>Client: 201 Created
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant UsersController
    participant UserCreateParamsValidator

    Client->>UsersController: create(body)
    UsersController->>UserCreateParamsValidator: validate({ body })
    UserCreateParamsValidator-->>UsersController: throws ValidationError
    UsersController-->>Client: 422 Validation Error
```

## 404 Not Found Account Not Found

```mermaid
sequenceDiagram
    actor Client
    participant UsersController
    participant UserCreateParamsValidator
    participant UsersService
    participant AccountRepository

    Client->>UsersController: create(body)
    UsersController->>UserCreateParamsValidator: validate({ body })
    UserCreateParamsValidator-->>UsersController: valid
    UsersController->>UsersService: create(body)
    UsersService->>AccountRepository: read(accountId)
    AccountRepository-->>UsersService: null
    UsersService-->>UsersController: throws NotFoundError
    UsersController-->>Client: 404 Not Found
```

## 422 Invalid Image Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant UsersController
    participant UserCreateParamsValidator
    participant UsersService
    participant AccountRepository
    participant Account

    Client->>UsersController: create(body)
    UsersController->>UserCreateParamsValidator: validate({ body })
    UserCreateParamsValidator-->>UsersController: valid
    UsersController->>UsersService: create(body)
    UsersService->>AccountRepository: read(accountId)
    AccountRepository-->>UsersService: account
    UsersService->>Account: $get("org")
    Account-->>UsersService: organization
    UsersService->>UsersService: hasValidImageSignature(Buffer.from(imageBase64, "base64"))
    UsersService-->>UsersController: throws ValidationError
    UsersController-->>Client: 422 Validation Error
```

## 422 Custom Field Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant UsersController
    participant UserCreateParamsValidator
    participant UsersService
    participant AccountRepository
    participant Account
    participant UsersRepository
    participant CustomFieldService

    Client->>UsersController: create(body)
    UsersController->>UserCreateParamsValidator: validate({ body })
    UserCreateParamsValidator-->>UsersController: valid
    UsersController->>UsersService: create(body)
    UsersService->>AccountRepository: read(accountId)
    AccountRepository-->>UsersService: account
    UsersService->>Account: $get("org")
    Account-->>UsersService: organization
    UsersService->>UsersRepository: search(params, { onlyTotal: true })
    UsersRepository-->>UsersService: total
    UsersService->>UsersRepository: create(params)
    UsersRepository->>CustomFieldService: validate("User", metadata, orgId)
    CustomFieldService-->>UsersRepository: throws ValidationError
    UsersRepository-->>UsersService: throws ValidationError
    UsersService-->>UsersController: throws ValidationError
    UsersController-->>Client: 422 Validation Error
```
