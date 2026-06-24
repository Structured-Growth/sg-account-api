# UsersController.search

Brief overview: Validates the GET search query, delegates the search to `UsersRepository`, and returns `200 OK`.

## Method

- Route: `GET /v1/users`
- Signature: `UsersController.search(query)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant UsersController
    participant UserSearchParamsValidator
    participant UsersRepository
    participant User

    Client->>UsersController: search(query)
    UsersController->>UserSearchParamsValidator: validate(query)
    UserSearchParamsValidator-->>UsersController: valid
    UsersController->>UsersRepository: search(query)
    UsersRepository->>User: findAndCountAll({ where, include, offset, limit, order })
    User-->>UsersRepository: { rows, count }
    UsersRepository-->>UsersController: search result
    UsersController-->>Client: 200 OK
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant UsersController
    participant UserSearchParamsValidator

    Client->>UsersController: search(query)
    UsersController->>UserSearchParamsValidator: validate(query)
    UserSearchParamsValidator-->>UsersController: throws ValidationError
    UsersController-->>Client: 422 Validation Error
```
