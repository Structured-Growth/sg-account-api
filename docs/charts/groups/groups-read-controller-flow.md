# GroupsController.get

Brief overview: `GET /v1/groups/:groupId` validates the path with `GroupReadParamsValidator`, reads the group through `GroupsRepository.read(groupId)`, and returns `200 OK` when the record exists. If no record is found, the controller raises `NotFoundError`.

## Method

Route: `GET /v1/groups/:groupId`  
Controller method: `GroupsController.get(groupId)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupReadParamsValidator
    participant GroupsRepository
    participant Group

    Client->>GroupsController: get(groupId)
    GroupsController->>GroupReadParamsValidator: validate(groupId)
    GroupReadParamsValidator-->>GroupsController: valid groupId
    GroupsController->>GroupsRepository: read(groupId)
    GroupsRepository->>Group: findByPk(groupId)
    Group-->>GroupsRepository: group
    GroupsRepository-->>GroupsController: group
    GroupsController-->>Client: 200 OK
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupReadParamsValidator
    participant GroupsRepository
    participant Group

    Client->>GroupsController: get(groupId)
    GroupsController->>GroupReadParamsValidator: validate(groupId)
    GroupReadParamsValidator-->>GroupsController: valid groupId
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
    participant GroupReadParamsValidator

    Client->>GroupsController: get(groupId)
    GroupsController->>GroupReadParamsValidator: validate(groupId)
    GroupReadParamsValidator-->>GroupsController: validation error
    GroupsController-->>Client: 422 Validation Error
```
