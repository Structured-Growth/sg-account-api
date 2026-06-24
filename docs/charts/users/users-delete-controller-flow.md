# UsersController.delete

Brief overview: Validates the delete request, reads the user before deletion through `UsersRepository`, deletes the record, publishes an event, sets the response status, and returns no content.

## Method

- Route: `DELETE /v1/users/:userId`
- Signature: `UsersController.delete(userId: number)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant UsersController
    participant UserDeleteParamsValidator
    participant UsersRepository
    participant User
    participant EventBus

    Client->>UsersController: delete(userId: number)
    UsersController->>UserDeleteParamsValidator: validate({ userId })
    UserDeleteParamsValidator-->>UsersController: valid
    UsersController->>UsersRepository: read(userId)
    UsersRepository->>User: findByPk(userId)
    User-->>UsersRepository: user
    UsersRepository-->>UsersController: user
    UsersController->>UsersRepository: delete(userId)
    UsersRepository->>User: destroy({ where: { id: userId } })
    User-->>UsersRepository: deleted rows
    UsersRepository-->>UsersController: deleted
    UsersController->>EventBus: publish(new EventMutation(...))
    EventBus-->>UsersController: published
    UsersController->>UsersController: response.status(204)
    UsersController-->>Client: 204 No Content
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant UsersController
    participant UserDeleteParamsValidator

    Client->>UsersController: delete(userId: number)
    UsersController->>UserDeleteParamsValidator: validate({ userId })
    UserDeleteParamsValidator-->>UsersController: throws ValidationError
    UsersController-->>Client: 422 Validation Error
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant UsersController
    participant UserDeleteParamsValidator
    participant UsersRepository
    participant User

    Client->>UsersController: delete(userId: number)
    UsersController->>UserDeleteParamsValidator: validate({ userId })
    UserDeleteParamsValidator-->>UsersController: valid
    UsersController->>UsersRepository: read(userId)
    UsersRepository->>User: findByPk(userId)
    User-->>UsersRepository: null
    UsersRepository-->>UsersController: null
    UsersController-->>Client: 404 Not Found
```
