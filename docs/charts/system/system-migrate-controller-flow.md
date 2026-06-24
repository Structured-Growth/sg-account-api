# SystemController.migrate

Brief overview: Internal-only endpoint hidden by `@Hidden()`. It logs migration start, loads database config through `dbConfig()`, creates a `sequelize` instance from `new Sequelize(config)`, attempts schema creation inside one shared `try` block, builds `Umzug` with `sequelize.getQueryInterface()` and `new SequelizeStorage(...)`, executes pending migrations through `up()`, and logs the applied migration count.

## Method

- Route: `POST /v1/system/migrate`
- Signature: `SystemController.migrate()`
- Visibility: internal-only via `@Hidden()`

## Success

```mermaid
sequenceDiagram
    actor InternalCaller
    participant SystemController
    participant dbConfig
    participant Sequelize
    participant sequelize
    participant Umzug
    participant SequelizeStorage

    InternalCaller->>SystemController: migrate()
    SystemController->>SystemController: logger.info("Applying latest migrations...")
    SystemController->>dbConfig: dbConfig()
    dbConfig-->>SystemController: config
    SystemController->>Sequelize: new Sequelize(config)
    Sequelize-->>SystemController: sequelize
    SystemController->>sequelize: createSchema(schema)
    sequelize-->>SystemController: created
    SystemController->>sequelize: createSchema(schema)
    sequelize-->>SystemController: created
    SystemController->>sequelize: getQueryInterface()
    sequelize-->>SystemController: queryInterface
    SystemController->>SequelizeStorage: new SequelizeStorage(...)
    SequelizeStorage-->>SystemController: storage
    SystemController->>Umzug: new Umzug(...)
    Umzug-->>SystemController: umzug
    SystemController->>Umzug: up()
    Umzug-->>SystemController: result
    SystemController->>SystemController: logger.info("migrations applied", result)
    SystemController-->>InternalCaller: completed
```

## Continue On "already exists"

```mermaid
sequenceDiagram
    actor InternalCaller
    participant SystemController
    participant dbConfig
    participant Sequelize
    participant sequelize
    participant Umzug
    participant SequelizeStorage

    InternalCaller->>SystemController: migrate()
    SystemController->>SystemController: logger.info("Applying latest migrations...")
    SystemController->>dbConfig: dbConfig()
    dbConfig-->>SystemController: config
    SystemController->>Sequelize: new Sequelize(config)
    Sequelize-->>SystemController: sequelize
    SystemController->>sequelize: createSchema(schema)
    sequelize-->>SystemController: created
    SystemController->>sequelize: createSchema(schema)
    sequelize-->>SystemController: throws error with "already exists"
    SystemController->>SystemController: logger.info("Schema already exists, continue...")
    SystemController->>sequelize: getQueryInterface()
    sequelize-->>SystemController: queryInterface
    SystemController->>SequelizeStorage: new SequelizeStorage(...)
    SequelizeStorage-->>SystemController: storage
    SystemController->>Umzug: new Umzug(...)
    Umzug-->>SystemController: umzug
    SystemController->>Umzug: up()
    Umzug-->>SystemController: result
    SystemController->>SystemController: logger.info("migrations applied", result)
    SystemController-->>InternalCaller: completed
```

## Schema Creation Failure

```mermaid
sequenceDiagram
    actor InternalCaller
    participant SystemController
    participant dbConfig
    participant Sequelize
    participant sequelize

    InternalCaller->>SystemController: migrate()
    SystemController->>SystemController: logger.info("Applying latest migrations...")
    SystemController->>dbConfig: dbConfig()
    dbConfig-->>SystemController: config
    SystemController->>Sequelize: new Sequelize(config)
    Sequelize-->>SystemController: sequelize
    SystemController->>sequelize: createSchema(schema)
    sequelize-->>SystemController: throws error without "already exists"
    SystemController-->>InternalCaller: propagates error
```

## Migration Failure

```mermaid
sequenceDiagram
    actor InternalCaller
    participant SystemController
    participant dbConfig
    participant Sequelize
    participant sequelize
    participant Umzug
    participant SequelizeStorage

    InternalCaller->>SystemController: migrate()
    SystemController->>SystemController: logger.info("Applying latest migrations...")
    SystemController->>dbConfig: dbConfig()
    dbConfig-->>SystemController: config
    SystemController->>Sequelize: new Sequelize(config)
    Sequelize-->>SystemController: sequelize
    SystemController->>sequelize: createSchema(schema)
    sequelize-->>SystemController: created
    SystemController->>sequelize: createSchema(schema)
    sequelize-->>SystemController: created
    SystemController->>sequelize: getQueryInterface()
    sequelize-->>SystemController: queryInterface
    SystemController->>SequelizeStorage: new SequelizeStorage(...)
    SequelizeStorage-->>SystemController: storage
    SystemController->>Umzug: new Umzug(...)
    Umzug-->>SystemController: umzug
    SystemController->>Umzug: up()
    Umzug-->>SystemController: throws error
    SystemController-->>InternalCaller: propagates error
```
