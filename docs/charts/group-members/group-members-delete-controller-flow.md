# GroupMembersController.delete

Brief overview: удаление участника группы сначала проверяет родительскую группу, затем читает целевого участника, удаляет запись через репозиторий, публикует событие и завершает запрос статусом `204 No Content`.

## Method

`DELETE /v1/groups/:groupId/members/:groupMemberId -> delete(groupId, groupMemberId)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant GroupMembersController
    participant GroupsRepository
    participant GroupMemberRepository
    participant GroupMember
    participant EventBus

    Client->>GroupMembersController: delete(groupMemberId)
    GroupMembersController->>GroupsRepository: read(groupId)
    GroupsRepository-->>GroupMembersController: group
    GroupMembersController->>GroupMemberRepository: read(groupMemberId)
    GroupMemberRepository->>GroupMember: findByPk(...)
    GroupMember-->>GroupMemberRepository: group member
    GroupMemberRepository-->>GroupMembersController: group member
    GroupMembersController->>GroupMemberRepository: delete(groupMemberId)
    GroupMemberRepository->>GroupMember: destroy(...)
    GroupMember-->>GroupMemberRepository: deleted
    GroupMemberRepository-->>GroupMembersController: void
    GroupMembersController->>EventBus: publish(new EventMutation(...))
    EventBus-->>GroupMembersController: published
    GroupMembersController-->>Client: 204 No Content
```

## 404 Not Found Group Not Found

```mermaid
sequenceDiagram
    actor Client
    participant GroupMembersController
    participant GroupsRepository

    Client->>GroupMembersController: delete(groupMemberId)
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

    Client->>GroupMembersController: delete(groupMemberId)
    GroupMembersController->>GroupsRepository: read(groupId)
    GroupsRepository-->>GroupMembersController: group
    GroupMembersController->>GroupMemberRepository: read(groupMemberId)
    GroupMemberRepository->>GroupMember: findByPk(...)
    GroupMember-->>GroupMemberRepository: null
    GroupMemberRepository-->>GroupMembersController: null
    GroupMembersController-->>Client: 404 Not Found
```
