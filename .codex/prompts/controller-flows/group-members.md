$controller-flow-generator Generate Mermaid sequence diagrams for the `GroupMembersController` in this project.

Output requirements:
- Generate one markdown file per controller method in `docs/charts/group-members`.
- Use Mermaid `sequenceDiagram` blocks only.
- Each file must contain: brief overview, `## Method`, one `## Success` diagram, then separate negative-scenario diagrams.
- Do not use `alt` or `else` blocks.
- For optional happy-path steps, use Mermaid `opt` blocks with the condition label.
- Use exact participant names from code where visible: `GroupMembersController`, method validator, `GroupMemberService`, `GroupMemberRepository`, `GroupsRepository`, `UsersRepository`, `CustomFieldService`, `GroupMember`, `Account`, `User`, `EventBus`.
- Use method signatures on arrows for readability.
- Use standard HTTP labels only when confirmed by code: `200 OK`, `201 Created`, `204 No Content`, `404 Not Found`, `422 Validation Error`.
- The diagrams should be valid for Mermaid and suitable for a self-hosted Mermaid setup on AWS.

Method files to generate:
- `docs/charts/group-members/group-members-search-controller-flow.md`
- `docs/charts/group-members/group-members-search-post-controller-flow.md`
- `docs/charts/group-members/group-members-create-controller-flow.md`
- `docs/charts/group-members/group-members-read-controller-flow.md`
- `docs/charts/group-members/group-members-update-controller-flow.md`
- `docs/charts/group-members/group-members-delete-controller-flow.md`

Controller-specific guidance:
- `search`: show the GET validator, repository search, and successful `200 OK` response, but do not add a separate controller self-call for `pick(...)`, `toJSON()`, `map(...)`, or response mapping. Keep method labels concise and untyped: prefer `search(query)` and `validate(query)`. Do not write TypeScript type annotations or interface names such as `GroupMemberSearchParamsInterface` in diagram arrows. Reflect the repository logic exactly: `groupId` is enforced in the controller route context and passed into the repository search params; the repository always joins `Account` and `User` with active-status filters. Also reflect the repository's optional `onlyTotal` path in a compact way: when that option is enabled it uses `count(...)`, otherwise it uses `findAndCountAll(...)`. If useful for the internal flow, you may show the repository returning a paginated search result to the controller, but for the final client response show only `200 OK`; do not append `data`, `total`, `limit`, `page`, attribute lists, or any JSON-like payload to that response arrow.
- `searchPost`: keep it separate from GET because it uses a different validator and request body, but reflect the same repository search and successful `200 OK` response without a separate controller self-call for `pick(...)`, `toJSON()`, `map(...)`, or response mapping. Keep method labels concise and untyped: prefer `searchPost(body)` or `search(body)` and `validate(body)`. Do not write TypeScript type annotations or interface names in diagram arrows. Reflect the same repository behavior as GET: the controller injects `groupId` into search params, and the repository always joins active `Account` and `User` records while choosing `count(...)` only for the `onlyTotal` path and `findAndCountAll(...)` otherwise. If useful for the internal flow, you may show the repository returning a paginated search result to the controller, but for the final client response show only `200 OK`; do not append `data`, `total`, `limit`, `page`, attribute lists, or any JSON-like payload to that response arrow.
- `create`: show validator, group lookup through `GroupsRepository.read`, user lookup through `UsersRepository.read`, duplicate-membership detection through `GroupMemberRepository.search(..., { onlyTotal: true })`, `GroupMemberRepository.create`, custom field validation inside the repository create path, response status change to `201 Created`, and event publication. Keep create-path method labels concise and untyped: prefer `create(groupId, body)`, `read(groupId)`, `read(userId)`, `search(params, { onlyTotal: true })`, `create(params)`, `validate("GroupMember", metadata, orgId)`, and `publish(new EventMutation(...))`. Do not write TypeScript object literals, inline type annotations, or expanded payload details in diagram arrows. Reflect the code exactly: the service derives `orgId` and `region` from the resolved group, derives `accountId` from the resolved user, defaults `status` to `"inactive"` when omitted, and throws a validation error when the user is already in the group. For the final client response, show only `201 Created`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- `read`: keep it compact with the controller, repository calls, optional not-found branches, and final `200 OK` response; do not show a separate controller self-call for `pick(...)`, `toJSON()`, or response mapping. Keep method labels concise and untyped: prefer `get(groupMemberId)`, `read(groupId)`, and `read(groupMemberId)`. Do not write TypeScript type annotations such as `groupId: number` or `groupMemberId: number` in diagram arrows. Reflect the code exactly: the controller first verifies the parent group exists through `GroupsRepository.read(groupId)` and only then reads the group member through `GroupMemberRepository.read(groupMemberId)`. For the final client response, show only `200 OK`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- `update`: show validator, parent group existence lookup through `GroupsRepository.read`, initial group member lookup through `GroupMemberRepository.read`, repository update, custom field validation inside the repository update path, save, event publication, and final `200 OK` response. Keep update-path method labels concise and untyped: prefer `update(groupMemberId, body)`, `validate(groupId, groupMemberId, body)`, `read(groupId)`, `read(groupMemberId)`, `update(groupMemberId, params)`, `validate("GroupMember", metadata, orgId)`, and `publish(new EventMutation(...))`. Do not write TypeScript object literals, inline type annotations, or interface names such as `GroupMemberUpdateBodyInterface` anywhere in the diagram arrows. Reflect the code exactly: the controller checks the parent group before calling the service, the service performs its own `read(groupMemberId)` before updating, and the repository omits undefined fields before `setAttributes(...)` and `save()`. For the final client response, show only `200 OK`; do not append the returned attribute list or any JSON-like payload to that response arrow.
- `delete`: show parent group existence lookup through `GroupsRepository.read`, read-before-delete through `GroupMemberRepository.read`, `GroupMemberRepository.delete`, event publication, and final status change to `204 No Content`. Keep delete-path event labels concise: prefer `publish(new EventMutation(...))` over expanded payload details. Reflect the code exactly: the controller checks the parent group and target group member before calling the repository delete method.
- Wherever `GroupMemberRepository` touches persistence, include `GroupMember` as a separate participant and show the concrete model call, for example `findByPk(...)`, `findAndCountAll(...)`, `count(...)`, `create(...)`, `setAttributes(...)`, `save()`, or `destroy(...)`, matching the code path actually used. When the repository search joins account and user status filters, include `Account` and `User` as separate participants.
- For all success responses that return a group member, reflect only the public attributes confirmed by code: `id`, `groupId`, `accountId`, `userId`, `createdAt`, `updatedAt`, `status`, `arn`, `metadata`.

Negative scenarios to split into separate diagrams only if confirmed by code:
- `422 Validation Error`
- `404 Not Found`
- group-not-found failure on `create`
- user-not-found failure on `create`
- duplicate-membership validation failure on `create`
- group-not-found failure on `read`
- group-member-not-found failure on `read`
- group-not-found failure on `update`
- group-member-not-found failure on `update`
- custom-field validation failure
- group-not-found failure on `delete`
- group-member-not-found failure on `delete`

Do not add undocumented failures or status codes. If a failure is not explicitly mapped in code, omit it rather than infer it.
