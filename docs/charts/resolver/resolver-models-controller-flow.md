# ResolverController.models

Brief overview: the method iterates over `this.app.models`, collects `resource` and `arnPattern` for each model, and returns the complete model list.

## Method

`GET /v1/resolver/models -> models()`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant ResolverController
    participant appModels as this.app.models

    Client->>ResolverController: models()
    ResolverController->>ResolverController: models = []
    ResolverController->>appModels: list resources
    appModels-->>ResolverController: model keys
    loop each resource
        ResolverController->>appModels: [resource].arnPattern
        appModels-->>ResolverController: arnPattern
        ResolverController->>ResolverController: models.push({ resource, arnPattern })
    end
    ResolverController-->>Client: 200 OK
```
