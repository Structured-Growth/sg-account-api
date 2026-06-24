# GroupsController.searchPost

Brief overview: `POST /v1/groups/search` validates request body with `GroupSearchWithPostParamsValidator` and forwards the body to `GroupsRepository.search(body)` without controller-side `includeOwner` normalization. When `accountId` is present, the repository joins `GroupMember` and applies account filtering internally based on `includeOwner`. Inside the repository, `onlyTotal` can switch the model call from `findAndCountAll(...)` to `count(...)`. On success the controller returns `200 OK`; unlike GET search, the final mapped response omits `imageUrl`.

## Method

Route: `POST /v1/groups/search`  
Controller method: `GroupsController.searchPost(body)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupSearchWithPostParamsValidator
    participant GroupsRepository
    participant GroupMember
    participant Group

    Client->>GroupsController: searchPost(body)
    GroupsController->>GroupSearchWithPostParamsValidator: validate(body)
    GroupSearchWithPostParamsValidator-->>GroupsController: valid body
    GroupsController->>GroupsRepository: search(body)
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
    participant GroupSearchWithPostParamsValidator

    Client->>GroupsController: searchPost(body)
    GroupsController->>GroupSearchWithPostParamsValidator: validate(body)
    GroupSearchWithPostParamsValidator-->>GroupsController: validation error
    GroupsController-->>Client: 422 Validation Error
```
