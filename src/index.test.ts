import b2bOptions from '../tests/options.js';
import {
  createB2BClient,
  createFlowClient,
  createFlightClient,
  createAirspaceClient,
  createGeneralInformationClient,
} from './index.js';

import type { Config } from './config.js';

import { describe, test, expect } from 'vitest';

describe('Main API', () => {
  test('createB2BClient', async () => {
    const b2bClient = await createB2BClient(b2bOptions as Config);
    expect(b2bClient).toBeDefined();
    expect(b2bClient.Airspace).toBeDefined();
    expect(b2bClient.Flight).toBeDefined();
    expect(b2bClient.Flow).toBeDefined();
    expect(b2bClient.GeneralInformation).toBeDefined();
  });

  test.each([
    createFlowClient,
    createFlightClient,
    createAirspaceClient,
    createGeneralInformationClient,
  ])('%O', async (fn) => {
    const res = await fn(b2bOptions);
    expect(res).toBeDefined();
    expect(res.config).toEqual(expect.objectContaining(b2bOptions));
  });
});
