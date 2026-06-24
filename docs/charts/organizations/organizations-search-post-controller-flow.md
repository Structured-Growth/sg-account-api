# OrganizationsController.searchPost

Brief overview: Validates the POST search body, passes the body directly to `OrganizationRepository.search(body)`, and returns a paginated list of public organizations without GET normalization logic.

## Method

- Route: `POST /v1/organizations/search`
- Signature: `OrganizationsController.searchPost(query: {}, body: OrganizationSearchParamsInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationSearchWithPostParamsValidator
    participant OrganizationRepository
    participant Organization

    Client->>OrganizationsController: searchPost(query, body)
    OrganizationsController->>OrganizationSearchWithPostParamsValidator: validate({ query, body })
    OrganizationSearchWithPostParamsValidator-->>OrganizationsController: valid
    OrganizationsController->>OrganizationRepository: search(body)
    OrganizationRepository->>Organization: findAndCountAll({ where, offset, limit, order })
    Organization-->>OrganizationRepository: { rows, count }
    OrganizationRepository-->>OrganizationsController: { data, total, limit, page }
    OrganizationsController-->>Client: 200 OK
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationSearchWithPostParamsValidator

    Client->>OrganizationsController: searchPost(query, body)
    OrganizationsController->>OrganizationSearchWithPostParamsValidator: validate({ query, body })
    OrganizationSearchWithPostParamsValidator-->>OrganizationsController: throws ValidationError
    OrganizationsController-->>Client: 422 Validation Error
```
