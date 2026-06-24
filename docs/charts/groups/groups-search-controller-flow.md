# GroupsController.search

Brief overview: `GET /v1/groups` validates query params with `GroupSearchParamsValidator`, normalizes `includeOwner` in `GroupsController`, then calls `GroupsRepository.search(query)`. When `accountId` is present, the repository joins `GroupMember` and applies account filtering internally based on `includeOwner`. Inside the repository, `onlyTotal` can switch the model call from `findAndCountAll(...)` to `count(...)`. On success the controller returns `200 OK`.

## Method

Route: `GET /v1/groups`  
Controller method: `GroupsController.search(query)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupSearchParamsValidator
    participant GroupsRepository
    participant GroupMember
    participant Group

    Client->>GroupsController: search(query)
    GroupsController->>GroupSearchParamsValidator: validate(query)
    GroupSearchParamsValidator-->>GroupsController: valid query
    GroupsController->>GroupsRepository: search(query)
    opt accountId is present
        GroupsRepository->>GroupMember: join members
    end
    opt onlyTotal is enabled
        GroupsRepository->>Group: count(...)
        Group-->>GroupsRepository: total count
    end
    opt onlyTotal is not enabled
        GroupsRepository->>Group: findAndCountAll(...)
        Group-->>GroupsRepository: paginated groups
    end
    GroupsRepository-->>GroupsController: search result
    GroupsController-->>Client: 200 OK
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupSearchParamsValidator

    Client->>GroupsController: search(query)
    GroupsController->>GroupSearchParamsValidator: validate(query)
    GroupSearchParamsValidator-->>GroupsController: validation error
    GroupsController-->>Client: 422 Validation Error
```
