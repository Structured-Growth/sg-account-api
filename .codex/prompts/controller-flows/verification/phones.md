$controller-flow-generator Generate Mermaid sequence diagrams for the **phones controller** in this project.

Response Style:
- Headings only in the format '## <N>) <Short Step Name>'.
- At the end, be sure to add 'Sources:' and 'Assumptions:'.

Features for this particular controller:
- Split the controller into CRUD flow and verification flow.
- Show search, create, read, update, send-code, verify, and delete as separate substeps.
- For verification, show sending the code and confirming the code in separate diagrams.
- Cover branches: validation failure, phone not found, invalid or expired verification code if present in code, duplicate or conflict if present, event publication failure, success.
- Reflect privacy-sensitive phone handling only at business level.
- If the code contains a mismatch between the read result check and the requested identifier, capture the actual runtime branch from code rather than the intended behavior.
