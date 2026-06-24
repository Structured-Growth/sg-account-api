# GroupMembersController.get

Brief overview: чтение участника группы сначала проверяет существование родительской группы через `GroupsRepository.read`, затем читает участника через `GroupMemberRepository.read` и возвращает публичные атрибуты.

## Method

`GET /v1/groups/:groupId/members/:groupMemberId -> get(groupId, groupMemberId)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant GroupMembersController
    participant GroupsRepository
    participant GroupMemberRepository
    participant GroupMember

    Client->>GroupMembersController: get(groupMemberId)
    GroupMembersController->>GroupsRepository: read(groupId)
    GroupsRepository-->>GroupMembersController: group
    GroupMembersController->>GroupMemberRepository: read(groupMemberId)
    GroupMemberRepository->>GroupMember: findByPk(...)
    GroupMember-->>GroupMemberRepository: group member
    GroupMemberRepository-->>GroupMembersController: group member
    GroupMembersController-->>Client: 200 OK
```

## 404 Not Found Group Not Found

```mermaid
sequenceDiagram
    actor Client
    participant GroupMembersController
    participant GroupsRepository

    Client->>GroupMembersController: get(groupMemberId)
    GroupMembersController->>GroupsRepository: read(groupId)
    GroupsRepository-->>GroupMembersController: null
    GroupMembersController-->>Client: 404 Not Found
```

## 404 Not Found Group Member Not Found

```mermaid
sequenceDiagram
    actor Client
    participant GroupMembersController
    participant GroupsRepository
    participant GroupMemberRepository
    participant GroupMember

    Client->>GroupMembersController: get(groupMemberId)
    GroupMembersController->>GroupsRepository: read(groupId)
    GroupsRepository-->>GroupMembersController: group
    GroupMembersController->>GroupMemberRepository: read(groupMemberId)
    GroupMemberRepository->>GroupMember: findByPk(...)
    GroupMember-->>GroupMemberRepository: null
    GroupMemberRepository-->>GroupMembersController: null
    GroupMembersController-->>Client: 404 Not Found
```
