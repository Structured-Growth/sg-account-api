# ResolverController.actions

Brief overview: the method iterates over imported `controllers`, discovers prototype methods, reads action metadata through `Reflect.getMetadata(...)`, looks up the route in `actionToRouteMap`, enriches resources with `arnPattern` from `this.app.models[resource]` when available, and returns the final action list prefixed with `this.appPrefix`.

## Method

`GET /v1/resolver/actions -> actions()`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant ResolverController
    participant controllers
    participant actionToRouteMap
    participant appModels as this.app.models

    Client->>ResolverController: actions()
    ResolverController->>ResolverController: actions = []
    ResolverController->>controllers: iterate controller exports
    controllers-->>ResolverController: controller
    ResolverController->>controllers: get prototype methods
    controllers-->>ResolverController: methods
    loop each controller
        loop each method
            ResolverController->>controllers: Reflect.getMetadata(__action:${method}, prototype)
            controllers-->>ResolverController: action metadata or undefined
            ResolverController->>actionToRouteMap: [${controller}.${method}]
            actionToRouteMap-->>ResolverController: route
            opt action metadata exists
                opt action.resources exists
                    ResolverController->>appModels: [resource]
                    appModels-->>ResolverController: modelClass or undefined
                    opt arnPattern missing after lookup
                        ResolverController->>ResolverController: arnPattern = "external resource"
                    end
                end
                ResolverController->>ResolverController: prefix action with this.appPrefix
                ResolverController->>ResolverController: actions.push({ action, route, resources })
            end
        end
    end
    ResolverController-->>Client: 200 OK
```
