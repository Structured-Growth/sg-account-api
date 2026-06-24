$controller-flow-generator Generate Mermaid sequence diagrams for the `CustomFieldsController` in this project.

Output requirements:
- Generate one markdown file per controller method in `docs/charts/custom-fields`.
- Use Mermaid `sequenceDiagram` blocks only.
- Each file must contain: brief overview, `## Method`, one `## Success` diagram, then separate negative-scenario diagrams.
- Do not use `alt` or `else` blocks.
- For optional happy-path steps, use Mermaid `opt` blocks with the condition label.
- Use exact participant names from code where visible: `CustomFieldsController`, method validator, `CustomFieldService`, `CustomFieldRepository`, `OrganizationRepository`, `OrganizationService`, `CustomField`, `EventBus`.
- Use method signatures on arrows for readability.
- Use standard HTTP labels only when confirmed by code: `200 OK`, `201 Created`, `204 No Content`, `404 Not Found`, `422 Validation Error`.
- The diagrams should be valid for Mermaid and suitable for a self-hosted Mermaid setup on AWS.

Method files to generate:
- `docs/charts/custom-fields/custom-fields-search-controller-flow.md`
- `docs/charts/custom-fields/custom-fields-create-controller-flow.md`
- `docs/charts/custom-fields/custom-fields-read-controller-flow.md`
- `docs/charts/custom-fields/custom-fields-update-controller-flow.md`
- `docs/charts/custom-fields/custom-fields-delete-controller-flow.md`

Controller-specific guidance:
- `search`: show the GET validator, controller normalization of `includeInherited` to `query.includeInherited?.toString() !== "false"`, service search, optional parent-organization lookup through `OrganizationService.getParentOrganizations(orgId)` only when `includeInherited` is true, repository search, and successful `200 OK` response. Do not add a separate controller self-call for `pick(...)`, `toJSON()`, `map(...)`, or response mapping. Keep method labels concise and untyped: prefer `search(query)`, `validate(query)`, `search(params)`, and `getParentOrganizations(orgId)`. Do not write TypeScript type annotations or interface names such as `CustomFieldSearchParamsInterface` in diagram arrows. Reflect the service logic exactly: when inheritance is enabled it searches with `[orgId, ...parentOrgIds]`, otherwise it searches with `[orgId]` only. If useful for the internal flow, you may show the repository returning a paginated search result to the controller, but for the final client response show only `200 OK`; do not append `data`, `total`, `limit`, `page`, attribute lists, or any JSON-like payload to that response arrow.
- `create`: show validator, organization lookup through `OrganizationRepository.read`, region derivation from the organization, duplicate custom-field lookup through `CustomFieldRepository.search`, repository create, response status change to `201 Created`, and event publication. Keep create-path method labels concise and untyped: prefer `create(body)`, `read(orgId)`, `search(params)`, `create(params)`, and `publish(new EventMutation(...))`. Do not write TypeScript object literals, inline type annotations, or expanded event payload details in diagram arrows. Reflect the code exactly: the service requires the organization to exist, derives `region` from that organization, checks duplicates by `orgId`, `entity`, and `name`, and defaults `status` to `"active"` when absent. For the final client response, show only `201 Created`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- `read`: keep it compact with the controller, validator, repository, model, optional not-found branch, and final `200 OK` response; do not show a separate controller self-call for `pick(...)`, `toJSON()`, or response mapping. Keep method labels concise and untyped: prefer `get(customFieldId)`, `validate(customFieldId)`, and `read(customFieldId)`. Do not write TypeScript type annotations such as `customFieldId: number` in diagram arrows. For the final client response, show only `200 OK`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- `update`: show validator, initial custom-field existence lookup through `CustomFieldRepository.read`, duplicate custom-field lookup through `CustomFieldRepository.search` using the next `entity` and `name` values, repository update, repository internal `read(customFieldId)` before model mutation, `setAttributes(...)`, `save()`, event publication, and final `200 OK` response. Keep update-path method labels concise and untyped: prefer `update(customFieldId, body)`, `validate(customFieldId, body)`, `read(customFieldId)`, `search(params)`, `update(customFieldId, params)`, `setAttributes(params)`, `save()`, and `publish(new EventMutation(...))`. Do not write TypeScript object literals, inline type annotations, or interface names such as `CustomFieldUpdateBodyInterface` anywhere in the diagram arrows. Reflect the code exactly: the service reuses the current record values when `entity` or `name` are omitted, and treats another matching record as a duplicate only when its `id` differs from the current one. For the final client response, show only `200 OK`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- `delete`: show validator, read-before-delete through `CustomFieldRepository.read`, repository delete through `CustomField.destroy`, event publication, and final status change to `204 No Content`. Keep delete-path event labels concise: prefer `publish(new EventMutation(...))` over expanded payload details.
- Wherever `CustomFieldRepository` touches persistence, include `CustomField` as a separate participant and show the concrete model call, matching the code path actually used, for example `findByPk(...)`, `findAndCountAll(...)`, `create(...)`, `setAttributes(...)`, `save()`, or `destroy(...)`.
- For all success responses that return a custom field, reflect only the public attributes confirmed by code: `id`, `orgId`, `entity`, `title`, `name`, `schema`, `createdAt`, `updatedAt`, `status`, `arn`.

Negative scenarios to split into separate diagrams only if confirmed by code:
- `422 Validation Error`
- `404 Not Found`
- organization-not-found failure on `create`
- duplicate-custom-field validation failure on `create`
- duplicate-custom-field validation failure on `update`

Do not add undocumented failures or status codes. If a failure is not explicitly mapped in code, omit it rather than infer it.
