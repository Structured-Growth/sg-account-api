# ResolverController.resolve

Brief overview: the method splits `query` into `resource` and `filter`, looks up the model in `this.app.models[resource]`, executes `findOne({ where: filter, rejectOnEmpty: false })`, and returns the ARN of the resolved record.

## Method

`GET /v1/resolver/resolve -> resolve(query)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant ResolverController
    participant appModels as this.app.models
    participant modelClass as this.app.models[resource]

    Client->>ResolverController: resolve(query)
    ResolverController->>ResolverController: { resource, ...filter } = query
    ResolverController->>appModels: [resource]
    appModels-->>ResolverController: modelClass
    ResolverController->>modelClass: findOne({ where: filter, rejectOnEmpty: false })
    modelClass-->>ResolverController: model
    ResolverController-->>Client: 200 OK { arn }
```

## 404 Not Found Missing Resource Type

```mermaid
sequenceDiagram
    actor Client
    participant ResolverController
    participant appModels as this.app.models

    Client->>ResolverController: resolve(query)
    ResolverController->>ResolverController: { resource, ...filter } = query
    ResolverController->>appModels: [resource]
    appModels-->>ResolverController: undefined
    ResolverController-->>Client: 404 Not Found
```

## 404 Not Found Missing Model Instance

```mermaid
sequenceDiagram
    actor Client
    participant ResolverController
    participant appModels as this.app.models
    participant modelClass as this.app.models[resource]

    Client->>ResolverController: resolve(query)
    ResolverController->>ResolverController: { resource, ...filter } = query
    ResolverController->>appModels: [resource]
    appModels-->>ResolverController: modelClass
    ResolverController->>modelClass: findOne({ where: filter, rejectOnEmpty: false })
    modelClass-->>ResolverController: null
    ResolverController-->>Client: 404 Not Found
```
