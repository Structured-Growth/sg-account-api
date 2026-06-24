$controller-flow-generator Generate Mermaid sequence diagrams for the `GroupsController` in this project.

Output requirements:
- Generate one markdown file per controller method in `docs/charts/groups`.
- Use Mermaid `sequenceDiagram` blocks only.
- Each file must contain: brief overview, `## Method`, one `## Success` diagram, then separate negative-scenario diagrams.
- Do not use `alt` or `else` blocks.
- For optional happy-path steps, use Mermaid `opt` blocks with the condition label.
- Use exact participant names from code where visible: `GroupsController`, method validator, `GroupService`, `GroupsRepository`, `AccountRepository`, `ImageValidator`, `CustomFieldService`, `Group`, `GroupMember`, `EventBus`.
- Use method signatures on arrows for readability.
- Use standard HTTP labels only when confirmed by code: `200 OK`, `201 Created`, `204 No Content`, `404 Not Found`, `422 Validation Error`.
- The diagrams should be valid for Mermaid and suitable for a self-hosted Mermaid setup on AWS.

Method files to generate:
- `docs/charts/groups/groups-search-controller-flow.md`
- `docs/charts/groups/groups-search-post-controller-flow.md`
- `docs/charts/groups/groups-create-controller-flow.md`
- `docs/charts/groups/groups-read-controller-flow.md`
- `docs/charts/groups/groups-update-controller-flow.md`
- `docs/charts/groups/groups-delete-controller-flow.md`

Controller-specific guidance:
- `search`: show the GET validator, `includeOwner` normalization in the controller, repository search, and successful `200 OK` response, but do not add a separate controller self-call for `pick(...)`, `toJSON()`, `map(...)`, or response mapping. Keep method labels concise and untyped: prefer `search(query)` and `validate(query)`. Do not write TypeScript type annotations or interface names such as `GroupSearchParamsInterface` in diagram arrows. Reflect the repository logic exactly: when `accountId` is present it joins `GroupMember`, and the repository applies account filtering based on `includeOwner`. Do not break that filtering into separate optional Mermaid blocks for the success diagram; show a compact repository call flow instead, like in the other controller examples. Also reflect the repository's optional `onlyTotal` path in a compact way: when that option is enabled it uses `count(...)`, otherwise it uses `findAndCountAll(...)`. If useful for the internal flow, you may show the repository returning a paginated search result to the controller, but for the final client response show only `200 OK`; do not append `data`, `total`, `limit`, `page`, attribute lists, or any JSON-like payload to that response arrow.
- `searchPost`: keep it separate from GET because it uses a different validator and request body, and because the controller does not normalize `includeOwner` before calling the repository. Reflect the same repository search and successful `200 OK` response without a separate controller self-call for `pick(...)`, `toJSON()`, `map(...)`, or response mapping. Keep method labels concise and untyped: prefer `searchPost(body)` or `search(body)` and `validate(body)`. Do not write TypeScript type annotations or interface names in diagram arrows. Reflect that the repository applies account filtering based on `includeOwner`, but do not split that internal filtering into separate optional Mermaid blocks in the success diagram; keep the success flow compact. Also reflect the repository's optional `onlyTotal` path in a compact way: when that option is enabled it uses `count(...)`, otherwise it uses `findAndCountAll(...)`. If useful for the internal flow, you may show the repository returning a paginated search result to the controller, but for the final client response show only `200 OK`; do not append `data`, `total`, `limit`, `page`, attribute lists, or any JSON-like payload to that response arrow. Reflect that POST search omits `imageUrl` from the final response even though GET search includes it.
- `create`: show validator, account lookup through `AccountRepository.read`, optional parent group lookup through `GroupsRepository.read` only when `parentGroupId` is provided, slug generation from `title`, duplicate-name detection through `Group.count`, optional image-signature validation through `ImageValidator`, `GroupsRepository.create`, custom field validation inside the repository create path, response status change to `201 Created`, and event publication. Keep create-path method labels concise and untyped: prefer `create(body)`, `read(accountId)`, `read(parentGroupId)`, `count({ name })`, `hasValidImageSignature(image)`, `create(params)`, `validate("Group", metadata, orgId)`, and `publish(new EventMutation(...))`. Do not write TypeScript object literals, inline type annotations, or expanded payload details in diagram arrows. Reflect the code exactly: the service derives `orgId` from the account when it is absent, stores `parentGroupId` only from the resolved parent record, and validates duplicate names globally by slugged `name`. For the final client response, show only `201 Created`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- `read`: keep it compact with the controller, validator, repository, model, optional not-found branch, and final `200 OK` response; do not show a separate controller self-call for `pick(...)`, `toJSON()`, or response mapping. Keep method labels concise and untyped: prefer `get(groupId)` and `read(groupId)`. Do not write TypeScript type annotations such as `groupId: number` in diagram arrows. For the final client response, show only `200 OK`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- `update`: show validator, initial group existence lookup through `GroupsRepository.read`, optional duplicate-name check only when `title` changes, optional parent group lookup when `parentGroupId` is provided, optional image-signature validation, repository update, custom field validation inside the repository update path, save, event publication, and final `200 OK` response. Keep update-path method labels concise and untyped: prefer `update(groupId, body)`, `validate(groupId, body)`, `read(groupId)`, `count({ name })`, `hasValidImageSignature(image)`, `update(groupId, params)`, `validate("Group", metadata, orgId)`, and `publish(new EventMutation(...))`. Do not write TypeScript object literals, inline type annotations, or interface names such as `GroupUpdateBodyInterface` anywhere in the diagram arrows. Reflect the code exactly: the service omits undefined fields before calling the repository, and the repository performs its own `read(groupId)` before `setAttributes(...)` and `save()`. For the final client response, show only `200 OK`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- `delete`: show validator, read-before-delete through `GroupsRepository.read`, `GroupsRepository.delete`, event publication, and final status change to `204 No Content`. Keep delete-path event labels concise: prefer `publish(new EventMutation(...))` over expanded payload details.
- Wherever `GroupsRepository` touches persistence, include `Group` as a separate participant and show the concrete model call, for example `findByPk(...)`, `findAndCountAll(...)`, `count(...)`, `create(...)`, `setAttributes(...)`, `save()`, or `destroy(...)`, matching the code path actually used. When the search flow joins group membership for account filtering, include `GroupMember` as a separate participant.
- For all success responses that return a group, reflect only the public attributes confirmed by code: `id`, `orgId`, `accountId`, `parentGroupId`, `title`, `name`, `status`, `createdAt`, `updatedAt`, `arn`, `metadata`; include `imageUrl` only on methods where the controller explicitly returns it.

Negative scenarios to split into separate diagrams only if confirmed by code:
- `422 Validation Error`
- `404 Not Found`
- account-not-found failure on `create`
- parent-group-not-found failure on `create`
- parent-group-not-found failure on `update`
- duplicate-name validation failure
- invalid-image validation failure
- custom-field validation failure

Do not add undocumented failures or status codes. If a failure is not explicitly mapped in code, omit it rather than infer it.
