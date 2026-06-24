# EmailsController.create

Brief overview: Validates the create request, delegates to `EmailsService` for account and user lookup, checks for duplicate emails and primary-email state, creates the email through `EmailsRepository` with custom field validation, optionally sends a verification email, publishes an event, and returns `201 Created`.

## Method

- Route: `POST /v1/emails`
- Signature: `EmailsController.create(query: {}, body: EmailCreateBodyInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant CreateEmailParamsValidator
    participant EmailsService
    participant AccountRepository
    participant UsersRepository
    participant EmailsRepository
    participant CustomFieldService
    participant Email
    participant Mailer
    participant EventBus

    Client->>EmailsController: create(body)
    EmailsController->>CreateEmailParamsValidator: validate(body)
    CreateEmailParamsValidator-->>EmailsController: valid
    EmailsController->>EmailsService: create(body)
    par account lookup
        EmailsService->>AccountRepository: read(accountId)
        AccountRepository-->>EmailsService: account
    and user lookup
        EmailsService->>UsersRepository: read(userId)
        UsersRepository-->>EmailsService: user
    end
    EmailsService->>EmailsRepository: search(params)
    EmailsRepository-->>EmailsService: search result
    EmailsService->>EmailsService: determine isPrimary
    EmailsService->>EmailsService: generateVerificationCode()
    EmailsService->>EmailsRepository: create(params)
    EmailsRepository->>CustomFieldService: validate("Email", metadata, orgId)
    CustomFieldService-->>EmailsRepository: valid
    EmailsRepository->>Email: create(params)
    Email-->>EmailsRepository: email
    EmailsRepository-->>EmailsService: email
    opt sendVerificationCode is true
        EmailsService->>EmailsService: sendVerificationEmail(emailId, code)
        EmailsService->>EmailsRepository: read(emailId)
        EmailsRepository->>Email: findByPk(emailId, { attributes, rejectOnEmpty: false })
        Email-->>EmailsRepository: email
        EmailsRepository-->>EmailsService: email
        EmailsService->>Mailer: send(message)
        Mailer-->>EmailsService: sent
    end
    EmailsService-->>EmailsController: email
    EmailsController->>EventBus: publish(new EventMutation(...))
    EventBus-->>EmailsController: published
    EmailsController-->>Client: 201 Created
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant CreateEmailParamsValidator

    Client->>EmailsController: create(body)
    EmailsController->>CreateEmailParamsValidator: validate(body)
    CreateEmailParamsValidator-->>EmailsController: throws ValidationError
    EmailsController-->>Client: 422 Validation Error
```

## 404 Account Not Found

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant CreateEmailParamsValidator
    participant EmailsService
    participant AccountRepository
    participant UsersRepository

    Client->>EmailsController: create(body)
    EmailsController->>CreateEmailParamsValidator: validate(body)
    CreateEmailParamsValidator-->>EmailsController: valid
    EmailsController->>EmailsService: create(body)
    par account lookup
        EmailsService->>AccountRepository: read(accountId)
        AccountRepository-->>EmailsService: null
    and user lookup
        EmailsService->>UsersRepository: read(userId)
        UsersRepository-->>EmailsService: user
    end
    EmailsService-->>EmailsController: throws NotFoundError
    EmailsController-->>Client: 404 Not Found
```

## 404 User Not Found

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant CreateEmailParamsValidator
    participant EmailsService
    participant AccountRepository
    participant UsersRepository

    Client->>EmailsController: create(body)
    EmailsController->>CreateEmailParamsValidator: validate(body)
    CreateEmailParamsValidator-->>EmailsController: valid
    EmailsController->>EmailsService: create(body)
    par account lookup
        EmailsService->>AccountRepository: read(accountId)
        AccountRepository-->>EmailsService: account
    and user lookup
        EmailsService->>UsersRepository: read(userId)
        UsersRepository-->>EmailsService: null
    end
    EmailsService-->>EmailsController: throws NotFoundError
    EmailsController-->>Client: 404 Not Found
```

## 422 Duplicate Email Validation Failure

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant CreateEmailParamsValidator
    participant EmailsService
    participant AccountRepository
    participant UsersRepository
    participant EmailsRepository
    participant Email

    Client->>EmailsController: create(body)
    EmailsController->>CreateEmailParamsValidator: validate(body)
    CreateEmailParamsValidator-->>EmailsController: valid
    EmailsController->>EmailsService: create(body)
    par account lookup
        EmailsService->>AccountRepository: read(accountId)
        AccountRepository-->>EmailsService: account
    and user lookup
        EmailsService->>UsersRepository: read(userId)
        UsersRepository-->>EmailsService: user
    end
    EmailsService->>EmailsRepository: search(params)
    EmailsRepository->>Email: findAndCountAll({ where, offset, limit, order })
    Email-->>EmailsRepository: { rows, count }
    EmailsRepository-->>EmailsService: search result
    EmailsService-->>EmailsController: throws ValidationError
    EmailsController-->>Client: 422 Validation Error
```

## 422 Custom Field Validation Failure

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant CreateEmailParamsValidator
    participant EmailsService
    participant AccountRepository
    participant UsersRepository
    participant EmailsRepository
    participant CustomFieldService
    participant Email

    Client->>EmailsController: create(body)
    EmailsController->>CreateEmailParamsValidator: validate(body)
    CreateEmailParamsValidator-->>EmailsController: valid
    EmailsController->>EmailsService: create(body)
    par account lookup
        EmailsService->>AccountRepository: read(accountId)
        AccountRepository-->>EmailsService: account
    and user lookup
        EmailsService->>UsersRepository: read(userId)
        UsersRepository-->>EmailsService: user
    end
    EmailsService->>EmailsRepository: search(params)
    EmailsRepository-->>EmailsService: search result
    EmailsService->>EmailsService: determine isPrimary
    EmailsService->>EmailsService: generateVerificationCode()
    EmailsService->>EmailsRepository: create(params)
    EmailsRepository->>CustomFieldService: validate("Email", metadata, orgId)
    CustomFieldService-->>EmailsRepository: throws ValidationError
    EmailsRepository-->>EmailsService: throws ValidationError
    EmailsService-->>EmailsController: throws ValidationError
    EmailsController-->>Client: 422 Validation Error
```
