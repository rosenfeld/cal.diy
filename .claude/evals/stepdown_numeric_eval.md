---
name: stepdown_numeric_eval
type: evaluation_criteria
paths:
  - "**/*.js"
  - "**/*.ts"
---

# Eval: Stepdown Rule Metric

Evaluate the file architecture following the Stepdown Rule: code should read like a newspaper — high-level concepts at the top, low-level details at the bottom. Each function should be followed by functions at the next level of abstraction.

## Scoring Rubric (Starts at 100 points)

Evaluate each modified file. Deduct points for the following violations:

- **[-30 pts per occurrence]:** Mixed Abstraction — a single function mixes high-level business logic with low-level implementation details (e.g., orchestration logic that also contains raw DB queries, inline string parsing, or UI loops).
- **[-20 pts per occurrence]:** Out of Order — a callee function is defined physically *above* the caller function. High-level functions must appear before the low-level functions they call.
- **[-15 pts per occurrence]:** Structural Leakage — infrastructure concerns, helper utilities, or configuration constants are positioned in the top 30% of the file, before the main entry points or high-level functions.

## Output Format

Return ONLY a strict JSON object — no prose, no markdown fences:

{
  "score": <number 0-100>,
  "deductions": [
    {"points_lost": <number>, "function": "<function or section name>", "reason": "<short explanation>"}
  ]
}

If the score is below 70, the implementation must be revised before proceeding to review.
