// DisposableStack is native from Node 24; tests also run on Node 22.
import 'core-js/actual/disposable-stack/index.js';
import { http, HttpResponse } from 'msw';
import { format } from 'oxfmt';
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
  RecordedExchange,
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
 * the replay with an error showing it; a scenario without recorded exchanges gets its reply served to any POST.
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
  const unmatchedRequests: Array<string> = [];
  const replayed = installReplayHandlers(contents, (body) => unmatchedRequests.push(body));

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

  // The client only sees a network error: fail with what went wrong instead, even when `.run()` caught it.
  const failOnUnmatchedRequest = async (cause?: unknown) => {
    const [body] = unmatchedRequests;
    if (body !== undefined && contents.exchanges !== undefined) {
      throw await unmatchedRequestError(body, contents.exchanges, { cause });
    }
  };
  const outcome = await fixture
    .executeOperation(client, variables, runContext)
    .catch(async (error: unknown) => {
      await failOnUnmatchedRequest(error);
      throw error;
    });
  await failOnUnmatchedRequest();

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
 * exchanges on disk with their handler, by id. A POST matching no recorded exchange, or one
 * already replayed, is handed to `onUnmatchedRequest` and gets a network error.
 */
function installReplayHandlers(
  contents: FixtureArtifactContents,
  onUnmatchedRequest: (body: string) => void,
): Record<RecordedExchangeId, ReplayedExchange> {
  if (contents.exchanges === undefined) {
    const { reply } = contents;
    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(reply)));
    return {};
  }

  const { exchanges } = contents;
  // Installed first, so that the exchanges' handlers take precedence over it.
  server.use(
    http.post(SOAP_ENDPOINT, async ({ request }) => {
      onUnmatchedRequest(await request.text());
      return HttpResponse.error();
    }),
  );

  const endpoint = new URL(SOAP_ENDPOINT).href;
  const replayed: Record<RecordedExchangeId, ReplayedExchange> = {};
  for (const [id, exchange] of Object.entries(exchanges)) {
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

/**
 * The error replay fails with on a POST matching no recorded exchange, for the scenario author.
 */
async function unmatchedRequestError(
  body: string,
  exchanges: Record<RecordedExchangeId, RecordedExchange>,
  options: ErrorOptions,
): Promise<Error> {
  // Formatted for display only: matching compares the raw body.
  const { code, errors } = await format('request.html', body, {
    htmlWhitespaceSensitivity: 'ignore',
  });
  const formatted = errors.length === 0 ? code : body;

  // Recording rejects two exchanges with identical requests: the body equals at most one of them.
  const replayedId = Object.entries(exchanges).find(
    ([, exchange]) => exchange.request.body === body,
  )?.[0];
  if (replayedId !== undefined) {
    return new Error(
      `The request of the recorded exchange "${replayedId}" was sent again, after its reply was replayed: each recorded exchange is replayed once.\n\nRequest sent:\n${formatted}`,
      options,
    );
  }

  const expectedIds = Object.keys(exchanges)
    .map((id) => `"${id}"`)
    .join(', ');
  return new Error(
    `The request matches no recorded exchange of the fixture scenario (expected: ${expectedIds}): re-record the fixture scenario if the change is intended.\n\nRequest sent:\n${formatted}`,
    options,
  );
}
