# OrganizationsController.getParents

Brief overview: Get parents validates the path parameter, loads the target organization, then walks the `parentOrgId` chain through `OrganizationService.getParentOrganizations()` until no further parent is found.

## Method

Route: `GET /v1/organizations/:organizationId/parents`  
Controller method: `async getParents(@Path() organizationId: number)`

## Success

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationReadParamsValidator
    participant OrganizationService
    participant OrganizationRepository
    participant Organization

    Client->>OrganizationsController: GET /v1/organizations/:organizationId/parents
    OrganizationsController->>OrganizationReadParamsValidator: validate({ organizationId })
    OrganizationReadParamsValidator-->>OrganizationsController: validated organizationId
    OrganizationsController->>OrganizationService: getParentOrganizations(organizationId)
    OrganizationService->>OrganizationRepository: read(organizationId)
    OrganizationRepository->>Organization: findByPk(organizationId)
    Organization-->>OrganizationRepository: organization
    OrganizationRepository-->>OrganizationService: organization
    OrganizationService->>OrganizationRepository: read(organization.parentOrgId)
    OrganizationRepository->>Organization: findByPk(parentOrgId)
    Organization-->>OrganizationRepository: parent organization
    OrganizationRepository-->>OrganizationService: parent organization
    loop while parent exists
        OrganizationService->>OrganizationRepository: read(parent.parentOrgId)
        OrganizationRepository->>Organization: findByPk(parent.parentOrgId)
        Organization-->>OrganizationRepository: next parent or null
        OrganizationRepository-->>OrganizationService: next parent or null
    end
    OrganizationService-->>OrganizationsController: parentOrganizations[]
    OrganizationsController->>OrganizationsController: map organization.toJSON(), imageUrl, arn
    OrganizationsController-->>Client: 200 OK + PublicOrganizationAttributes[]
```

## 422 Validation Error

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationReadParamsValidator

    Client->>OrganizationsController: GET /v1/organizations/:organizationId/parents
    OrganizationsController->>OrganizationReadParamsValidator: validate({ organizationId })
    OrganizationReadParamsValidator-->>OrganizationsController: validation errors
    OrganizationsController-->>Client: 422 Validation Error
```

Sources:
- `src/controllers/v1/organizations.controller.ts`
- `src/modules/organizations/organization.service.ts`
- `src/modules/organizations/organization.repository.ts`
- `src/validators/organization-read-params.validator.ts`
- `database/models/organization.ts`
- `test/api/v1/organizations/get-parents.test.ts`

Assumptions: none
