# PhonesController.create

Brief overview: Validates the create request, delegates to `PhonesService` for account and user lookup, checks for duplicate phones and primary-phone state, creates the phone through `PhonesRepository` with custom field validation, optionally sends a verification code through `SmsService`, publishes an event, and returns `201 Created`.

## Method

- Route: `POST /v1/phones`
- Signature: `PhonesController.create(query: {}, body: PhoneCreateBodyInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneCreateParamsValidator
    participant PhonesService
    participant AccountRepository
    participant UsersRepository
    participant PhonesRepository
    participant CustomFieldService
    participant SmsService
    participant Phone
    participant EventBus

    Client->>PhonesController: create(body)
    PhonesController->>PhoneCreateParamsValidator: validate(body)
    PhoneCreateParamsValidator-->>PhonesController: valid
    PhonesController->>PhonesService: create(body)
    par account lookup
        PhonesService->>AccountRepository: read(accountId)
        AccountRepository-->>PhonesService: account
    and user lookup
        PhonesService->>UsersRepository: read(userId)
        UsersRepository-->>PhonesService: user
    end
    PhonesService->>PhonesRepository: search(params)
    PhonesRepository->>Phone: findAndCountAll({ where, offset, limit, order })
    Phone-->>PhonesRepository: { rows, count }
    PhonesRepository-->>PhonesService: search result
    PhonesService->>PhonesService: determine isPrimary
    PhonesService->>PhonesService: generateVerificationCode()
    PhonesService->>PhonesRepository: create(params)
    PhonesRepository->>CustomFieldService: validate("Phone", metadata, orgId)
    CustomFieldService-->>PhonesRepository: valid
    PhonesRepository->>Phone: create(params)
    Phone-->>PhonesRepository: phone
    PhonesRepository-->>PhonesService: phone
    opt sendVerificationCode is true
        PhonesService->>PhonesService: sendVerificationCode(phoneId, code)
        PhonesService->>PhonesRepository: read(phoneId)
        PhonesRepository->>Phone: findByPk(phoneId, { attributes, rejectOnEmpty: false })
        Phone-->>PhonesRepository: phone
        PhonesRepository-->>PhonesService: phone
        PhonesService->>SmsService: send(phoneNumber, message)
        SmsService-->>PhonesService: sent
    end
    PhonesService-->>PhonesController: phone
    PhonesController->>EventBus: publish(new EventMutation(...))
    EventBus-->>PhonesController: published
    PhonesController-->>Client: 201 Created
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneCreateParamsValidator

    Client->>PhonesController: create(body)
    PhonesController->>PhoneCreateParamsValidator: validate(body)
    PhoneCreateParamsValidator-->>PhonesController: throws ValidationError
    PhonesController-->>Client: 422 Validation Error
```

## 422 Duplicate Phone Validation Failure

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneCreateParamsValidator
    participant PhonesService
    participant AccountRepository
    participant UsersRepository
    participant PhonesRepository
    participant Phone

    Client->>PhonesController: create(body)
    PhonesController->>PhoneCreateParamsValidator: validate(body)
    PhoneCreateParamsValidator-->>PhonesController: valid
    PhonesController->>PhonesService: create(body)
    par account lookup
        PhonesService->>AccountRepository: read(accountId)
        AccountRepository-->>PhonesService: account
    and user lookup
        PhonesService->>UsersRepository: read(userId)
        UsersRepository-->>PhonesService: user
    end
    PhonesService->>PhonesRepository: search(params)
    PhonesRepository->>Phone: findAndCountAll({ where, offset, limit, order })
    Phone-->>PhonesRepository: { rows, count }
    PhonesRepository-->>PhonesService: search result
    PhonesService-->>PhonesController: throws ValidationError
    PhonesController-->>Client: 422 Validation Error
```

## 500 Internal Server Error Missing Account Runtime Failure

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneCreateParamsValidator
    participant PhonesService
    participant AccountRepository
    participant UsersRepository

    Client->>PhonesController: create(body)
    PhonesController->>PhoneCreateParamsValidator: validate(body)
    PhoneCreateParamsValidator-->>PhonesController: valid
    PhonesController->>PhonesService: create(body)
    par account lookup
        PhonesService->>AccountRepository: read(accountId)
        AccountRepository-->>PhonesService: null
    and user lookup
        PhonesService->>UsersRepository: read(userId)
        UsersRepository-->>PhonesService: user
    end
    PhonesService->>PhonesService: access account.orgId
    PhonesService-->>PhonesController: throws runtime error
    PhonesController-->>Client: 500 Internal Server Error
```

## 500 Internal Server Error Missing User Runtime Failure

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneCreateParamsValidator
    participant PhonesService
    participant AccountRepository
    participant UsersRepository
    participant PhonesRepository
    participant Phone

    Client->>PhonesController: create(body)
    PhonesController->>PhoneCreateParamsValidator: validate(body)
    PhoneCreateParamsValidator-->>PhonesController: valid
    PhonesController->>PhonesService: create(body)
    par account lookup
        PhonesService->>AccountRepository: read(accountId)
        AccountRepository-->>PhonesService: account
    and user lookup
        PhonesService->>UsersRepository: read(userId)
        UsersRepository-->>PhonesService: null
    end
    PhonesService->>PhonesRepository: search(params)
    PhonesRepository->>Phone: findAndCountAll({ where, offset, limit, order })
    Phone-->>PhonesRepository: { rows, count }
    PhonesRepository-->>PhonesService: search result
    PhonesService->>PhonesService: determine isPrimary
    PhonesService->>PhonesService: generateVerificationCode()
    PhonesService->>PhonesService: access user.id
    PhonesService-->>PhonesController: throws runtime error
    PhonesController-->>Client: 500 Internal Server Error
```

## 422 Custom Field Validation Failure

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneCreateParamsValidator
    participant PhonesService
    participant AccountRepository
    participant UsersRepository
    participant PhonesRepository
    participant CustomFieldService
    participant Phone

    Client->>PhonesController: create(body)
    PhonesController->>PhoneCreateParamsValidator: validate(body)
    PhoneCreateParamsValidator-->>PhonesController: valid
    PhonesController->>PhonesService: create(body)
    par account lookup
        PhonesService->>AccountRepository: read(accountId)
        AccountRepository-->>PhonesService: account
    and user lookup
        PhonesService->>UsersRepository: read(userId)
        UsersRepository-->>PhonesService: user
    end
    PhonesService->>PhonesRepository: search(params)
    PhonesRepository->>Phone: findAndCountAll({ where, offset, limit, order })
    Phone-->>PhonesRepository: { rows, count }
    PhonesRepository-->>PhonesService: search result
    PhonesService->>PhonesService: determine isPrimary
    PhonesService->>PhonesService: generateVerificationCode()
    PhonesService->>PhonesRepository: create(params)
    PhonesRepository->>CustomFieldService: validate("Phone", metadata, orgId)
    CustomFieldService-->>PhonesRepository: throws ValidationError
    PhonesRepository-->>PhonesService: throws ValidationError
    PhonesService-->>PhonesController: throws ValidationError
    PhonesController-->>Client: 422 Validation Error
```
