import invariant from 'invariant';
import promiseMap from './utils/promiseMap';
import path from 'path';
import { Security } from './security';
import { B2B_VERSION, B2BFlavour } from './constants';
import { isConfigValid, Config } from './config';
import { dirExists, createDir } from './utils/fs.js';
import { download as downloadWSDL } from './utils/xsd';

import { getAirspaceClient, AirspaceService } from './Airspace';
import { getFlightClient, FlightService } from './Flight';
import {
  getPublishSubscribeClient,
  PublishSubscribeService,
} from './PublishSubscribe';
import { getFlowClient, FlowService } from './Flow';
import {
  getGeneralInformationClient,
  GeneralInformationService,
} from './GeneralInformation';

export { AirspaceService } from './Airspace';
export { FlightService } from './Flight';
export { PublishSubscribeService } from './PublishSubscribe';
export { FlowService } from './Flow';
export { GeneralInformationService } from './GeneralInformation';

export interface B2BClient {
  Airspace: AirspaceService;
  Flight: FlightService;
  PublishSubscribe: PublishSubscribeService;
  Flow: FlowService;
  GeneralInformation: GeneralInformationService;
}

interface InputOptions {
  security: Security;
  flavour?: B2BFlavour;
  XSD_PATH?: string;
}

const defaults = {
  flavour: 'OPS' as B2BFlavour,
  XSD_PATH: '/tmp/b2b-xsd',
};

export async function makeB2BClient(args: InputOptions): Promise<B2BClient> {
  const options = { ...defaults, ...args };

  if (!isConfigValid(options)) {
    throw new Error('Invalid options provided');
  }

  await downloadWSDL(options);

  return promiseMap({
    Airspace: getAirspaceClient(options),
    Flight: getFlightClient(options),
    PublishSubscribe: getPublishSubscribeClient(options),
    Flow: getFlowClient(options),
    GeneralInformation: getGeneralInformationClient(options),
  });
}

export async function makeAirspaceClient(
  args: InputOptions,
): Promise<AirspaceService> {
  const options = { ...defaults, ...args };
  if (!isConfigValid(options)) {
    throw new Error('Invalid options provided');
  }

  await downloadWSDL(options);

  return getAirspaceClient(options);
}

export async function makeFlightClient(
  args: InputOptions,
): Promise<FlightService> {
  const options = { ...defaults, ...args };
  if (!isConfigValid(options)) {
    throw new Error('Invalid options provided');
  }

  await downloadWSDL(options);

  return getFlightClient(options);
}

export async function makeFlowClient(args: InputOptions): Promise<FlowService> {
  const options = { ...defaults, ...args };
  if (!isConfigValid(options)) {
    throw new Error('Invalid options provided');
  }

  await downloadWSDL(options);

  return getFlowClient(options);
}

export async function makeGeneralInformationClient(
  args: InputOptions,
): Promise<GeneralInformationService> {
  const options = { ...defaults, ...args };
  if (!isConfigValid(options)) {
    throw new Error('Invalid options provided');
  }

  await downloadWSDL(options);

  return getGeneralInformationClient(options);
}

export async function makePublishSubscribeClient(
  args: InputOptions,
): Promise<PublishSubscribeService> {
  const options = { ...defaults, ...args };
  if (!isConfigValid(options)) {
    throw new Error('Invalid options provided');
  }

  await downloadWSDL(options);

  return getPublishSubscribeClient(options);
}
