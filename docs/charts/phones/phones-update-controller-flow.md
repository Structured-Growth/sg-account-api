# PhonesController.update

Brief overview: Validates the update request, delegates to `PhonesService`, checks that the target phone exists, optionally reassigns primary-phone state, updates through `PhonesRepository` with custom field validation, publishes an event, and returns `200 OK`.

## Method

- Route: `PUT /v1/phones/:phoneId`
- Signature: `PhonesController.update(phoneId: number, query: {}, body: PhoneUpdateBodyInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneUpdateParamsValidator
    participant PhonesService
    participant PhonesRepository
    participant CustomFieldService
    participant Phone
    participant EventBus

    Client->>PhonesController: update(phoneId, body)
    PhonesController->>PhoneUpdateParamsValidator: validate(phoneId, body)
    PhoneUpdateParamsValidator-->>PhonesController: valid
    PhonesController->>PhonesService: update(phoneId, body)
    PhonesService->>PhonesRepository: read(phoneId)
    PhonesRepository->>Phone: findByPk(phoneId, { attributes, rejectOnEmpty: false })
    Phone-->>PhonesRepository: phone
    PhonesRepository-->>PhonesService: phone
    opt isPrimary === true
        PhonesService->>PhonesRepository: search(params)
        PhonesRepository->>Phone: findAndCountAll({ where, offset, limit, order })
        Phone-->>PhonesRepository: { rows, count }
        PhonesRepository-->>PhonesService: search result
        loop each phone in account
            PhonesService->>PhonesRepository: update(phoneId, params)
            PhonesRepository->>PhonesRepository: read(phoneId)
            PhonesRepository->>Phone: findByPk(phoneId, { attributes, rejectOnEmpty: false })
            Phone-->>PhonesRepository: phone
            PhonesRepository->>Phone: setAttributes(params)
            PhonesRepository->>CustomFieldService: validate("Phone", metadata, orgId)
            CustomFieldService-->>PhonesRepository: valid
            PhonesRepository->>Phone: save()
            Phone-->>PhonesRepository: updated phone
            PhonesRepository-->>PhonesService: updated phone
        end
    end
    opt isPrimary is provided and false
        PhonesService->>PhonesRepository: search(params)
        PhonesRepository->>Phone: findAndCountAll({ where, offset, limit, order })
        Phone-->>PhonesRepository: { rows, count }
        PhonesRepository-->>PhonesService: search result
    end
    PhonesService->>PhonesRepository: update(phoneId, params)
    PhonesRepository->>PhonesRepository: read(phoneId)
    PhonesRepository->>Phone: findByPk(phoneId, { attributes, rejectOnEmpty: false })
    Phone-->>PhonesRepository: phone
    PhonesRepository->>Phone: setAttributes(params)
    PhonesRepository->>CustomFieldService: validate("Phone", metadata, orgId)
    CustomFieldService-->>PhonesRepository: valid
    PhonesRepository->>Phone: save()
    Phone-->>PhonesRepository: updated phone
    PhonesRepository-->>PhonesService: updated phone
    PhonesService-->>PhonesController: updated phone
    PhonesController->>EventBus: publish(new EventMutation(...))
    EventBus-->>PhonesController: published
    PhonesController-->>Client: 200 OK
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneUpdateParamsValidator

    Client->>PhonesController: update(phoneId, body)
    PhonesController->>PhoneUpdateParamsValidator: validate(phoneId, body)
    PhoneUpdateParamsValidator-->>PhonesController: throws ValidationError
    PhonesController-->>Client: 422 Validation Error
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneUpdateParamsValidator
    participant PhonesService
    participant PhonesRepository
    participant Phone

    Client->>PhonesController: update(phoneId, body)
    PhonesController->>PhoneUpdateParamsValidator: validate(phoneId, body)
    PhoneUpdateParamsValidator-->>PhonesController: valid
    PhonesController->>PhonesService: update(phoneId, body)
    PhonesService->>PhonesRepository: read(phoneId)
    PhonesRepository->>Phone: findByPk(phoneId, { attributes, rejectOnEmpty: false })
    Phone-->>PhonesRepository: null
    PhonesRepository-->>PhonesService: null
    PhonesService-->>PhonesController: throws NotFoundError
    PhonesController-->>Client: 404 Not Found
```

## 422 One Primary Phone Validation Failure

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneUpdateParamsValidator
    participant PhonesService
    participant PhonesRepository
    participant Phone

    Client->>PhonesController: update(phoneId, body)
    PhonesController->>PhoneUpdateParamsValidator: validate(phoneId, body)
    PhoneUpdateParamsValidator-->>PhonesController: valid
    PhonesController->>PhonesService: update(phoneId, body)
    PhonesService->>PhonesRepository: read(phoneId)
    PhonesRepository->>Phone: findByPk(phoneId, { attributes, rejectOnEmpty: false })
    Phone-->>PhonesRepository: phone
    PhonesRepository-->>PhonesService: phone
    PhonesService->>PhonesRepository: search(params)
    PhonesRepository->>Phone: findAndCountAll({ where, offset, limit, order })
    Phone-->>PhonesRepository: { rows, count }
    PhonesRepository-->>PhonesService: search result
    PhonesService-->>PhonesController: throws ValidationError
    PhonesController-->>Client: 422 Validation Error
```

## 422 Custom Field Validation Failure

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneUpdateParamsValidator
    participant PhonesService
    participant PhonesRepository
    participant CustomFieldService
    participant Phone

    Client->>PhonesController: update(phoneId, body)
    PhonesController->>PhoneUpdateParamsValidator: validate(phoneId, body)
    PhoneUpdateParamsValidator-->>PhonesController: valid
    PhonesController->>PhonesService: update(phoneId, body)
    PhonesService->>PhonesRepository: read(phoneId)
    PhonesRepository->>Phone: findByPk(phoneId, { attributes, rejectOnEmpty: false })
    Phone-->>PhonesRepository: phone
    PhonesRepository-->>PhonesService: phone
    PhonesService->>PhonesRepository: update(phoneId, params)
    PhonesRepository->>PhonesRepository: read(phoneId)
    PhonesRepository->>Phone: findByPk(phoneId, { attributes, rejectOnEmpty: false })
    Phone-->>PhonesRepository: phone
    PhonesRepository->>Phone: setAttributes(params)
    PhonesRepository->>CustomFieldService: validate("Phone", metadata, orgId)
    CustomFieldService-->>PhonesRepository: throws ValidationError
    PhonesRepository-->>PhonesService: throws ValidationError
    PhonesService-->>PhonesController: throws ValidationError
    PhonesController-->>Client: 422 Validation Error
```
