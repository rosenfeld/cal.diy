---
name: rpi-implement
description: Phase 3 of the RPI workflow — executes an approved plan from `.claude/plans/<slug>/plan.md` step by step in the main agent, keeps the plan updated as it goes, and hands off to the open-pr skill. Use when asked to implement an approved plan, execute the plan, or finish the RPI flow.
---

# Implement (RPI phase 3)

Third and final phase of **Research → Plan → Implement**. Executes an approved plan and ships it.

Runs **in the main agent** — no implementation subagents. The plan is already the delegation; splitting the edits across agents just loses context between steps.

Previous phase: `rpi-plan`. Hands off to: `open-pr`.

---

## Step 1 — Verify the gate

Read `.claude/plans/<slug>/plan.md`.

- Missing file → run the `rpi-plan` skill first.
- `**Status:** AWAITING APPROVAL` → **stop.** Show the plan and ask the user to approve it. Do not implement an unapproved plan, even if it looks obviously right.
- `**Status:** APPROVED` → proceed.

Also read `research.md` alongside it — the plan names the files, the research explains the patterns to imitate.

---

## Step 2 — Set up the branch

Follow Step 2 of the `open-pr` skill: branch off an up-to-date `rosenfeld/main`.

```bash
git fetch rosenfeld main
git switch -c <branch-name> rosenfeld/main
```

Use the plan's `<slug>` for the branch name, prefixed by the change type: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`.

Never implement on `main`, `jaya-main`, `favini-main` or `add-mcp-server`.

---

## Step 3 — Execute the steps in order

For each step in the plan:

1. Read the target files before editing them — the research may be stale.
2. Make the change, following the patterns recorded in `research.md`.
3. Run the narrowest check that covers it (`TZ=UTC yarn test <path>`, or `yarn type-check` for a typing change).
4. Mark the step done in `plan.md`.

Rules:

- **Stay inside the plan.** If a step turns out to need a file the plan does not name, stop and tell the user what you found and why the plan was wrong. Do not silently widen the diff — the approval covered the plan, not everything adjacent to it.
- If a step proves impossible as written, do every step that does not depend on it, then report the blocker. Do not substitute your own approach for an approved one.
- Write the tests from the plan's test table as you go, not at the end.
- Respect the domain decisions in `CLAUDE.md` — business hours, per-organizer timezone, fixed UTC offset with no DST adjustment, both timezones displayed, out-of-hours slots warned rather than blocked.
- New user-facing strings need keys in `packages/i18n/locales/en/common.json` and the `pt`/`pt-BR` locales.

---

## Step 4 — Verify the whole change

Once every step is done:

```bash
yarn lint
yarn type-check
TZ=UTC yarn test <paths covering the change>
```

Do not run the unfiltered suite or the e2e suites — too expensive. Run what covers the diff.

Then re-read your own diff (`git diff rosenfeld/main...`) against the plan and check three things: every planned step is present, nothing unplanned crept in, and no debug leftovers survived.

If a check fails, fix it here. Do not proceed to the PR with a failing check.

---

## Step 5 — Hand off to `open-pr`

Invoke the `open-pr` skill. It owns commit conventions, push, the PR template and the report.

Give it the material it needs from this phase:
- The plan's approach paragraph, for the PR's "What does this PR do?"
- The test table and the runner command, for "How should this be tested?"
- Whether automated tests are actually in place — `open-pr` will not tick that mandatory checkbox unless it is true

Do not re-implement the PR flow here.

---

## Step 6 — Close out the plan

After the PR is open, set the plan's `**Status:**` line to `SHIPPED — <PR URL>`.

`.claude/plans/` is gitignored, so the research and plan documents stay local — they are the audit trail for how the change was reached, not part of the deliverable.
