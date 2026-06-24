$controller-flow-generator Generate Mermaid sequence diagrams for the `EmailsController` in this project.

Output requirements:
- Generate one markdown file per controller method in `docs/charts/emails`.
- Use Mermaid `sequenceDiagram` blocks only.
- Each file must contain: brief overview, `## Method`, one `## Success` diagram, then separate negative-scenario diagrams.
- Do not use `alt` or `else` blocks.
- For optional happy-path steps, use Mermaid `opt` blocks with the condition label.
- Use exact participant names from code where visible: `EmailsController`, method validator, `EmailsService`, `EmailsRepository`, `AccountRepository`, `UsersRepository`, `CustomFieldService`, `Mailer`, `Email`, `EventBus`.
- Use method signatures on arrows for readability.
- Use standard HTTP labels only when confirmed by code: `200 OK`, `201 Created`, `204 No Content`, `404 Not Found`, `422 Validation Error`.
- The diagrams should be valid for Mermaid and suitable for a self-hosted Mermaid setup on AWS.

Method files to generate:
- `docs/charts/emails/emails-search-controller-flow.md`
- `docs/charts/emails/emails-search-post-controller-flow.md`
- `docs/charts/emails/emails-create-controller-flow.md`
- `docs/charts/emails/emails-read-controller-flow.md`
- `docs/charts/emails/emails-update-controller-flow.md`
- `docs/charts/emails/emails-send-code-controller-flow.md`
- `docs/charts/emails/emails-verify-controller-flow.md`
- `docs/charts/emails/emails-delete-controller-flow.md`

Controller-specific guidance:
- `search`: show the GET validator, repository search, and successful `200 OK` response, but do not add a separate controller self-call for `pick(...)`, `toJSON()`, `map(...)`, or response mapping. Keep method labels concise and untyped: prefer `search(query)` and `validate(query)`. Do not write TypeScript type annotations or interface names such as `EmailSearchParamsInterface` in diagram arrows. If useful for the internal flow, you may show the repository returning a paginated search result to the controller, but for the final client response show only `200 OK`; do not append `data`, `total`, `limit`, `page`, attribute lists, or any JSON-like payload to that response arrow.
- `searchPost`: keep it separate from GET because it uses a different validator and request body, but reflect the same repository search and successful `200 OK` response without a separate controller self-call for `pick(...)`, `toJSON()`, `map(...)`, or response mapping. Keep method labels concise and untyped: prefer `searchPost(body)` or `search(body)` and `validate(body)`. Do not write TypeScript type annotations or interface names in diagram arrows. If useful for the internal flow, you may show the repository returning a paginated search result to the controller, but for the final client response show only `200 OK`; do not append `data`, `total`, `limit`, `page`, attribute lists, or any JSON-like payload to that response arrow.
- `create`: show validator, parallel account and user lookup through `AccountRepository.read` and `UsersRepository.read`, duplicate email check through `EmailsRepository.search`, primary-email detection, verification code generation, `EmailsRepository.create`, custom field validation inside the repository create path, optional verification email sending when `sendVerificationCode` is true, response status change to `201 Created`, and event publication. Keep create-path method labels concise and untyped: prefer `create(body)`, `read(accountId)`, `read(userId)`, `search(params)`, `create(params)`, `validate("Email", metadata, orgId)`, `sendVerificationEmail(emailId, code)`, and `publish(new EventMutation(...))`. Do not write TypeScript object literals, inline type annotations, or expanded payload details in diagram arrows. For the final client response, show only `201 Created`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- `read`: keep it compact with the controller, validator, repository, optional not-found branch, and final `200 OK` response; do not show a separate controller self-call for `pick(...)`, `toJSON()`, or response mapping. Keep method labels concise and untyped: prefer `get(emailId)` and `read(emailId)`. Do not write TypeScript type annotations such as `emailId: number` in diagram arrows. For the final client response, show only `200 OK`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- `update`: show validator, initial email existence lookup through `EmailsRepository.read`, optional primary-email reassignment search when `isPrimary === true`, optional one-primary-email guard when `isPrimary === false`, repository update, custom field validation inside the repository update path, save, event publication, and final `200 OK` response. Keep update-path method labels concise and untyped: prefer `update(emailId, body)`, `validate(emailId, body)`, `read(emailId)`, `search(params)`, `update(emailId, params)`, `validate("Email", metadata, orgId)`, and `publish(new EventMutation(...))`. Do not write TypeScript object literals, inline type annotations, or interface names such as `EmailUpdateBodyInterface` anywhere in the diagram arrows. For the final client response, show only `200 OK`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- `sendCode`: keep it separate from `verify`. Show validator, email lookup through `EmailsRepository.read`, optional verification code generation and `EmailsRepository.update` only when a code is not already passed in from the create flow, mail delivery through `Mailer.send`, and final status change to `204 No Content`. Keep method labels concise and untyped: prefer `sendCode(emailId)`, `sendVerificationEmail(emailId)`, `read(emailId)`, `update(emailId, params)`, and `send(message)`. Do not show hashing internals such as `bcrypt`, salts, or decorator-level masking unless they materially affect the business flow.
- `verify`: show validator, email lookup through `EmailsRepository.read`, verification code comparison and expiration check inside `EmailsService.verifyEmail`, repository update to clear verification fields and activate the email, event publication, and final `200 OK` response. Keep verify-path method labels concise and untyped: prefer `verify(emailId, body)`, `verifyEmail(emailId, verificationCode)`, `read(emailId)`, `update(emailId, params)`, and `publish(new EventMutation(...))`. Do not draw `compareSync(...)` or other low-level crypto calls as separate technical participants unless needed to explain the failure branch. For the final client response, show only `200 OK`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- `delete`: show validator, read-before-delete through `EmailsRepository.read`, `EmailsRepository.delete`, event publication, and final status change to `204 No Content`. Keep delete-path event labels concise: prefer `publish(new EventMutation(...))` over expanded payload details.
- Wherever `EmailsRepository` touches persistence, include `Email` as a separate participant and show the concrete model call, for example `findByPk(...)`, `findAndCountAll(...)`, `count(...)`, `create(...)`, `setAttributes(...)`, `save()`, or `destroy(...)`, matching the code path actually used.
- For all success responses that return an email, reflect only the public attributes confirmed by code: `id`, `orgId`, `accountId`, `userId`, `createdAt`, `updatedAt`, `email`, `isPrimary`, `status`, `arn`, `metadata`.

Negative scenarios to split into separate diagrams only if confirmed by code:
- `422 Validation Error`
- `404 Not Found`
- account-not-found failure on `create`
- user-not-found failure on `create`
- duplicate-email validation failure on `create`
- custom-field validation failure
- one-primary-email validation failure on `update`
- invalid-or-expired verification code failure on `verify`

Do not add undocumented failures or status codes. If a failure is not explicitly mapped in code, omit it rather than infer it.
