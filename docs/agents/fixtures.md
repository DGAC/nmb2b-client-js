# Fixtures

Unit tests for SOAP operations record real B2B interactions once, then replay them offline through MSW.

## Layout

- Scenarios: `src/<Domain>/__fixtures__/<operation>.ts`. Each exported constant is one scenario; its name is the scenario name.
- Artifacts, written by recording: `src/<Domain>/__fixtures__/<operation>/<scenario>.context.json` (setup variables), `.mock.xml` (SOAP reply), `.result.json` (parsed result snapshot).

## Defining a scenario

```ts
import { defineFixture, expectSnapshot } from '../../../tests/utils/fixtures.ts';

export const nominal = defineFixture({ service: 'Flow', method: 'queryRegulations' })
  .describe('Nominal regulation query')
  .setup(async (client) => ({/* variables */}))
  .run(async (client, variables) => {
    const result = await client.Flow.queryRegulations({/* ... */});
    return { result };
  })
  .test('should match snapshot', expectSnapshot())
  .test('should ...', ({ expect, result, variables }) => {
    /* ... */
  });
```

- `.describe(text)`: the scenario description.
- `.setup(fn)`: optional, runs **only while recording**, against live B2B, to find or prepare data (e.g. a valid flight ID). Its return value is stored in `context.json` and replayed as `variables`.
- `.run(fn)`: the SOAP call; receives `(client, variables, { record })` and returns `{ result, exchanges? }`. The type of `result` seen by `.test()` is inferred from it, so `.run()` may narrow it first. `record` is not implemented yet (#370): recording and replay ignore `exchanges` until then.
- `.test(name, fn)`: one or more assertions, receiving `{ expect, result, exchanges, variables }`; `exchanges` is what `.run()` returned (`{}` when it returned none). `expectSnapshot()` compares against `result.json`.

Reference: `src/Flow/__fixtures__/queryRegulations.ts`.

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

`pnpm update-fixtures [filter...]` records every scenario (or those matching the filters) against the real B2B API. It needs B2B credentials in `.env`; when they are missing, ask the user to run it.

## Harness

Fixture recording and fixture replay live in `tests/utils/fixtureHarness/`, one operation per file: `recordScenario(fixture, client, location)` and `replayScenario(fixture, client, location)`. `pnpm update-fixtures` and `registerFixtures` only delegate to them; test the harness through these two operations (`fixtureHarness.test.ts`).

`recordScenario.ts` runs outside Vitest, in `pnpm update-fixtures`: it must not import `vitest`, MSW, or anything that does. There is no `index.ts`, which would pull replay dependencies into the recorder.
