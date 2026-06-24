# OrganizationsController.create

Brief overview: Validates the create request, delegates the mutation to `OrganizationService`, optionally checks the parent organization, validates duplicate name, image signature, and custom fields, persists through `OrganizationRepository`, publishes an event, and returns the created organization.

## Method

- Route: `POST /v1/organizations/`
- Signature: `OrganizationsController.create(query: {}, body: OrganizationCreateBodyInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationCreateParamsValidator
    participant OrganizationService
    participant OrganizationRepository
    participant Organization
    participant CustomFieldService
    participant EventBus

    Client->>OrganizationsController: create(query, body)
    OrganizationsController->>OrganizationCreateParamsValidator: validate({ query, body })
    OrganizationCreateParamsValidator-->>OrganizationsController: valid
    OrganizationsController->>OrganizationService: create(body)
    opt body.parentOrgId is provided
        OrganizationService->>OrganizationRepository: read(parentOrgId)
        OrganizationRepository->>Organization: findByPk(parentOrgId)
        Organization-->>OrganizationRepository: parent organization
        OrganizationRepository-->>OrganizationService: parent organization
    end
    OrganizationService->>Organization: count({ where: { name: params.name }, group: [] })
    Organization-->>OrganizationService: count = 0
    opt body.imageBase64 is provided
        OrganizationService->>OrganizationService: hasValidImageSignature(Buffer.from(params.imageBase64, "base64"))
        OrganizationService-->>OrganizationService: valid image signature
    end
    OrganizationService->>OrganizationRepository: create(params)
    OrganizationRepository->>CustomFieldService: validate("Organization", metadata, parentOrgId)
    CustomFieldService-->>OrganizationRepository: { valid: true }
    OrganizationRepository->>Organization: create(params)
    Organization-->>OrganizationRepository: organization
    OrganizationRepository-->>OrganizationService: organization
    OrganizationService-->>OrganizationsController: organization
    OrganizationsController->>EventBus: publish(new EventMutation(...))
    EventBus-->>OrganizationsController: published
    OrganizationsController-->>Client: 201 Created
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationCreateParamsValidator

    Client->>OrganizationsController: create(query, body)
    OrganizationsController->>OrganizationCreateParamsValidator: validate({ query, body })
    OrganizationCreateParamsValidator-->>OrganizationsController: throws ValidationError
    OrganizationsController-->>Client: 422 Validation Error
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationCreateParamsValidator
    participant OrganizationService
    participant OrganizationRepository
    participant Organization

    Client->>OrganizationsController: create(query, body)
    OrganizationsController->>OrganizationCreateParamsValidator: validate({ query, body })
    OrganizationCreateParamsValidator-->>OrganizationsController: valid
    OrganizationsController->>OrganizationService: create(body)
    OrganizationService->>OrganizationRepository: read(parentOrgId)
    OrganizationRepository->>Organization: findByPk(parentOrgId)
    Organization-->>OrganizationRepository: null
    OrganizationRepository-->>OrganizationService: null
    OrganizationService-->>OrganizationsController: throws NotFoundError
    OrganizationsController-->>Client: 404 Not Found
```

## 422 Duplicate Name Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationCreateParamsValidator
    participant OrganizationService
    participant Organization

    Client->>OrganizationsController: create(query, body)
    OrganizationsController->>OrganizationCreateParamsValidator: validate({ query, body })
    OrganizationCreateParamsValidator-->>OrganizationsController: valid
    OrganizationsController->>OrganizationService: create(body)
    OrganizationService->>Organization: count({ where: { name: params.name }, group: [] })
    Organization-->>OrganizationService: count > 0
    OrganizationService-->>OrganizationsController: throws ValidationError
    OrganizationsController-->>Client: 422 Validation Error
```

## 422 Invalid Image Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationCreateParamsValidator
    participant OrganizationService

    Client->>OrganizationsController: create(query, body)
    OrganizationsController->>OrganizationCreateParamsValidator: validate({ query, body })
    OrganizationCreateParamsValidator-->>OrganizationsController: valid
    OrganizationsController->>OrganizationService: create(body)
    OrganizationService->>OrganizationService: hasValidImageSignature(Buffer.from(params.imageBase64, "base64"))
    OrganizationService-->>OrganizationsController: throws ValidationError
    OrganizationsController-->>Client: 422 Validation Error
```

## 422 Custom Field Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationCreateParamsValidator
    participant OrganizationService
    participant OrganizationRepository
    participant CustomFieldService

    Client->>OrganizationsController: create(query, body)
    OrganizationsController->>OrganizationCreateParamsValidator: validate({ query, body })
    OrganizationCreateParamsValidator-->>OrganizationsController: valid
    OrganizationsController->>OrganizationService: create(body)
    OrganizationService->>OrganizationRepository: create(params)
    OrganizationRepository->>CustomFieldService: validate("Organization", metadata, parentOrgId)
    CustomFieldService-->>OrganizationRepository: throws ValidationError
    OrganizationRepository-->>OrganizationService: throws ValidationError
    OrganizationService-->>OrganizationsController: throws ValidationError
    OrganizationsController-->>Client: 422 Validation Error
```
