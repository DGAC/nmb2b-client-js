// DisposableStack is native from Node 24; tests also run on Node 22.
import 'core-js/actual/disposable-stack/index.js';
import { http, HttpResponse } from 'msw';
import type { B2BClient } from '../../../src/index.ts';
import { FixtureArtifacts, type FixtureLocation } from '../artifacts.ts';
import type { FixtureOutcome, IFixtureRunnable } from '../fixtures.ts';
import { server, SOAP_ENDPOINT } from '../msw.ts';
import { withFakeSystemTime } from '../withFakeSystemTime.ts';

/**
 * A fixture replay in progress: dispose it to restore the clock.
 */
export interface FixtureReplay<TVariables, TResult>
  extends FixtureOutcome<TVariables, TResult>, Disposable {}

/**
 * Fixture replay: runs the fixture scenario offline from the fixture artifacts
 * next to `location`, MSW serving the recorded reply to any POST. The clock stays
 * frozen at `recordedAt` until the returned replay is disposed, so that the
 * scenario's tests run at the recorded date too:
 * `using replay = await replayScenario(...)`.
 *
 * Must run inside a Vitest test.
 */
export async function replayScenario<TVariables, TResult>(
  fixture: IFixtureRunnable<TVariables, TResult>,
  client: B2BClient,
  location: FixtureLocation,
): Promise<FixtureReplay<TVariables, TResult>> {
  const artifacts = new FixtureArtifacts<TVariables>(location);
  const { recordedAt, variables, reply } = await artifacts.read();

  // Scoped to the caller's `server.boundary`, if any; otherwise reset after each test by `tests/setupMsw.ts`.
  server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(reply)));

  using stack = new DisposableStack();
  stack.use(withFakeSystemTime(new Date(recordedAt)));

  const result = await fixture.executeOperation(client, variables);

  // Hand the clock over to the caller; on throw, `stack` restores it here.
  const replay = stack.move();
  return {
    variables,
    result,
    [Symbol.dispose]: () => {
      replay.dispose();
    },
  };
}
