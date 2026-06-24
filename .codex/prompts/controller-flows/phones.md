$controller-flow-generator Generate Mermaid sequence diagrams for the `PhonesController` in this project.

Output requirements:
- Generate one markdown file per controller method in `docs/charts/phones`.
- Use Mermaid `sequenceDiagram` blocks only.
- Each file must contain: brief overview, `## Method`, one `## Success` diagram, then separate negative-scenario diagrams.
- Do not use `alt` or `else` blocks.
- For optional happy-path steps, use Mermaid `opt` blocks with the condition label.
- Use exact participant names from code where visible: `PhonesController`, method validator, `PhonesService`, `PhonesRepository`, `AccountRepository`, `UsersRepository`, `CustomFieldService`, `SmsService`, `Phone`, `EventBus`.
- Use method signatures on arrows for readability.
- Use standard HTTP labels only when confirmed by code: `200 OK`, `201 Created`, `204 No Content`, `404 Not Found`, `422 Validation Error`.
- The diagrams should be valid for Mermaid and suitable for a self-hosted Mermaid setup on AWS.

Method files to generate:
- `docs/charts/phones/phones-search-controller-flow.md`
- `docs/charts/phones/phones-search-post-controller-flow.md`
- `docs/charts/phones/phones-create-controller-flow.md`
- `docs/charts/phones/phones-read-controller-flow.md`
- `docs/charts/phones/phones-update-controller-flow.md`
- `docs/charts/phones/phones-send-code-controller-flow.md`
- `docs/charts/phones/phones-verify-controller-flow.md`
- `docs/charts/phones/phones-delete-controller-flow.md`

