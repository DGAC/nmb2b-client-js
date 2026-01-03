import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createB2BClient } from '../src/index.js';
import { resolveB2BEnvironment } from '../tests/resolveB2BEnvironment.js';
import { Fixture } from '../tests/utils/fixtures.js';
import { fromValues } from '../src/security.js';
import type { CreateB2BClientOptions } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

async function findFixtureFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith('.ts') &&
        !entry.name.endsWith('.test.ts') &&
        entry.parentPath.includes('__fixtures__'),
    )
    .map((entry) => join(entry.parentPath, entry.name));
}

async function record() {
  console.log('🚀 Starting fixtures recording...');

  // Manually construct options avoiding top-level import side effects from tests/options.ts
  const env = resolveB2BEnvironment();
  const options: CreateB2BClientOptions = {
    flavour: env.B2B_FLAVOUR,
    XSD_PATH: env.B2B_XSD_PATH,
    security: fromValues(env as Record<string, string | undefined>),
    ...(env.B2B_ENDPOINT && { endpoint: env.B2B_ENDPOINT }),
    ...(env.B2B_XSD_REMOTE_URL && { xsdEndpoint: env.B2B_XSD_REMOTE_URL }),
  };

  const client = await createB2BClient(options);

  const fixtureFiles = await findFixtureFiles(join(ROOT_DIR, 'src'));
  console.log(`Found ${fixtureFiles.length} fixture files.`);

  for (const filePath of fixtureFiles) {
    const relativePath = relative(ROOT_DIR, filePath);
    console.log(`\nProcessing ${relativePath}...`);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const module = await import(filePath);
      const fixtureName = basename(filePath, '.ts');
      const fixturesDir = dirname(filePath);
      const artifactsDir = join(fixturesDir, fixtureName);

      // Ensure artifacts directory exists
      await mkdir(artifactsDir, { recursive: true });

      for (const [exportName, fixture] of Object.entries(module)) {
        if (!(fixture instanceof Fixture)) {
          continue;
        }

        console.log(
          `  - Recording fixture: ${exportName} (${fixture._description})...`,
        );

        try {
          const setupStart = new Date();
          const variables = fixture._setup
            ? await fixture._setup(client)
            : undefined;

          // Capture mock date (ensure it matches the execution time)
          const mockDate = setupStart.toISOString();

          if (!fixture._run) {
            console.warn(
              `    ⚠️  Skipping ${exportName}: No run function defined.`,
            );
            continue;
          }

          const result = await fixture._run(client, variables);

          // Capture XML response
          // We need to cast to access the internal soap client properties
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const serviceClient = (client as any)[fixture.info.service];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const lastResponse = (serviceClient as any).__soapClient.lastResponse;

          if (!lastResponse) {
            throw new Error(
              'No SOAP response captured. Did the run function execute a SOAP query?',
            );
          }

          // Write Artifacts

          // 1. Context
          const context = {
            meta: { mockDate },
            variables,
          };
          await writeFile(
            join(artifactsDir, `${exportName}.context.json`),
            JSON.stringify(context, null, 2),
          );

          // 2. Mock XML
          await writeFile(
            join(artifactsDir, `${exportName}.mock.xml`),
            lastResponse,
          );

          console.log(`    ✅ Success`);
        } catch (err) {
          console.error(`    ❌ Failed to record ${exportName}:`, err);
          // We don't stop the whole process, just this fixture
        }
      }
    } catch (err) {
      console.error(`Failed to load module ${relativePath}:`, err);
    }
  }

  console.log('\n✨ Recording complete.');
}

record().catch((err) => {
  console.error('Fatal error during recording:', err);
  process.exit(1);
});
