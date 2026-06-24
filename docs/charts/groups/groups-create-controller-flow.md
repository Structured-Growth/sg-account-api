# GroupsController.create

Brief overview: `POST /v1/groups` validates the body with `GroupCreateParamsValidator`, then `GroupService.create(body)` resolves the account, optionally resolves the parent group, builds a slugged name from `title`, rejects duplicate names globally, optionally validates image signature, and delegates persistence to `GroupsRepository.create(params)`. The repository validates custom fields before `Group.create(...)`. On success the controller switches the response to `201 Created` and publishes an event.

## Method

Route: `POST /v1/groups`  
Controller method: `GroupsController.create(body)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupCreateParamsValidator
    participant GroupService
    participant AccountRepository
    participant GroupsRepository
    participant ImageValidator
    participant CustomFieldService
    participant Group
    participant EventBus

    Client->>GroupsController: create(body)
    GroupsController->>GroupCreateParamsValidator: validate(body)
    GroupCreateParamsValidator-->>GroupsController: valid body
    GroupsController->>GroupService: create(body)
    GroupService->>AccountRepository: read(accountId)
    AccountRepository-->>GroupService: account
    opt parentGroupId is provided
        GroupService->>GroupsRepository: read(parentGroupId)
        GroupsRepository->>Group: findByPk(parentGroupId)
        Group-->>GroupsRepository: parent group
        GroupsRepository-->>GroupService: parent group
    end
    GroupService->>Group: count({ name })
    Group-->>GroupService: count
    opt imageBase64 is provided
        GroupService->>ImageValidator: hasValidImageSignature(image)
        ImageValidator-->>GroupService: valid image
    end
    GroupService->>GroupsRepository: create(params)
    GroupsRepository->>CustomFieldService: validate("Group", metadata, orgId)
    CustomFieldService-->>GroupsRepository: valid metadata
    GroupsRepository->>Group: create(...)
    Group-->>GroupsRepository: group
    GroupsRepository-->>GroupService: group
    GroupService-->>GroupsController: group
    GroupsController->>EventBus: publish(new EventMutation(...))
    EventBus-->>GroupsController: published
    GroupsController-->>Client: 201 Created
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupCreateParamsValidator

    Client->>GroupsController: create(body)
    GroupsController->>GroupCreateParamsValidator: validate(body)
    GroupCreateParamsValidator-->>GroupsController: validation error
    GroupsController-->>Client: 422 Validation Error
```

## 404 Account Not Found

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupCreateParamsValidator
    participant GroupService
    participant AccountRepository

    Client->>GroupsController: create(body)
    GroupsController->>GroupCreateParamsValidator: validate(body)
    GroupCreateParamsValidator-->>GroupsController: valid body
    GroupsController->>GroupService: create(body)
    GroupService->>AccountRepository: read(accountId)
    AccountRepository-->>GroupService: null
    GroupService-->>GroupsController: NotFoundError
    GroupsController-->>Client: 404 Not Found
```

## 404 Parent Group Not Found

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupCreateParamsValidator
    participant GroupService
    participant AccountRepository
    participant GroupsRepository
    participant Group

    Client->>GroupsController: create(body)
    GroupsController->>GroupCreateParamsValidator: validate(body)
    GroupCreateParamsValidator-->>GroupsController: valid body
    GroupsController->>GroupService: create(body)
    GroupService->>AccountRepository: read(accountId)
    AccountRepository-->>GroupService: account
    GroupService->>GroupsRepository: read(parentGroupId)
    GroupsRepository->>Group: findByPk(parentGroupId)
    Group-->>GroupsRepository: null
    GroupsRepository-->>GroupService: null
    GroupService-->>GroupsController: NotFoundError
    GroupsController-->>Client: 404 Not Found
```

## 422 Duplicate Name Validation Failure

```mermaid
sequenceDiagram
    actor Client
    participant GroupsController
    participant GroupCreateParamsValidator
    participant GroupService
    participant AccountRepository
    participant Group

    Client->>GroupsController: create(body)
    GroupsController->>GroupCreateParamsValidator: validate(body)
    GroupCreateParamsValidator-->>GroupsController: valid body
    GroupsController->>GroupService: create(body)
    GroupService->>AccountRepository: read(accountId)
    AccountRepository-->>GroupService: account
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
    participant GroupCreateParamsValidator
    participant GroupService
    participant AccountRepository
    participant Group
    participant ImageValidator

    Client->>GroupsController: create(body)
    GroupsController->>GroupCreateParamsValidator: validate(body)
    GroupCreateParamsValidator-->>GroupsController: valid body
    GroupsController->>GroupService: create(body)
    GroupService->>AccountRepository: read(accountId)
    AccountRepository-->>GroupService: account
    GroupService->>Group: count({ name })
    Group-->>GroupService: count
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
    participant GroupCreateParamsValidator
    participant GroupService
    participant AccountRepository
    participant Group
    participant GroupsRepository
    participant CustomFieldService

    Client->>GroupsController: create(body)
    GroupsController->>GroupCreateParamsValidator: validate(body)
    GroupCreateParamsValidator-->>GroupsController: valid body
    GroupsController->>GroupService: create(body)
    GroupService->>AccountRepository: read(accountId)
    AccountRepository-->>GroupService: account
    GroupService->>Group: count({ name })
    Group-->>GroupService: count
    GroupService->>GroupsRepository: create(params)
    GroupsRepository->>CustomFieldService: validate("Group", metadata, orgId)
    CustomFieldService-->>GroupsRepository: ValidationError
    GroupsRepository-->>GroupService: ValidationError
    GroupService-->>GroupsController: ValidationError
    GroupsController-->>Client: 422 Validation Error
```
