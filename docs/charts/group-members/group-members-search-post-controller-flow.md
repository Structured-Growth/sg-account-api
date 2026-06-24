# GroupMembersController.searchPost

Brief overview: POST-поиск участников группы валидирует тело запроса, добавляет `groupId` из route-контекста и использует тот же `GroupMemberRepository.search`, включая обязательные join-фильтры по активным `Account` и `User`.

## Method

`POST /v1/groups/:groupId/members/search -> searchPost(groupId, body)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant GroupMembersController
    participant GroupMemberSearchWithPostParamsValidator
    participant GroupMemberRepository
    participant GroupMember
    participant Account
    participant User

    Client->>GroupMembersController: searchPost(groupId, body)
    GroupMembersController->>GroupMemberSearchWithPostParamsValidator: validate(body)
    GroupMemberSearchWithPostParamsValidator-->>GroupMembersController: valid
    GroupMembersController->>GroupMemberRepository: search(body)
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
    participant GroupMemberSearchWithPostParamsValidator

    Client->>GroupMembersController: searchPost(groupId, body)
    GroupMembersController->>GroupMemberSearchWithPostParamsValidator: validate(body)
    GroupMemberSearchWithPostParamsValidator-->>GroupMembersController: validation error
    GroupMembersController-->>Client: 422 Validation Error
```
