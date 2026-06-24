# GroupMembersController.update

Brief overview: обновление участника группы валидирует входные данные, проверяет родительскую группу в контроллере, затем сервис повторно читает участника, репозиторий отбрасывает `undefined`, валидирует custom fields, сохраняет модель и после этого публикуется событие.

## Method

`PUT /v1/groups/:groupId/members/:groupMemberId -> update(groupId, groupMemberId, body)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant GroupMembersController
    participant GroupMemberUpdateParamsValidator
    participant GroupsRepository
    participant GroupMemberService
    participant GroupMemberRepository
    participant CustomFieldService
    participant GroupMember
    participant EventBus

    Client->>GroupMembersController: update(groupMemberId, body)
    GroupMembersController->>GroupMemberUpdateParamsValidator: validate(groupId, groupMemberId, body)
    GroupMemberUpdateParamsValidator-->>GroupMembersController: valid
    GroupMembersController->>GroupsRepository: read(groupId)
    GroupsRepository-->>GroupMembersController: group
    GroupMembersController->>GroupMemberService: update(groupMemberId, body)
    GroupMemberService->>GroupMemberRepository: read(groupMemberId)
    GroupMemberRepository->>GroupMember: findByPk(...)
    GroupMember-->>GroupMemberRepository: group member
    GroupMemberRepository-->>GroupMemberService: group member
    GroupMemberService->>GroupMemberRepository: update(groupMemberId, params)
    GroupMemberRepository->>GroupMember: findByPk(...)
    GroupMember-->>GroupMemberRepository: group member
    GroupMemberRepository->>GroupMember: setAttributes(...)
    GroupMemberRepository->>CustomFieldService: validate("GroupMember", metadata, orgId)
    CustomFieldService-->>GroupMemberRepository: valid
    GroupMemberRepository->>GroupMember: save()
    GroupMember-->>GroupMemberRepository: group member
    GroupMemberRepository-->>GroupMemberService: group member
    GroupMemberService-->>GroupMembersController: group member
    GroupMembersController->>EventBus: publish(new EventMutation(...))
    EventBus-->>GroupMembersController: published
    GroupMembersController-->>Client: 200 OK
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant GroupMembersController
    participant GroupMemberUpdateParamsValidator

    Client->>GroupMembersController: update(groupMemberId, body)
    GroupMembersController->>GroupMemberUpdateParamsValidator: validate(groupId, groupMemberId, body)
    GroupMemberUpdateParamsValidator-->>GroupMembersController: validation error
    GroupMembersController-->>Client: 422 Validation Error
```

## 404 Not Found Group Not Found

```mermaid
sequenceDiagram
    actor Client
    participant GroupMembersController
    participant GroupMemberUpdateParamsValidator
    participant GroupsRepository

    Client->>GroupMembersController: update(groupMemberId, body)
    GroupMembersController->>GroupMemberUpdateParamsValidator: validate(groupId, groupMemberId, body)
    GroupMemberUpdateParamsValidator-->>GroupMembersController: valid
    GroupMembersController->>GroupsRepository: read(groupId)
    GroupsRepository-->>GroupMembersController: null
    GroupMembersController-->>Client: 404 Not Found
```

## 404 Not Found Group Member Not Found

```mermaid
sequenceDiagram
    actor Client
    participant GroupMembersController
    participant GroupMemberUpdateParamsValidator
    participant GroupsRepository
    participant GroupMemberService
    participant GroupMemberRepository
    participant GroupMember

    Client->>GroupMembersController: update(groupMemberId, body)
    GroupMembersController->>GroupMemberUpdateParamsValidator: validate(groupId, groupMemberId, body)
    GroupMemberUpdateParamsValidator-->>GroupMembersController: valid
    GroupMembersController->>GroupsRepository: read(groupId)
    GroupsRepository-->>GroupMembersController: group
    GroupMembersController->>GroupMemberService: update(groupMemberId, body)
    GroupMemberService->>GroupMemberRepository: read(groupMemberId)
    GroupMemberRepository->>GroupMember: findByPk(...)
    GroupMember-->>GroupMemberRepository: null
    GroupMemberRepository-->>GroupMemberService: null
    GroupMemberService-->>GroupMembersController: not found error
    GroupMembersController-->>Client: 404 Not Found
```

## 422 Validation Error Custom Field Validation Failure

```mermaid
sequenceDiagram
    actor Client
    participant GroupMembersController
    participant GroupMemberUpdateParamsValidator
    participant GroupsRepository
    participant GroupMemberService
    participant GroupMemberRepository
    participant CustomFieldService
    participant GroupMember

    Client->>GroupMembersController: update(groupMemberId, body)
    GroupMembersController->>GroupMemberUpdateParamsValidator: validate(groupId, groupMemberId, body)
    GroupMemberUpdateParamsValidator-->>GroupMembersController: valid
    GroupMembersController->>GroupsRepository: read(groupId)
    GroupsRepository-->>GroupMembersController: group
    GroupMembersController->>GroupMemberService: update(groupMemberId, body)
    GroupMemberService->>GroupMemberRepository: read(groupMemberId)
    GroupMemberRepository->>GroupMember: findByPk(...)
    GroupMember-->>GroupMemberRepository: group member
    GroupMemberRepository-->>GroupMemberService: group member
    GroupMemberService->>GroupMemberRepository: update(groupMemberId, params)
    GroupMemberRepository->>GroupMember: findByPk(...)
    GroupMember-->>GroupMemberRepository: group member
    GroupMemberRepository->>GroupMember: setAttributes(...)
    GroupMemberRepository->>CustomFieldService: validate("GroupMember", metadata, orgId)
    CustomFieldService-->>GroupMemberRepository: validation error
    GroupMemberRepository-->>GroupMemberService: validation error
    GroupMemberService-->>GroupMembersController: validation error
    GroupMembersController-->>Client: 422 Validation Error
```
