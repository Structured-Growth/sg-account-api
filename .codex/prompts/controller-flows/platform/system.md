$controller-flow-generator Generate Mermaid sequence diagrams for the **system controller** in this project.

Response Style:
- Headings only in the format '## <N>) <Short Step Name>'.
- At the end, be sure to add 'Sources:' and 'Assumptions:'.

Features for this particular controller:
- Split the controller into migration flow and i18n upload flow.
- For migration, show configuration loading, schema creation, migration discovery, and applying pending migrations as separate stages if the code warrants it.
- For i18n upload, show translation payload assembly and the outbound upload request separately.
- Cover branches: schema already exists, migration failure, external translation API failure, unexpected response status, success.
- Show hidden or internal-only behavior only if it is explicit in the controller code.
