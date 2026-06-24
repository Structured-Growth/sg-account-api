# OrganizationsController.getParents

Brief overview: Validates the organization id, asks `OrganizationService` for the parent chain confirmed by `getParentOrganizations`, and returns the collected parent organizations.

## Method

- Route: `GET /v1/organizations/:organizationId/parents`
- Signature: `OrganizationsController.getParents(organizationId: number)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationReadParamsValidator
    participant OrganizationService
    participant OrganizationRepository
    participant Organization

    Client->>OrganizationsController: getParents(organizationId)
    OrganizationsController->>OrganizationReadParamsValidator: validate({ organizationId })
    OrganizationReadParamsValidator-->>OrganizationsController: valid
    OrganizationsController->>OrganizationService: getParentOrganizations(organizationId)
    OrganizationService->>OrganizationRepository: read(orgId)
    OrganizationRepository->>Organization: findByPk(orgId)
    Organization-->>OrganizationRepository: organization
    OrganizationRepository-->>OrganizationService: organization
    OrganizationService->>OrganizationRepository: read(organization.parentOrgId)
    OrganizationRepository->>Organization: findByPk(organization.parentOrgId)
    Organization-->>OrganizationRepository: parent organization
    OrganizationRepository-->>OrganizationService: parent organization
    loop while parent exists
        OrganizationService->>OrganizationService: parentOrganizations.push(parent)
        OrganizationService->>OrganizationRepository: read(parent.parentOrgId)
        OrganizationRepository->>Organization: findByPk(parent.parentOrgId)
        Organization-->>OrganizationRepository: parent organization or null
        OrganizationRepository-->>OrganizationService: parent organization or null
    end
    OrganizationService-->>OrganizationsController: parentOrganizations
    OrganizationsController-->>Client: 200 OK
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationReadParamsValidator

    Client->>OrganizationsController: getParents(organizationId)
    OrganizationsController->>OrganizationReadParamsValidator: validate({ organizationId })
    OrganizationReadParamsValidator-->>OrganizationsController: throws ValidationError
    OrganizationsController-->>Client: 422 Validation Error
```
