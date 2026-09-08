---
name: open-pr
description: Opens a Pull Request on the rosenfeld/cal.diy fork from the current work — creates the branch if needed, commits using Conventional Commits, pushes to the `rosenfeld` remote, and creates the PR with the repository template filled in. Use when asked to "open a PR", "create a pull request", "ship these changes", "abrir uma PR" or similar.
---

# Open PR

The full "local work → Pull Request" flow for this repository.

**Fixed target:** everything happens on the **`rosenfeld/cal.diy`** fork — push to the `rosenfeld` remote, PR based on `rosenfeld/cal.diy:main`. Do not open a PR against `origin` (calcom), `jaya` or `favini` unless the user explicitly asks.

**Entry points:** invoked directly, or as the hand-off from the `implement` skill (phase 3 of the Research → Plan → Implement flow). Either way this skill owns everything from the commit onwards.

**Tooling:** use the `gh` CLI. The GitHub MCP server may be unavailable; `gh` is already authenticated as `rosenfeld`.

---

## Step 1 — Survey the state

Run in parallel:

```bash
git status --short
git branch --show-current
git log --oneline rosenfeld/main..HEAD   # commits already on this branch
git diff --stat rosenfeld/main...HEAD
```

Work out which case you are in:

| State | Action |
|---|---|
| Uncommitted changes, branch is `main` | Step 2 (create branch) → Step 3 |
| Uncommitted changes, feature branch | Step 3 (commit) |
| Everything committed, feature branch | Step 4 (push) |
| Nothing committed and nothing modified | Stop and report there is nothing to send |

**Never** commit directly on `main`, `jaya-main`, `favini-main` or `add-mcp-server`.

---

## Step 2 — Create the branch

If on `main` (or on any branch tracking another remote), branch off an up-to-date `main`:

```bash
git fetch rosenfeld main
git switch -c <branch-name> rosenfeld/main
```

Branch name: descriptive kebab-case, no mandatory prefix. If the changes close a known issue, use `fix/issue-<n>-<slug>` or `feat/issue-<n>-<slug>`.

If there are uncommitted changes before switching, they carry over — confirm with `git status` after the switch.

---

## Step 3 — Commit

Before committing, run the checks that cover the touched files:

```bash
yarn lint          # or biome on the changed files, for a small diff
yarn type-check
TZ=UTC yarn test <path-to-relevant-tests>
```

Do not run the whole suite (`yarn test` with no filter) or the e2e suites — too expensive. Run only what covers the diff. If a check fails, **fix it before committing** and report what broke.

Commit message in **Conventional Commits**, matching the repository history:

```
<type>(<scope>): <imperative description, lowercase, no trailing period>
```

Types in use here: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`.
Common scopes: `bookings`, `emails`, `calendar`, `i18n`, `booker`, `notifications`.

Real examples from the history:
- `feat(bookings): show warning for slots outside business hours`
- `fix(emails): customReplyToEmail no longer dropped when hideOrganizerEmail is true`
- `docs: add CLAUDE.md with business hours and timezone decisions`

End the message with:

```
Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
```

If the diff covers more than one concern, split it into separate commits — CONTRIBUTING asks for single-responsibility PRs.

---

## Step 4 — Push

```bash
git push -u rosenfeld <branch-name>
```

If the branch already tracks another remote, publish it on `rosenfeld` anyway before opening the PR.

---

## Step 5 — Build the PR body

Base it on `.github/PULL_REQUEST_TEMPLATE.md`, but **actually fill it in** — no leftover placeholders or HTML comments from the template.

Minimum structure:

```markdown
## What does this PR do?

<1–3 paragraphs: what changes and why. If it closes an issue, open with "Fixes #N".>

## Mandatory Tasks (DO NOT REMOVE)

- [x] I have self-reviewed the code (A decent size PR without self-review might be rejected).
- [x] I have updated the developer docs if this PR makes changes that would require a documentation change. If N/A, write N/A here and check the checkbox.
- [x] I confirm automated tests are in place that prove my fix is effective or that my feature works.

## How should this be tested?

<Exact commands, minimum data required, and expected result.>
```

Rules:
- Only tick a mandatory checkbox if it is true. If there are no automated tests, **leave it unchecked** — write why and let the user decide.
- Include the "Visual Demo" section only for user-visible changes; in that case ask the user for the image/video rather than inventing one.
- Drop the template's "Checklist" section (those bullets are things the contributor did *not* do).
- If the diff exceeds 500 lines or 10 code files, tell the user CONTRIBUTING asks for a split, but open the PR anyway if they confirm.

Always end the body with:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## Step 6 — Create the PR

Write the body to a temporary file in the scratchpad (avoids escaping problems) and run:

```bash
gh pr create \
  --repo rosenfeld/cal.diy \
  --base main \
  --head <branch-name> \
  --title "<same convention as the main commit>" \
  --body-file <file>
```

PR title: same convention as the commit (`feat(scope): ...`). For a single-commit PR, reuse that commit's message.

---

## Step 7 — Report back

Give the user:
- The PR URL
- Branch and base (`rosenfeld/<branch>` → `rosenfeld/cal.diy:main`)
- The result of the Step 3 checks (lint / type-check / tests), including what was **not** run
- Any caveat: unticked checkbox, oversized PR, pending visual demo

---

## Common failures

| Situation | Action |
|---|---|
| `gh` not authenticated | Ask the user to run `! gh auth login` |
| Branch already has an open PR | Do not create another — show the existing one (`gh pr view --repo rosenfeld/cal.diy`) and ask whether to update it |
| Push rejected (non-fast-forward) | Stop and show the error; never use `--force` unless the user asks |
| Conflict with `rosenfeld/main` | Report it and ask whether to rebase |
| Tests failing | Do not open the PR. Report the output and fix, or ask |
