# EmailsController.sendCode

Brief overview: Validates the path parameter, delegates to `EmailsService` to read the email, optionally generates and stores a new verification code, sends the email through `Mailer`, and finishes with `204 No Content`.

## Method

- Route: `POST /v1/emails/:emailId/send-code`
- Signature: `EmailsController.sendCode(emailId: number)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant EmailSendCodeParamsValidator
    participant EmailsService
    participant EmailsRepository
    participant Email
    participant Mailer

    Client->>EmailsController: sendCode(emailId)
    EmailsController->>EmailSendCodeParamsValidator: validate(emailId)
    EmailSendCodeParamsValidator-->>EmailsController: valid
    EmailsController->>EmailsService: sendVerificationEmail(emailId)
    EmailsService->>EmailsRepository: read(emailId)
    EmailsRepository->>Email: findByPk(emailId, { attributes, rejectOnEmpty: false })
    Email-->>EmailsRepository: email
    EmailsRepository-->>EmailsService: email
    opt code is not passed from create flow
        EmailsService->>EmailsService: generateVerificationCode()
        EmailsService->>EmailsRepository: update(emailId, params)
        EmailsRepository->>EmailsRepository: read(emailId)
        EmailsRepository->>Email: findByPk(emailId, { attributes, rejectOnEmpty: false })
        Email-->>EmailsRepository: email
        EmailsRepository->>Email: setAttributes(params)
        EmailsRepository->>Email: save()
        Email-->>EmailsRepository: updated email
        EmailsRepository-->>EmailsService: updated email
    end
    EmailsService->>Mailer: send(message)
    Mailer-->>EmailsService: sent
    EmailsService-->>EmailsController: email
    EmailsController-->>Client: 204 No Content
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant EmailSendCodeParamsValidator
    participant EmailsService
    participant EmailsRepository
    participant Email

    Client->>EmailsController: sendCode(emailId)
    EmailsController->>EmailSendCodeParamsValidator: validate(emailId)
    EmailSendCodeParamsValidator-->>EmailsController: valid
    EmailsController->>EmailsService: sendVerificationEmail(emailId)
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
    participant EmailSendCodeParamsValidator

    Client->>EmailsController: sendCode(emailId)
    EmailsController->>EmailSendCodeParamsValidator: validate(emailId)
    EmailSendCodeParamsValidator-->>EmailsController: throws ValidationError
    EmailsController-->>Client: 422 Validation Error
```
