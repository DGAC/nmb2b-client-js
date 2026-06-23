# Getting Started (Contributor Guide)

Onboarding for working **on** `@dgac/nmb2b-client`: repo layout, tooling,
build/test/release workflows, and how to add a new SOAP operation.

For using the published library, see the [API & Usage Guide](./api-reference.md).
For internals, see [Architecture](./architecture.md).

---

## Prerequisites

- **Node `>=22`**.
- **pnpm only** — `pnpm@11.8.0` (pinned via `packageManager`).
  `npm install` / `yarn install` are **forbidden** (see [`AGENTS.md`](../AGENTS.md)).
- For E2E tests / fixture recording: valid NM B2B credentials in a `.env` file.

```bash
pnpm install
```

---

## Repository layout

```
src/                  # Library source (see Architecture for the full map)
  <Domain>/           # Airspace, Flight, Flow, GeneralInformation
    index.ts          # getXxxClient + service definition
    <operation>.ts    # one file per SOAP operation
    types.ts          # request/reply types matching the XSD
    *.e2e.test.ts     # integration tests (real B2B)
    __fixtures__/     # recorded interactions for deterministic unit tests
  Common/             # shared NM types + base interface
  utils/              # soap factory, transformers, xsd bootstrap, hooks, helpers
tests/                # test harness: msw setup, options, runner, fixtures
scripts/              # downloadWSDL.ts, update-fixtures.ts
.changeset/           # changesets for versioning/release
docs/                 # this documentation
```

Project conventions are codified in [`AGENTS.md`](../AGENTS.md) — read it before
contributing. Highlights:

- One SOAP operation per file: `src/<Domain>/<Action>.ts`.
- Types matching the XSD go in `src/<Domain>/types.ts`; reuse from
  `src/types.ts`/`Common` where possible.
- `any` is forbidden; tests must not hardcode secrets.

---

## Tooling

