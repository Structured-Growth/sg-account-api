---
name: controller-flow-generator
description: Generate technology-agnostic Mermaid sequence diagrams from API controller code, split into small sub-step diagrams per endpoint or business stage, with happy-path and key alternative branches.
---

# Controller Flow Generator

Use this skill when the user asks for Mermaid sequence diagrams of API controllers, endpoint flows, or backend request processing based on code.

## Rules
1. Analyze only code inside the current project scope unless the user says otherwise.
2. Start from the target controller, then read only the directly relevant service, repository, validator, route, and model files needed to explain the flow.
3. Do not invent behavior not present in code.
4. Generate one markdown file per controller method unless the user explicitly asks for a combined document.
5. Inside each method file, create:
   - a brief overview
   - a method heading with route and controller method signature
   - one Mermaid `sequenceDiagram` for the success flow
   - one separate Mermaid `sequenceDiagram` per negative scenario confirmed by code
6. Use exact class and service names from the codebase for participants whenever they are visible in code.
7. Use method signatures on arrows when they improve readability, for example `get(organizationId)`, `read(id)`, `findByPk(id)`.
8. Do not use `alt` or `else` blocks. Split success and each negative scenario into separate diagrams.
9. Use standard HTTP status labels where the code confirms them, such as `200 OK`, `201 Created`, `404 Not Found`, `422 Validation Error`.
10. Show side effects explicitly when they exist in code:
   - event publishing
   - status change
   - verification code sending
   - inherited data lookup
   - migration or external API call
11. Mermaid must be valid for mermaid.live and suitable for self-hosted Mermaid rendering.
12. Before creating a diagram for a controller flow, check whether a diagram for that method already exists.
13. If an existing controller flow diagram is found, update it instead of creating a duplicate.
14. Save every new or updated diagram file in `docs/charts`.

## Output format
1. One markdown file per controller method.
2. Inside each file use markdown sections in this order:
   - `# <Controller>.<method>`
   - `Brief overview`
   - `## Method`
   - `## Success`
   - `## <HTTP code> <Scenario name>` for each negative scenario
3. After the diagrams:
   - `Sources:` exact file list used
   - `Assumptions:` `none` or a short list only if truly needed
