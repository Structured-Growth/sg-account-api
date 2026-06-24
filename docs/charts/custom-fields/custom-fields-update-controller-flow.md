# CustomFieldsController.update

Brief overview: Validates the update request, checks that the custom field exists, resolves duplicate conflicts with the next `entity` and `name` values, updates through `CustomFieldRepository`, publishes an event, and returns `200 OK` with the public custom-field attributes (`id`, `orgId`, `entity`, `title`, `name`, `schema`, `createdAt`, `updatedAt`, `status`, `arn`).

## Method

- Route: `PUT /v1/custom-fields/:customFieldId`
- Signature: `CustomFieldsController.update(customFieldId: number, query: {}, body: CustomFieldUpdateBodyInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant CustomFieldsController
    participant CustomFieldUpdateParamsValidator
    participant CustomFieldService
    participant CustomFieldRepository
    participant CustomField
    participant EventBus

    Client->>CustomFieldsController: update(customFieldId, body)
    CustomFieldsController->>CustomFieldUpdateParamsValidator: validate(customFieldId, body)
    CustomFieldUpdateParamsValidator-->>CustomFieldsController: valid
    CustomFieldsController->>CustomFieldService: update(customFieldId, body)
    CustomFieldService->>CustomFieldRepository: read(customFieldId)
    CustomFieldRepository->>CustomField: findByPk(customFieldId, { attributes, rejectOnEmpty: false })
    CustomField-->>CustomFieldRepository: custom field
    CustomFieldRepository-->>CustomFieldService: custom field
    CustomFieldService->>CustomFieldService: next entity/name use body values or current values
    CustomFieldService->>CustomFieldRepository: search(params)
    CustomFieldRepository->>CustomField: findAndCountAll({ where, offset, limit, order })
    CustomField-->>CustomFieldRepository: { rows, count }
    CustomFieldRepository-->>CustomFieldService: search result
    CustomFieldService->>CustomFieldService: ignore matching result when id equals customFieldId
    CustomFieldService->>CustomFieldRepository: update(customFieldId, params)
    CustomFieldRepository->>CustomFieldRepository: read(customFieldId)
    CustomFieldRepository->>CustomField: findByPk(customFieldId, { attributes, rejectOnEmpty: false })
    CustomField-->>CustomFieldRepository: custom field
    CustomFieldRepository->>CustomField: setAttributes(params)
    CustomFieldRepository->>CustomField: save()
    CustomField-->>CustomFieldRepository: updated custom field
    CustomFieldRepository-->>CustomFieldService: updated custom field
    CustomFieldService-->>CustomFieldsController: updated custom field
    CustomFieldsController->>EventBus: publish(new EventMutation(...))
    EventBus-->>CustomFieldsController: published
    CustomFieldsController-->>Client: 200 OK
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant CustomFieldsController
    participant CustomFieldUpdateParamsValidator

    Client->>CustomFieldsController: update(customFieldId, body)
    CustomFieldsController->>CustomFieldUpdateParamsValidator: validate(customFieldId, body)
    CustomFieldUpdateParamsValidator-->>CustomFieldsController: throws ValidationError
    CustomFieldsController-->>Client: 422 Validation Error
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant CustomFieldsController
    participant CustomFieldUpdateParamsValidator
    participant CustomFieldService
    participant CustomFieldRepository
    participant CustomField

    Client->>CustomFieldsController: update(customFieldId, body)
    CustomFieldsController->>CustomFieldUpdateParamsValidator: validate(customFieldId, body)
    CustomFieldUpdateParamsValidator-->>CustomFieldsController: valid
    CustomFieldsController->>CustomFieldService: update(customFieldId, body)
    CustomFieldService->>CustomFieldRepository: read(customFieldId)
    CustomFieldRepository->>CustomField: findByPk(customFieldId, { attributes, rejectOnEmpty: false })
    CustomField-->>CustomFieldRepository: null
    CustomFieldRepository-->>CustomFieldService: null
    CustomFieldService-->>CustomFieldsController: throws NotFoundError
    CustomFieldsController-->>Client: 404 Not Found
```

## 422 Duplicate Custom Field Validation Failure

```mermaid
sequenceDiagram
    actor Client
    participant CustomFieldsController
    participant CustomFieldUpdateParamsValidator
    participant CustomFieldService
    participant CustomFieldRepository
    participant CustomField

    Client->>CustomFieldsController: update(customFieldId, body)
    CustomFieldsController->>CustomFieldUpdateParamsValidator: validate(customFieldId, body)
    CustomFieldUpdateParamsValidator-->>CustomFieldsController: valid
    CustomFieldsController->>CustomFieldService: update(customFieldId, body)
    CustomFieldService->>CustomFieldRepository: read(customFieldId)
    CustomFieldRepository->>CustomField: findByPk(customFieldId, { attributes, rejectOnEmpty: false })
    CustomField-->>CustomFieldRepository: custom field
    CustomFieldRepository-->>CustomFieldService: custom field
    CustomFieldService->>CustomFieldService: next entity/name use body values or current values
    CustomFieldService->>CustomFieldRepository: search(params)
    CustomFieldRepository->>CustomField: findAndCountAll({ where, offset, limit, order })
    CustomField-->>CustomFieldRepository: { rows, count }
    CustomFieldRepository-->>CustomFieldService: search result
    CustomFieldService->>CustomFieldService: matching result has different id
    CustomFieldService-->>CustomFieldsController: throws ValidationError
    CustomFieldsController-->>Client: 422 Validation Error
```
