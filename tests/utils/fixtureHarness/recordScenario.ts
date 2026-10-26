import assert from 'node:assert';
import type { B2BClient } from '../../../src/index.ts';
import { FixtureArtifacts, toRecordedExchange, type FixtureLocation } from '../artifacts.ts';
import type {
  FixtureOutcome,
  FixtureRunContext,
  IFixtureRunnable,
  RecordedExchange,
} from '../fixtures.ts';
import { withFakeSystemTime } from '../withFakeSystemTime.ts';

/**
 * Fixture recording: runs the fixture scenario against `client` and writes its
 * fixture artifacts next to `location`: `context.json`, and either its recorded
 * exchanges or, for a scenario that does not call `recordExchange()`, the B2B reply.
 *
 * `setup` runs with the real clock; `.run()` with `Date` frozen at `recordedAt`, as on replay.
 */
export async function recordScenario<TVariables, TResult>(
  fixture: IFixtureRunnable<TVariables, TResult>,
  client: B2BClient,
  location: FixtureLocation,
): Promise<FixtureOutcome<TVariables, TResult>> {
  const { service, setupRecording, executeOperation } = fixture;
  const artifacts = new FixtureArtifacts<TVariables>(location);
  const soapClient = client[service].__soapClient;

  const variables = await setupRecording(client);
  const recordedAt = new Date().toISOString();

  const runContext: FixtureRunContext = {
    recordExchange: async (id, call) => {
      soapClient.lastRequest = undefined;
      soapClient.lastResponse = undefined;

      const result = await call();

      const request = soapClient.lastRequest as unknown;
      const reply = soapClient.lastResponse as unknown;
      assert(
        typeof request === 'string' && typeof reply === 'string',
        `No SOAP exchange captured for "${id}". Did recordExchange() wrap a SOAP query?`,
      );

      return {
        result,
        exchanges: { [id]: toRecordedExchange(request, reply) } as Record<
          typeof id,
          RecordedExchange
        >,
      };
    },
  };

  // No `using`: this file also runs under plain Node 22, outside Vitest.
  const clock = withFakeSystemTime(new Date(recordedAt));
  const outcome = await executeOperation(client, variables, runContext).finally(() => {
    clock[Symbol.dispose]();
  });

  if (outcome.exchanges !== undefined) {
    await artifacts.write({ recordedAt, variables, exchanges: outcome.exchanges });
    return { variables, result: outcome.result, exchanges: outcome.exchanges };
  }

  const reply = soapClient.lastResponse as unknown;

  assert(
    reply && typeof reply === 'string',
    'No SOAP response captured. Did the executeOperation execute a SOAP query?',
  );

  await artifacts.write({ recordedAt, variables, reply });

  return { variables, result: outcome.result, exchanges: {} };
}
