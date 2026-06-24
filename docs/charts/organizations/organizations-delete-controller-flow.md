# OrganizationsController.delete

Brief overview: Validates the path parameter, reads the organization before deletion, deletes it through `OrganizationRepository`, publishes a mutation event, and returns no content.

## Method

- Route: `DELETE /v1/organizations/:organizationId`
- Signature: `OrganizationsController.delete(organizationId: number)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationDeleteParamsValidator
    participant OrganizationRepository
    participant Organization
    participant EventBus

    Client->>OrganizationsController: delete(organizationId)
    OrganizationsController->>OrganizationDeleteParamsValidator: validate({ organizationId })
    OrganizationDeleteParamsValidator-->>OrganizationsController: valid
    OrganizationsController->>OrganizationRepository: read(organizationId)
    OrganizationRepository->>Organization: findByPk(organizationId)
    Organization-->>OrganizationRepository: organization
    OrganizationRepository-->>OrganizationsController: organization
    OrganizationsController->>OrganizationRepository: delete(organizationId)
    OrganizationRepository->>Organization: destroy({ where: { id: organizationId } })
    Organization-->>OrganizationRepository: deleted rows = 1
    OrganizationRepository-->>OrganizationsController: void
    OrganizationsController->>EventBus: publish(new EventMutation(...))
    EventBus-->>OrganizationsController: published
    OrganizationsController-->>Client: 204 No Content
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationDeleteParamsValidator

    Client->>OrganizationsController: delete(organizationId)
    OrganizationsController->>OrganizationDeleteParamsValidator: validate({ organizationId })
    OrganizationDeleteParamsValidator-->>OrganizationsController: throws ValidationError
    OrganizationsController-->>Client: 422 Validation Error
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationDeleteParamsValidator
    participant OrganizationRepository
    participant Organization

    Client->>OrganizationsController: delete(organizationId)
    OrganizationsController->>OrganizationDeleteParamsValidator: validate({ organizationId })
    OrganizationDeleteParamsValidator-->>OrganizationsController: valid
    OrganizationsController->>OrganizationRepository: read(organizationId)
    OrganizationRepository->>Organization: findByPk(organizationId)
    Organization-->>OrganizationRepository: null
    OrganizationRepository-->>OrganizationsController: null
    OrganizationsController-->>Client: 404 Not Found
```
