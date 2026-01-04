import { http, HttpResponse } from 'msw';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert, beforeAll, describe, expect, test, vi } from 'vitest';
import { createB2BClient, type B2BClient } from '../../src/index.js';
import { TEST_B2B_OPTIONS } from '../options.js';
import { FixtureArtifacts, type FixtureLocation } from './artifacts.js';
import { Fixture } from './fixtures.js';
import { server, SOAP_ENDPOINT } from './msw.js';

/**
 * Registers tests for fixtures loaded via import.meta.glob.
 * @param fixtureModules - The result of import.meta.glob('./__fixtures__/*.ts', { eager: true })
 * @param baseUrl - The import.meta.url of the test file, used to resolve absolute paths
 */
export async function registerFixtures(
  fixtureModules: Record<string, unknown>,
  baseUrl: string,
) {
  const b2bClient = await createB2BClient(TEST_B2B_OPTIONS);
  const baseDir = path.dirname(fileURLToPath(baseUrl));

  for (const [relativePath, mod] of Object.entries(fixtureModules)) {
    const fixturePath = path.resolve(baseDir, relativePath);
    assert(mod !== null && typeof mod === 'object');
    const fixtureName = path.basename(fixturePath);

    describe(fixtureName, () => {
      for (const [fixtureId, fixture] of Object.entries(mod)) {
        assert(
          fixture instanceof Fixture,
          `Export ${fixtureId} of module ${relativePath} is not a fixture`,
        );

        const fixtureLocation = {
          filePath: fixturePath,
          exportName: fixtureId,
        };
        const artifacts = new FixtureArtifacts(fixtureLocation);

        describe(`[${fixtureId}] ${fixture.description}`, async () => {
          const context = await artifacts.readContext();
          const xmlResponse = await artifacts.readMock();

          beforeAll(() => {
            vi.setSystemTime(new Date(context.meta.mockDate));
            return () => {
              vi.useRealTimers();
            };
          });

          runFixtureTests({
            b2bClient,
            fixture,
            variables: context.variables,
            xmlResponse,
            fixtureLocation,
          });
        });
      }
    });
  }
}

function runFixtureTests<
  TB2BService extends keyof B2BClient,
  TVariables,
  TResult,
>({
  b2bClient,
  fixture,
  variables,
  xmlResponse,
  fixtureLocation,
}: {
  b2bClient: B2BClient;
  fixture: Fixture<TB2BService, TVariables, TResult>;
  variables: TVariables;
  xmlResponse: string;
  fixtureLocation: FixtureLocation;
}) {
  for (const { name, fn } of fixture.tests) {
    test(
      name,
      server.boundary(async () => {
        server.use(
          http.post(SOAP_ENDPOINT, () => {
            return HttpResponse.xml(xmlResponse);
          }),
        );

        assert(fixture.executeOperation, 'Incomplete fixture');

        const result = await fixture.executeOperation(b2bClient, variables);

        await fn({
          expect,
          result,
          fixtureLocation,
          variables,
        });
      }),
    );
  }
}
