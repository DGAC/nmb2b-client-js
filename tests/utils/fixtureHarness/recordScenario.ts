import assert from 'node:assert';
import type { B2BClient } from '../../../src/index.ts';
import { FixtureArtifacts, type FixtureLocation } from '../artifacts.ts';
import { asCompleteFixture, type FixtureOutcome, type IFixtureRunnable } from '../fixtures.ts';

/**
 * Fixture recording: runs the fixture scenario against `client` and writes its
 * fixture artifacts (`context.json` and the B2B reply) next to `location`.
 */
export async function recordScenario<TVariables, TResult>(
  fixture: IFixtureRunnable<TVariables, TResult>,
  client: B2BClient,
  location: FixtureLocation,
): Promise<FixtureOutcome<TVariables, TResult>> {
  const { service, setupRecording, executeOperation } = asCompleteFixture(fixture, location);
  const artifacts = new FixtureArtifacts<TVariables>(location);

  const setupStart = new Date();
  const variables = (setupRecording ? await setupRecording(client) : undefined) as TVariables;

  // Capture mock date (ensure it matches the execution time)
  const mockDate = setupStart.toISOString();

  const result = await executeOperation(client, variables);

  const lastResponse = client[service].__soapClient.lastResponse as unknown;

  assert(
    lastResponse && typeof lastResponse === 'string',
    'No SOAP response captured. Did the executeOperation execute a SOAP query?',
  );

  await artifacts.saveContext({
    meta: { mockDate },
    variables,
  });

  await artifacts.saveMock(lastResponse);

  return { variables, result };
}
