import b2bOptions from '../tests/options';
import {
  makeB2BClient,
  makeFlowClient,
  makeFlightClient,
  makeGeneralInformationClient,
  makeAirspaceClient,
} from '.';

import { Config } from './config';

import { describe, test, expect } from 'vitest';

// jest.setTimeout(20000);

describe('Main API', () => {
  test('makeB2BClient', async () => {
    const b2bClient = await makeB2BClient(b2bOptions as Config);
    expect(b2bClient).toBeDefined();
    expect(b2bClient.Airspace).toBeDefined();
    expect(b2bClient.Flight).toBeDefined();
    expect(b2bClient.Flow).toBeDefined();
    expect(b2bClient.GeneralInformation).toBeDefined();
  });

  test.each([
    makeAirspaceClient,
    makeFlowClient,
    makeFlightClient,
    makeGeneralInformationClient,
  ])('%O', async (fn) => {
    const res = await fn(b2bOptions);
    expect(res).toBeDefined();
  });
});
