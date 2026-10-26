import { http, HttpResponse } from 'msw';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, test } from 'vitest';
import { createB2BClient } from '../../../src/index.ts';
import { TEST_B2B_OPTIONS } from '../../options.ts';
import type { FixtureLocation } from '../artifacts.ts';
import { defineFixture } from '../fixtures.ts';
import { recordScenario } from './recordScenario.ts';
import { replayScenario } from './replayScenario.ts';
import { server, SOAP_ENDPOINT } from '../msw.ts';

const OTMV_PLAN_REPLY = `<?xml version='1.0' encoding='utf-8'?><S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/"><S:Body><fw:OTMVPlanRetrievalReply xmlns:fw="eurocontrol/cfmu/b2b/FlowServices"><requestReceptionTime>2026-08-02 16:00:56</requestReceptionTime><requestId>B2B_CUR2:1</requestId><sendTime>2026-08-02 16:00:56</sendTime><status>OK</status><data><plans><dataId>O1</dataId><dataset><type>OPERATIONAL</type></dataset><day>2026-08-02</day><planTransferred>true</planTransferred><planCutOffReached>true</planCutOffReached></plans></data></fw:OTMVPlanRetrievalReply></S:Body></S:Envelope>`;

const scenario = defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' })
  .setup(() => Promise.resolve({ day: '2026-08-02', trafficVolume: 'LFEKD' }))
  .run(async (client, { day, trafficVolume }) =>
    client.Flow.retrieveOTMVPlan({
      dataset: { type: 'OPERATIONAL' },
      day: new Date(day),
      otmvsWithDuration: { item: [{ trafficVolume }] },
    }),
  );

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

    const replayed = await replayScenario(scenario, client, location);

    expect(replayed.variables).toEqual({ day: '2026-08-02', trafficVolume: 'LFEKD' });
    expect(replayed.result.data.plans.dataId).toBe('O1');
    expect(replayed.result).toEqual(recorded.result);
  });
});
