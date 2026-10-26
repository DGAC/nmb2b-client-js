import * as fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assert, describe, expect, test } from 'vitest';
import { createB2BClient } from '../../src/index.ts';
import { TEST_B2B_OPTIONS } from '../options.ts';
import { assertIsFixture } from './fixtures.ts';
import { replayScenario } from './fixtureHarness/replayScenario.ts';
import { server } from './msw.ts';

/**
 * Registers tests for fixtures loaded via import.meta.glob.
 * @param globPattern - A glob pattern matching fixtures files relative to `baseUrl`
 * @param baseUrl - The import.meta.url of the test file, used to resolve absolute paths
 */
export async function registerFixtures(globPattern: string, baseUrl: string) {
  const b2bClient = await createB2BClient(TEST_B2B_OPTIONS);
  const baseDir = path.dirname(fileURLToPath(baseUrl));

  const fixtureModules = await loadModulesFromGlob(globPattern, baseUrl);

  for (const [relativePath, mod] of Object.entries(fixtureModules)) {
    const fixturePath = path.resolve(baseDir, relativePath);
    assert(mod !== null && typeof mod === 'object');
    const fixtureName = path.basename(fixturePath);

    describe(fixtureName, () => {
      for (const [fixtureId, fixture] of Object.entries(mod)) {
        assertIsFixture(
          fixture,
          `Export ${fixtureId} of module ${relativePath} is not a fixture scenario`,
        );

        const fixtureLocation = {
          filePath: fixturePath,
          exportName: fixtureId,
        };
        describe(`[${fixtureId}] ${fixture.description}`, () => {
          for (const { name, fn } of fixture.tests) {
            // oxlint-disable-next-line vitest/expect-expect -- assertions live in the scenario's `fn`
            test(
              name,
              server.boundary(async () => {
                const { result, variables } = await replayScenario(
                  fixture,
                  b2bClient,
                  fixtureLocation,
                );

                await fn({ expect, result, fixtureLocation, variables });
              }),
            );
          }
        });
      }
    });
  }
}

async function loadModulesFromGlob(globPattern: string, baseUrl: string) {
  const cwd = path.dirname(fileURLToPath(baseUrl));

  const fixtureFiles = await Array.fromAsync(
    fs.glob(globPattern, {
      cwd,
    }),
  );

  const fixtures = Object.fromEntries(
    await Promise.all(
      fixtureFiles.map(async (relativeFilePath) => {
        const importPath = pathToFileURL(path.join(cwd, relativeFilePath)).href;
        const mod = (await import(importPath)) as unknown;
        return [relativeFilePath, mod] as const;
      }),
    ),
  );

  return fixtures;
}
