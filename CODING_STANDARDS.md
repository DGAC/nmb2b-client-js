# Coding standards

Rules for code in this repo, followed when writing and checked in review. Mechanical rules (no `any`, `.ts` import extensions, formatting) are enforced by `oxlint` and `oxfmt` and are not repeated here.

## Structure

- **One SOAP operation per file**: `src/<Domain>/<operation>.ts`, named after the B2B operation, exposed through the domain's `index.ts`.
- **Types follow the XSD**: request/reply interfaces live in `src/<Domain>/types.ts` and mirror the XSD names and shapes. Types shared across domains live in `src/types.ts` (or `src/Common/`); reuse them before defining a new one.

## Tests

- **Unit tests stay offline**: `*.test.ts` replay recorded fixtures, or use hand-written MSW handlers for failures B2B cannot produce (see `docs/agents/fixtures.md`); every new SOAP operation comes with at least one fixture scenario.
- **E2E tests are gated**: every test in `*.e2e.test.ts` runs under `test.runIf(shouldUseRealB2BConnection)` (`tests/utils.ts`), or under the stricter `test.skip` when it writes to B2B (e.g. `updateOTMVPlan`, `updateCapacityPlan`).
- **Credentials come from the environment**: tests build clients from `TEST_B2B_OPTIONS` (`tests/options.ts`), and fixture recording from `resolveB2BEnvironment()`; certificates, keys and passphrases never appear in source. The one exception is the throwaway self-signed credentials in `tests/fixtures/credentials/`, which grant access to nothing.
- **Disposable test helpers are named `with<Thing>`**: a test helper that returns a `Disposable` or `AsyncDisposable` is named `with<Thing>` (`withFakeSystemTime`, `withTempDirectory`) and bound with `using` / `await using`, so its cleanup runs even when the test fails.
