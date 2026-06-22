$controller-flow-generator Generate Mermaid sequence diagrams for the **resolver controller** in this project.

Response Style:
- Headings only in the format '## <N>) <Short Step Name>'.
- At the end, be sure to add 'Sources:' and 'Assumptions:'.

Features for this particular controller:
- Show resource resolution, action listing, model listing, and custom field validation as separate substeps.
- For resource resolution, show the lookup of the model class by resource name and the model query by filter.
- For action listing, show how controller metadata and route mappings are traversed to build the response.
- For custom field validation, show the handoff to the custom field service.
- Cover branches: resource type not found, model instance not found, validation failure, metadata missing or partially missing, downstream validation failure, success.
- Make the diagrams describe the observable behavior of metadata-driven introspection without leaking framework internals unless they are required to explain the flow.
