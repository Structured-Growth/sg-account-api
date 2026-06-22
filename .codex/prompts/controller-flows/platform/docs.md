$controller-flow-generator Generate Mermaid sequence diagrams for the **docs controller** in this project.

Response Style:
- Headings only in the format '## <N>) <Short Step Name>'.
- At the end, be sure to add 'Sources:' and 'Assumptions:'.

Features for this particular controller:
- Show the OpenAPI document retrieval flow as a single focused diagram.
- Reflect how the runtime root directory is resolved before building the Swagger file path.
- Cover branches: swagger file not found, file read error, invalid JSON if it can happen from the code path, success.
- Show that the endpoint is public only if that fact is explicit in the controller code.
