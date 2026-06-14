---
name: github-issue-workflow
description: Reads a GitHub issue via MCP, implements it using multiple coordinated agents (researcher, implementer, reviewer), and opens a draft PR awaiting human approval. Use this skill when asked to implement a GitHub issue, work on an issue, or execute the multi-agent development workflow.
---

# GitHub Issue Workflow

This skill orchestrates a multi-agent workflow to implement a GitHub issue end-to-end:

1. Read the issue via GitHub MCP
2. Research the relevant code (Explore agent)
3. Implement the feature (Implementation agent, isolated worktree)
4. Automated structural eval (Stepdown) runs automatically on modified files
5. Reviewer agent validates functional correctness, tests, and test execution
6. Open a draft PR with a human approval comment

## Usage

Invoke with an issue number as argument:
> /github-issue-workflow 1

If no number is provided, ask the user for it before proceeding.

---

## Step 1 — Read the Issue

Use the GitHub MCP tools to read the issue from the `rosenfeld/cal.diy` repository:
- Fetch issue number `<NUMBER>` including its title, body, and labels
- Store the full content — it will be passed verbatim to all downstream agents

---

## Step 2 — Research Agent

Launch an **Explore** subagent with this prompt:

> "You are a research agent. Map the relevant files for implementing this GitHub issue.
>
> Issue: <ISSUE_TITLE>
> Body: <ISSUE_BODY>
>
> Search the codebase and return:
> 1. The files most likely to be modified (with paths)
> 2. The files most likely to need new test files (with suggested paths)
> 3. Existing patterns (function signatures, data structures) the implementer should follow
> 4. The exact test runner command for this part of the codebase
>
> Be specific — return file paths, not directories."

---

## Step 3 — Implementation Agent

Launch a subagent with `isolation: worktree` and this prompt:

> "You are an implementation agent. Implement the following GitHub issue exactly as described.
>
> Issue #<NUMBER>: <ISSUE_TITLE>
> <ISSUE_BODY>
>
> Relevant files identified by the research agent:
> <RESEARCH_OUTPUT>
>
> Requirements:
> - Implement every acceptance criterion listed in the issue
> - Write unit tests covering: happy path, edge cases, and all acceptance criteria
> - Do not break existing functionality or tests
> - Follow the existing code patterns identified by the research agent
> - Do not create a PR or commit — only implement the code
>
> When done, report:
> - Which files were created or modified (with paths)
> - A brief summary of what was implemented"

---

## Step 4 — Structural Eval (Automatic)

The `.claude/evals/stepdown_numeric_eval.md` eval runs automatically on all modified `.js` and `.ts` files.

- If score ≥ 70: proceed to Step 5
- If score < 70: relay the deductions as feedback to the implementation agent and ask it to revise

Allow up to **2 revision attempts**. If the eval still fails after 2 attempts, report the deductions to the user and stop.

---

## Step 5 — Reviewer Agent

Launch a subagent with this prompt:

> "You are a code reviewer agent. Validate that the implementation correctly fulfils the GitHub issue.
>
> Issue #<NUMBER>: <ISSUE_TITLE>
> <ISSUE_BODY>
>
> Implementation summary:
> <IMPLEMENTATION_SUMMARY>
>
> Review checklist:
> 1. Does the implementation satisfy every acceptance criterion in the issue?
> 2. Are there unit tests for each criterion, and do they assert the correct behavior?
> 3. Run the tests using the command: <TEST_COMMAND_FROM_RESEARCH>. Do all tests pass?
> 4. Are there obvious missing edge cases?
> 5. Do any existing tests break?
>
> Output:
> - VERDICT: APPROVED or CHANGES_REQUESTED
> - If CHANGES_REQUESTED: list each specific problem with file path and what must be fixed
> - If APPROVED: brief summary of what was verified"

If the verdict is **CHANGES_REQUESTED**, relay the specific feedback to the implementation agent and repeat from Step 3. Allow up to **2 revision cycles**. If still not approved after 2 cycles, report the reviewer feedback to the user and stop.

---

## Step 6 — Open Draft PR

Once the reviewer approves, use the GitHub MCP tools to create a draft pull request on `rosenfeld/cal.diy` with:

- **Title:** `<ISSUE_TITLE>`
- **Body:**
  ```
  ## Summary

  Implements #<NUMBER> — <ISSUE_TITLE>

  <IMPLEMENTATION_SUMMARY>

  ## Review checklist
  - [x] All acceptance criteria verified by reviewer agent
  - [x] All tests pass
  - [x] Stepdown structural eval passed (score ≥ 70)

  ## Human approval required

  This PR was created by an automated agent workflow. Please review the changes and mark as **Ready for review** only after human approval.

  🤖 Generated with the `github-issue-workflow` skill
  ```
- **Draft:** true
- **Base branch:** `main`

After creating the PR, use the GitHub MCP to add a comment to issue `#<NUMBER>` with:

```
A draft PR has been opened: <PR_URL>

The implementation passed automated structural eval (Stepdown ≥ 70) and agent code review.

⏳ **Human approval required** — please review the PR and mark it as ready for review when approved.
```

---

## Error Handling

| Situation | Action |
|-----------|--------|
| GitHub MCP unavailable | Stop and ask the user to ensure the GitHub MCP server is configured |
| Issue not found | Stop and report the issue number to the user |
| Structural eval fails after 2 revision attempts | Report eval deductions to user and stop |
| Reviewer requests changes after 2 revision cycles | Report reviewer feedback to user and stop |
| Tests fail and cannot be fixed | Report test output to user and stop |
