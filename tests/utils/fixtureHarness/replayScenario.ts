import { http, HttpResponse } from 'msw';
import { onTestFinished, vi } from 'vitest';
import type { B2BClient } from '../../../src/index.ts';
import { FixtureArtifacts, type FixtureLocation } from '../artifacts.ts';
import { asCompleteFixture, type FixtureOutcome, type IFixtureRunnable } from '../fixtures.ts';
import { server, SOAP_ENDPOINT } from '../msw.ts';

/**
 * Fixture replay: runs the fixture scenario offline from the fixture artifacts
 * next to `location`. Until the end of the current Vitest test, the clock stays
 * frozen at `recordedAt` and MSW serves the recorded reply to any POST.
 *
 * Must run inside a Vitest test.
 */
export async function replayScenario<TVariables, TResult>(
  fixture: IFixtureRunnable<TVariables, TResult>,
  client: B2BClient,
  location: FixtureLocation,
): Promise<FixtureOutcome<TVariables, TResult>> {
  const { executeOperation } = asCompleteFixture(fixture, location);
  const artifacts = new FixtureArtifacts<TVariables>(location);
  const { recordedAt, variables, reply } = await artifacts.read();

  // Scoped to the caller's `server.boundary`, if any; otherwise reset after each test by `tests/setupMsw.ts`.
  server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(reply)));

  vi.setSystemTime(new Date(recordedAt));
  onTestFinished(() => {
    vi.useRealTimers();
  });

  const result = await executeOperation(client, variables);
  return { variables, result };
}
