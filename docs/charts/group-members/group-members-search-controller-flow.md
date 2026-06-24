# GroupMembersController.search

Brief overview: GET-поиск участников группы валидирует query-параметры, принудительно добавляет `groupId` из route-контекста и передаёт поиск в `GroupMemberRepository`, который всегда фильтрует связанные `Account` и `User` по активному статусу.

## Method

`GET /v1/groups/:groupId/members -> search(groupId, query)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant GroupMembersController
    participant GroupMemberSearchParamsValidator
    participant GroupMemberRepository
    participant GroupMember
    participant Account
    participant User

    Client->>GroupMembersController: search(groupId, query)
    GroupMembersController->>GroupMemberSearchParamsValidator: validate(query)
    GroupMemberSearchParamsValidator-->>GroupMembersController: valid
    GroupMembersController->>GroupMemberRepository: search(query)
    GroupMemberRepository->>Account: join active status
    Account-->>GroupMemberRepository: join config
    GroupMemberRepository->>User: join active status
    User-->>GroupMemberRepository: join config
    opt onlyTotal enabled
        GroupMemberRepository->>GroupMember: count(...)
        GroupMember-->>GroupMemberRepository: total
    end
    opt onlyTotal disabled
        GroupMemberRepository->>GroupMember: findAndCountAll(...)
        GroupMember-->>GroupMemberRepository: rows, count
    end
    GroupMemberRepository-->>GroupMembersController: search result
    GroupMembersController-->>Client: 200 OK
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant GroupMembersController
    participant GroupMemberSearchParamsValidator

    Client->>GroupMembersController: search(groupId, query)
    GroupMembersController->>GroupMemberSearchParamsValidator: validate(query)
    GroupMemberSearchParamsValidator-->>GroupMembersController: validation error
    GroupMembersController-->>Client: 422 Validation Error
```
