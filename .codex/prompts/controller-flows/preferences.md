$controller-flow-generator Generate Mermaid sequence diagrams for the `PreferencesController` in this project.

Output requirements:
- Generate one markdown file per controller method in `docs/charts/preferences`.
- Use Mermaid `sequenceDiagram` blocks only.
- Each file must contain: brief overview, `## Method`, one `## Success` diagram, then separate negative-scenario diagrams.
- Do not use `alt` or `else` blocks.
- For optional happy-path steps, use Mermaid `opt` blocks with the condition label.
- Use exact participant names from code where visible: `PreferencesController`, method validator, `PreferencesService`, `PreferencesRepository`, `AccountRepository`, `CustomFieldService`, `Preferences`, `EventBus`.
- Use method signatures on arrows for readability.
- Use standard HTTP labels only when confirmed by code: `200 OK`, `404 Not Found`, `422 Validation Error`.
- The diagrams should be valid for Mermaid and suitable for a self-hosted Mermaid setup on AWS.

Method files to generate:
- `docs/charts/preferences/preferences-read-controller-flow.md`
- `docs/charts/preferences/preferences-update-controller-flow.md`

Controller-specific guidance:
- `read`: show the validator, account lookup through `AccountRepository.read`, preferences lookup through `PreferencesRepository.search`, optional create-on-read path through `PreferencesRepository.create` only when no preferences record exists yet, and final `200 OK` response. Keep method labels concise and untyped: prefer `read(accountId)`, `validate(accountId)`, `search(params)`, and `create(params)`. Do not write TypeScript type annotations, object literals, or interface names in diagram arrows. Reflect the code exactly: `PreferencesService.read` first verifies the account exists, then searches by `accountId`, then either returns the first existing record or creates a new record with default preferences and empty metadata. For the final client response, show only `200 OK`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- `update`: show the validator, the internal `read(accountId)` call reuse through `PreferencesService.read`, optional preferences merge only when `params.preferences` is present, optional custom field validation through `CustomFieldService.validate` only when `params.metadata` is present, model mutation through `Preferences.set(...)`, save through `Preferences.save()`, event publication, and final `200 OK` response. Keep update-path method labels concise and untyped: prefer `update(accountId, body)`, `validate(accountId, body)`, `read(accountId)`, `validate("Preferences", metadata, orgId)`, `set("preferences", mergedPreferences)`, `set("metadata", mergedMetadata)`, `save()`, and `publish(new EventMutation(...))`. Do not write TypeScript type annotations, inline object literals, or expanded event payload details in diagram arrows. Reflect the code exactly: update reuses the read flow, merges nested `preferences` and `metadata` into the existing record instead of replacing the whole object, validates custom fields only for `metadata`, and publishes the event after the save succeeds. For the final client response, show only `200 OK`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- Wherever `PreferencesRepository` touches persistence, include `Preferences` as a separate participant and show the concrete model call, matching the code path actually used, for example `count(...)`, `findAndCountAll(...)`, `create(...)`, or `findByPk(...)`.
- For all success responses that return preferences, reflect only the public attributes confirmed by code: `id`, `orgId`, `createdAt`, `updatedAt`, `arn`, `preferences`, `metadata`.

Negative scenarios to split into separate diagrams only if confirmed by code:
- `422 Validation Error`
- `404 Not Found`
- account-not-found failure on `read`
- account-not-found failure on `update`
- custom-field validation failure on `update`

Do not add undocumented failures or status codes. If a failure is not explicitly mapped in code, omit it rather than infer it.
