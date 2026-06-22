$controller-flow-generator Generate Mermaid sequence diagrams for the **accounts controller** in this project.

Response Style:
- Headings only in the format '## <N>) <Short Step Name>'.
- At the end, be sure to add 'Sources:' and 'Assumptions:'.

Features for this particular controller:
- Show the search flow separately for GET and POST search only if their behavior differs in code.
- Show the create flow including account creation and the explicit post-create event publication.
- Show read, update, and soft-delete as separate substeps.
- Cover branches: validation failure, account not found, repository or service failure, event publication failure, success.
- Reflect that the create flow also creates the primary email, user, and credentials only if this is explicitly confirmed by the called service code.
- Show which public attributes are returned and when the HTTP status changes to 201 or 204.
