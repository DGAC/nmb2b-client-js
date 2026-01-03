import { describe, test, expect, beforeAll, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server, SOAP_ENDPOINT } from './msw.js';
import { createB2BClient } from '../../src/index.js';
import { TEST_B2B_OPTIONS } from '../options.js';
import { Fixture } from './fixtures.js';
import { FixtureArtifacts } from './artifacts.js';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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
    // Dynamic import of the fixture module
    const mod = (await import(pathToFileURL(fixturePath).href)) as Record<
      string,
      unknown
    >;

    for (const [fixtureId, fixture] of Object.entries(mod)) {
      if (!(fixture instanceof Fixture)) continue;

      const artifacts = new FixtureArtifacts(fixture, {
        filePath: fixturePath,
        fixtureId,
      });

      describe(`${fixture.description} [${fixtureId}]`, () => {
        let result: unknown;

        beforeAll(async () => {
          const client = await clientPromise;

          // 1. Load context and mock time
          const context = await artifacts.readContext();
          if (context.meta.mockDate) {
            vi.setSystemTime(new Date(context.meta.mockDate));
          }

          // 2. Load network mock and register MSW handler
          const xmlResponse = await artifacts.readMock();
          server.use(
            http.post(SOAP_ENDPOINT, () => {
              return HttpResponse.xml(xmlResponse);
            }),
          );

          // 3. Execute logic
          if (!fixture.executeOperation) {
            throw new Error(
              `Fixture ${fixtureId} has no executeOperation defined`,
            );
          }
          result = await fixture.executeOperation(client, context.variables);
        });

        // 4. Register tests
        for (const { name, fn } of fixture.tests) {
          test(name, async () => {
            await fn({
              expect,
              result: result as never,
              expectSnapshot: async (data: unknown) => {
                await expect(data).toMatchFileSnapshot(artifacts.snapshotPath);
              },
            });
          });
        }
      });
    }
  }
}
