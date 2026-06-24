# OrganizationsController.get

Brief overview: Validates the path parameter, reads one organization from `OrganizationRepository`, and returns the public organization payload when the record exists.

## Method

- Route: `GET /v1/organizations/:organizationId`
- Signature: `OrganizationsController.get(organizationId: number)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationReadParamsValidator
    participant OrganizationRepository
    participant Organization

    Client->>OrganizationsController: get(organizationId)
    OrganizationsController->>OrganizationReadParamsValidator: validate({ organizationId })
    OrganizationReadParamsValidator-->>OrganizationsController: valid
    OrganizationsController->>OrganizationRepository: read(organizationId)
    OrganizationRepository->>Organization: findByPk(organizationId)
    Organization-->>OrganizationRepository: organization
    OrganizationRepository-->>OrganizationsController: organization
    OrganizationsController-->>Client: 200 OK
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationReadParamsValidator

    Client->>OrganizationsController: get(organizationId)
    OrganizationsController->>OrganizationReadParamsValidator: validate({ organizationId })
    OrganizationReadParamsValidator-->>OrganizationsController: throws ValidationError
    OrganizationsController-->>Client: 422 Validation Error
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationReadParamsValidator
    participant OrganizationRepository
    participant Organization

    Client->>OrganizationsController: get(organizationId)
    OrganizationsController->>OrganizationReadParamsValidator: validate({ organizationId })
    OrganizationReadParamsValidator-->>OrganizationsController: valid
    OrganizationsController->>OrganizationRepository: read(organizationId)
    OrganizationRepository->>Organization: findByPk(organizationId)
    Organization-->>OrganizationRepository: null
    OrganizationRepository-->>OrganizationsController: null
    OrganizationsController-->>Client: 404 Not Found
```
