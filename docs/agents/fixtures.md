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
  .run(async (client, variables) => client.Flow.queryRegulations({/* ... */}))
  .test('should match snapshot', expectSnapshot())
  .test('should ...', ({ expect, result, variables }) => {
    /* ... */
  });
```

- `.describe(text)`: the scenario description.
- `.setup(fn)`: optional, runs **only while recording**, against live B2B, to find or prepare data (e.g. a valid flight ID). Its return value is stored in `context.json` and replayed as `variables`.
- `.run(fn)`: the SOAP call; receives `variables`.
- `.test(name, fn)`: one or more assertions, receiving `{ expect, result, variables }`. `expectSnapshot()` compares against `result.json`.

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
