# OrganizationsController.searchPost

Brief overview: POST search validates the request body and forwards it directly to `OrganizationRepository.search()` without the GET-only `signUpEnabled` normalization logic.

## Method

Route: `POST /v1/organizations/search`  
Controller method: `async searchPost(@Queries() query: {}, @Body() body: OrganizationSearchParamsInterface)`

## Success

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationSearchWithPostParamsValidator
    participant OrganizationRepository
    participant Organization

    Client->>OrganizationsController: POST /v1/organizations/search
    OrganizationsController->>OrganizationSearchWithPostParamsValidator: validate({ query, body })
    OrganizationSearchWithPostParamsValidator-->>OrganizationsController: validated body
    OrganizationsController->>OrganizationRepository: search(body)
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
    participant OrganizationSearchWithPostParamsValidator

    Client->>OrganizationsController: POST /v1/organizations/search
    OrganizationsController->>OrganizationSearchWithPostParamsValidator: validate({ query, body })
    OrganizationSearchWithPostParamsValidator-->>OrganizationsController: validation errors
    OrganizationsController-->>Client: 422 Validation Error
```

Sources:
- `src/controllers/v1/organizations.controller.ts`
- `src/modules/organizations/organization.repository.ts`
- `src/validators/organization-search-with-post-params.validator.ts`
- `src/validators/common-search-params.validator.ts`
- `database/models/organization.ts`
- `src/routes/v1.ts`

Assumptions: none
