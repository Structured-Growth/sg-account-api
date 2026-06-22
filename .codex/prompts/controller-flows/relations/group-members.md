$controller-flow-generator Generate Mermaid sequence diagrams for the **group members controller** in this project.

Response Style:
- Headings only in the format '## <N>) <Short Step Name>'.
- At the end, be sure to add 'Sources:' and 'Assumptions:'.

Features for this particular controller:
- Show search, create, read, update, and delete as separate substeps.
- Reflect that the controller is nested under a parent group and validate the group context where the code does so.
- Show the add-user-to-group and remove-user-from-group flows as explicit membership lifecycle steps.
- Cover branches: validation failure, group not found, group member not found, user linkage failure, duplicate membership or conflict if present, event publication failure, success.
- Show when the controller checks the parent group before acting on a group member.
