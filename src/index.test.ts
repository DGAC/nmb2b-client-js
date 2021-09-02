/**
 * @jest-environment node
 */
// @ts-ignore
import b2bOptions from '../tests/options';
import {
  makeB2BClient,
  makeFlowClient,
  makeFlightClient,
  makeGeneralInformationClient,
  makeAirspaceClient,
  makePublishSubscribeClient,
} from '.';
import { Config } from './config';

jest.setTimeout(20000);

describe('Main API', () => {
  test.only('makeB2BClient', async () => {
    const b2bClient = await makeB2BClient(b2bOptions as Config);
    expect(b2bClient).toBeDefined();
    expect(b2bClient.Airspace).toBeDefined();
    expect(b2bClient.Flight).toBeDefined();
    expect(b2bClient.Flow).toBeDefined();
    expect(b2bClient.GeneralInformation).toBeDefined();
    expect(b2bClient.PublishSubscribe).toBeDefined();
  });

  test.each([
    makeAirspaceClient,
    makeFlowClient,
    makeFlightClient,
    makeGeneralInformationClient,
    makePublishSubscribeClient,
  ])('%p', async fn => {
    const res = await fn(b2bOptions);
    expect(res).toBeDefined();
  });
});
