# Fixtures

Unit tests for SOAP operations record real B2B interactions once, then replay them offline through MSW.

## Layout

- Scenarios: `src/<Domain>/__fixtures__/<operation>.ts`. Each exported constant is one scenario; its name is the scenario name.
- Artifacts, written by recording, under `src/<Domain>/__fixtures__/<operation>/`:
  - `<scenario>.context.json`: setup variables and `meta.recordedAt`.
  - `<scenario>.<id>.request.xml` and `<scenario>.<id>.mock.xml`: one recorded exchange per `recordExchange(id, …)` call, the SOAP request as sent and the B2B reply.
  - `<scenario>.mock.xml`: instead of the exchanges, the B2B reply of a scenario that does not call `recordExchange()` yet.
  - `<scenario>.result.json`: the parsed result snapshot, written by `expectSnapshot()`.

## Defining a scenario

```ts
import {
  defineFixture,
  expectRecordedRequests,
  expectSnapshot,
} from '../../../tests/utils/fixtures.ts';

export const nominal = defineFixture({ service: 'Flow', method: 'queryRegulations' })
  .describe('Nominal regulation query')
  .setup(async (client) => ({/* variables */}))
  .run((client, variables, { recordExchange }) =>
    recordExchange('queryRegulations', () => client.Flow.queryRegulations({/* ... */})),
  )
  .test('should match snapshot', expectSnapshot())
  .test('should send the recorded requests', expectRecordedRequests())
  .test('should ...', ({ expect, result, variables }) => {
    /* ... */
  });
```

- `.describe(text)`: the scenario description.
- `.setup(fn)`: optional, runs **only while recording**, against live B2B, to find or prepare data (e.g. a valid flight ID). Its return value is stored in `context.json` and replayed as `variables`.
- `.run(fn)`: the SOAP calls; receives `(client, variables, { recordExchange })` and returns `{ result, exchanges? }`. The type of `result` seen by `.test()` is inferred from it, so `.run()` may narrow it first. Recording freezes `Date` at `recordedAt` during `.run()`, right after `setup`, and replay freezes it at the same date, so the injected `sendTime` is the same on both sides.
- `recordExchange(id, call)`: wraps one SOAP call and returns `{ result, exchanges: { [id]: … } }`, which `.run()` may return as is. Recording captures the request sent and the B2B reply as the recorded exchange `id`; replay returns the exchange read from disk. Several calls take distinct ids, their `exchanges` merged into what `.run()` returns.
- `.test(name, fn)`: one or more assertions, receiving `{ expect, result, exchanges, variables }`; `exchanges` is what `.run()` returned (`{}` when it returned none), each with the MSW `handler` that replayed it. `expectSnapshot()` compares against `result.json`; `expectRecordedRequests()` asserts that the exchange ids returned by `.run()` are exactly those on disk, and that each was requested.

Reference: `src/Flight/__fixtures__/retrieveFlight.ts`.

## Replay matches the exact request

On replay, a recorded exchange's reply is served once, only to a request byte-identical to its `request.xml`; any other request, or the same one sent again, fails with MSW's unhandled request error (ADR `docs/adr/0001-fixture-replay-matches-exact-request-body.md`). A change to what the client sends (serializer, request shape, scenario inputs) therefore requires re-recording the scenarios it touches against B2B with `pnpm update-fixtures`; do not edit `request.xml` by hand.

A scenario that does not call `recordExchange()` keeps its single `<scenario>.mock.xml`, served to any request.

## Registering

Each domain has one `src/<Domain>/<Domain>.test.ts` that loads all its scenarios; create it when the domain has none:

```ts
import { registerFixtures } from '../../tests/utils/runner.ts';
import { describe } from 'vitest';

describe('<Domain> Fixtures', async () => {
  await registerFixtures('./__fixtures__/*.ts', import.meta.url);
});
```

## Recording

`pnpm update-fixtures [filter...]` records every scenario (or those matching the filters) against the real B2B API. It needs Node 24 or later (the recorder uses `using` and runs without Vitest's transform) and B2B credentials in `.env`; when they are missing, ask the user to run it.

## Harness

Fixture recording and fixture replay live in `tests/utils/fixtureHarness/`, one operation per file: `recordScenario(fixture, client, location)` and `replayScenario(fixture, client, location)`. `pnpm update-fixtures` and `registerFixtures` only delegate to them; test the harness through these two operations (`fixtureHarness.test.ts`).

`recordScenario.ts` runs outside Vitest, in `pnpm update-fixtures`: it must not import `vitest`, MSW, or anything that does. There is no `index.ts`, which would pull replay dependencies into the recorder.
