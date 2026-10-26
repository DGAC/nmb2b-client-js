import { http, HttpResponse } from 'msw';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, test } from 'vitest';
import { createB2BClient } from '../../../src/index.ts';
import { TEST_B2B_OPTIONS } from '../../options.ts';
import type { FixtureLocation } from '../artifacts.ts';
import { defineFixture, expectRecordedRequests, type RecordedExchangeId } from '../fixtures.ts';
import { recordScenario } from './recordScenario.ts';
import { replayScenario, type FixtureReplay } from './replayScenario.ts';
import { server, SOAP_ENDPOINT } from '../msw.ts';

const OTMV_PLAN_REPLY = `<?xml version='1.0' encoding='utf-8'?><S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/"><S:Body><fw:OTMVPlanRetrievalReply xmlns:fw="eurocontrol/cfmu/b2b/FlowServices"><requestReceptionTime>2026-08-02 16:00:56</requestReceptionTime><requestId>B2B_CUR2:1</requestId><sendTime>2026-08-02 16:00:56</sendTime><status>OK</status><data><plans><dataId>O1</dataId><dataset><type>OPERATIONAL</type></dataset><day>2026-08-02</day><planTransferred>true</planTransferred><planCutOffReached>true</planCutOffReached></plans></data></fw:OTMVPlanRetrievalReply></S:Body></S:Envelope>`;

const scenario = defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' })
  .setup(() => Promise.resolve({ day: '2026-08-02', trafficVolume: 'LFEKD' }))
  .run(async (client, { day, trafficVolume }) => {
    const result = await client.Flow.retrieveOTMVPlan({
      dataset: { type: 'OPERATIONAL' },
      day: new Date(day),
      otmvsWithDuration: { item: [{ trafficVolume }] },
    });

    return { result };
  });

function otmvPlanScenario({ trafficVolume }: { trafficVolume: string }) {
  return defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' })
    .setup(() => Promise.resolve({ day: '2026-08-02' }))
    .run((client, { day }, { recordExchange }) =>
      recordExchange('retrieveOTMVPlan', () =>
        client.Flow.retrieveOTMVPlan({
          dataset: { type: 'OPERATIONAL' },
          day: new Date(day),
          otmvsWithDuration: { item: [{ trafficVolume }] },
        }),
      ),
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

    expect(replayed.variables).toEqual({ day: '2026-08-02', trafficVolume: 'LFEKD' });
    expect(replayed.result.data.plans.dataId).toBe('O1');
    expect(replayed.result).toEqual(recorded.result);
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

    await expect(
      replayScenario(otmvPlanScenario({ trafficVolume: 'LFEEKD' }), client, location),
    ).rejects.toThrow(/onUnhandledFrame/);
  });

  test('fails the replay when a recorded request is sent twice', async () => {
    const client = await createB2BClient(TEST_B2B_OPTIONS);
    const sendTwice = defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' }).run(
      (client, _variables, { recordExchange }) =>
        recordExchange('retrieveOTMVPlan', async () => {
          const request = {
            dataset: { type: 'OPERATIONAL' as const },
            day: new Date('2026-08-02'),
          };
          await client.Flow.retrieveOTMVPlan(request);
          return client.Flow.retrieveOTMVPlan(request);
        }),
    );

    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY)));
    await recordScenario(sendTwice, client, location);
    server.resetHandlers();

    await expect(replayScenario(sendTwice, client, location)).rejects.toThrow(/onUnhandledFrame/);
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
    const sendsNothing = defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' }).run(
      (_client, _variables, { recordExchange }) =>
        recordExchange('retrieveOTMVPlan', () => Promise.resolve(null)),
    );

    server.use(http.post(SOAP_ENDPOINT, () => HttpResponse.xml(OTMV_PLAN_REPLY)));
    await recordScenario(otmvPlanScenario({ trafficVolume: 'LFEKD' }), client, location);
    server.resetHandlers();

    using replayed = await replayScenario(sendsNothing, client, location);

    await expect(checkRecordedRequests(replayed, location)).rejects.toThrow(/never requested/);
  });
});
