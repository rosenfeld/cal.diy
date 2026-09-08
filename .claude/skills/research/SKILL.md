---
name: research
description: Phase 1 of the RPI workflow — maps the codebase for a task before any code is written, using read-only Explore subagents, and writes the findings to `.claude/plans/<slug>/research.md`. Use when asked to research a task, investigate how something works before changing it, or start the RPI flow. Produces no code changes.
---

# Research (RPI phase 1)

First phase of **Research → Plan → Implement**. Answers *"what already exists and where"* so the planning phase does not have to guess.

**This phase writes no code.** Its only output is a research document. If you find yourself editing a source file, you are in the wrong phase.

Next phase: `plan`.

---

## Step 1 — Fix the task and the slug

Take the task from the skill argument. If none was given, ask the user for it before doing anything else.

Derive a kebab-case `<slug>` from the task (e.g. "warn on slots outside business hours" → `slots-outside-business-hours`). Everything for this task lives in `.claude/plans/<slug>/`, which is gitignored — research and plan artifacts never end up in a PR.

If `.claude/plans/<slug>/research.md` already exists, read it and ask the user whether to extend it or start over.

If the task is a GitHub issue number, fetch it first — `gh issue view <n> --repo rosenfeld/cal.diy --json title,body,labels` — and use the issue body as the task statement. The GitHub MCP server may be unavailable; `gh` is authenticated.

**Check for an existing spec.** This repo has an opt-in spec workflow in `specs/` (see `SPEC-WORKFLOW.md`). If `specs/<something-related>/design.md` exists, read it and treat it as authoritative input — do not re-derive requirements the spec already settles.

---

## Step 2 — Fan out with Explore subagents

Split the question into independent dimensions and launch one **`Explore`** subagent per dimension, **all in a single message** so they run concurrently. Three to five is usually right; more than that and you are paying for overlap.

Typical dimensions for this monorepo:

| Dimension | What to ask for |
|---|---|
| Feature surface | Which `apps/web` routes, components and hooks render the behavior |
| Domain logic | Which `packages/*` modules own the rules (e.g. `packages/features`, `packages/lib`) |
| Data layer | Prisma schema, migrations, tRPC routers and handlers involved |
| Tests | Existing test files covering this area and the exact runner command |
| i18n | Whether the change needs keys in `packages/i18n/locales/*/common.json` |

Give each subagent a search breadth ("medium" or "very thorough") and demand **file paths, not directories**. Ask each one to also report the patterns to imitate — function signatures, existing data structures, naming conventions.

Do not ask an Explore agent to judge whether the change is a good idea. It locates code; it does not review it.

---

## Step 3 — Write the research document

Write `.claude/plans/<slug>/research.md`:

```markdown
# Research — <task title>

## Task
<the task statement, verbatim>

## Current behavior
<what the code does today, with file:line references>

## Relevant files
| File | Role | Why it matters |
|---|---|---|

## Patterns to follow
<existing signatures, data structures and conventions the implementation should imitate>

## Tests
- Existing coverage: <files>
- Runner command: <exact command, scoped to this area>

## Constraints
<anything from CLAUDE.md, specs/, or the code that limits the solution space>

## Open questions
<what could not be determined from the code alone>
```

Rules for the document:

- Every claim about the codebase carries a `path:line` reference. A claim you could not verify goes under **Open questions**, not into the body.
- Record what is *absent* too — "no existing helper for X" is a finding that shapes the plan.
- Do not propose a solution here. Options and trade-offs belong to the `plan` phase.
- Keep the domain decisions in `CLAUDE.md` in view (business hours, timezone handling, DST) — they are constraints, and contradicting them is a finding worth flagging.

---

## Step 4 — Report back

Give the user:
- The path to `research.md`
- A 3–5 bullet summary of what was found
- Any **Open questions** that block planning — ask them now rather than letting the plan phase guess

Then offer to continue with the `plan` skill. Do not start planning in the same breath; the user may want to correct the research first.
