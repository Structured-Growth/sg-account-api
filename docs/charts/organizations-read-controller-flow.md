# OrganizationsController.get

Brief overview: Read validates the path parameter, loads one `Organization` by primary key, throws `NotFoundError` when absent, and maps the model to the public response.

## Method

Route: `GET /v1/organizations/:organizationId`  
Controller method: `async get(@Path() organizationId: number)`

## Success

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationReadParamsValidator
    participant OrganizationRepository
    participant Organization

    Client->>OrganizationsController: GET /v1/organizations/:organizationId
    OrganizationsController->>OrganizationReadParamsValidator: validate({ organizationId })
    OrganizationReadParamsValidator-->>OrganizationsController: validated organizationId
    OrganizationsController->>OrganizationRepository: read(organizationId)
    OrganizationRepository->>Organization: findByPk(organizationId)
    Organization-->>OrganizationRepository: organization
    OrganizationRepository-->>OrganizationsController: organization
    OrganizationsController->>OrganizationsController: map organization.toJSON(), imageUrl, arn
    OrganizationsController-->>Client: 200 OK + PublicOrganizationAttributes
```

## 422 Validation Error

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationReadParamsValidator

    Client->>OrganizationsController: GET /v1/organizations/:organizationId
    OrganizationsController->>OrganizationReadParamsValidator: validate({ organizationId })
    OrganizationReadParamsValidator-->>OrganizationsController: validation errors
    OrganizationsController-->>Client: 422 Validation Error
```

## 404 Not Found

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationReadParamsValidator
    participant OrganizationRepository
    participant Organization

    Client->>OrganizationsController: GET /v1/organizations/:organizationId
    OrganizationsController->>OrganizationReadParamsValidator: validate({ organizationId })
    OrganizationReadParamsValidator-->>OrganizationsController: validated organizationId
    OrganizationsController->>OrganizationRepository: read(organizationId)
    OrganizationRepository->>Organization: findByPk(organizationId)
    Organization-->>OrganizationRepository: null
    OrganizationRepository-->>OrganizationsController: null
    OrganizationsController-->>Client: 404 Not Found
```

Sources:
- `src/controllers/v1/organizations.controller.ts`
- `src/modules/organizations/organization.repository.ts`
- `src/validators/organization-read-params.validator.ts`
- `database/models/organization.ts`
- `test/api/v1/organizations/read.test.ts`

Assumptions: none
