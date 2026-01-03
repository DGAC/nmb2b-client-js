import { describe, test, expect, beforeAll, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server, SOAP_ENDPOINT } from './msw.js';
import { createB2BClient } from '../../src/index.js';
import { TEST_B2B_OPTIONS } from '../options.js';
import { Fixture } from './fixtures.js';
import fs from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

interface FixtureContext {
  meta?: {
    mockDate?: string;
  };
  variables: unknown;
}

/**
 * Collects all fixture files in the __fixtures__ directory relative to the caller.
 * @param importMetaUrl - The import.meta.url of the caller.
 */
export function collectFixtures(importMetaUrl: string): string[] {
  const callerPath = fileURLToPath(importMetaUrl);
  const callerDir = path.dirname(callerPath);
  const fixturesDir = path.join(callerDir, '__fixtures__');

  try {
    return readdirSync(fixturesDir)
      .filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'))
      .map((file) => path.join(fixturesDir, file));
  } catch (_err) {
    // If __fixtures__ doesn't exist, return empty array
    return [];
  }
}

/**
 * Registers tests for each fixture in the provided paths.
 */
export async function registerAutoTests(fixturePaths: string[]) {
  // The test client uses mock options (MSW)
  const clientPromise = createB2BClient(TEST_B2B_OPTIONS);

  for (const fixturePath of fixturePaths) {
    const fixtureFileName = path.basename(fixturePath, '.ts');
    const fixturesDir = path.dirname(fixturePath);

    // Dynamic import of the fixture module
    const mod = (await import(pathToFileURL(fixturePath).href)) as Record<
      string,
      unknown
    >;

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
              result: result as never,
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
