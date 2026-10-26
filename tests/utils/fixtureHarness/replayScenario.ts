// DisposableStack is native from Node 24; tests also run on Node 22.
import 'core-js/actual/disposable-stack/index.js';
import { http, HttpResponse } from 'msw';
import type { B2BClient } from '../../../src/index.ts';
import {
  FixtureArtifacts,
  type FixtureArtifactContents,
  type FixtureLocation,
} from '../artifacts.ts';
import type {
  FixtureOutcome,
  FixtureRunContext,
  IFixtureRunnable,
  RecordedExchangeId,
  ReplayedExchange,
} from '../fixtures.ts';
import { server, SOAP_ENDPOINT } from '../msw.ts';
import { withFakeSystemTime } from '../withFakeSystemTime.ts';

/**
 * A fixture replay in progress: dispose it to restore the clock.
 */
export interface FixtureReplay<TVariables, TResult>
  extends Omit<FixtureOutcome<TVariables, TResult>, 'exchanges'>, Disposable {
  /**
   * The recorded exchanges returned by `.run()`, each with the MSW handler that served it.
   */
  readonly exchanges: Record<RecordedExchangeId, ReplayedExchange>;
}

/**
 * Fixture replay: runs the fixture scenario offline from the fixture artifacts
 * next to `location`. MSW serves each recorded exchange's reply only to a POST whose
 * body is byte-identical to its recorded request, so that a changed request fails
 * the replay; a scenario without recorded exchanges gets its reply served to any POST.
 *
 * The clock stays frozen at `recordedAt` until the returned replay is disposed, so that
 * the scenario's tests run at the recorded date too: `using replay = await replayScenario(...)`.
 *
 * Must run inside a Vitest test.
 */
export async function replayScenario<TVariables, TResult>(
  fixture: IFixtureRunnable<TVariables, TResult>,
  client: B2BClient,
  location: FixtureLocation,
): Promise<FixtureReplay<TVariables, TResult>> {
  const artifacts = new FixtureArtifacts<TVariables>(location);
  const contents = await artifacts.read();
  const { recordedAt, variables } = contents;

  // Scoped to the caller's `server.boundary`, if any; otherwise reset after each test by `tests/setupMsw.ts`.
  const replayed = installReplayHandlers(contents);

  const runContext: FixtureRunContext = {
    recordExchange: async (id, call) => {
      const exchange = replayed[id];
      if (exchange === undefined) {
        throw new Error(
          `No recorded exchange "${id}" in the fixture artifacts: re-record the fixture scenario.`,
        );
      }

      const result = await call();
      return { result, exchanges: { [id]: exchange } as Record<typeof id, ReplayedExchange> };
    },
  };

  using stack = new DisposableStack();
  stack.use(withFakeSystemTime(new Date(recordedAt)));

  const outcome = await fixture.executeOperation(client, variables, runContext);
  // Looked up by id rather than taken from `.run()`, which only knows them as recorded exchanges.
  const exchanges = Object.fromEntries(
    Object.keys(outcome.exchanges ?? {}).flatMap((id) => {
      const exchange = replayed[id];
      return exchange ? [[id, exchange] as const] : [];
    }),
  );

  // Hand the clock over to the caller; on throw, `stack` restores it here.
  const replay = stack.move();
  return {
    variables,
    result: outcome.result,
    exchanges,
    [Symbol.dispose]: () => {
      replay.dispose();
    },
  };
}

/**
 * Installs the MSW handlers serving the fixture artifacts, and returns the recorded
 * exchanges on disk with their handler, by id.
 */
function installReplayHandlers(
  contents: FixtureArtifactContents,
): Record<RecordedExchangeId, ReplayedExchange> {
  if (contents.exchanges === undefined) {
    const { reply } = contents;
    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(reply)));
    return {};
  }

  const endpoint = new URL(SOAP_ENDPOINT).href;
  const replayed: Record<RecordedExchangeId, ReplayedExchange> = {};
  for (const [id, exchange] of Object.entries(contents.exchanges)) {
    // A request matching no recorded exchange, or one already replayed, gets MSW's unhandled request error.
    const handler = http.post(
      async ({ request }) =>
        request.url === endpoint && (await request.clone().text()) === exchange.request.body,
      () => HttpResponse.xml(exchange.reply.body),
      { once: true },
    );
    server.use(handler);
    replayed[id] = { ...exchange, handler };
  }

  return replayed;
}
