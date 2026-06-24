# UsersController.searchPost

Brief overview: Validates the POST search body, delegates the search to `UsersRepository`, and returns `200 OK`.

## Method

- Route: `POST /v1/users/search`
- Signature: `UsersController.searchPost(body)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant UsersController
    participant UserSearchWithPostParamsValidator
    participant UsersRepository
    participant User

    Client->>UsersController: searchPost(body)
    UsersController->>UserSearchWithPostParamsValidator: validate(body)
    UserSearchWithPostParamsValidator-->>UsersController: valid
    UsersController->>UsersRepository: search(body)
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
    participant UserSearchWithPostParamsValidator

    Client->>UsersController: searchPost(body)
    UsersController->>UserSearchWithPostParamsValidator: validate(body)
    UserSearchWithPostParamsValidator-->>UsersController: throws ValidationError
    UsersController-->>Client: 422 Validation Error
```
