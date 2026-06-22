# OrganizationsController.delete

Brief overview: Delete validates the path parameter, reads the organization before deletion to obtain its ARN, deletes it through the repository, publishes a delete mutation event, and returns an empty response.

## Method

Route: `DELETE /v1/organizations/:organizationId`  
Controller method: `async delete(@Path() organizationId: number)`

## Success

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationDeleteParamsValidator
    participant OrganizationRepository
    participant Organization
    participant EventBus

    Client->>OrganizationsController: DELETE /v1/organizations/:organizationId
    OrganizationsController->>OrganizationDeleteParamsValidator: validate({ organizationId })
    OrganizationDeleteParamsValidator-->>OrganizationsController: validated organizationId
    OrganizationsController->>OrganizationRepository: read(organizationId)
    OrganizationRepository->>Organization: findByPk(organizationId)
    Organization-->>OrganizationRepository: organization
    OrganizationRepository-->>OrganizationsController: organization
    OrganizationsController->>OrganizationRepository: delete(organizationId)
    OrganizationRepository->>Organization: destroy({ where: { id: organizationId } })
    Organization-->>OrganizationRepository: deleted row count
    OrganizationRepository-->>OrganizationsController: void
    OrganizationsController->>EventBus: publish(new EventMutation(principal.arn, organization.arn, appPrefix:organizations/delete, JSON.stringify({})))
    EventBus-->>OrganizationsController: published
    OrganizationsController-->>Client: empty response
```

## 422 Validation Error

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationDeleteParamsValidator

    Client->>OrganizationsController: DELETE /v1/organizations/:organizationId
    OrganizationsController->>OrganizationDeleteParamsValidator: validate({ organizationId })
    OrganizationDeleteParamsValidator-->>OrganizationsController: validation errors
    OrganizationsController-->>Client: 422 Validation Error
```

## 404 Not Found

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationDeleteParamsValidator
    participant OrganizationRepository
    participant Organization

    Client->>OrganizationsController: DELETE /v1/organizations/:organizationId
    OrganizationsController->>OrganizationDeleteParamsValidator: validate({ organizationId })
    OrganizationDeleteParamsValidator-->>OrganizationsController: validated organizationId
    OrganizationsController->>OrganizationRepository: read(organizationId)
    OrganizationRepository->>Organization: findByPk(organizationId)
    Organization-->>OrganizationRepository: null
    OrganizationRepository-->>OrganizationsController: null
    OrganizationsController-->>Client: 404 Not Found
```

Sources:
- `src/controllers/v1/organizations.controller.ts`
- `src/modules/organizations/organization.repository.ts`
- `src/validators/organization-delete-params.validator.ts`
- `database/models/organization.ts`
- `test/api/v1/organizations/delete.test.ts`

Assumptions:
- The success diagram uses `empty response` instead of an HTTP label because the allowed confirmed labels in the request did not include `204`.
