$controller-flow-generator Generate Mermaid sequence diagrams for the `UsersController` in this project.

Output requirements:
- Generate one markdown file per controller method in `docs/charts/users`.
- Use Mermaid `sequenceDiagram` blocks only.
- Each file must contain: brief overview, `## Method`, one `## Success` diagram, then separate negative-scenario diagrams.
- Do not use `alt` or `else` blocks.
- For optional happy-path steps, use Mermaid `opt` blocks with the condition label.
- Use exact participant names from code where visible: `UsersController`, method validator, `UsersService`, `UsersRepository`, `EventBus`.
- Use method signatures on arrows for readability.
- Use standard HTTP labels only when confirmed by code: `200 OK`, `201 Created`, `204 No Content`, `404 Not Found`, `422 Validation Error`.
- The diagrams should be valid for Mermaid and suitable for a self-hosted Mermaid setup on AWS.

Method files to generate:
- `docs/charts/users/users-search-controller-flow.md`
- `docs/charts/users/users-search-post-controller-flow.md`
- `docs/charts/users/users-create-controller-flow.md`
- `docs/charts/users/users-read-controller-flow.md`
- `docs/charts/users/users-update-controller-flow.md`
- `docs/charts/users/users-delete-controller-flow.md`

Controller-specific guidance:
- `search`: show the GET validator, repository search, and successful `200 OK` response, but do not add a separate controller self-call for `pick(...)`, `toJSON()`, or response mapping. Keep method labels concise and untyped: prefer `search(query)` and `validate(query)`. Do not write TypeScript type annotations or interface names such as `UserSearchParamsInterface` in diagram arrows. Keep the privacy-sensitive field handling implicit instead of drawing decorator-level hashing steps. If useful for the internal flow, you may show the repository returning a paginated search result to the controller, but for the final client response show only `200 OK`; do not append `data`, `total`, `limit`, `page`, attribute lists, or any JSON-like payload to that response arrow.
- `searchPost`: keep it separate from GET because it uses a different validator and request body, and because the controller response omits `imageUrl`; reflect the same repository search and successful `200 OK` response, without a separate controller self-call for `pick(...)`, `toJSON()`, or response mapping. Keep method labels concise and untyped: prefer `searchPost(body)` or `search(body)` and `validate(body)`. Do not write TypeScript type annotations or interface names in diagram arrows. If useful for the internal flow, you may show the repository returning a paginated search result to the controller, but for the final client response show only `200 OK`; do not append `data`, `total`, `limit`, `page`, attribute lists, or any JSON-like payload to that response arrow.
- `create`: show validator, account lookup through `AccountRepository`, organization lookup through `account.$get("org")`, optional image-signature validation, primary-user detection via `UsersRepository.search(..., { onlyTotal: true })`, `UsersRepository.create`, custom field validation inside the repository create path, response status change to `201 Created`, and event publication. Keep create-path method labels concise and untyped: prefer `create(body)`, `read(accountId)`, `search(params, { onlyTotal: true })`, `validate("User", metadata, orgId)`, and `publish(new EventMutation(...))`. Do not write TypeScript object literals, inline type annotations, or interface names such as `query: {}` or `UserCreateBodyInterface` anywhere in the diagram arrows. For the final client response, show only `201 Created`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- `read`: keep it compact with the controller, repository, optional not-found branch, and final `200 OK` response; do not show a separate controller self-call for `pick(...)`, `toJSON()`, or response mapping. Keep method labels concise and untyped: prefer `get(userId)` and `read(userId)`. Do not write TypeScript type annotations such as `userId: number` in diagram arrows. For the final client response, show only `200 OK`; do not append the returned attribute list or any JSON-like payload to that response arrow, even though the controller returns public user attributes including `imageUrl`.
- `update`: show validator, initial user existence lookup through `UsersRepository.read`, optional image-signature validation, optional primary-user reassignment search when `isPrimary === true`, optional primary-user guard when `isPrimary === false`, repository update, custom field validation inside the repository update path, save, event publication, and final `200 OK` response. Keep update-path method labels concise and untyped: prefer `update(userId, body)`, `validate(userId, body)`, `read(userId)`, `search(params)`, `update(userId, params)`, `validate("User", metadata, orgId)`, and `publish(new EventMutation(...))`. Do not write TypeScript object literals, inline type annotations, or interface names such as `userId: number`, `query: {}`, or `UserUpdateBodyInterface` anywhere in the diagram arrows. For the final client response, show only `200 OK`; do not append the returned attribute list or any JSON-like payload to that response arrow, even though the controller returns public user attributes including `imageUrl`.
- `delete`: show validator, read-before-delete through `UsersRepository.read`, `UsersRepository.delete`, event publication, and final status change to `204 No Content`. Keep delete-path event labels concise: prefer `publish(new EventMutation(...))` over expanded payload details.
- For all success responses that return a user, reflect only the public attributes confirmed by code: `id`, `orgId`, `region`, `accountId`, `createdAt`, `updatedAt`, `firstName`, `lastName`, `birthday`, `gender`, `isPrimary`, `status`, `metadata`, `arn`; include `imageUrl` only on methods where the controller explicitly returns it.

Negative scenarios to split into separate diagrams only if confirmed by code:
- `422 Validation Error`
- `404 Not Found`
- account-not-found failure on `create`
- invalid-image validation failure
- custom-field validation failure
- primary-user validation failure on `update`

Do not add undocumented failures or status codes. If a failure is not explicitly mapped in code, omit it rather than infer it.
