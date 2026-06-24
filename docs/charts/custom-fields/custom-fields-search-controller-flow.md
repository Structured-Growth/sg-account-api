# CustomFieldsController.search

Brief overview: Validates the search query, normalizes `includeInherited` in the controller, optionally expands the organization scope through `OrganizationService`, searches through `CustomFieldRepository`, and returns `200 OK`.

## Method

- Route: `GET /v1/custom-fields`
- Signature: `CustomFieldsController.search(query: CustomFieldSearchParamsInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant CustomFieldsController
    participant CustomFieldSearchParamsValidator
    participant CustomFieldService
    participant OrganizationService
    participant CustomFieldRepository
    participant CustomField

    Client->>CustomFieldsController: search(query)
    CustomFieldsController->>CustomFieldSearchParamsValidator: validate(query)
    CustomFieldSearchParamsValidator-->>CustomFieldsController: valid
    CustomFieldsController->>CustomFieldsController: includeInherited = query.includeInherited?.toString() !== "false"
    CustomFieldsController->>CustomFieldService: search(query)
    opt includeInherited is true
        CustomFieldService->>OrganizationService: getParentOrganizations(orgId)
        OrganizationService-->>CustomFieldService: parent organizations
        CustomFieldService->>CustomFieldRepository: search(params with [orgId, ...parentOrgIds])
    end
    opt includeInherited is false
        CustomFieldService->>CustomFieldRepository: search(params with [orgId])
    end
    CustomFieldRepository->>CustomField: findAndCountAll({ where, offset, limit, order })
    CustomField-->>CustomFieldRepository: { rows, count }
    CustomFieldRepository-->>CustomFieldService: search result
    CustomFieldService-->>CustomFieldsController: search result
    CustomFieldsController-->>Client: 200 OK
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant CustomFieldsController
    participant CustomFieldSearchParamsValidator

    Client->>CustomFieldsController: search(query)
    CustomFieldsController->>CustomFieldSearchParamsValidator: validate(query)
    CustomFieldSearchParamsValidator-->>CustomFieldsController: throws ValidationError
    CustomFieldsController-->>Client: 422 Validation Error
```
