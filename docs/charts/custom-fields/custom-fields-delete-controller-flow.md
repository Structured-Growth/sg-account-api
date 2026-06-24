# CustomFieldsController.delete

Brief overview: Validates the path parameter, reads the custom field before deletion through `CustomFieldRepository`, deletes it through `CustomField.destroy`, publishes an event, sets `204 No Content`, and returns no body.

## Method

- Route: `DELETE /v1/custom-fields/:customFieldId`
- Signature: `CustomFieldsController.delete(customFieldId: number)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant CustomFieldsController
    participant CustomFieldDeleteParamsValidator
    participant CustomFieldRepository
    participant CustomField
    participant EventBus

    Client->>CustomFieldsController: delete(customFieldId)
    CustomFieldsController->>CustomFieldDeleteParamsValidator: validate(customFieldId)
    CustomFieldDeleteParamsValidator-->>CustomFieldsController: valid
    CustomFieldsController->>CustomFieldRepository: read(customFieldId)
    CustomFieldRepository->>CustomField: findByPk(customFieldId, { attributes, rejectOnEmpty: false })
    CustomField-->>CustomFieldRepository: custom field
    CustomFieldRepository-->>CustomFieldsController: custom field
    CustomFieldsController->>CustomFieldRepository: delete(customFieldId)
    CustomFieldRepository->>CustomField: destroy({ where: { id } })
    CustomField-->>CustomFieldRepository: deleted rows
    CustomFieldRepository-->>CustomFieldsController: deleted
    CustomFieldsController->>EventBus: publish(new EventMutation(...))
    EventBus-->>CustomFieldsController: published
    CustomFieldsController->>CustomFieldsController: status(204)
    CustomFieldsController-->>Client: 204 No Content
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant CustomFieldsController
    participant CustomFieldDeleteParamsValidator
    participant CustomFieldRepository
    participant CustomField

    Client->>CustomFieldsController: delete(customFieldId)
    CustomFieldsController->>CustomFieldDeleteParamsValidator: validate(customFieldId)
    CustomFieldDeleteParamsValidator-->>CustomFieldsController: valid
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
    participant CustomFieldDeleteParamsValidator

    Client->>CustomFieldsController: delete(customFieldId)
    CustomFieldsController->>CustomFieldDeleteParamsValidator: validate(customFieldId)
    CustomFieldDeleteParamsValidator-->>CustomFieldsController: throws ValidationError
    CustomFieldsController-->>Client: 422 Validation Error
```
