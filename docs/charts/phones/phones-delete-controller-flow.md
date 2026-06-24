# PhonesController.delete

Brief overview: Validates the path parameter, reads the phone before deletion through `PhonesRepository`, deletes it, publishes an event, and finishes with `204 No Content`.

## Method

- Route: `DELETE /v1/phones/:phoneId`
- Signature: `PhonesController.delete(phoneId: number)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneDeleteParamsValidator
    participant PhonesRepository
    participant Phone
    participant EventBus

    Client->>PhonesController: delete(phoneId)
    PhonesController->>PhoneDeleteParamsValidator: validate(phoneId)
    PhoneDeleteParamsValidator-->>PhonesController: valid
    PhonesController->>PhonesRepository: read(phoneId)
    PhonesRepository->>Phone: findByPk(phoneId, { attributes, rejectOnEmpty: false })
    Phone-->>PhonesRepository: phone
    PhonesRepository-->>PhonesController: phone
    PhonesController->>PhonesRepository: delete(phoneId)
    PhonesRepository->>Phone: destroy({ where: { id } })
    Phone-->>PhonesRepository: deleted count
    PhonesRepository-->>PhonesController: deleted
    PhonesController->>EventBus: publish(new EventMutation(...))
    EventBus-->>PhonesController: published
    PhonesController-->>Client: 204 No Content
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneDeleteParamsValidator
    participant PhonesRepository
    participant Phone

    Client->>PhonesController: delete(phoneId)
    PhonesController->>PhoneDeleteParamsValidator: validate(phoneId)
    PhoneDeleteParamsValidator-->>PhonesController: valid
    PhonesController->>PhonesRepository: read(phoneId)
    PhonesRepository->>Phone: findByPk(phoneId, { attributes, rejectOnEmpty: false })
    Phone-->>PhonesRepository: null
    PhonesRepository-->>PhonesController: null
    PhonesController->>PhonesController: throw NotFoundError(...)
    PhonesController-->>Client: 404 Not Found
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneDeleteParamsValidator

    Client->>PhonesController: delete(phoneId)
    PhonesController->>PhoneDeleteParamsValidator: validate(phoneId)
    PhoneDeleteParamsValidator-->>PhonesController: throws ValidationError
    PhonesController-->>Client: 422 Validation Error
```
