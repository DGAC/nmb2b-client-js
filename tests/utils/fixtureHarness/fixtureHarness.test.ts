// DisposableStack is native from Node 24; tests also run on Node 22. recordScenario needs it
// here, outside `pnpm update-fixtures` (which requires Node 24).
import 'core-js/actual/disposable-stack/index.js';
import assert from 'node:assert';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, test } from 'vitest';

import { createB2BClient } from '../../../src/index.ts';
import { TEST_B2B_OPTIONS } from '../../options.ts';
import { FixtureArtifacts, type FixtureLocation } from '../artifacts.ts';
import { defineFixture, expectRecordedRequests, type RecordedExchangeId } from '../fixtures.ts';
import { server, SOAP_ENDPOINT } from '../msw.ts';
import { recordScenario } from './recordScenario.ts';
import { replayScenario, type FixtureReplay } from './replayScenario.ts';

const OTMV_PLAN_REPLY = `<?xml version='1.0' encoding='utf-8'?><S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/"><S:Body><fw:OTMVPlanRetrievalReply xmlns:fw="eurocontrol/cfmu/b2b/FlowServices"><requestReceptionTime>2026-08-02 16:00:56</requestReceptionTime><requestId>B2B_CUR2:1</requestId><sendTime>2026-08-02 16:00:56</sendTime><status>OK</status><data><plans><dataId>O1</dataId><dataset><type>OPERATIONAL</type></dataset><day>2026-08-02</day><planTransferred>true</planTransferred><planCutOffReached>true</planCutOffReached></plans></data></fw:OTMVPlanRetrievalReply></S:Body></S:Envelope>`;

const scenario = defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' })
  .setup(() => Promise.resolve({ day: new Date('2026-08-02'), trafficVolume: 'LFEKD' }))
  .run((client, { day, trafficVolume }, { recordExchange }) =>
    recordExchange('retrieveOTMVPlan', () =>
      client.Flow.retrieveOTMVPlan({
        dataset: { type: 'OPERATIONAL' },
        day,
        otmvsWithDuration: { item: [{ trafficVolume }] },
      }),
    ),
  );

function otmvPlanScenario({ trafficVolume }: { trafficVolume: string }) {
  return defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' })
    .setup(() => Promise.resolve({ day: new Date('2026-08-02') }))
    .run((client, { day }, { recordExchange }) =>
      recordExchange('retrieveOTMVPlan', () =>
        client.Flow.retrieveOTMVPlan({
          dataset: { type: 'OPERATIONAL' },
          day,
          otmvsWithDuration: { item: [{ trafficVolume }] },
        }),
      ),
    );
}

function otmvPlanScenarioCatchingErrors({ trafficVolume }: { trafficVolume: string }) {
  const scenario = otmvPlanScenario({ trafficVolume });
  return defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' })
    .setup(() => Promise.resolve({ day: new Date('2026-08-02') }))
    .run(async (client, variables, runContext) => {
      try {
        return await scenario.executeOperation(client, variables, runContext);
      } catch {
        return { result: null, exchanges: {} };
      }
    });
}

function sendTwiceScenario() {
  return defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' })
    .setup(() => Promise.resolve({ day: new Date('2026-08-02') }))
    .run((client, { day }, { recordExchange }) =>
      recordExchange('retrieveOTMVPlan', async () => {
        const request = {
          dataset: { type: 'OPERATIONAL' as const },
          day,
          otmvsWithDuration: { item: [{ trafficVolume: 'LFEKD' }] },
        };
        await client.Flow.retrieveOTMVPlan(request);
        return client.Flow.retrieveOTMVPlan(request);
      }),
    );
}

function sendsNothingScenario() {
  return defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' }).run(
    (_client, _variables, { recordExchange }) =>
      recordExchange('retrieveOTMVPlan', () => Promise.resolve(null)),
  );
}

function recordsNothingScenario() {
  return defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' }).run(() =>
    Promise.resolve({ result: null, exchanges: {} }),
  );
}

function sameRequestTwiceScenario() {
  return defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' }).run(
    async (client, _variables, { recordExchange }) => {
      const request = { dataset: { type: 'OPERATIONAL' as const }, day: new Date('2026-08-02') };
      const first = await recordExchange('first', () => client.Flow.retrieveOTMVPlan(request));
      const second = await recordExchange('second', () => client.Flow.retrieveOTMVPlan(request));
      return { result: null, exchanges: { ...first.exchanges, ...second.exchanges } };
    },
  );
}

function catchesFailedRecordExchangeScenario() {
  return defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' }).run(
    async (client, _variables, { recordExchange }) => {
      const request = { dataset: { type: 'OPERATIONAL' as const }, day: new Date('2026-08-02') };
      const [first] = await Promise.allSettled([
        recordExchange('first', () => client.Flow.retrieveOTMVPlan(request)),
        recordExchange('Second', () => client.Flow.retrieveOTMVPlan(request)),
      ]);
      assert(first.status === 'fulfilled');
      return first.value;
    },
  );
}

