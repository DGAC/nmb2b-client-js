import assert from 'node:assert';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { EventEmitter } from 'node:events';
import type { B2BClient } from '../../../src/index.ts';
import { FixtureArtifacts, toRecordedExchange, type FixtureLocation } from '../artifacts.ts';
import type {
  FixtureOutcome,
  FixtureRunContext,
  IFixtureRunnable,
  RecordedExchange,
  RecordedExchangeId,
} from '../fixtures.ts';
import { withFakeSystemTime } from '../withFakeSystemTime.ts';

/**
 * A recorded exchange id: part of the fixture artifact file names, `<scenario>.<id>.request.xml`.
 */
const RECORDED_EXCHANGE_ID = /^[a-z][a-zA-Z0-9]*$/;

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

  const variables = await setupRecording(client);
  const recordedAt = new Date().toISOString();

  using exchangeCapture = captureExchanges(client);
  // Recorded exchange ids by request body: replay tells exchanges apart only by request body.
  const recordedIds = new Map<string, RecordedExchangeId>();
  const usedIds = new Set<RecordedExchangeId>();

  const runContext: FixtureRunContext = {
    recordExchange: async (id, call) => {
      assert(
        RECORDED_EXCHANGE_ID.test(id),
        `Invalid recorded exchange id "${id}": it must match /${RECORDED_EXCHANGE_ID.source}/.`,
      );
      assert(!usedIds.has(id), `Recorded exchange id "${id}" is used twice.`);
      usedIds.add(id);

      const { result, sent } = await exchangeCapture.during(call);

      assert(
        sent.size === 1,
        `recordExchange("${id}") must send exactly one SOAP request, it sent ${sent.size}.`,
      );
      const [exchange] = sent.values();
      assert(exchange?.reply !== undefined, `No B2B reply captured for "${id}".`);

      const sameRequestId = recordedIds.get(exchange.request);
      assert(
        sameRequestId === undefined,
        `Recorded exchange "${id}" sent the same request as "${sameRequestId}": replay could not tell them apart.`,
      );
      recordedIds.set(exchange.request, id);

      return {
        result,
        exchanges: { [id]: toRecordedExchange(exchange.request, exchange.reply) } as Record<
          typeof id,
          RecordedExchange
        >,
      };
    },
  };

  const outcome = await withDateFrozenAt(new Date(recordedAt), () =>
    executeOperation(client, variables, runContext),
  );

  if (outcome.exchanges !== undefined) {
    const { outside } = exchangeCapture;
    assert(
      outside.length === 0,
      `${outside.length} SOAP request(s) sent outside recordExchange(): the replay would not serve them.`,
    );

    await artifacts.write({ recordedAt, variables, exchanges: outcome.exchanges });
    return { variables, result: outcome.result, exchanges: outcome.exchanges };
  }

  const reply = client[service].__soapClient.lastResponse as unknown;

  assert(
    reply && typeof reply === 'string',
    'No SOAP response captured. Did the executeOperation execute a SOAP query?',
  );

  await artifacts.write({ recordedAt, variables, reply });

  return { variables, result: outcome.result, exchanges: {} };
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
