# UsersController.get

Brief overview: Reads one user through `UsersRepository`, returns `404 Not Found` when the record is missing, and otherwise returns `200 OK`.

## Method

- Route: `GET /v1/users/:userId`
- Signature: `UsersController.get(userId)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant UsersController
    participant UsersRepository
    participant User

    Client->>UsersController: get(userId)
    UsersController->>UsersRepository: read(userId)
    UsersRepository->>User: findByPk(userId)
    User-->>UsersRepository: user
    UsersRepository-->>UsersController: user
    UsersController-->>Client: 200 OK
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant UsersController
    participant UsersRepository
    participant User

    Client->>UsersController: get(userId)
    UsersController->>UsersRepository: read(userId)
    UsersRepository->>User: findByPk(userId)
    User-->>UsersRepository: null
    UsersRepository-->>UsersController: null
    UsersController-->>Client: 404 Not Found
```
