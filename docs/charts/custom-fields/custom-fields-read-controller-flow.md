# CustomFieldsController.get

Brief overview: Validates the path parameter, reads one custom field from `CustomFieldRepository`, and returns `200 OK` when the record exists.

## Method

- Route: `GET /v1/custom-fields/:customFieldId`
- Signature: `CustomFieldsController.get(customFieldId: number)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant CustomFieldsController
    participant CustomFieldReadParamsValidator
    participant CustomFieldRepository
    participant CustomField

    Client->>CustomFieldsController: get(customFieldId)
    CustomFieldsController->>CustomFieldReadParamsValidator: validate(customFieldId)
    CustomFieldReadParamsValidator-->>CustomFieldsController: valid
    CustomFieldsController->>CustomFieldRepository: read(customFieldId)
    CustomFieldRepository->>CustomField: findByPk(customFieldId, { attributes, rejectOnEmpty: false })
    CustomField-->>CustomFieldRepository: custom field
    CustomFieldRepository-->>CustomFieldsController: custom field
    CustomFieldsController-->>Client: 200 OK
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant CustomFieldsController
    participant CustomFieldReadParamsValidator
    participant CustomFieldRepository
    participant CustomField

    Client->>CustomFieldsController: get(customFieldId)
    CustomFieldsController->>CustomFieldReadParamsValidator: validate(customFieldId)
    CustomFieldReadParamsValidator-->>CustomFieldsController: valid
    CustomFieldsController->>CustomFieldRepository: read(customFieldId)
    CustomFieldRepository->>CustomField: findByPk(customFieldId, { attributes, rejectOnEmpty: false })
    CustomField-->>CustomFieldRepository: null
    CustomFieldRepository-->>CustomFieldsController: null
    CustomFieldsController-->>Client: 404 Not Found
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant CustomFieldsController
    participant CustomFieldReadParamsValidator

    Client->>CustomFieldsController: get(customFieldId)
    CustomFieldsController->>CustomFieldReadParamsValidator: validate(customFieldId)
    CustomFieldReadParamsValidator-->>CustomFieldsController: throws ValidationError
    CustomFieldsController-->>Client: 422 Validation Error
```
