import { describe, test, expect, beforeAll, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server, SOAP_ENDPOINT } from './msw.js';
import { createB2BClient } from '../../src/index.js';
import { TEST_B2B_OPTIONS } from '../options.js';
import { Fixture } from './fixtures.js';
import fs from 'node:fs/promises';
import path from 'node:path';

interface FixtureContext {
  meta?: {
    mockDate?: string;
  };
  variables: unknown;
}

export function registerAutoTests(modules: Record<string, unknown>) {
  // The test client uses mock options (MSW)
  const clientPromise = createB2BClient(TEST_B2B_OPTIONS);

  for (const [fileRelativePath, mod] of Object.entries(modules)) {
    const fixtureFileName = path.basename(fileRelativePath, '.ts');
    const fixturesDir = path.dirname(fileRelativePath);

    if (typeof mod !== 'object' || mod === null) {
      continue;
    }

    for (const [fixtureId, fixture] of Object.entries(mod)) {
      if (!(fixture instanceof Fixture)) continue;

      describe(`${fixture._description} [${fixtureId}]`, () => {
        let result: unknown;

        beforeAll(async () => {
          const client = await clientPromise;

          // 1. Load context (.context.json)
          const contextPath = path.join(
            fixturesDir,
            fixtureFileName,
            `${fixtureId}.context.json`,
          );
          const context = JSON.parse(
            await fs.readFile(contextPath, 'utf-8'),
          ) as FixtureContext;

          // 2. Mock time
          if (context.meta?.mockDate) {
            vi.setSystemTime(new Date(context.meta.mockDate));
          }

          // 3. Load network mock (.mock.xml)
          const mockPath = path.join(
            fixturesDir,
            fixtureFileName,
            `${fixtureId}.mock.xml`,
          );
          const xmlResponse = await fs.readFile(mockPath, 'utf-8');

          server.use(
            http.post(SOAP_ENDPOINT, () => {
              return HttpResponse.xml(xmlResponse);
            }),
          );

          // 4. Execute logic
          if (!fixture._run) {
            throw new Error(`Fixture ${fixtureId} has no run() function`);
          }
          result = await fixture._run(client, context.variables);
        });

        // 5. Register tests
        for (const { name, fn } of fixture._tests) {
          test(name, async () => {
            await fn({
              expect,
              result,
              expectSnapshot: async (data) => {
                await expect(data).toMatchFileSnapshot(
                  path.join(
                    fixturesDir,
                    fixtureFileName,
                    `${fixtureId}.result.json`,
                  ),
                );
              },
            });
          });
        }
      });
    }
  }
}
