import assert from 'node:assert';
import { glob } from 'node:fs/promises';
import { join, relative } from 'node:path';
import type { CreateB2BClientOptions } from '../src/index.ts';
import { createB2BClient } from '../src/index.ts';
import { fromValues } from '../src/security.ts';
import { resolveB2BEnvironment } from '../tests/resolveB2BEnvironment.ts';
import { FixtureArtifacts } from '../tests/utils/artifacts.ts';
import { assertIsFixture } from '../tests/utils/fixtures.ts';

const ROOT_DIR = join(import.meta.dirname, '..');

async function findFixtureFiles(baseDirectory: string): Promise<string[]> {
  const files: string[] = [];
  const pattern = join(baseDirectory, '**', '__fixtures__', '*.ts');
  for await (const entry of glob(pattern)) {
    if (!entry.endsWith('.test.ts')) {
      files.push(entry);
    }
  }
  return files;
}

async function record() {
  console.log('🚀 Starting fixtures recording...');

  // Manually construct options avoiding top-level import side effects from tests/options.ts
  const env = resolveB2BEnvironment();
  const options: CreateB2BClientOptions = {
    flavour: env.B2B_FLAVOUR,
    XSD_PATH: env.B2B_XSD_PATH,
    security: fromValues(env),
    ...(env.B2B_ENDPOINT && { endpoint: env.B2B_ENDPOINT }),
    ...(env.B2B_XSD_REMOTE_URL && { xsdEndpoint: env.B2B_XSD_REMOTE_URL }),
  };

  const client = await createB2BClient(options);

  const fixtureFiles = await findFixtureFiles(join(ROOT_DIR, 'src'));
  console.log(`Found ${fixtureFiles.length} fixture files.`);

  for (const filePath of fixtureFiles) {
    const relativePath = relative(ROOT_DIR, filePath);
    console.log(`\nProcessing ${relativePath}...`);

    const fixtureModule = (await import(filePath)) as unknown;
    assert(fixtureModule !== null && typeof fixtureModule === 'object');

    for (const [exportName, fixture] of Object.entries(fixtureModule)) {
      assertIsFixture(
        fixture,
        `Module ${filePath}, export ${exportName} is not a Fixture instance.`,
      );

      const artifacts = new FixtureArtifacts({ filePath, exportName });

      console.log(
        `  - Recording fixture: ${exportName} (${fixture.description})...`,
      );

      const setupStart = new Date();
      const variables = fixture.setupRecording
        ? await fixture.setupRecording(client)
        : undefined;

      // Capture mock date (ensure it matches the execution time)
      const mockDate = setupStart.toISOString();

      assert(
        fixture.executeOperation,
        `Module ${filePath}, export ${exportName} is not a complete fixture.`,
      );

      await fixture.executeOperation(client, variables);

      const serviceClient = client[fixture.service];
      const lastResponse = serviceClient.__soapClient.lastResponse as unknown;

      assert(
        lastResponse && typeof lastResponse === 'string',
        'No SOAP response captured. Did the executeOperation execute a SOAP query?',
      );

      await artifacts.saveContext({
        meta: { mockDate },
        variables,
      });
      await artifacts.saveMock(lastResponse);

      console.log(`    ✅ Success`);
    }
  }

  console.log('\n✨ Recording complete.');
}

await record();
