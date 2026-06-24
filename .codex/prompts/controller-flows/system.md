$controller-flow-generator Generate Mermaid sequence diagrams for the `SystemController` in this project.

Output requirements:
- Generate one markdown file per controller method in `docs/charts/system`.
- Use Mermaid `sequenceDiagram` blocks only.
- Each file must contain: brief overview, `## Method`, one `## Success` diagram, then separate negative-scenario diagrams when confirmed by code.
- Do not use `alt` or `else` blocks.
- For optional happy-path steps, use Mermaid `opt` blocks with the condition label.
- Use exact participant names from code where visible: `SystemController`, `dbConfig`, `Sequelize`, `sequelize`, `Umzug`, `SequelizeStorage`, `mainJson`, `defaultJoiTranslations`, `fetch`.
- Use method signatures on arrows for readability.
- Use standard HTTP labels only when confirmed by code: `204 No Content`.
- The diagrams should be valid for Mermaid and suitable for a self-hosted Mermaid setup on AWS.

Method files to generate:
- `docs/charts/system/system-migrate-controller-flow.md`
- `docs/charts/system/system-i18n-upload-controller-flow.md`

Controller-specific guidance:
- `migrate`: show the controller log entry, async config loading through `dbConfig()`, `Sequelize` initialization from that config, the two schema creation attempts through `sequelize.createSchema(...)`, the explicit `"already exists"` continue branch, `Umzug` construction with `sequelize.getQueryInterface()` context and `SequelizeStorage`, pending migration execution through `umzug.up()`, and the final applied-migrations log. Keep method labels concise and untyped: prefer `migrate()`, `dbConfig()`, `new Sequelize(config)`, `createSchema(schema)`, `getQueryInterface()`, `new SequelizeStorage(...)`, and `up()`. Do not expand environment-variable values, migration glob internals, inline config objects, or logger payload details in diagram arrows.
- `migrate`: reflect the code exactly: both schema-creation calls are inside the same `try` block, only errors whose message includes `"already exists"` are swallowed, and all other errors are rethrown. Show the continue path as a separate negative or alternate diagram only if needed for clarity, but do not invent extra schema-validation or database-connection branches that are not explicit in the method body.
- `uploadI18n`: show translation payload assembly by merging `mainJson` and `defaultJoiTranslations`, locale resolution through `process.env.DEFAULT_LANGUAGE || "en-US"`, request URL construction from the translate API environment variables, JSON request-body serialization, the outbound `fetch(...)` POST call, and the success path only when the response status is `204 No Content`. Keep method labels concise and untyped: prefer `uploadI18n()`, `merge(mainJson, defaultJoiTranslations)`, `JSON.stringify(payload)`, and `fetch(url, options)`. Do not expand the full translation map, full URL string, headers object, or serialized payload contents in diagram arrows.
- `uploadI18n`: reflect the code exactly: the method throws only when `resp.status !== 204`, and the thrown error includes both status and response text. Do not invent response-body parsing, retries, or undocumented HTTP statuses.
- Reflect that both endpoints are internal-only because `@Hidden()` is explicit in the controller code.

Negative scenarios to split into separate diagrams only if confirmed by code:
- schema creation failure other than "already exists"
- migration failure
- translation upload returned a non-`204 No Content` status

Do not add undocumented failures or status codes. If a failure is not explicitly mapped in code, omit it rather than infer it.
