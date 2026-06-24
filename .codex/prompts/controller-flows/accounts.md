$controller-flow-generator Generate Mermaid sequence diagrams for the `AccountsController` in this project.

Output requirements:
- Generate one markdown file per controller method in `docs/charts/accounts`.
- Use Mermaid `sequenceDiagram` blocks only.
- Each file must contain: brief overview, `## Method`, one `## Success` diagram, then separate negative-scenario diagrams.
- Do not use `alt` or `else` blocks.
- For optional happy-path steps, use Mermaid `opt` blocks with the condition label.
- Use exact participant names from code where visible: `AccountsController`, method validator, `AccountsService`, `AccountRepository`, `OrganizationRepository`, `Account`, `CustomFieldService`, `EventBus`.
- Use method signatures on arrows for readability.
- Use standard HTTP labels only when confirmed by code: `200 OK`, `201 Created`, `204 No Content`, `404 Not Found`, `422 Validation Error`.
- The diagrams should be valid for Mermaid and suitable for a self-hosted Mermaid setup on AWS.

Method files to generate:
- `docs/charts/accounts/accounts-search-controller-flow.md`
- `docs/charts/accounts/accounts-search-post-controller-flow.md`
- `docs/charts/accounts/accounts-create-controller-flow.md`
- `docs/charts/accounts/accounts-read-controller-flow.md`
- `docs/charts/accounts/accounts-update-controller-flow.md`
- `docs/charts/accounts/accounts-delete-controller-flow.md`

Controller-specific guidance:
- `search`: show the GET repository search flow and the successful `200 OK` response with public account attributes, but do not add a separate controller self-call for `toJSON()` or response mapping.
- `searchPost`: keep it separate from GET only because it uses a different validator and request body, but reflect the same repository search and successful `200 OK` response with public account attributes, without a separate controller self-call for `toJSON()` or response mapping.
- `create`: show validator, organization lookup through `OrganizationRepository`, `AccountRepository.create`, custom field validation inside the repository create path, response status change to `201 Created`, and event publication. Reflect the created resource only through the final `201 Created` response, without a separate controller self-call for `toJSON()` or response mapping. Keep create-path method labels concise: prefer `create(params)` over expanded field lists, `validate("Account", metadata, orgId)` over `validate("Account", params.metadata, params.orgId)`, and `publish(new EventMutation(...))` over expanded payload details. Do not show primary email, user, or credentials creation unless explicitly confirmed by the called service code.
- `read`: keep it compact with the controller, validator, repository, and final `200 OK` response; do not show a separate controller self-call for `toJSON()` or response mapping.
- `update`: show target account lookup, attribute mutation, custom field validation, save, event publication, and final `200 OK` response with public account attributes, but do not show a separate controller self-call for `toJSON()` or response mapping. Keep update-path method labels concise: prefer `findByPk(accountId)` over expanded repository read options, `validate("Account", metadata, orgId)` over `validate("Account", account.toJSON().metadata, account.orgId)`, and `publish(new EventMutation(...))` over expanded payload details.
- `delete`: show read-before-delete, `AccountRepository.delete`, event publication, and final status change to `204 No Content`. Keep delete-path event labels concise: prefer `publish(new EventMutation(...))` over expanded payload details.
- For all success responses that return an account, reflect only the public attributes confirmed by code: `id`, `orgId`, `region`, `createdAt`, `updatedAt`, `status`, `arn`, `metadata`, and keep them implicit in the final HTTP response instead of drawing a separate internal mapping step.

Negative scenarios to split into separate diagrams only if confirmed by code:
- `422 Validation Error`
- `404 Not Found`
- custom-field validation failure

Do not add undocumented failures or status codes. If a failure is not explicitly mapped in code, omit it rather than infer it.
