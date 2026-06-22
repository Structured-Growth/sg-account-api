$controller-flow-generator Generate Mermaid sequence diagrams for the **custom fields controller** in this project.

Response Style:
- Headings only in the format '## <N>) <Short Step Name>'.
- At the end, be sure to add 'Sources:' and 'Assumptions:'.

Features for this particular controller:
- Show search, create, read, update, and delete as separate substeps.
- For search, reflect the inherited custom fields behavior and the `includeInherited` branch only if it is present in the service code.
- For create and update, show the custom field service interaction rather than only repository access.
- Cover branches: validation failure, organization or custom field not found, schema or entity validation failure, duplicate or conflict if present in code, event publication failure, success.
- Show the explicit event publication after create, update, and delete.
