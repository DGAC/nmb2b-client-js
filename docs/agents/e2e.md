# E2E tests

`*.e2e.test.ts` call the real NM B2B, with the credentials from `.env`.

## Budget

B2B rate-limits calls. Before running `pnpm test:e2e`, ask the user for a run budget, then spend it one run at a time, never in parallel. Keep each run's output (`> <scratchpad>/e2e-<label>.log`) so a comparison never needs a second run.

## Real or skipped

`shouldUseRealB2BConnection` (`tests/utils.ts`) decides:

- **Locally** (`CI` unset): real B2B.
- **In CI**: skipped, except in the `test (24)` job of `.github/workflows/ci.yml`, which sets `REAL_B2B_CONNECTIONS` when the B2B secrets are available. Secrets reach PRs from branches of `DGAC/nmb2b-client-js`, not from forks.

So on a PR opened from a branch of the repo, CI already runs e2e against real B2B. A local run is worth its budget for a before/after comparison, or before pushing.

## Worktrees

`.env` and `b2b-xsd/` are gitignored and resolved from the project root (`tests/resolveB2BEnvironment.ts`), so a fresh `git worktree` has neither. Copy both from the main checkout before running any tests there, unit tests included; otherwise `ensureWSDLPresence` aborts with "Initialization of SOAP clients will fail".
