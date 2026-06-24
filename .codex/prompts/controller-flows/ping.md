$controller-flow-generator Generate Mermaid sequence diagrams for the `PingController` in this project.

Output requirements:
- Generate one markdown file per controller method in `docs/charts/ping`.
- Use Mermaid `sequenceDiagram` blocks only.
- Each file must contain: brief overview, `## Method`, one `## Success` diagram, then separate negative-scenario diagrams when confirmed by code.
- Do not use `alt` or `else` blocks.
- For optional happy-path steps, use Mermaid `opt` blocks with the condition label.
- Use exact participant names from code where visible: `PingController`, `getI18n`, `i18n`.
- Use method signatures on arrows for readability.
- Use standard HTTP labels only when confirmed by code: `200 OK`.
- The diagrams should be valid for Mermaid and suitable for a self-hosted Mermaid setup on AWS.

Method files to generate:
- `docs/charts/ping/ping-alive-controller-flow.md`

Controller-specific guidance:
- `pingGet`: keep the flow as a single compact success diagram centered on localized message construction and the returned response.
- Show the constructor-time dependency setup before the request flow only if needed for clarity: `getI18n()` is injected and used to initialize the controller's `i18n` field. Do not over-expand DI container internals if they are not needed to explain the request path.
- For the request flow, show the two translation lookups `i18n.__("system.ping.am")` and `i18n.__("system.ping.service")`, the interpolation with `this.appPrefix`, and the final `200 OK` response.
- Keep method labels concise and untyped: prefer `pingGet()`, `__("system.ping.am")`, and `__("system.ping.service")`. Do not write TypeScript return types, inline template-literal syntax, or JSON object literals in diagram arrows.
- For the final client response, show only `200 OK`; do not append `{ message: ... }`, translated strings, or any JSON-like payload to that response arrow.
- Reflect that the endpoint is public only because `@NoSecurity()` is explicit in the controller code.
- Reflect the code exactly: the method body contains no explicit conditional branches or handled failures. Do not invent translation-failure, missing-prefix, or DI-resolution branches unless a concrete runtime branch is visible in code.

Negative scenarios to split into separate diagrams only if confirmed by code:
- none beyond explicitly visible code branches

Do not add undocumented failures or status codes. If a failure is not explicitly mapped in code, omit it rather than infer it.
