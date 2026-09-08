---
name: rpi-plan
description: Phase 2 of the RPI workflow — turns research findings into an ordered, reviewable implementation plan at `.claude/plans/<slug>/plan.md` using the Plan subagent, then stops for human approval. Use when asked to plan a change, design an approach before coding, or continue the RPI flow after research. Produces no code changes.
---

# Plan (RPI phase 2)

Second phase of **Research → Plan → Implement**. Turns *"what exists"* into *"what we will change, in what order"*.

**This phase writes no code.** Its only output is a plan document plus an approval gate.

Previous phase: `rpi-research`. Next phase: `rpi-implement`.

---

## Step 1 — Load the research

Resolve the `<slug>` from the skill argument, or from the task description the user gave.

Read `.claude/plans/<slug>/research.md`.

If it does not exist, **do not improvise a plan from a cold read of the repo** — run the `rpi-research` skill first, then come back. Planning without research is how the wrong files get edited.

If the research has unanswered **Open questions** that would change the shape of the solution, ask the user now. Questions that only affect details can be carried into the plan as stated assumptions.

---

## Step 2 — Delegate to the Plan subagent

Launch one **`Plan`** subagent. Pass it, verbatim:

- The task statement
- The full contents of `research.md`
- The relevant constraints from `CLAUDE.md`
- The PR size limits from `CONTRIBUTING.md` (under 500 lines changed, under 10 code files)

Ask it for:

1. Two or three viable approaches, with the trade-off that separates them
2. A recommendation, with the reason
3. An ordered list of steps for the recommended approach — each step naming the exact files it touches
4. The test strategy: which cases, at which level, in which files
5. What could break — existing behavior at risk, and how the plan protects it

If the Plan agent's recommendation contradicts `CLAUDE.md` or the research, say so rather than passing it through.

---

## Step 3 — Write the plan document

Write `.claude/plans/<slug>/plan.md`:

```markdown
# Plan — <task title>

**Status:** AWAITING APPROVAL
**Research:** ./research.md

## Approach
<the chosen approach in a paragraph, and why it beat the alternatives>

## Alternatives considered
| Approach | Why not |
|---|---|

## Steps
1. **<step>** — `path/to/file.ts`
   <what changes and why>
2. ...

## Tests
| Case | Level | File |
|---|---|---|

Runner command: <exact command, scoped>

## Risks
<what could break, and what the plan does about it>

## Assumptions
<anything decided without confirmation, so the reviewer can veto it>

## Size estimate
<approximate lines and code files touched; flag if over the CONTRIBUTING limits>
```

Rules:

- Steps must be ordered so the tree builds and tests pass between them where practical.
- If the estimate breaks the CONTRIBUTING limits, propose the split into multiple PRs **in the plan** — do not leave it for the implementer to discover.
- No step may say "refactor as needed" or "update related files". Name the files.

---

## Step 4 — Approval gate — stop here

Present to the user:
- The path to `plan.md`
- The approach in two or three sentences
- The step list
- Every assumption and risk

Then **stop and wait for explicit approval.** Do not begin implementing, do not create a branch, do not edit a file.

On approval, change the document's `**Status:**` line to `APPROVED` and tell the user to continue with the `rpi-implement` skill.

If the user asks for changes, revise `plan.md` and present it again. The status line stays `AWAITING APPROVAL` until they say yes.