function retriesAfterB2BErrorScenario() {
  return defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' }).run(
    async (client, _variables, { recordExchange }) => {
      const retrieve = () =>
        client.Flow.retrieveOTMVPlan({
          dataset: { type: 'OPERATIONAL' },
          day: new Date('2026-08-02'),
        });
      try {
        return await recordExchange('retrieveOTMVPlan', retrieve);
      } catch {
        return recordExchange('retrieveOTMVPlan', retrieve);
      }
    },
  );
}

function concurrentScenario() {
  return defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' }).run(
    async (client, _variables, { recordExchange }) => {
      const outcomes = await Promise.all(
        ['LFEKD', 'LFEEKD'].map((trafficVolume, index) =>
          recordExchange(`exchange${index}`, () =>
            client.Flow.retrieveOTMVPlan({
              dataset: { type: 'OPERATIONAL' },
              day: new Date('2026-08-02'),
              otmvsWithDuration: { item: [{ trafficVolume }] },
            }),
          ),
        ),
      );
      return {
        result: outcomes.map(({ result }) => result),
        exchanges: Object.assign({}, ...outcomes.map(({ exchanges }) => exchanges)),
      };
    },
  );
}

function multiExchangeScenario({
  exchangeIds,
}: {
  exchangeIds: ReadonlyArray<RecordedExchangeId>;
}) {
  return defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' }).run(
    async (client, _variables, { recordExchange }) => {
      let outcome = { result: [] as Array<unknown>, exchanges: {} };
      for (const [index, id] of exchangeIds.entries()) {
        const { result, exchanges } = await recordExchange(id, () =>
          client.Flow.retrieveOTMVPlan({
            dataset: { type: 'OPERATIONAL' },
            day: new Date('2026-08-02'),
            otmvsWithDuration: { item: [{ trafficVolume: `LFEK${index}` }] },
          }),
        );
        outcome = {
          result: [...outcome.result, result],
          exchanges: { ...outcome.exchanges, ...exchanges },
        };
      }
      return outcome;
    },
  );
}

/**
 * A fixture scenario whose `.setup()` returns `variables`, and whose `.run()` hands them to `onRun`.
 */
function variablesProbeScenario<TVariables>(
  variables: TVariables,
  onRun: (variables: TVariables) => void,
) {
  return defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' })
    .setup(() => Promise.resolve(variables))
    .run((client, variables, { recordExchange }) => {
      onRun(variables);
      return recordExchange('retrieveOTMVPlan', () =>
        client.Flow.retrieveOTMVPlan({
          dataset: { type: 'OPERATIONAL' },
          day: new Date('2026-08-02'),
        }),
      );
    });
}

/**
 * Runs `expectRecordedRequests()` on a fixture replay, as `registerFixtures` does for a scenario's test.
 */
function checkRecordedRequests(
  replay: FixtureReplay<unknown, unknown>,
  fixtureLocation: FixtureLocation,
): Promise<void> | void {
  const { result, exchanges, variables } = replay;
  return expectRecordedRequests()({ expect, fixtureLocation, result, exchanges, variables });
}

