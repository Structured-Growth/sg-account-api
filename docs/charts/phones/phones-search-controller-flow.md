# PhonesController.search

Brief overview: Validates the GET search query, queries `PhonesRepository` directly, and returns `200 OK` when the paginated phone search completes successfully.

## Method

- Route: `GET /v1/phones`
- Signature: `PhonesController.search(query: PhoneSearchParamsInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneSearchParamsValidator
    participant PhonesRepository
    participant Phone

    Client->>PhonesController: search(query)
    PhonesController->>PhoneSearchParamsValidator: validate(query)
    PhoneSearchParamsValidator-->>PhonesController: valid
    PhonesController->>PhonesRepository: search(query)
    PhonesRepository->>Phone: findAndCountAll({ where, offset, limit, order })
    Phone-->>PhonesRepository: { rows, count }
    PhonesRepository-->>PhonesController: search result
    PhonesController-->>Client: 200 OK
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneSearchParamsValidator

    Client->>PhonesController: search(query)
    PhonesController->>PhoneSearchParamsValidator: validate(query)
    PhoneSearchParamsValidator-->>PhonesController: throws ValidationError
    PhonesController-->>Client: 422 Validation Error
```
