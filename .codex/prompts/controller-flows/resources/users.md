$controller-flow-generator Generate Mermaid sequence diagrams for the **users controller** in this project.

Response Style:
- Headings only in the format '## <N>) <Short Step Name>'.
- At the end, be sure to add 'Sources:' and 'Assumptions:'.

Features for this particular controller:
- Show search, create, read, update, and delete as separate substeps.
- Show GET and POST search separately only if their observable behavior differs.
- Reflect privacy-sensitive handling for personal fields only as business-level data protection, not decorator detail.
- Cover branches: validation failure, user not found, account linkage failure if present, repository or service failure, event publication failure, success.
- Show image URL handling only if it is explicit in the repository or model output path.
