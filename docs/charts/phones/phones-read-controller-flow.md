# PhonesController.get

Brief overview: Validates the path parameter, reads one phone from `PhonesRepository`, returns `200 OK` when found, and throws `NotFoundError` with `404 Not Found` when the phone does not exist.

## Method

- Route: `GET /v1/phones/:phoneId`
- Signature: `PhonesController.get(phoneId: number)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneReadParamsValidator
    participant PhonesRepository
    participant Phone

    Client->>PhonesController: get(phoneId)
    PhonesController->>PhoneReadParamsValidator: validate(phoneId)
    PhoneReadParamsValidator-->>PhonesController: valid
    PhonesController->>PhonesRepository: read(phoneId)
    PhonesRepository->>Phone: findByPk(phoneId, { attributes, rejectOnEmpty: false })
    Phone-->>PhonesRepository: phone
    PhonesRepository-->>PhonesController: phone
    PhonesController-->>Client: 200 OK
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneReadParamsValidator
    participant PhonesRepository
    participant Phone

    Client->>PhonesController: get(phoneId)
    PhonesController->>PhoneReadParamsValidator: validate(phoneId)
    PhoneReadParamsValidator-->>PhonesController: valid
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
    participant PhoneReadParamsValidator

    Client->>PhonesController: get(phoneId)
    PhonesController->>PhoneReadParamsValidator: validate(phoneId)
    PhoneReadParamsValidator-->>PhonesController: throws ValidationError
    PhonesController-->>Client: 422 Validation Error
```