| Concern        | Tool                                   | Config                                  |
| -------------- | -------------------------------------- | --------------------------------------- |
| Package manager| **pnpm**                               | [`pnpm-workspace.yaml`](../pnpm-workspace.yaml) |
| Build / bundle | [**tsdown**](https://tsdown.dev)       | [`tsdown.config.ts`](../tsdown.config.ts) |
| Type checking  | **tsc** (`--noEmit`)                   | [`tsconfig.json`](../tsconfig.json)     |
| Linting        | [**oxlint**](https://oxc.rs) (type-aware) | [`oxlint.config.ts`](../oxlint.config.ts) |
| Tests          | [**vitest**](https://vitest.dev)       | [`vitest.config.ts`](../vitest.config.ts) |
| HTTP mocking   | [**msw**](https://mswjs.io)            | [`tests/setupMsw.ts`](../tests/setupMsw.ts) |
| Versioning     | [**changesets**](https://github.com/changesets/changesets) | [`.changeset/`](../.changeset/) |
| Formatting     | **prettier**                           | [`.prettierrc`](../.prettierrc)         |

---

## npm scripts

From [`package.json`](../package.json):

| Script                  | What it does                                                     |
| ----------------------- | --------------------------------------------------------------- |
| `pnpm build`            | Bundle with tsdown → `dist/` (ESM + `.d.mts` + sourcemaps).      |
| `pnpm clean`            | `rimraf dist`.                                                   |
| `pnpm typecheck`        | `tsc --noEmit`.                                                  |
| `pnpm lint`             | oxlint (type-aware, reports unused disable directives).         |
| `pnpm lint:ci`          | Lint with GitHub-formatted output.                              |
| `pnpm test`             | Run vitest (watch mode).                                        |
| `pnpm test:unit`        | Unit project only (mocked, no network).                        |
| `pnpm test:e2e`         | E2E project only (real B2B connection).                        |
| `pnpm test:ci`          | Single run + junit + coverage + typecheck.                     |
| `pnpm downloadWSDL`     | Run [`scripts/downloadWSDL.ts`](../scripts/downloadWSDL.ts).     |
| `pnpm update-fixtures`  | Record/refresh fixtures from the real B2B API (needs `.env`).   |
| `pnpm release`          | `pnpm build && changeset publish`.                             |

### Validate your work

```bash
pnpm lint
pnpm typecheck
pnpm test:unit --no-watch
```

---

## Testing model

Vitest is split into two **projects** ([`vitest.config.ts`](../vitest.config.ts)):

### `unit` project

- Excludes `*.e2e.test.ts`.
- Uses **msw** ([`tests/setupMsw.ts`](../tests/setupMsw.ts)) to mock the B2B
  endpoint — **no real network calls**.
- Runs with mock credentials and mock endpoints injected via env
  (`B2B_API_KEY_ID=mock-…`, `B2B_ENDPOINT=…`, etc.).
- Deterministic; this is what CI relies on.

### `e2e` project

- Includes only `src/**/*.e2e.test.ts`, 20 s timeout.
- Talks to a **real** B2B connection using credentials from the environment.
- Guard real-network tests with `test.runIf(shouldUseRealB2BConnection)` and
  initialize clients from `TEST_B2B_OPTIONS` (`tests/options.ts`). Never
  hardcode secrets.

A global setup ([`tests/ensureWSDLPresence.ts`](../tests/ensureWSDLPresence.ts))
makes sure the WSDL cache exists before tests run.

---

## Fixture-based unit testing

Unit tests replay **recorded** real API interactions so they stay deterministic.
The custom framework lives in [`tests/utils/`](../tests/utils/) and is described
in [`AGENTS.md`](../AGENTS.md).

A fixture is defined per operation in `src/<Domain>/__fixtures__/<Action>.ts`
with `defineFixture(serviceMethod)`:

- **`.describe(text)`** — *(required)* scenario description.
- **`.setup()`** — *(optional, recording only)* prepares live data (e.g. find a
  valid flight id); returns `variables`.
- **`.run()`** — *(required)* executes the SOAP call; receives `variables`.
- **`.test()`** — one or more vitest assertions; receives
  `{ expect, result, variables }`. Use `expectSnapshot()` for standard snapshots.

Recorded sidecar artifacts live in
`src/<Domain>/__fixtures__/<Action>/<scenario>.*` (JSON context, XML mock, JSON
result snapshot).

**Recording / refreshing** (requires valid B2B credentials in `.env`):

```bash
pnpm update-fixtures
```

**Registering** fixtures in a domain test (`src/<Domain>/<Domain>.test.ts`):

```typescript
/// <reference types="vite/client" />
import { registerFixtures } from '../../tests/utils/runner';
import { describe } from 'vitest';

describe('MyDomain Fixtures', async () => {
  const fixtures = import.meta.glob('./__fixtures__/*.ts', { eager: true });
  await registerFixtures(fixtures, import.meta.url);
});
```

---

## How to add a new SOAP operation

1. **Create the operation file** `src/<Domain>/<newOperation>.ts` using
   `createSoapQueryDefinition`:

   ```typescript
   import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
   import type { MyRequest, MyReply } from './types.ts';

   export const newOperation = createSoapQueryDefinition<MyRequest, MyReply>({
     service: 'Flow',           // logical service name (used in logs/errors)
     query: 'newOperation',     // matches the soap client `${query}Async` method
     getSchema: (client) =>
       client.describe().SomeService.SomePort.newOperation.input,
   });
   ```

   Find the right `describe()` path by inspecting `client.describe()` for the
   target WSDL (an existing operation in the same domain is the best template).

2. **Add request/reply types** to `src/<Domain>/types.ts`, reusing primitives
   from [`Common/types.ts`](../src/Common/types.ts) (`Reply`, `NMSet`, date
   aliases, etc.). `any` is not allowed.

3. **Register it** in `src/<Domain>/index.ts` by adding it to `queryDefinitions`.
   The `SoapService` type and the callable method are derived automatically.

4. **Add a fixture** under `src/<Domain>/__fixtures__/` and record it with
   `pnpm update-fixtures`; add an `*.e2e.test.ts` if appropriate.

5. **Validate:** `pnpm lint && pnpm typecheck && pnpm test:unit --no-watch`.

---

## Release process

The project uses **changesets**:

1. After a change, add a changeset:
   ```bash
   pnpm changeset
   ```
   (choose the semver bump and write a summary).
2. Merging the changeset's "Version Packages" PR updates the version and
   `CHANGELOG.md`.
3. Publishing runs `pnpm release` (`build` + `changeset publish`). The package
   is published with npm **provenance** (`publishConfig.provenance: true`); only
   the `dist/` directory is shipped (`files: ["dist"]`).

CI lives under [`.github/`](../.github/).
