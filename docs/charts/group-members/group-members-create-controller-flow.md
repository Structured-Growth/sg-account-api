# GroupMembersController.create

Brief overview: создание участника группы валидирует входные данные, проверяет существование группы и пользователя, делает проверку на дублирующее членство через поиск `onlyTotal`, затем создаёт запись с валидацией custom fields и публикует событие.

## Method

`POST /v1/groups/:groupId/members -> create(groupId, body)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant GroupMembersController
    participant GroupMemberCreateParamsValidator
    participant GroupMemberService
    participant GroupsRepository
    participant UsersRepository
    participant GroupMemberRepository
    participant CustomFieldService
    participant GroupMember
    participant EventBus

    Client->>GroupMembersController: create(groupId, body)
    GroupMembersController->>GroupMemberCreateParamsValidator: validate(body)
    GroupMemberCreateParamsValidator-->>GroupMembersController: valid
    GroupMembersController->>GroupMemberService: create(groupId, body)
    GroupMemberService->>GroupsRepository: read(groupId)
    GroupsRepository-->>GroupMemberService: group
    GroupMemberService->>UsersRepository: read(userId)
    UsersRepository-->>GroupMemberService: user
    GroupMemberService->>GroupMemberRepository: search(params, { onlyTotal: true })
    GroupMemberRepository->>Account: join active status
    Account-->>GroupMemberRepository: join config
    GroupMemberRepository->>User: join active status
    User-->>GroupMemberRepository: join config
    GroupMemberRepository->>GroupMember: count(...)
    GroupMember-->>GroupMemberRepository: total
    GroupMemberRepository-->>GroupMemberService: search result
    GroupMemberService->>GroupMemberRepository: create(params)
    GroupMemberRepository->>CustomFieldService: validate("GroupMember", metadata, orgId)
    CustomFieldService-->>GroupMemberRepository: valid
    GroupMemberRepository->>GroupMember: create(...)
    GroupMember-->>GroupMemberRepository: group member
    GroupMemberRepository-->>GroupMemberService: group member
    GroupMemberService-->>GroupMembersController: group member
    GroupMembersController->>EventBus: publish(new EventMutation(...))
    EventBus-->>GroupMembersController: published
    GroupMembersController-->>Client: 201 Created
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant GroupMembersController
    participant GroupMemberCreateParamsValidator

    Client->>GroupMembersController: create(groupId, body)
    GroupMembersController->>GroupMemberCreateParamsValidator: validate(body)
    GroupMemberCreateParamsValidator-->>GroupMembersController: validation error
    GroupMembersController-->>Client: 422 Validation Error
```

## 404 Not Found Group Not Found

```mermaid
sequenceDiagram
    actor Client
    participant GroupMembersController
    participant GroupMemberCreateParamsValidator
    participant GroupMemberService
    participant GroupsRepository

    Client->>GroupMembersController: create(groupId, body)
    GroupMembersController->>GroupMemberCreateParamsValidator: validate(body)
    GroupMemberCreateParamsValidator-->>GroupMembersController: valid
    GroupMembersController->>GroupMemberService: create(groupId, body)
    GroupMemberService->>GroupsRepository: read(groupId)
    GroupsRepository-->>GroupMemberService: null
    GroupMemberService-->>GroupMembersController: not found error
    GroupMembersController-->>Client: 404 Not Found
```

## 404 Not Found User Not Found

```mermaid
sequenceDiagram
    actor Client
    participant GroupMembersController
    participant GroupMemberCreateParamsValidator
    participant GroupMemberService
    participant GroupsRepository
    participant UsersRepository

    Client->>GroupMembersController: create(groupId, body)
    GroupMembersController->>GroupMemberCreateParamsValidator: validate(body)
    GroupMemberCreateParamsValidator-->>GroupMembersController: valid
    GroupMembersController->>GroupMemberService: create(groupId, body)
    GroupMemberService->>GroupsRepository: read(groupId)
    GroupsRepository-->>GroupMemberService: group
    GroupMemberService->>UsersRepository: read(userId)
    UsersRepository-->>GroupMemberService: null
    GroupMemberService-->>GroupMembersController: not found error
    GroupMembersController-->>Client: 404 Not Found
```

## 422 Validation Error Duplicate Membership

```mermaid
sequenceDiagram
    actor Client
    participant GroupMembersController
    participant GroupMemberCreateParamsValidator
    participant GroupMemberService
    participant GroupsRepository
    participant UsersRepository
    participant GroupMemberRepository
    participant GroupMember
    participant Account
    participant User

    Client->>GroupMembersController: create(groupId, body)
    GroupMembersController->>GroupMemberCreateParamsValidator: validate(body)
    GroupMemberCreateParamsValidator-->>GroupMembersController: valid
    GroupMembersController->>GroupMemberService: create(groupId, body)
    GroupMemberService->>GroupsRepository: read(groupId)
    GroupsRepository-->>GroupMemberService: group
    GroupMemberService->>UsersRepository: read(userId)
    UsersRepository-->>GroupMemberService: user
    GroupMemberService->>GroupMemberRepository: search(params, { onlyTotal: true })
    GroupMemberRepository->>Account: join active status
    Account-->>GroupMemberRepository: join config
    GroupMemberRepository->>User: join active status
    User-->>GroupMemberRepository: join config
    GroupMemberRepository->>GroupMember: count(...)
    GroupMember-->>GroupMemberRepository: total
    GroupMemberRepository-->>GroupMemberService: search result
    GroupMemberService-->>GroupMembersController: validation error
    GroupMembersController-->>Client: 422 Validation Error
```

## 422 Validation Error Custom Field Validation Failure

```mermaid
sequenceDiagram
    actor Client
    participant GroupMembersController
    participant GroupMemberCreateParamsValidator
    participant GroupMemberService
    participant GroupsRepository
    participant UsersRepository
    participant GroupMemberRepository
    participant CustomFieldService
    participant GroupMember
    participant Account
    participant User

    Client->>GroupMembersController: create(groupId, body)
    GroupMembersController->>GroupMemberCreateParamsValidator: validate(body)
    GroupMemberCreateParamsValidator-->>GroupMembersController: valid
    GroupMembersController->>GroupMemberService: create(groupId, body)
    GroupMemberService->>GroupsRepository: read(groupId)
    GroupsRepository-->>GroupMemberService: group
    GroupMemberService->>UsersRepository: read(userId)
    UsersRepository-->>GroupMemberService: user
    GroupMemberService->>GroupMemberRepository: search(params, { onlyTotal: true })
    GroupMemberRepository->>Account: join active status
    Account-->>GroupMemberRepository: join config
    GroupMemberRepository->>User: join active status
    User-->>GroupMemberRepository: join config
    GroupMemberRepository->>GroupMember: count(...)
    GroupMember-->>GroupMemberRepository: total
    GroupMemberRepository-->>GroupMemberService: search result
    GroupMemberService->>GroupMemberRepository: create(params)
    GroupMemberRepository->>CustomFieldService: validate("GroupMember", metadata, orgId)
    CustomFieldService-->>GroupMemberRepository: validation error
    GroupMemberRepository-->>GroupMemberService: validation error
    GroupMemberService-->>GroupMembersController: validation error
    GroupMembersController-->>Client: 422 Validation Error
```
