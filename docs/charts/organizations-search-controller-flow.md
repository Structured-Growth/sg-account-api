# OrganizationsController.search

Brief overview: GET search validates query params, normalizes `signUpEnabled` inside `OrganizationsController.search()`, then performs a repository search and maps each `Organization` model to the public response shape.

## Method

Route: `GET /v1/organizations`  
Controller method: `async search(@Queries() query: OrganizationSearchParamsInterface)`

## Success

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationSearchParamsValidator
    participant OrganizationRepository
    participant Organization

    Client->>OrganizationsController: GET /v1/organizations
    OrganizationsController->>OrganizationSearchParamsValidator: validate({ query })
    OrganizationSearchParamsValidator-->>OrganizationsController: validated query
    OrganizationsController->>OrganizationsController: normalize signUpEnabled
    OrganizationsController->>OrganizationRepository: search({ ...query, signUpEnabled })
    OrganizationRepository->>Organization: findAndCountAll({ where, offset, limit, order })
    Organization-->>OrganizationRepository: { rows, count }
    OrganizationRepository-->>OrganizationsController: { data, total, limit, page }
    OrganizationsController->>OrganizationsController: map organization.toJSON(), imageUrl, arn
    OrganizationsController-->>Client: 200 OK + SearchResultInterface<PublicOrganizationAttributes>
```

## 422 Validation Error

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationSearchParamsValidator

    Client->>OrganizationsController: GET /v1/organizations
    OrganizationsController->>OrganizationSearchParamsValidator: validate({ query })
    OrganizationSearchParamsValidator-->>OrganizationsController: validation errors
    OrganizationsController-->>Client: 422 Validation Error
```

Sources:
- `src/controllers/v1/organizations.controller.ts`
- `src/modules/organizations/organization.repository.ts`
- `src/validators/organization-search-params.validator.ts`
- `src/validators/common-search-params.validator.ts`
- `database/models/organization.ts`
- `test/api/v1/organizations/search.test.ts`

Assumptions: none
