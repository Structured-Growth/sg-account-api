# DocsController.getSwagger

Brief overview: публичный `GET /v1/docs/swagger.json` доступен без security middleware только потому, что в контроллере явно указан `@NoSecurity()`. Метод `getSwagger()` определяет runtime root directory через `process.env.LAMBDA_TASK_ROOT || process.cwd()`, строит путь к Swagger-файлу, читает `.docs/openapi.v1/swagger.json` и возвращает `200 OK` после `JSON.parse(swaggerRaw)`.

## Method

Route: `GET /v1/docs/swagger.json`  
Controller method: `DocsController.getSwagger()`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant DocsController
    participant process
    participant path
    participant readFile
    participant JSON

    Client->>DocsController: getSwagger()
    opt process.env.LAMBDA_TASK_ROOT is set
        DocsController->>process: env.LAMBDA_TASK_ROOT
        process-->>DocsController: rootDir
    end
    opt process.env.LAMBDA_TASK_ROOT is not set
        DocsController->>process: cwd()
        process-->>DocsController: rootDir
    end
    DocsController->>path: join(rootDir, ".docs", "openapi.v1", "swagger.json")
    path-->>DocsController: swaggerPath
    DocsController->>readFile: readFile(swaggerPath, "utf-8")
    readFile-->>DocsController: swaggerRaw
    DocsController->>JSON: parse(swaggerRaw)
    JSON-->>DocsController: swagger document
    DocsController-->>Client: 200 OK
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant DocsController
    participant process
    participant path
    participant readFile

    Client->>DocsController: getSwagger()
    opt process.env.LAMBDA_TASK_ROOT is set
        DocsController->>process: env.LAMBDA_TASK_ROOT
        process-->>DocsController: rootDir
    end
    opt process.env.LAMBDA_TASK_ROOT is not set
        DocsController->>process: cwd()
        process-->>DocsController: rootDir
    end
    DocsController->>path: join(rootDir, ".docs", "openapi.v1", "swagger.json")
    path-->>DocsController: swaggerPath
    DocsController->>readFile: readFile(swaggerPath, "utf-8")
    readFile-->>DocsController: ENOENT error
    DocsController->>DocsController: throw NotFoundError("Swagger file not found")
    DocsController-->>Client: 404 Not Found
```

## Invalid JSON Parse Failure

```mermaid
sequenceDiagram
    actor Client
    participant DocsController
    participant process
    participant path
    participant readFile
    participant JSON

    Client->>DocsController: getSwagger()
    opt process.env.LAMBDA_TASK_ROOT is set
        DocsController->>process: env.LAMBDA_TASK_ROOT
        process-->>DocsController: rootDir
    end
    opt process.env.LAMBDA_TASK_ROOT is not set
        DocsController->>process: cwd()
        process-->>DocsController: rootDir
    end
    DocsController->>path: join(rootDir, ".docs", "openapi.v1", "swagger.json")
    path-->>DocsController: swaggerPath
    DocsController->>readFile: readFile(swaggerPath, "utf-8")
    readFile-->>DocsController: swaggerRaw
    DocsController->>JSON: parse(swaggerRaw)
    JSON-->>DocsController: parse error
```

## File Read Failure

```mermaid
sequenceDiagram
    actor Client
    participant DocsController
    participant process
    participant path
    participant readFile

    Client->>DocsController: getSwagger()
    opt process.env.LAMBDA_TASK_ROOT is set
        DocsController->>process: env.LAMBDA_TASK_ROOT
        process-->>DocsController: rootDir
    end
    opt process.env.LAMBDA_TASK_ROOT is not set
        DocsController->>process: cwd()
        process-->>DocsController: rootDir
    end
    DocsController->>path: join(rootDir, ".docs", "openapi.v1", "swagger.json")
    path-->>DocsController: swaggerPath
    DocsController->>readFile: readFile(swaggerPath, "utf-8")
    readFile-->>DocsController: error
    DocsController->>DocsController: throw error
```
