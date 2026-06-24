# CustomFieldsController.create

Brief overview: Validates the create request, loads the organization to derive `region`, checks for a duplicate custom field by organization, entity, and name, creates the record through `CustomFieldRepository`, publishes an event, sets `201 Created`, and returns the public custom-field attributes (`id`, `orgId`, `entity`, `title`, `name`, `schema`, `createdAt`, `updatedAt`, `status`, `arn`).

## Method

- Route: `POST /v1/custom-fields`
- Signature: `CustomFieldsController.create(query: {}, body: CustomFieldCreateBodyInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant CustomFieldsController
    participant CustomFieldCreateParamsValidator
    participant CustomFieldService
    participant OrganizationRepository
    participant CustomFieldRepository
    participant CustomField
    participant EventBus

    Client->>CustomFieldsController: create(body)
    CustomFieldsController->>CustomFieldCreateParamsValidator: validate(body)
    CustomFieldCreateParamsValidator-->>CustomFieldsController: valid
    CustomFieldsController->>CustomFieldService: create(body)
    CustomFieldService->>OrganizationRepository: read(orgId)
    OrganizationRepository-->>CustomFieldService: organization
    CustomFieldService->>CustomFieldService: region = organization.region
    CustomFieldService->>CustomFieldService: status = body.status or "active"
    CustomFieldService->>CustomFieldRepository: search(params)
    CustomFieldRepository->>CustomField: findAndCountAll({ where, offset, limit, order })
    CustomField-->>CustomFieldRepository: { rows, count }
    CustomFieldRepository-->>CustomFieldService: search result
    CustomFieldService->>CustomFieldRepository: create(params)
    CustomFieldRepository->>CustomField: create(params)
    CustomField-->>CustomFieldRepository: custom field
    CustomFieldRepository-->>CustomFieldService: custom field
    CustomFieldService-->>CustomFieldsController: custom field
    CustomFieldsController->>CustomFieldsController: status(201)
    CustomFieldsController->>EventBus: publish(new EventMutation(...))
    EventBus-->>CustomFieldsController: published
    CustomFieldsController-->>Client: 201 Created
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant CustomFieldsController
    participant CustomFieldCreateParamsValidator

    Client->>CustomFieldsController: create(body)
    CustomFieldsController->>CustomFieldCreateParamsValidator: validate(body)
    CustomFieldCreateParamsValidator-->>CustomFieldsController: throws ValidationError
    CustomFieldsController-->>Client: 422 Validation Error
```

## 404 Organization Not Found

```mermaid
sequenceDiagram
    actor Client
    participant CustomFieldsController
    participant CustomFieldCreateParamsValidator
    participant CustomFieldService
    participant OrganizationRepository

    Client->>CustomFieldsController: create(body)
    CustomFieldsController->>CustomFieldCreateParamsValidator: validate(body)
    CustomFieldCreateParamsValidator-->>CustomFieldsController: valid
    CustomFieldsController->>CustomFieldService: create(body)
    CustomFieldService->>OrganizationRepository: read(orgId)
    OrganizationRepository-->>CustomFieldService: null
    CustomFieldService-->>CustomFieldsController: throws NotFoundError
    CustomFieldsController-->>Client: 404 Not Found
```

## 422 Duplicate Custom Field Validation Failure

```mermaid
sequenceDiagram
    actor Client
    participant CustomFieldsController
    participant CustomFieldCreateParamsValidator
    participant CustomFieldService
    participant OrganizationRepository
    participant CustomFieldRepository
    participant CustomField

    Client->>CustomFieldsController: create(body)
    CustomFieldsController->>CustomFieldCreateParamsValidator: validate(body)
    CustomFieldCreateParamsValidator-->>CustomFieldsController: valid
    CustomFieldsController->>CustomFieldService: create(body)
    CustomFieldService->>OrganizationRepository: read(orgId)
    OrganizationRepository-->>CustomFieldService: organization
    CustomFieldService->>CustomFieldService: region = organization.region
    CustomFieldService->>CustomFieldService: status = body.status or "active"
    CustomFieldService->>CustomFieldRepository: search(params)
    CustomFieldRepository->>CustomField: findAndCountAll({ where, offset, limit, order })
    CustomField-->>CustomFieldRepository: { rows, count }
    CustomFieldRepository-->>CustomFieldService: search result
    CustomFieldService-->>CustomFieldsController: throws ValidationError
    CustomFieldsController-->>Client: 422 Validation Error
```
