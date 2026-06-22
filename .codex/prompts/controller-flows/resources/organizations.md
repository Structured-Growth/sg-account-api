$controller-flow-generator Generate Mermaid sequence diagrams for the `OrganizationsController` in this project.

Output requirements:
- Generate one markdown file per controller method in `docs/charts`.
- Use Mermaid `sequenceDiagram` blocks only.
- Each file must contain: brief overview, `## Method`, one `## Success` diagram, then separate negative-scenario diagrams.
- Do not use `alt` or `else` blocks.
- Use exact participant names from code where visible: `OrganizationsController`, method validator, `OrganizationService`, `OrganizationRepository`, `Organization`, `CustomFieldService`, `EventBus`.
- Use method signatures on arrows for readability.
- Use standard HTTP labels only when confirmed by code: `200 OK`, `201 Created`, `404 Not Found`, `422 Validation Error`.
- The diagrams should be valid for Mermaid and suitable for a self-hosted Mermaid setup on AWS.

Method files to generate:
- `docs/charts/organizations-search-controller-flow.md`
- `docs/charts/organizations-search-post-controller-flow.md`
- `docs/charts/organizations-create-controller-flow.md`
- `docs/charts/organizations-read-controller-flow.md`
- `docs/charts/organizations-get-parents-controller-flow.md`
- `docs/charts/organizations-update-controller-flow.md`
- `docs/charts/organizations-delete-controller-flow.md`

Controller-specific guidance:
- `search`: show GET search separately from POST search; reflect `signUpEnabled` normalization only in `search`.
- `searchPost`: show the direct repository search flow without GET normalization logic.
- `create`: show parent organization lookup only when `parentOrgId` is provided; include duplicate name validation, image signature validation, custom field validation, repository create, and event publication.
- `read`: keep it compact with four technical columns after the client where possible: controller, validator, repository, model.
- `getParents`: show the parent chain lookup loop only as confirmed by `getParentOrganizations`.
- `update`: show target organization lookup, optional duplicate name check, optional image validation, repository update with `customFieldsOrgId`, custom field validation, save, and event publication.
- `delete`: show read-before-delete, delete, and event publication.

Negative scenarios to split into separate diagrams only if confirmed by code:
- `422 Validation Error`
- `404 Not Found`
- duplicate-name validation failure
- invalid-image validation failure
- custom-field validation failure

Do not add undocumented failures or status codes. If a failure is not explicitly mapped in code, omit it rather than infer it.
