# Coding standards

Rules for code in this repo, followed when writing and checked in review. Mechanical rules (no `any`, `.ts` import extensions, formatting) are enforced by `oxlint` and `oxfmt` and are not repeated here.

## Structure

- **One SOAP operation per file**: `src/<Domain>/<operation>.ts`, named after the B2B operation, exposed through the domain's `index.ts`.
- **Types follow the XSD**: request/reply interfaces live in `src/<Domain>/types.ts` and mirror the XSD names and shapes. Types shared across domains live in `src/types.ts` (or `src/Common/`); reuse them before defining a new one.

## Tests

- **Unit tests stay offline**: `*.test.ts` replay recorded fixtures, or use hand-written MSW handlers for failures B2B cannot produce.
- **Fixture scenarios cover SOAP operations**: every new operation comes with at least one (`docs/agents/fixtures.md`).
- **E2E tests are gated**: every test in `*.e2e.test.ts` runs under `test.runIf(shouldUseRealB2BConnection)` (`tests/utils.ts`), or under the stricter `test.skip` when it writes to B2B (e.g. `updateOTMVPlan`, `updateCapacityPlan`).
- **Credentials come from the environment**: tests build clients from `TEST_B2B_OPTIONS` (`tests/options.ts`), and fixture recording from `resolveB2BEnvironment()`; certificates, keys and passphrases never appear in source. The one exception is the throwaway self-signed credentials in `tests/fixtures/credentials/`, which grant access to nothing.
- **`assert` checks the world, `expect` checks the behaviour**: `assert` (from `vitest`, or `src/utils/assert.ts` in fixture scenarios, which the recorder runs outside vitest) states what the test relies on, such as a type narrowing or a setup that worked; `expect` states what the test is about.
- **Disposable test helpers are named `with<Thing>`**: a test helper that returns a `Disposable` or `AsyncDisposable` is named `with<Thing>` (`withFakeSystemTime`, `withTempDirectory`) and bound with `using` / `await using`, so its cleanup runs even when the test fails.

### Style defaults

Depart from a default when the test reads better. A reviewer reports a departure as a judgement call.

- **The test report reads as a spec**: nest `describe` blocks: the subject, what it does when it does several things, then the situation (`when …`, `with …`).
- **A test title names one behaviour**, usually as `should …`, and the test asserts that behaviour, so that a failure points at what broke. After an expected rejection, check each side effect in its own test.
- **Tests are self-contained**: setup, action and assertions read in the test body, with each test calling its own setup helpers, so that a test can be understood on its own. Expected values are traceable from the test: built there, or taken from its table row or a constant named after its domain state. A shared hook suits what no test needs to read, like the MSW reset in `tests/setupMsw.ts`. Fixture scenarios share `.setup()` and `.run()` by construction, and e2e tests may share setup across a file to spend less of the B2B rate limit.
- **Tables run the same tests over variants**: name the fields of a row, since positional columns are hard to read past a few values. `describe.each` on `['with …', { params }]` tuples titled `'%s'` suits several tests per variant, and `test.each` carries the behaviour in its title (`'should reject: %s'`). `$name` only interpolates in object rows, so a title that needs a field of a tuple goes on the nested test.

  ```typescript
  describe.each([
    [
      'with a 502, with an HTML page',
      {
        response: { body: '<p>Bad Gateway</p>', statusCode: 502, contentType: 'text/html' },
        expectedError: { kind: 'http', message: 'HTTP status 502' },
      },
    ],
  ])('%s', (_, { response, expectedError }) => {
    test(`should read "${expectedError.message}"`, async () => {});
    test(`should report kind "${expectedError.kind}"`, async () => {});
  });
  ```
