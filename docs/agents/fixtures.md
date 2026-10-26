# Fixtures

Unit tests for SOAP operations record real B2B interactions once, then replay them offline through MSW.

## Layout

- Scenarios: `src/<Domain>/__fixtures__/<operation>.ts`. Each exported constant is one scenario; its name is the scenario name.
- Artifacts, written by recording, under `src/<Domain>/__fixtures__/<operation>/`:
  - `<scenario>.context.json`: setup variables and `meta.recordedAt`.
  - `<scenario>.<id>.request.xml` and `<scenario>.<id>.mock.xml`: one recorded exchange per `recordExchange(id, …)` call, the SOAP request as sent and the B2B reply.
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
- `.run(fn)`: the SOAP calls; receives `(client, variables, { recordExchange })` and returns `{ result, exchanges }`. The type of `result` seen by `.test()` is inferred from it, so `.run()` may narrow it first. Recording freezes `Date` at `recordedAt` during `.run()`, right after `setup`, and replay freezes it at the same date, so the injected `sendTime` is the same on both sides.
- `recordExchange(id, call)`: wraps one SOAP call and returns `{ result, exchanges: { [id]: … } }`, which `.run()` may return as is. `call` must send exactly one SOAP request, through any service of `client`; recording fails otherwise. Recording captures that request and the B2B reply as the recorded exchange `id`; replay returns the exchange read from disk. `id` matches `/^[a-z][a-zA-Z0-9]*$/` (e.g. `retrieveFlight`). Several calls take distinct ids and send distinct requests, their `exchanges` merged into what `.run()` returns; they may run concurrently. Recording fails on an invalid or reused id, or on two exchanges with identical requests, which replay could not tell apart. A failed `recordExchange()` fails recording even when `.run()` catches it (`try`/`catch`, `Promise.allSettled`); a B2B error does not, since it records no exchange: `.run()` may retry it under the same id. Every SOAP request `.run()` sends must go through `recordExchange()`, and `.run()` must return at least one exchange: recording fails otherwise, since replay would not serve it. SOAP requests sent by `.setup()` are not recorded.
- `.test(name, fn)`: one or more assertions, receiving `{ expect, result, exchanges, variables }`; `exchanges` is what `.run()` returned, each with the MSW `handler` that replayed it. `expectSnapshot()` compares against `result.json`; `expectRecordedRequests()` asserts that the exchange ids returned by `.run()` are exactly those on disk, and that each was requested.

Reference: `src/Flight/__fixtures__/retrieveFlight.ts`.

## Replay matches the exact request

On replay, a recorded exchange's reply is served once, only to a request byte-identical to its `request.xml`; any other request, or the same one sent again, fails the replay with an error showing the request sent, formatted, and either the expected exchange ids or the id of the exchange already replayed (ADR `docs/adr/0001-fixture-replay-matches-exact-request-body.md`). A change to what the client sends (serializer, request shape, scenario inputs) therefore requires re-recording the scenarios it touches against B2B with `pnpm update-fixtures`; do not edit `request.xml` by hand.

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
