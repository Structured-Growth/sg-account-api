# EmailsController.verify

Brief overview: Validates the verification request, delegates to `EmailsService.verifyEmail`, reads the email, checks the verification code and expiration in the service, updates the record through `EmailsRepository`, publishes an event, and returns `200 OK`.

## Method

- Route: `POST /v1/emails/:emailId/verify`
- Signature: `EmailsController.verify(emailId: number, query: {}, body: EmailVerifyBodyInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant EmailVerifyParamsValidator
    participant EmailsService
    participant EmailsRepository
    participant CustomFieldService
    participant Email
    participant EventBus

    Client->>EmailsController: verify(emailId, body)
    EmailsController->>EmailVerifyParamsValidator: validate(emailId, body)
    EmailVerifyParamsValidator-->>EmailsController: valid
    EmailsController->>EmailsService: verifyEmail(emailId, verificationCode)
    EmailsService->>EmailsRepository: read(emailId)
    EmailsRepository->>Email: findByPk(emailId, { attributes, rejectOnEmpty: false })
    Email-->>EmailsRepository: email
    EmailsRepository-->>EmailsService: email
    EmailsService->>EmailsService: verify code and expiration
    EmailsService->>EmailsRepository: update(emailId, params)
    EmailsRepository->>EmailsRepository: read(emailId)
    EmailsRepository->>Email: findByPk(emailId, { attributes, rejectOnEmpty: false })
    Email-->>EmailsRepository: email
    EmailsRepository->>Email: setAttributes(params)
    EmailsRepository->>CustomFieldService: validate("Email", metadata, orgId)
    CustomFieldService-->>EmailsRepository: valid
    EmailsRepository->>Email: save()
    Email-->>EmailsRepository: updated email
    EmailsRepository-->>EmailsService: updated email
    EmailsService-->>EmailsController: updated email
    EmailsController->>EventBus: publish(new EventMutation(...))
    EventBus-->>EmailsController: published
    EmailsController-->>Client: 200 OK
```

## 404 Invalid Or Expired Verification Code

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant EmailVerifyParamsValidator
    participant EmailsService
    participant EmailsRepository
    participant Email

    Client->>EmailsController: verify(emailId, body)
    EmailsController->>EmailVerifyParamsValidator: validate(emailId, body)
    EmailVerifyParamsValidator-->>EmailsController: valid
    EmailsController->>EmailsService: verifyEmail(emailId, verificationCode)
    EmailsService->>EmailsRepository: read(emailId)
    EmailsRepository->>Email: findByPk(emailId, { attributes, rejectOnEmpty: false })
    Email-->>EmailsRepository: email
    EmailsRepository-->>EmailsService: email
    EmailsService->>EmailsService: verify code and expiration
    EmailsService-->>EmailsController: throws NotFoundError
    EmailsController-->>Client: 404 Not Found
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant EmailVerifyParamsValidator
    participant EmailsService
    participant EmailsRepository
    participant Email

    Client->>EmailsController: verify(emailId, body)
    EmailsController->>EmailVerifyParamsValidator: validate(emailId, body)
    EmailVerifyParamsValidator-->>EmailsController: valid
    EmailsController->>EmailsService: verifyEmail(emailId, verificationCode)
    EmailsService->>EmailsRepository: read(emailId)
    EmailsRepository->>Email: findByPk(emailId, { attributes, rejectOnEmpty: false })
    Email-->>EmailsRepository: null
    EmailsRepository-->>EmailsService: null
    EmailsService-->>EmailsController: throws NotFoundError
    EmailsController-->>Client: 404 Not Found
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant EmailVerifyParamsValidator

    Client->>EmailsController: verify(emailId, body)
    EmailsController->>EmailVerifyParamsValidator: validate(emailId, body)
    EmailVerifyParamsValidator-->>EmailsController: throws ValidationError
    EmailsController-->>Client: 422 Validation Error
```
