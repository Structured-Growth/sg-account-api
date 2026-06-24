$controller-flow-generator Generate Mermaid sequence diagrams for the `DocsController` in this project.

Output requirements:
- Generate one markdown file per controller method in `docs/charts/docs`.
- Use Mermaid `sequenceDiagram` blocks only.
- Each file must contain: brief overview, `## Method`, one `## Success` diagram, then separate negative-scenario diagrams when confirmed by code.
- Do not use `alt` or `else` blocks.
- For optional happy-path steps, use Mermaid `opt` blocks with the condition label.
- Use exact participant names from code where visible: `DocsController`, `process`, `path`, `readFile`, `JSON`.
- Use method signatures on arrows for readability.
- Use standard HTTP labels only when confirmed by code: `200 OK`, `404 Not Found`.
- The diagrams should be valid for Mermaid and suitable for a self-hosted Mermaid setup on AWS.

Method files to generate:
- `docs/charts/docs/docs-get-swagger-controller-flow.md`

Controller-specific guidance:
- `getSwagger`: keep the flow compact around runtime root directory resolution, Swagger path construction, file loading, and JSON parsing of the loaded document.
- Show the runtime root directory resolution using `process.env.LAMBDA_TASK_ROOT || process.cwd()` before building the Swagger path with `path.join(rootDir, ".docs", "openapi.v1", "swagger.json")`.
- Show the file read through `readFile(swaggerPath, "utf-8")`, the `ENOENT` branch that becomes `404 Not Found` via `NotFoundError("Swagger file not found")`, and the final `JSON.parse(swaggerRaw)` response path.
- Keep method labels concise and untyped: prefer `getSwagger()`, `cwd()`, `join(rootDir, ".docs", "openapi.v1", "swagger.json")`, `readFile(swaggerPath, "utf-8")`, and `parse(swaggerRaw)`. Do not write TypeScript return types or inline object shapes in diagram arrows.
- Reflect the code exactly: only `error?.code === "ENOENT"` is converted to `404 Not Found`; all other read failures are rethrown unchanged. Show a separate negative diagram for the rethrow branch only if it is useful for clarity, and do not invent permission, validation, or fallback-file branches that are not explicit in the method body.
- For the final client response on success, show only `200 OK`; do not append the full OpenAPI payload, schema fragments, or JSON-like response bodies to that response arrow.
- Reflect that the endpoint is public only because `@NoSecurity()` is explicit in the controller code.

Negative scenarios to split into separate diagrams only if confirmed by code:
- `404 Not Found`
- invalid JSON parse failure
- file read failure other than `ENOENT`

Do not add undocumented failures or status codes. If a failure is not explicitly mapped in code, omit it rather than infer it.
