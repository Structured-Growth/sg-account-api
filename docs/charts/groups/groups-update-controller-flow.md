# GroupsController.update

Brief overview: `PUT /v1/groups/:groupId` validates path and body with `GroupUpdateParamsValidator`, then `GroupService.update(groupId, body)` checks group existence, optionally re-slugs and checks duplicate name when `title` changes, optionally resolves `parentGroupId`, optionally validates image signature, omits undefined fields, and calls `GroupsRepository.update(groupId, params)`. The repository reads the group again, applies `setAttributes(...)`, validates custom fields, saves the model, and returns the updated record. The controller publishes an event and returns `200 OK`.

## Method

Route: `PUT /v1/groups/:groupId`  
Controller method: `GroupsController.update(groupId, body)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupUpdateParamsValidator
    participant GroupService
    participant GroupsRepository
    participant ImageValidator
    participant CustomFieldService
    participant Group
    participant EventBus

    Client->>GroupsController: update(groupId, body)
    GroupsController->>GroupUpdateParamsValidator: validate(groupId, body)
    GroupUpdateParamsValidator-->>GroupsController: valid request
    GroupsController->>GroupService: update(groupId, body)
    GroupService->>GroupsRepository: read(groupId)
    GroupsRepository->>Group: findByPk(groupId)
    Group-->>GroupsRepository: group
    GroupsRepository-->>GroupService: group
    opt title changes
        GroupService->>Group: count({ name })
        Group-->>GroupService: count
    end
    opt parentGroupId is provided
        GroupService->>GroupsRepository: read(parentGroupId)
        GroupsRepository->>Group: findByPk(parentGroupId)
        Group-->>GroupsRepository: parent group
        GroupsRepository-->>GroupService: parent group
    end
    opt imageBase64 is provided
        GroupService->>ImageValidator: hasValidImageSignature(image)
        ImageValidator-->>GroupService: valid image
    end
    GroupService->>GroupsRepository: update(groupId, params)
    GroupsRepository->>GroupsRepository: read(groupId)
    GroupsRepository->>Group: findByPk(groupId)
    Group-->>GroupsRepository: group
    GroupsRepository->>Group: setAttributes(...)
    GroupsRepository->>CustomFieldService: validate("Group", metadata, orgId)
    CustomFieldService-->>GroupsRepository: valid metadata
    GroupsRepository->>Group: save()
    Group-->>GroupsRepository: updated group
    GroupsRepository-->>GroupService: updated group
    GroupService-->>GroupsController: updated group
    GroupsController->>EventBus: publish(new EventMutation(...))
    EventBus-->>GroupsController: published
    GroupsController-->>Client: 200 OK
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupUpdateParamsValidator
    participant GroupService
    participant GroupsRepository
    participant Group

    Client->>GroupsController: update(groupId, body)
    GroupsController->>GroupUpdateParamsValidator: validate(groupId, body)
    GroupUpdateParamsValidator-->>GroupsController: valid request
    GroupsController->>GroupService: update(groupId, body)
    GroupService->>GroupsRepository: read(groupId)
    GroupsRepository->>Group: findByPk(groupId)
    Group-->>GroupsRepository: null
    GroupsRepository-->>GroupService: null
    GroupService-->>GroupsController: NotFoundError
    GroupsController-->>Client: 404 Not Found
```

## 404 Parent Group Not Found

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupUpdateParamsValidator
    participant GroupService
    participant GroupsRepository
    participant Group

    Client->>GroupsController: update(groupId, body)
    GroupsController->>GroupUpdateParamsValidator: validate(groupId, body)
    GroupUpdateParamsValidator-->>GroupsController: valid request
    GroupsController->>GroupService: update(groupId, body)
    GroupService->>GroupsRepository: read(groupId)
    GroupsRepository->>Group: findByPk(groupId)
    Group-->>GroupsRepository: group
    GroupsRepository-->>GroupService: group
    GroupService->>GroupsRepository: read(parentGroupId)
    GroupsRepository->>Group: findByPk(parentGroupId)
    Group-->>GroupsRepository: null
    GroupsRepository-->>GroupService: null
    GroupService-->>GroupsController: NotFoundError
    GroupsController-->>Client: 404 Not Found
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupUpdateParamsValidator

    Client->>GroupsController: update(groupId, body)
    GroupsController->>GroupUpdateParamsValidator: validate(groupId, body)
    GroupUpdateParamsValidator-->>GroupsController: validation error
    GroupsController-->>Client: 422 Validation Error
```

## 422 Duplicate Name Validation Failure

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupUpdateParamsValidator
    participant GroupService
    participant GroupsRepository
    participant Group

    Client->>GroupsController: update(groupId, body)
    GroupsController->>GroupUpdateParamsValidator: validate(groupId, body)
    GroupUpdateParamsValidator-->>GroupsController: valid request
    GroupsController->>GroupService: update(groupId, body)
    GroupService->>GroupsRepository: read(groupId)
    GroupsRepository->>Group: findByPk(groupId)
    Group-->>GroupsRepository: group
    GroupsRepository-->>GroupService: group
    GroupService->>Group: count({ name })
    Group-->>GroupService: count > 0
    GroupService-->>GroupsController: ValidationError
    GroupsController-->>Client: 422 Validation Error
```

## 422 Invalid Image Validation Failure

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupUpdateParamsValidator
    participant GroupService
    participant GroupsRepository
    participant Group
    participant ImageValidator

    Client->>GroupsController: update(groupId, body)
    GroupsController->>GroupUpdateParamsValidator: validate(groupId, body)
    GroupUpdateParamsValidator-->>GroupsController: valid request
    GroupsController->>GroupService: update(groupId, body)
    GroupService->>GroupsRepository: read(groupId)
    GroupsRepository->>Group: findByPk(groupId)
    Group-->>GroupsRepository: group
    GroupsRepository-->>GroupService: group
    GroupService->>ImageValidator: hasValidImageSignature(image)
    ImageValidator-->>GroupService: invalid image
    GroupService-->>GroupsController: ValidationError
    GroupsController-->>Client: 422 Validation Error
```

## 422 Custom Field Validation Failure

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupUpdateParamsValidator
    participant GroupService
    participant GroupsRepository
    participant CustomFieldService
    participant Group

    Client->>GroupsController: update(groupId, body)
    GroupsController->>GroupUpdateParamsValidator: validate(groupId, body)
    GroupUpdateParamsValidator-->>GroupsController: valid request
    GroupsController->>GroupService: update(groupId, body)
    GroupService->>GroupsRepository: read(groupId)
    GroupsRepository->>Group: findByPk(groupId)
    Group-->>GroupsRepository: group
    GroupsRepository-->>GroupService: group
    GroupService->>GroupsRepository: update(groupId, params)
    GroupsRepository->>GroupsRepository: read(groupId)
    GroupsRepository->>Group: findByPk(groupId)
    Group-->>GroupsRepository: group
    GroupsRepository->>Group: setAttributes(...)
    GroupsRepository->>CustomFieldService: validate("Group", metadata, orgId)
    CustomFieldService-->>GroupsRepository: ValidationError
    GroupsRepository-->>GroupService: ValidationError
    GroupService-->>GroupsController: ValidationError
    GroupsController-->>Client: 422 Validation Error
```
