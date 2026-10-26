import assert from 'node:assert';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { EventEmitter } from 'node:events';
import type { B2BClient } from '../../../src/index.ts';
import { FixtureArtifacts, toRecordedExchange, type FixtureLocation } from '../artifacts.ts';
import { deserializeFixtureContext, serializeFixtureContext } from '../fixtureContext.ts';
import {
  RECORDED_EXCHANGE_ID,
  type FixtureOutcome,
  type FixtureRunContext,
  type IFixtureRunnable,
  type RecordedExchange,
  type RecordedExchangeId,
} from '../fixtures.ts';
import { withFakeSystemTime } from '../withFakeSystemTime.ts';

/**
 * Fixture recording: runs the fixture scenario against `client` and writes its
 * fixture artifacts next to `location`: `context.json` and its recorded exchanges.
 *
 * `setup` runs with the real clock; `.run()` with `Date` frozen at `recordedAt`, as on replay.
 * `.run()` receives the variables read back from their serialization, as on replay.
 */
export async function recordScenario<TVariables, TResult>(
  fixture: IFixtureRunnable<TVariables, TResult>,
  client: B2BClient,
  location: FixtureLocation,
): Promise<FixtureOutcome<TVariables, TResult>> {
  const { setupRecording, executeOperation } = fixture;
  const artifacts = new FixtureArtifacts<TVariables>(location);

  // Wrapped: without `.setup()`, the variables are `undefined`, which JSON cannot hold alone.
  const { variables } = deserializeFixtureContext(
    serializeFixtureContext({ variables: await setupRecording(client) }),
  ) as { variables: TVariables };
  const recordedAt = new Date();

  using exchangeCapture = captureExchanges(client);
  // Replay tells recorded exchanges apart only by request body.
  const idByRequestBody = new Map<string, RecordedExchangeId>();
  const usedIds = new Set<RecordedExchangeId>();
  // Checked again after `.run()`, which could catch them and still return exchanges.
  const failedChecks: Array<string> = [];

  function failRecordingUnless(condition: boolean, message: string): asserts condition {
    if (!condition) {
      failedChecks.push(message);
      assert.fail(message);
    }
  }

  const runContext: FixtureRunContext = {
    recordExchange: async (id, call) => {
      failRecordingUnless(
        RECORDED_EXCHANGE_ID.test(id),
        `Invalid recorded exchange id "${id}": it must match /${RECORDED_EXCHANGE_ID.source}/.`,
      );
      failRecordingUnless(!usedIds.has(id), `Recorded exchange id "${id}" is used twice.`);
      usedIds.add(id);

      const { result, sent } = await exchangeCapture.during(call).catch((error: unknown) => {
        // A B2B error records no exchange: `.run()` may retry under the same id.
        usedIds.delete(id);
        throw error;
      });

      failRecordingUnless(
        sent.size === 1,
        `recordExchange("${id}") must send exactly one SOAP request, it sent ${sent.size}.`,
      );
      const [exchange] = sent.values();
      failRecordingUnless(exchange?.reply !== undefined, `No B2B reply captured for "${id}".`);

      const sameRequestId = idByRequestBody.get(exchange.request);
      failRecordingUnless(
        sameRequestId === undefined,
        `Recorded exchange "${id}" sent the same request as "${sameRequestId}": replay could not tell them apart.`,
      );
      idByRequestBody.set(exchange.request, id);

      return {
        result,
        exchanges: { [id]: toRecordedExchange(exchange.request, exchange.reply) } as Record<
          typeof id,
          RecordedExchange
        >,
      };
    },
  };

  const outcome = await withDateFrozenAt(recordedAt, () =>
    executeOperation(client, variables, runContext),
  );

  assert(
    failedChecks.length === 0,
    `recordExchange() failed, caught by .run(): ${failedChecks.join(' ')}`,
  );

  const { outside } = exchangeCapture;
  assert(
    outside.length === 0,
    `${outside.length} SOAP request(s) sent outside recordExchange(): the replay would not serve them.`,
  );
  assert(
    Object.keys(outcome.exchanges).length > 0,
    '.run() recorded no exchange: wrap its SOAP calls in recordExchange() and return their exchanges.',
  );

  await artifacts.write({ recordedAt, variables, exchanges: outcome.exchanges });
  return { variables, result: outcome.result, exchanges: outcome.exchanges };
}

interface SentExchange {
  request: string;
  reply?: string;
}

/**
 * The SOAP exchanges sent by one call, by node-soap exchange id (`eid`), which pairs a response with its request.
 */
type SentExchanges = Map<string, SentExchange>;

/**
 * Listens to the SOAP clients of every service of `client`, until disposed. `during(call)` returns
 * the SOAP exchanges sent by `call`: those of concurrent calls go to their own `during()`.
 * `outside` lists the node-soap exchange ids of the requests sent outside any `during()`.
 */
function captureExchanges(client: B2BClient) {
  const current = new AsyncLocalStorage<SentExchanges>();
  const outside: Array<string> = [];

  function onRequest(request: string, eid: string) {
    const store = current.getStore();
    if (!store) {
      outside.push(eid);
      return;
    }

    store.set(eid, { request });
  }

  function onResponse(reply: unknown, _response: unknown, eid: string) {
    const store = current.getStore();
    if (!store || typeof reply !== 'string') {
      return;
    }

    const exchange = store.get(eid);
    if (exchange) {
      exchange.reply = reply;
    }
  }

  const stack = new DisposableStack();
  for (const service of Object.values(client)) {
    // `soap.Client`'s `[method: string]: any` index signature hides its EventEmitter typings.
    const soapClient: EventEmitter = service.__soapClient;
    soapClient.on('request', onRequest);
    soapClient.on('response', onResponse);
    stack.defer(() => {
      soapClient.off('request', onRequest);
      soapClient.off('response', onResponse);
    });
  }

  return {
    outside,
    async during<T>(call: () => Promise<T>): Promise<{ result: T; sent: SentExchanges }> {
      const sent: SentExchanges = new Map();
      const result = await current.run(sent, call);
      return { result, sent };
    },
    [Symbol.dispose]: () => {
      stack.dispose();
    },
  };
}

async function withDateFrozenAt<T>(now: Date, run: () => Promise<T>): Promise<T> {
  using stack = new DisposableStack();
  stack.use(withFakeSystemTime(now));
  return await run();
}
