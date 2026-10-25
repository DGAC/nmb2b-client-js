# AGENTS.md

TypeScript client for the Eurocontrol NM B2B SOAP API (`@dgac/nmb2b-client`).

## Context

- **Domain vocabulary** (OTMV, regulation, traffic volume, AUP…): read `GLOSSARY.md` when it exists, otherwise `README.md` and the XSD in `b2b-xsd/`, before naming a domain concept.
- **Package manager**: `pnpm` only.

## Writing code

**Before writing code** under `src/`, `tests/` or `scripts/`, read `CODING_STANDARDS.md`: structure, types and test rules. `/code-review` checks changes against it.

- `*.test.ts`: unit tests, offline, replayed through MSW.
- `*.e2e.test.ts`: tests against a real B2B connection, rate-limited. **Before running them, or any tests in a git worktree** → `docs/agents/e2e.md`.
- **Writing or changing a unit test for a SOAP operation** → `docs/agents/fixtures.md`.

## Done

The work is done when:

1. `pnpm format:ci`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm dedupe --check` and `pnpm test:unit --no-watch` all pass: the local counterparts of the CI jobs (vitest watches by default; `--no-watch` lets it exit).
2. Any change under `src/` ships with a changeset: a `.changeset/<kebab-name>.md` file, written by hand (`pnpm changeset` is interactive):

   ```md
   ---
   '@dgac/nmb2b-client': patch
   ---

   One-line summary for the changelog.
   ```

   Pick `patch`, `minor` or `major` per semver on the public API.

## Writing on GitHub

`AI_POLICY.md` requires external contributors' own voice on GitHub. Before writing an issue, comment or PR description, check whether the user is a maintainer: `gh api repos/DGAC/nmb2b-client-js --jq .permissions.push`.

- **`true` (maintainer)**: write and publish them.
- **Anything else** (`false`, error, `gh` unavailable): the user writes them. Hand over short notes (what changed, why, how it was verified) for the user to put in their own words, and leave publishing to them. `/pr` output is such notes.

## Agent skills

- **Issue tracker**: GitHub Issues via `gh`. See `docs/agents/issue-tracker.md`.
- **Triage labels**: see `docs/agents/triage-labels.md`.
- **Domain docs**: one `GLOSSARY.md` and `docs/adr/` at the repo root (single-context). See `docs/agents/domain.md`.
