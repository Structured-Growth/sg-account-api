# OrganizationsController.search

Brief overview: Validates the GET search query, normalizes `signUpEnabled` only in the controller when it arrives as a string, queries `OrganizationRepository`, and returns a paginated list of public organizations.

## Method

- Route: `GET /v1/organizations/`
- Signature: `OrganizationsController.search(query: OrganizationSearchParamsInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant OrganizationsController
    participant OrganizationSearchParamsValidator
    participant OrganizationRepository
    participant Organization

    Client->>OrganizationsController: search(query)
    OrganizationsController->>OrganizationSearchParamsValidator: validate({ query })
    OrganizationSearchParamsValidator-->>OrganizationsController: valid
    opt query.signUpEnabled is a string
        OrganizationsController->>OrganizationsController: normalizeSignUpEnabled(query.signUpEnabled)
    end
    OrganizationsController->>OrganizationRepository: search({ ...query, signUpEnabled })
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
    participant OrganizationSearchParamsValidator

    Client->>OrganizationsController: search(query)
    OrganizationsController->>OrganizationSearchParamsValidator: validate({ query })
    OrganizationSearchParamsValidator-->>OrganizationsController: throws ValidationError
    OrganizationsController-->>Client: 422 Validation Error
```
