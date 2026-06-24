# EmailsController.update

Brief overview: Validates the update request, delegates to `EmailsService`, checks that the target email exists, optionally reassigns primary-email state, updates through `EmailsRepository` with custom field validation, publishes an event, and returns `200 OK`.

## Method

- Route: `PUT /v1/emails/:emailId`
- Signature: `EmailsController.update(emailId: number, query: {}, body: EmailUpdateBodyInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant UpdateEmailParamsValidator
    participant EmailsService
    participant EmailsRepository
    participant CustomFieldService
    participant Email
    participant EventBus

    Client->>EmailsController: update(emailId, body)
    EmailsController->>UpdateEmailParamsValidator: validate(emailId, body)
    UpdateEmailParamsValidator-->>EmailsController: valid
    EmailsController->>EmailsService: update(emailId, body)
    EmailsService->>EmailsRepository: read(emailId)
    EmailsRepository->>Email: findByPk(emailId, { attributes, rejectOnEmpty: false })
    Email-->>EmailsRepository: email
    EmailsRepository-->>EmailsService: email
    opt isPrimary === true
        EmailsService->>EmailsRepository: search(params)
        EmailsRepository->>Email: findAndCountAll({ where, offset, limit, order })
        Email-->>EmailsRepository: { rows, count }
        EmailsRepository-->>EmailsService: search result
        loop each email in account
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
        end
    end
    opt isPrimary is provided and false
        EmailsService->>EmailsRepository: search(params)
        EmailsRepository->>Email: findAndCountAll({ where, offset, limit, order })
        Email-->>EmailsRepository: { rows, count }
        EmailsRepository-->>EmailsService: search result
    end
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

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant UpdateEmailParamsValidator

    Client->>EmailsController: update(emailId, body)
    EmailsController->>UpdateEmailParamsValidator: validate(emailId, body)
    UpdateEmailParamsValidator-->>EmailsController: throws ValidationError
    EmailsController-->>Client: 422 Validation Error
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant UpdateEmailParamsValidator
    participant EmailsService
    participant EmailsRepository
    participant Email

    Client->>EmailsController: update(emailId, body)
    EmailsController->>UpdateEmailParamsValidator: validate(emailId, body)
    UpdateEmailParamsValidator-->>EmailsController: valid
    EmailsController->>EmailsService: update(emailId, body)
    EmailsService->>EmailsRepository: read(emailId)
    EmailsRepository->>Email: findByPk(emailId, { attributes, rejectOnEmpty: false })
    Email-->>EmailsRepository: null
    EmailsRepository-->>EmailsService: null
    EmailsService-->>EmailsController: throws NotFoundError
    EmailsController-->>Client: 404 Not Found
```

## 422 One Primary Email Validation Failure

```mermaid
sequenceDiagram
    actor Client
    participant EmailsController
    participant UpdateEmailParamsValidator
    participant EmailsService
    participant EmailsRepository
    participant Email

    Client->>EmailsController: update(emailId, body)
    EmailsController->>UpdateEmailParamsValidator: validate(emailId, body)
    UpdateEmailParamsValidator-->>EmailsController: valid
    EmailsController->>EmailsService: update(emailId, body)
    EmailsService->>EmailsRepository: read(emailId)
    EmailsRepository->>Email: findByPk(emailId, { attributes, rejectOnEmpty: false })
    Email-->>EmailsRepository: email
    EmailsRepository-->>EmailsService: email
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
    participant UpdateEmailParamsValidator
    participant EmailsService
    participant EmailsRepository
    participant CustomFieldService
    participant Email

    Client->>EmailsController: update(emailId, body)
    EmailsController->>UpdateEmailParamsValidator: validate(emailId, body)
    UpdateEmailParamsValidator-->>EmailsController: valid
    EmailsController->>EmailsService: update(emailId, body)
    EmailsService->>EmailsRepository: read(emailId)
    EmailsRepository->>Email: findByPk(emailId, { attributes, rejectOnEmpty: false })
    Email-->>EmailsRepository: email
    EmailsRepository-->>EmailsService: email
    EmailsService->>EmailsRepository: update(emailId, params)
    EmailsRepository->>EmailsRepository: read(emailId)
    EmailsRepository->>Email: findByPk(emailId, { attributes, rejectOnEmpty: false })
    Email-->>EmailsRepository: email
    EmailsRepository->>Email: setAttributes(params)
    EmailsRepository->>CustomFieldService: validate("Email", metadata, orgId)
    CustomFieldService-->>EmailsRepository: throws ValidationError
    EmailsRepository-->>EmailsService: throws ValidationError
    EmailsService-->>EmailsController: throws ValidationError
    EmailsController-->>Client: 422 Validation Error
```
