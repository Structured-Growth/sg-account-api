# GroupsController.delete

Brief overview: `DELETE /v1/groups/:groupId` validates the path with `GroupDeleteParamsValidator`, reads the group before deletion, deletes it through `GroupsRepository.delete(groupId)`, publishes an event, and switches the response to `204 No Content`.

## Method

Route: `DELETE /v1/groups/:groupId`  
Controller method: `GroupsController.delete(groupId)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupDeleteParamsValidator
    participant GroupsRepository
    participant Group
    participant EventBus

    Client->>GroupsController: delete(groupId)
    GroupsController->>GroupDeleteParamsValidator: validate(groupId)
    GroupDeleteParamsValidator-->>GroupsController: valid groupId
    GroupsController->>GroupsRepository: read(groupId)
    GroupsRepository->>Group: findByPk(groupId)
    Group-->>GroupsRepository: group
    GroupsRepository-->>GroupsController: group
    GroupsController->>GroupsRepository: delete(groupId)
    GroupsRepository->>Group: destroy(...)
    Group-->>GroupsRepository: deleted rows
    GroupsRepository-->>GroupsController: deleted
    GroupsController->>EventBus: publish(new EventMutation(...))
    EventBus-->>GroupsController: published
    GroupsController-->>Client: 204 No Content
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupDeleteParamsValidator
    participant GroupsRepository
    participant Group

    Client->>GroupsController: delete(groupId)
    GroupsController->>GroupDeleteParamsValidator: validate(groupId)
    GroupDeleteParamsValidator-->>GroupsController: valid groupId
    GroupsController->>GroupsRepository: read(groupId)
    GroupsRepository->>Group: findByPk(groupId)
    Group-->>GroupsRepository: null
    GroupsRepository-->>GroupsController: null
    GroupsController-->>Client: 404 Not Found
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupDeleteParamsValidator

    Client->>GroupsController: delete(groupId)
    GroupsController->>GroupDeleteParamsValidator: validate(groupId)
    GroupDeleteParamsValidator-->>GroupsController: validation error
    GroupsController-->>Client: 422 Validation Error
```
