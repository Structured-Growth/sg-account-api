# SystemController.uploadI18n

Brief overview: Internal-only endpoint hidden by `@Hidden()`. It merges `mainJson` and `defaultJoiTranslations`, resolves the locale from `process.env.DEFAULT_LANGUAGE || "en-US"`, builds the translation upload URL from environment variables, serializes the JSON request body, sends a POST request through `fetch`, and only completes successfully when the response status is `204 No Content`.

## Method

- Route: `POST /v1/system/i18n-upload`
- Signature: `SystemController.uploadI18n()`
- Visibility: internal-only via `@Hidden()`

## Success

```mermaid
sequenceDiagram
    actor InternalCaller
    participant SystemController
    participant mainJson
    participant defaultJoiTranslations
    participant fetch

    InternalCaller->>SystemController: uploadI18n()
    mainJson-->>SystemController: translations
    defaultJoiTranslations-->>SystemController: translations
    SystemController->>SystemController: merge(mainJson, defaultJoiTranslations)
    SystemController->>SystemController: process.env.DEFAULT_LANGUAGE || "en-US"
    SystemController->>SystemController: build url from TRANSLATE_API_URL and TRANSLATE_API_CLIENT_ID
    SystemController->>SystemController: assemble payload
    SystemController->>SystemController: JSON.stringify(payload)
    SystemController->>fetch: fetch(url, options)
    fetch-->>SystemController: resp.status = 204
    SystemController-->>InternalCaller: 204 No Content
```

## Translation Upload Returned Non-204

```mermaid
sequenceDiagram
    actor InternalCaller
    participant SystemController
    participant mainJson
    participant defaultJoiTranslations
    participant fetch

    InternalCaller->>SystemController: uploadI18n()
    mainJson-->>SystemController: translations
    defaultJoiTranslations-->>SystemController: translations
    SystemController->>SystemController: merge(mainJson, defaultJoiTranslations)
    SystemController->>SystemController: process.env.DEFAULT_LANGUAGE || "en-US"
    SystemController->>SystemController: build url from TRANSLATE_API_URL and TRANSLATE_API_CLIENT_ID
    SystemController->>SystemController: assemble payload
    SystemController->>SystemController: JSON.stringify(payload)
    SystemController->>fetch: fetch(url, options)
    fetch-->>SystemController: resp.status != 204
    SystemController->>fetch: resp.text()
    fetch-->>SystemController: response text
    SystemController-->>InternalCaller: throws Error(status, response text)
```
