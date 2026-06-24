$controller-flow-generator Generate Mermaid sequence diagrams for the `ResolverController` in this project.

Output requirements:
- Generate one markdown file per controller method in `docs/charts/resolver`.
- Use Mermaid `sequenceDiagram` blocks only.
- Each file must contain: brief overview, `## Method`, one `## Success` diagram, then separate negative-scenario diagrams.
- Do not use `alt` or `else` blocks.
- For optional happy-path steps, use Mermaid `opt` blocks with the condition label.
- Use exact participant names from code where visible: `ResolverController`, method validator, `controllers`, `actionToRouteMap`, `CustomFieldService`, `OrganizationService`, `CustomField`, `joi`, `validate`.
- Use method signatures on arrows for readability.
- Use standard HTTP labels only when confirmed by code: `200 OK`, `404 Not Found`, `422 Validation Error`.
- The diagrams should be valid for Mermaid and suitable for a self-hosted Mermaid setup on AWS.

Method files to generate:
- `docs/charts/resolver/resolver-resolve-controller-flow.md`
- `docs/charts/resolver/resolver-actions-controller-flow.md`
- `docs/charts/resolver/resolver-models-controller-flow.md`
- `docs/charts/resolver/resolver-validate-custom-fields-controller-flow.md`

Controller-specific guidance:
- `resolve`: show query destructuring into `resource` and `filter`, lookup of `this.app.models[resource]`, `findOne({ where: filter, rejectOnEmpty: false })`, and the final `200 OK` response with the resolved ARN. Keep the method labels concise and untyped: prefer `resolve(query)` and `findOne({ where: filter, rejectOnEmpty: false })`. Do not add a separate controller self-call for response mapping beyond the final `200 OK`.
- `actions`: show traversal of imported `controllers`, prototype method discovery, action metadata lookup through `Reflect.getMetadata(...)`, route lookup through `actionToRouteMap`, optional resource-to-ARN-pattern enrichment through `this.app.models[resource]`, fallback to `"external resource"` when no model pattern exists, action prefixing with `this.appPrefix`, and the final `200 OK` response. Keep the diagram at the level of observable behavior; do not expand framework internals beyond those explicit metadata and route-map lookups.
- `models`: show listing of `this.app.models` separately from action listing, including collection of `resource` and `arnPattern` for each model, then the final `200 OK` response. Do not mix `models` behavior into the `actions` diagram.
- `validateCustomFields`: show the `@ValidateFuncArgs(ResolveCustomFieldValidateValidator)` handoff, the downstream call `validate(entity, data, orgId, false)`, the optional early return when `orgId` is missing, inherited-organization lookup through `OrganizationService.getParentOrganizations(orgId)`, custom-field schema loading through `CustomField.findAll(...)`, Joi schema assembly, and the final validation result returned in `200 OK`. Keep method labels concise and untyped: prefer `validateCustomFields(body)`, `validate(body, query)`, and `validate(entity, data, orgId, false)`. Do not invent an exception branch for invalid custom-field values here, because this controller passes `throwError = false` and returns the validation result in the success response.
- Do not leak framework internals unless they are required to explain the runtime flow.

Negative scenarios to split into separate diagrams only if confirmed by code:
- `404 Not Found` on `resolve`
- missing resource type on `resolve`
- missing model instance on `resolve`
- `422 Validation Error` from `ResolveCustomFieldValidateValidator`

Do not add undocumented failures or status codes. If a failure is not explicitly mapped in code, omit it rather than infer it.
