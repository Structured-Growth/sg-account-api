$controller-flow-generator Generate Mermaid sequence diagrams for the **emails controller** in this project.

Response Style:
- Headings only in the format '## <N>) <Short Step Name>'.
- At the end, be sure to add 'Sources:' and 'Assumptions:'.

Features for this particular controller:
- Split the controller into CRUD flow and verification flow.
- Show search, create, read, update, verify, send-code, and delete as separate substeps.
- For verification, show sending the verification code and confirming the code in separate diagrams.
- Cover branches: validation failure, email not found, invalid or expired verification code if present in code, duplicate or conflict if present, event publication failure, success.
- Reflect hashed or masked sensitive fields only as privacy-relevant business handling, not as framework detail.
- Show status changes and returned public attributes only if they are explicit in service or repository code.