Controller-specific guidance:
- `search`: show the GET validator, repository search, and successful `200 OK` response, but do not add a separate controller self-call for `pick(...)`, `toJSON()`, `map(...)`, or response mapping. Keep method labels concise and untyped: prefer `search(query)` and `validate(query)`. Do not write TypeScript type annotations or interface names such as `PhoneSearchParamsInterface` in diagram arrows. If useful for the internal flow, you may show the repository returning a paginated search result to the controller, but for the final client response show only `200 OK`; do not append `data`, `total`, `limit`, `page`, attribute lists, or any JSON-like payload to that response arrow.
- `searchPost`: keep it separate from GET because it uses a different validator and request body, but reflect the same repository search and successful `200 OK` response without a separate controller self-call for `pick(...)`, `toJSON()`, `map(...)`, or response mapping. Keep method labels concise and untyped: prefer `searchPost(body)` or `search(body)` and `validate(body)`. Do not write TypeScript type annotations or interface names in diagram arrows. If useful for the internal flow, you may show the repository returning a paginated search result to the controller, but for the final client response show only `200 OK`; do not append `data`, `total`, `limit`, `page`, attribute lists, or any JSON-like payload to that response arrow.
- `create`: show validator, parallel account and user lookup through `AccountRepository.read` and `UsersRepository.read`, duplicate phone check through `PhonesRepository.search`, primary-phone detection, verification code generation, `PhonesRepository.create`, custom field validation inside the repository create path, optional SMS sending when `sendVerificationCode` is true, response status change to `201 Created`, and event publication. Keep create-path method labels concise and untyped: prefer `create(body)`, `read(accountId)`, `read(userId)`, `search(params)`, `create(params)`, `validate("Phone", metadata, orgId)`, `sendVerificationCode(phoneId, code)`, and `publish(new EventMutation(...))`. Do not write TypeScript object literals, inline type annotations, or expanded payload details in diagram arrows. Reflect the code exactly: unlike `EmailsService.create`, `PhonesService.create` does not guard `!account` or `!user` before dereferencing `account.orgId`, `account.region`, and `user.id`; include separate negative diagrams for the resulting runtime-failure branches when account lookup returns `null` and when user lookup returns `null`. For the final client response, show only `201 Created`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- `read`: keep it compact with the controller, validator, repository, optional not-found branch, and final `200 OK` response; do not show a separate controller self-call for `pick(...)`, `toJSON()`, or response mapping. Keep method labels concise and untyped: prefer `get(phoneId)` and `read(phoneId)`. Do not write TypeScript type annotations such as `phoneId: number` in diagram arrows. Reflect the code exactly: after `PhonesRepository.read(phoneId)`, the controller checks `if (!phone)` and throws `NotFoundError` when the record is missing. For the final client response, show only `200 OK`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- `update`: show validator, initial phone existence lookup through `PhonesRepository.read`, optional primary-phone reassignment search when `isPrimary === true`, optional one-primary-phone guard when `isPrimary === false`, repository update, custom field validation inside the repository update path, save, event publication, and final `200 OK` response. Keep update-path method labels concise and untyped: prefer `update(phoneId, body)`, `validate(phoneId, body)`, `read(phoneId)`, `search(params)`, `update(phoneId, params)`, `validate("Phone", metadata, orgId)`, and `publish(new EventMutation(...))`. Do not write TypeScript object literals, inline type annotations, or interface names such as `PhoneUpdateBodyInterface` anywhere in the diagram arrows. For the final client response, show only `200 OK`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- `sendCode`: keep it separate from `verify`. Show validator, phone lookup through `PhonesRepository.read`, optional verification code generation and `PhonesRepository.update` only when a code is not already passed in from the create flow, SMS delivery through `SmsService.send`, and final status change to `204 No Content`. Keep method labels concise and untyped: prefer `sendCode(phoneId)`, `sendVerificationCode(phoneId)`, `read(phoneId)`, `update(phoneId, params)`, and `send(phoneNumber, message)`. Do not show hashing internals such as `bcrypt`, salts, or decorator-level masking unless they materially affect the business flow.
- `verify`: show validator, phone lookup through `PhonesRepository.read`, verification code comparison and expiration check inside `PhonesService.verifyPhone`, repository update to clear verification fields and activate the phone, event publication, and final `200 OK` response. Keep verify-path method labels concise and untyped: prefer `verify(phoneId, body)`, `verifyPhone(phoneId, verificationCode)`, `read(phoneId)`, `update(phoneId, params)`, and `publish(new EventMutation(...))`. Do not draw `compareSync(...)` or other low-level crypto calls as separate technical participants unless needed to explain the failure branch. For the final client response, show only `200 OK`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- `delete`: show validator, read-before-delete through `PhonesRepository.read`, `PhonesRepository.delete`, event publication, and final status change to `204 No Content`. Keep delete-path event labels concise: prefer `publish(new EventMutation(...))` over expanded payload details. Reflect the code exactly: the controller checks `if (!phoneId)` after the read, not `if (!phone)`, so do not invent a controller-level not-found branch that is not present in the method body.
- Wherever `PhonesRepository` touches persistence, include `Phone` as a separate participant and show the concrete model call, for example `findByPk(...)`, `findAndCountAll(...)`, `count(...)`, `create(...)`, `setAttributes(...)`, `save()`, or `destroy(...)`, matching the code path actually used.
- For all success responses that return a phone, reflect only the public attributes confirmed by code: `id`, `orgId`, `accountId`, `userId`, `createdAt`, `updatedAt`, `phoneNumber`, `isPrimary`, `status`, `arn`, `metadata`.

Negative scenarios to split into separate diagrams only if confirmed by code:
- `422 Validation Error`
- `404 Not Found`
- `500 Internal Server Error` for missing account runtime failure on `create`
- `500 Internal Server Error` for missing user runtime failure on `create`
- account-not-found failure on `create`
- user-not-found failure on `create`
- duplicate-phone validation failure on `create`
- custom-field validation failure
- one-primary-phone validation failure on `update`
- invalid-or-expired verification code failure on `verify`

Do not add undocumented failures or status codes. If a failure is not explicitly mapped in code, omit it rather than infer it.
