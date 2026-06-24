# PhonesController.searchPost

Brief overview: Validates the POST search body, queries `PhonesRepository` directly, and returns `200 OK` when the paginated phone search completes successfully.

## Method

- Route: `POST /v1/phones/search`
- Signature: `PhonesController.searchPost(query: {}, body: PhoneSearchParamsInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneSearchWithPostParamsValidator
    participant PhonesRepository
    participant Phone

    Client->>PhonesController: searchPost(body)
    PhonesController->>PhoneSearchWithPostParamsValidator: validate(body)
    PhoneSearchWithPostParamsValidator-->>PhonesController: valid
    PhonesController->>PhonesRepository: search(body)
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
    participant PhoneSearchWithPostParamsValidator

    Client->>PhonesController: searchPost(body)
    PhonesController->>PhoneSearchWithPostParamsValidator: validate(body)
    PhoneSearchWithPostParamsValidator-->>PhonesController: throws ValidationError
    PhonesController-->>Client: 422 Validation Error
```
