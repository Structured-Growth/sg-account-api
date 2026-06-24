# OrganizationsController.update

Brief overview: Validates the update request, delegates the mutation to `OrganizationService`, loads the target organization, optionally checks duplicate name and image signature, updates through `OrganizationRepository` with `customFieldsOrgId`, validates custom fields, saves, publishes an event, and returns the updated organization.

## Method

- Route: `PUT /v1/organizations/:organizationId`
- Signature: `OrganizationsController.update(organizationId: number, query: {}, body: OrganizationUpdateBodyInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationUpdateParamsValidator
    participant OrganizationService
    participant OrganizationRepository
    participant Organization
    participant CustomFieldService
    participant EventBus

    Client->>OrganizationsController: update(organizationId, query, body)
    OrganizationsController->>OrganizationUpdateParamsValidator: validate({ organizationId, query, body })
    OrganizationUpdateParamsValidator-->>OrganizationsController: valid
    OrganizationsController->>OrganizationService: update(organizationId, body, body.customFieldsOrgId)
    OrganizationService->>OrganizationRepository: read(organizationId)
    OrganizationRepository->>Organization: findByPk(organizationId)
    Organization-->>OrganizationRepository: organization
    OrganizationRepository-->>OrganizationService: organization
    opt body.name is provided and body.name != checkOrg.name
        OrganizationService->>Organization: count({ where: { name: params.name }, group: [] })
        Organization-->>OrganizationService: count = 0
    end
    opt body.imageBase64 is provided
        OrganizationService->>OrganizationService: hasValidImageSignature(Buffer.from(params.imageBase64, "base64"))
        OrganizationService-->>OrganizationService: valid image signature
    end
    OrganizationService->>OrganizationRepository: update(organizationId, params, customFieldsOrgId)
    OrganizationRepository->>OrganizationRepository: read(organizationId)
    OrganizationRepository->>Organization: findByPk(organizationId)
    Organization-->>OrganizationRepository: organization
    OrganizationRepository->>Organization: setAttributes(omitBy(params, isUndefined))
    OrganizationRepository->>CustomFieldService: validate("Organization", organization.toJSON().metadata, customFieldsOrgId || organization.parentOrgId)
    CustomFieldService-->>OrganizationRepository: { valid: true }
    OrganizationRepository->>Organization: save()
    Organization-->>OrganizationRepository: updated organization
    OrganizationRepository-->>OrganizationService: updated organization
    OrganizationService-->>OrganizationsController: updated organization
    OrganizationsController->>EventBus: publish(new EventMutation(...))
    EventBus-->>OrganizationsController: published
    OrganizationsController-->>Client: 200 OK
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationUpdateParamsValidator

    Client->>OrganizationsController: update(organizationId, query, body)
    OrganizationsController->>OrganizationUpdateParamsValidator: validate({ organizationId, query, body })
    OrganizationUpdateParamsValidator-->>OrganizationsController: throws ValidationError
    OrganizationsController-->>Client: 422 Validation Error
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationUpdateParamsValidator
    participant OrganizationService
    participant OrganizationRepository
    participant Organization

    Client->>OrganizationsController: update(organizationId, query, body)
    OrganizationsController->>OrganizationUpdateParamsValidator: validate({ organizationId, query, body })
    OrganizationUpdateParamsValidator-->>OrganizationsController: valid
    OrganizationsController->>OrganizationService: update(organizationId, body, body.customFieldsOrgId)
    OrganizationService->>OrganizationRepository: read(organizationId)
    OrganizationRepository->>Organization: findByPk(organizationId)
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
    participant OrganizationUpdateParamsValidator
    participant OrganizationService
    participant OrganizationRepository
    participant Organization

    Client->>OrganizationsController: update(organizationId, query, body)
    OrganizationsController->>OrganizationUpdateParamsValidator: validate({ organizationId, query, body })
    OrganizationUpdateParamsValidator-->>OrganizationsController: valid
    OrganizationsController->>OrganizationService: update(organizationId, body, body.customFieldsOrgId)
    OrganizationService->>OrganizationRepository: read(organizationId)
    OrganizationRepository->>Organization: findByPk(organizationId)
    Organization-->>OrganizationRepository: organization
    OrganizationRepository-->>OrganizationService: organization
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
    participant OrganizationUpdateParamsValidator
    participant OrganizationService
    participant OrganizationRepository
    participant Organization

    Client->>OrganizationsController: update(organizationId, query, body)
    OrganizationsController->>OrganizationUpdateParamsValidator: validate({ organizationId, query, body })
    OrganizationUpdateParamsValidator-->>OrganizationsController: valid
    OrganizationsController->>OrganizationService: update(organizationId, body, body.customFieldsOrgId)
    OrganizationService->>OrganizationRepository: read(organizationId)
    OrganizationRepository->>Organization: findByPk(organizationId)
    Organization-->>OrganizationRepository: organization
    OrganizationRepository-->>OrganizationService: organization
    OrganizationService->>OrganizationService: hasValidImageSignature(Buffer.from(params.imageBase64, "base64"))
    OrganizationService-->>OrganizationsController: throws ValidationError
    OrganizationsController-->>Client: 422 Validation Error
```

## 422 Custom Field Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationUpdateParamsValidator
    participant OrganizationService
    participant OrganizationRepository
    participant Organization
    participant CustomFieldService

    Client->>OrganizationsController: update(organizationId, query, body)
    OrganizationsController->>OrganizationUpdateParamsValidator: validate({ organizationId, query, body })
    OrganizationUpdateParamsValidator-->>OrganizationsController: valid
    OrganizationsController->>OrganizationService: update(organizationId, body, body.customFieldsOrgId)
    OrganizationService->>OrganizationRepository: update(organizationId, params, customFieldsOrgId)
    OrganizationRepository->>OrganizationRepository: read(organizationId)
    OrganizationRepository->>Organization: findByPk(organizationId)
    Organization-->>OrganizationRepository: organization
    OrganizationRepository->>Organization: setAttributes(omitBy(params, isUndefined))
    OrganizationRepository->>CustomFieldService: validate("Organization", organization.toJSON().metadata, customFieldsOrgId || organization.parentOrgId)
    CustomFieldService-->>OrganizationRepository: throws ValidationError
    OrganizationRepository-->>OrganizationService: throws ValidationError
    OrganizationService-->>OrganizationsController: throws ValidationError
    OrganizationsController-->>Client: 422 Validation Error
```
