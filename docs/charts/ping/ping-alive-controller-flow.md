# PingController.pingGet

Brief overview: публичный `GET /v1/ping/alive` доступен без security middleware благодаря явному `@NoSecurity()`. Метод `pingGet()` использует `i18n`, инициализированный через `getI18n()` в конструкторе, собирает локализованное сообщение с `this.appPrefix` и возвращает `200 OK`.

## Method

`GET /v1/ping/alive -> pingGet()`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant PingController
    participant getI18n
    participant i18n

    PingController->>getI18n: getI18n()
    getI18n-->>PingController: i18n
    PingController->>PingController: initialize i18n
    Client->>PingController: pingGet()
    PingController->>i18n: __("system.ping.am")
    i18n-->>PingController: localized fragment
    PingController->>i18n: __("system.ping.service")
    i18n-->>PingController: localized fragment
    PingController->>PingController: interpolate appPrefix
    PingController-->>Client: 200 OK
```