describe('fixture harness', () => {
  let location: FixtureLocation;

  beforeEach(async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'nmb2b-fixture-harness-'));
    location = { filePath: path.join(dir, 'retrieveOTMVPlan.ts'), exportName: 'throwaway' };
    return () => fs.rm(dir, { recursive: true, force: true });
  });

  test('replays a recorded scenario from its artifacts, without B2B', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);

    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY)));
    const recorded = await recordScenario(scenario, client, location);
    server.resetHandlers();

    using replayed = await replayScenario(scenario, client, location);

    expect(replayed.variables).toEqual({ day: new Date('2026-08-02'), trafficVolume: 'LFEKD' });
    expect(replayed.result.data.plans.dataId).toBe('O1');
    expect(replayed.result).toEqual(recorded.result);
  });

  test('hands .run() the same variables on recording and on replay, Dates included', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);
    const received: Array<unknown> = [];
    const scenario = variablesProbeScenario(
      {
        queryPeriod: {
          wef: new Date('2026-08-02T15:00:00Z'),
          unt: new Date('2026-08-02T17:00:00Z'),
        },
        days: [new Date('2026-08-02T00:00:00Z')],
        comment: undefined,
      },
      (variables) => received.push(variables),
    );

    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY)));
    await recordScenario(scenario, client, location);
    server.resetHandlers();

    using replayed = await replayScenario(scenario, client, location);

    const expected = {
      queryPeriod: {
        wef: new Date('2026-08-02T15:00:00.000Z'),
        unt: new Date('2026-08-02T17:00:00.000Z'),
      },
      days: [new Date('2026-08-02T00:00:00.000Z')],
    };
    expect(received).toStrictEqual([expected, expected]);
    expect(replayed.variables).toStrictEqual(expected);
  });

  test('replays a recorded exchange from its artifacts', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);

    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY)));
    const recorded = await recordScenario(
      otmvPlanScenario({ trafficVolume: 'LFEKD' }),
      client,
      location,
    );
    server.resetHandlers();

    using replayed = await replayScenario(
      otmvPlanScenario({ trafficVolume: 'LFEKD' }),
      client,
      location,
    );

    expect(replayed.result.data.plans.dataId).toBe('O1');
    expect(replayed.result).toEqual(recorded.result);
    expect(Object.keys(replayed.exchanges)).toEqual(['retrieveOTMVPlan']);
    expect(replayed.exchanges.retrieveOTMVPlan?.reply.body).toBe(OTMV_PLAN_REPLY);
  });

  test('fails the replay when the request changed since the recording', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);

    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY)));
    await recordScenario(otmvPlanScenario({ trafficVolume: 'LFEKD' }), client, location);
    server.resetHandlers();

    const replay = replayScenario(otmvPlanScenario({ trafficVolume: 'LFEEKD' }), client, location);

    await expect(replay).rejects.toThrow(/matches no recorded exchange.*"retrieveOTMVPlan"/s);
    await expect(replay).rejects.toThrow(/\n {6}<otmvsWithDuration>\n.*<trafficVolume>LFEEKD</s);
  });

  test('fails the replay on a changed request even when .run() catches its failure', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);

    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY)));
    await recordScenario(otmvPlanScenario({ trafficVolume: 'LFEKD' }), client, location);
    server.resetHandlers();

    await expect(
      replayScenario(otmvPlanScenarioCatchingErrors({ trafficVolume: 'LFEEKD' }), client, location),
    ).rejects.toThrow(/matches no recorded exchange/);
  });

  test('fails the replay when a recorded request is sent twice', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);

    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY)));
    await recordScenario(otmvPlanScenario({ trafficVolume: 'LFEKD' }), client, location);
    server.resetHandlers();

    await expect(replayScenario(sendTwiceScenario(), client, location)).rejects.toThrow(
      /request of the recorded exchange "retrieveOTMVPlan" was sent again/,
    );
  });

  test('fails the replay when the fixture artifacts hold no recorded exchange', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);

    // As left by recorded exchanges deleted by hand: recording itself refuses a scenario without any.
    await new FixtureArtifacts(location).write({
      recordedAt: new Date('2026-08-02T16:00:56.000Z'),
      variables: undefined,
      exchanges: {},
    });

    await expect(replayScenario(recordsNothingScenario(), client, location)).rejects.toThrow(
      /No recorded exchange in the fixture artifacts/,
    );
  });

  test('fails the recording when .run() records no exchange', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);

    await expect(recordScenario(recordsNothingScenario(), client, location)).rejects.toThrow(
      /\.run\(\) recorded no exchange/,
    );
    expect(await new FixtureArtifacts(location).exchangeIds()).toEqual([]);
  });

  test('fails the recording when recordExchange() sends two requests', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);

    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY)));

    await expect(recordScenario(sendTwiceScenario(), client, location)).rejects.toThrow(
      /exactly one SOAP request/,
    );
  });

  test('fails the recording when recordExchange() sends no request', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);

    await expect(recordScenario(sendsNothingScenario(), client, location)).rejects.toThrow(
      /exactly one SOAP request, it sent 0/,
    );
  });

  test.each(['RetrieveOTMVPlan', 'retrieve-otmv-plan', 'retrieve.otmv', ''])(
    'fails the recording on the invalid exchange id %j',
    async (id) => {
      const client = await createB2BClient(TEST_B2B_OPTIONS);
      const handler = http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY));

      server.use(handler);

      await expect(
        recordScenario(multiExchangeScenario({ exchangeIds: [id] }), client, location),
      ).rejects.toThrow(/Invalid recorded exchange id/);
      expect(handler.isUsed).toBe(false);
    },
  );

  test('fails the recording when an exchange id is used twice', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);

    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY)));

    await expect(
      recordScenario(multiExchangeScenario({ exchangeIds: ['first', 'first'] }), client, location),
    ).rejects.toThrow(/"first" is used twice/);
  });

  test('fails the recording when two exchanges send the same request', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);

    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY)));

    await expect(recordScenario(sameRequestTwiceScenario(), client, location)).rejects.toThrow(
      /"second" sent the same request as "first"/,
    );
  });

  test('records an exchange retried under the same id after a B2B error', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);

    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY)));
    server.use(
      http.post(SOAP_ENDPOINT, () => new HttpResponse(null, { status: 503 }), { once: true }),
    );
    const recorded = await recordScenario(retriesAfterB2BErrorScenario(), client, location);

    expect(recorded.exchanges.retrieveOTMVPlan?.reply.body).toBe(OTMV_PLAN_REPLY);
  });

  test('fails the recording when .run() catches a failed recordExchange()', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);

    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY)));

    await expect(
      recordScenario(catchesFailedRecordExchangeScenario(), client, location),
    ).rejects.toThrow(/caught by \.run\(\): Invalid recorded exchange id "Second"/);
    expect(await new FixtureArtifacts(location).exchangeIds()).toEqual([]);
  });

  test('fails the recording when a request is sent outside recordExchange()', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);
    const sendsOutside = defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' }).run(
      async (client, _variables, { recordExchange }) => {
        const request = { dataset: { type: 'OPERATIONAL' as const }, day: new Date('2026-08-02') };
        const recorded = await recordExchange('retrieveOTMVPlan', () =>
          client.Flow.retrieveOTMVPlan(request),
        );
        await client.Flow.retrieveOTMVPlan(request);
        return recorded;
      },
    );

    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY)));

    await expect(recordScenario(sendsOutside, client, location)).rejects.toThrow(
      /outside recordExchange\(\)/,
    );
  });

  test('records a request sent through another service than the fixture scenario', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);
    const otherService = defineFixture({ service: 'Flight', method: 'retrieveFlight' }).run(
      (client, _variables, { recordExchange }) =>
        recordExchange('retrieveOTMVPlan', () =>
          client.Flow.retrieveOTMVPlan({ dataset: { type: 'OPERATIONAL' }, day: new Date() }),
        ),
    );

    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY)));
    const recorded = await recordScenario(otherService, client, location);

    expect(recorded.exchanges.retrieveOTMVPlan?.request.body).toContain('OTMVPlanRetrievalRequest');
    expect(recorded.exchanges.retrieveOTMVPlan?.reply.body).toBe(OTMV_PLAN_REPLY);
  });

  test('records concurrent recordExchange() calls each with its own request', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);

    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY)));
    const recorded = await recordScenario(concurrentScenario(), client, location);

    expect(recorded.exchanges.exchange0?.request.body).toContain('<trafficVolume>LFEKD<');
    expect(recorded.exchanges.exchange1?.request.body).toContain('<trafficVolume>LFEEKD<');
  });

  test('replays concurrent recordExchange() calls each with its own reply', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);

    // Each request gets a reply naming its traffic volume, so that a swapped reply shows.
    server.use(
      http.post(SOAP_ENDPOINT, async ({ request }) => {
        const trafficVolume = /<trafficVolume>(\w+)</.exec(await request.text())?.[1];
        return HttpResponse.xml(OTMV_PLAN_REPLY.replace('O1', trafficVolume ?? 'missing'));
      }),
    );
    await recordScenario(concurrentScenario(), client, location);
    server.resetHandlers();

    using replayed = await replayScenario(concurrentScenario(), client, location);

    expect(replayed.result.map((result) => result.data.plans.dataId)).toEqual(['LFEKD', 'LFEEKD']);
    expect(Object.keys(replayed.exchanges).toSorted()).toEqual(['exchange0', 'exchange1']);
  });

  // oxlint-disable-next-line vitest/expect-expect -- assertions live in checkRecordedRequests()
  test('expectRecordedRequests() passes when every recorded exchange is requested once', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);
    const scenario = multiExchangeScenario({ exchangeIds: ['first', 'second'] });

    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY)));
    await recordScenario(scenario, client, location);
    server.resetHandlers();

    using replayed = await replayScenario(scenario, client, location);

    await checkRecordedRequests(replayed, location);
  });

  test('expectRecordedRequests() fails when a recorded exchange is never requested', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);

    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY)));
    await recordScenario(
      multiExchangeScenario({ exchangeIds: ['first', 'second'] }),
      client,
      location,
    );
    server.resetHandlers();

    using replayed = await replayScenario(
      multiExchangeScenario({ exchangeIds: ['first'] }),
      client,
      location,
    );

    await expect(checkRecordedRequests(replayed, location)).rejects.toThrow(/second/);
  });

  test('expectRecordedRequests() fails when recordExchange() sends no request', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);

    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY)));
    await recordScenario(otmvPlanScenario({ trafficVolume: 'LFEKD' }), client, location);
    server.resetHandlers();

    using replayed = await replayScenario(sendsNothingScenario(), client, location);

    await expect(checkRecordedRequests(replayed, location)).rejects.toThrow(/never requested/);
  });
});
