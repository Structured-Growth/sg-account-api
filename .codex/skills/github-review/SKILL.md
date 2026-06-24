---
name: github-review
description: Perform strict GitHub pull request code review with findings-first output, severity ordering, concrete file/line references, risk focus, and explicit test gaps. Trigger on requests about review, code review, PR review, pull request review, or GitHub review.
---

# GitHub Review

Use this skill when the user asks to review code, review a PR, review a pull request, or perform GitHub review.

## Rules
1. Focus on bugs, regressions, security risks, incorrect assumptions, and missing tests.
2. Do not summarize first. Start with findings.
3. Order findings by severity: critical, high, medium, low.
4. Each finding must include:
   - severity
   - impacted file path
   - exact line or nearest line anchor
   - why it is a problem
   - concrete fix recommendation
5. If there are no issues, state that explicitly and include residual risks or test gaps.
6. Do not invent behavior not present in code or diff.
7. Keep comments concise, technical, and actionable.
8. Separate blocking issues from non-blocking suggestions.
9. Verify whether tests cover changed behavior; if not, call out missing coverage.

## Output format
1. `Findings:` list ordered by severity.
2. `Open Questions / Assumptions:` only if needed.
3. `Change Summary:` brief, secondary context.
4. `Test Gaps:` explicit list or `none`.
