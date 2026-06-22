$controller-flow-generator Generate Mermaid sequence diagrams for the **ping controller** in this project.

Response Style:
- Headings only in the format '## <N>) <Short Step Name>'.
- At the end, be sure to add 'Sources:' and 'Assumptions:'.

Features for this particular controller:
- Show the alive-check flow as a single focused diagram.
- Reflect the localized message construction only if it is explicit in the controller code.
- Cover branches: translation lookup failure only if a real failure path is visible in code, success.
- Show that the endpoint is public only if that fact is explicit in the controller code.
