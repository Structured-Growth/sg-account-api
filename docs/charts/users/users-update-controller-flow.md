# UsersController.update

Brief overview: Validates the update request, checks the target user in `UsersService`, optionally validates the image signature and primary-user rules, updates the record through `UsersRepository`, validates custom fields inside the repository update path, saves the user, publishes an event, and returns `200 OK`.

## Method

- Route: `PUT /v1/users/:userId`
- Signature: `UsersController.update(userId, body)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant UsersController
    participant UserUpdateParamsValidator
    participant UsersService
    participant UsersRepository
    participant CustomFieldService
    participant User
    participant EventBus

    Client->>UsersController: update(userId, body)
    UsersController->>UserUpdateParamsValidator: validate(userId, body)
    UserUpdateParamsValidator-->>UsersController: valid
    UsersController->>UsersService: update(userId, body)
    UsersService->>UsersRepository: read(userId)
    UsersRepository->>User: findByPk(userId)
    User-->>UsersRepository: user
    UsersRepository-->>UsersService: user
    opt body.imageBase64 is provided
        UsersService->>UsersService: hasValidImageSignature(Buffer.from(imageBase64, "base64"))
        UsersService-->>UsersService: valid image signature
    end
    opt body.isPrimary === true
        UsersService->>UsersRepository: search(params)
        UsersRepository->>User: findAndCountAll({ where, include, offset, limit, order })
        User-->>UsersRepository: { rows, count }
        UsersRepository-->>UsersService: search result
        UsersService->>UsersRepository: update(user.id, params)
        UsersRepository->>UsersRepository: read(user.id)
        UsersRepository->>User: findByPk(user.id)
        User-->>UsersRepository: user
        UsersRepository->>User: setAttributes(params)
        UsersRepository->>CustomFieldService: validate("User", metadata, orgId)
        CustomFieldService-->>UsersRepository: valid
        UsersRepository->>User: save()
        User-->>UsersRepository: updated user
        UsersRepository-->>UsersService: updated user
    end
    opt body.isPrimary === false
        UsersService->>UsersRepository: search(params)
        UsersRepository->>User: findAndCountAll({ where, include, offset, limit, order })
        User-->>UsersRepository: { rows, count }
        UsersRepository-->>UsersService: search result
    end
    UsersService->>UsersRepository: update(userId, params)
    UsersRepository->>UsersRepository: read(userId)
    UsersRepository->>User: findByPk(userId)
    User-->>UsersRepository: user
    UsersRepository->>User: setAttributes(params)
    UsersRepository->>CustomFieldService: validate("User", metadata, orgId)
    CustomFieldService-->>UsersRepository: valid
    UsersRepository->>User: save()
    User-->>UsersRepository: updated user
    UsersRepository-->>UsersService: updated user
    UsersService-->>UsersController: user
    UsersController->>EventBus: publish(new EventMutation(...))
    EventBus-->>UsersController: published
    UsersController-->>Client: 200 OK
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant UsersController
    participant UserUpdateParamsValidator

    Client->>UsersController: update(userId, body)
    UsersController->>UserUpdateParamsValidator: validate(userId, body)
    UserUpdateParamsValidator-->>UsersController: throws ValidationError
    UsersController-->>Client: 422 Validation Error
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant UsersController
    participant UserUpdateParamsValidator
    participant UsersService
    participant UsersRepository
    participant User

    Client->>UsersController: update(userId, body)
    UsersController->>UserUpdateParamsValidator: validate(userId, body)
    UserUpdateParamsValidator-->>UsersController: valid
    UsersController->>UsersService: update(userId, body)
    UsersService->>UsersRepository: read(userId)
    UsersRepository->>User: findByPk(userId)
    User-->>UsersRepository: null
    UsersRepository-->>UsersService: null
    UsersService-->>UsersController: throws NotFoundError
    UsersController-->>Client: 404 Not Found
```

## 422 Invalid Image Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant UsersController
    participant UserUpdateParamsValidator
    participant UsersService
    participant UsersRepository
    participant User

    Client->>UsersController: update(userId, body)
    UsersController->>UserUpdateParamsValidator: validate(userId, body)
    UserUpdateParamsValidator-->>UsersController: valid
    UsersController->>UsersService: update(userId, body)
    UsersService->>UsersRepository: read(userId)
    UsersRepository->>User: findByPk(userId)
    User-->>UsersRepository: user
    UsersRepository-->>UsersService: user
    UsersService->>UsersService: hasValidImageSignature(Buffer.from(imageBase64, "base64"))
    UsersService-->>UsersController: throws ValidationError
    UsersController-->>Client: 422 Validation Error
```

## 422 Primary User Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant UsersController
    participant UserUpdateParamsValidator
    participant UsersService
    participant UsersRepository
    participant User

    Client->>UsersController: update(userId, body)
    UsersController->>UserUpdateParamsValidator: validate(userId, body)
    UserUpdateParamsValidator-->>UsersController: valid
    UsersController->>UsersService: update(userId, body)
    UsersService->>UsersRepository: read(userId)
    UsersRepository->>User: findByPk(userId)
    User-->>UsersRepository: user
    UsersRepository-->>UsersService: user
    UsersService->>UsersRepository: search(params)
    UsersRepository->>User: findAndCountAll({ where, include, offset, limit, order })
    User-->>UsersRepository: { rows, count }
    UsersRepository-->>UsersService: search result
    UsersService-->>UsersController: throws ValidationError
    UsersController-->>Client: 422 Validation Error
```

## 422 Custom Field Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant UsersController
    participant UserUpdateParamsValidator
    participant UsersService
    participant UsersRepository
    participant CustomFieldService
    participant User

    Client->>UsersController: update(userId, body)
    UsersController->>UserUpdateParamsValidator: validate(userId, body)
    UserUpdateParamsValidator-->>UsersController: valid
    UsersController->>UsersService: update(userId, body)
    UsersService->>UsersRepository: read(userId)
    UsersRepository->>User: findByPk(userId)
    User-->>UsersRepository: user
    UsersRepository-->>UsersService: user
    UsersService->>UsersRepository: update(userId, params)
    UsersRepository->>UsersRepository: read(userId)
    UsersRepository->>User: findByPk(userId)
    User-->>UsersRepository: user
    UsersRepository->>User: setAttributes(params)
    UsersRepository->>CustomFieldService: validate("User", metadata, orgId)
    CustomFieldService-->>UsersRepository: throws ValidationError
    UsersRepository-->>UsersService: throws ValidationError
    UsersService-->>UsersController: throws ValidationError
    UsersController-->>Client: 422 Validation Error
```
