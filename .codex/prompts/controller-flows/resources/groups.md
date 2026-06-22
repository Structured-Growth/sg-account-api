$controller-flow-generator Generate Mermaid sequence diagrams for the **groups controller** in this project.

Response Style:
- Headings only in the format '## <N>) <Short Step Name>'.
- At the end, be sure to add 'Sources:' and 'Assumptions:'.

Features for this particular controller:
- Show search, create, read, update, and delete as separate substeps.
- In search, reflect optional owner inclusion only if it is explicitly handled in repository code.
- Show how organization, account, and parent group identifiers participate in the create flow.
- Cover branches: validation failure, group not found, parent group or owner resolution failure if present, duplicate or conflict if present, event publication failure, success.
- Show the explicit event publication for create, update, and delete.
