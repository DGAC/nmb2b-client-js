import { isConfigValid, obfuscate } from './config.js';
import type { B2BFlavour } from './constants.js';
import type { Security } from './security.js';
import d from './utils/debug.js';
import { download as downloadWSDL } from './utils/xsd/index.js';
const debug = d();

import type { AirspaceService } from './Airspace/index.js';
import { getAirspaceClient } from './Airspace/index.js';
import type { FlightService } from './Flight/index.js';
import { getFlightClient } from './Flight/index.js';

import type { FlowService } from './Flow/index.js';
import { getFlowClient } from './Flow/index.js';
import type { GeneralInformationService } from './GeneralInformation/index.js';
import { getGeneralInformationClient } from './GeneralInformation/index.js';

export type { AirspaceService } from './Airspace/index.js';
export type { FlightService } from './Flight/index.js';
export type { FlowService } from './Flow/index.js';
export type { GeneralInformationService } from './GeneralInformation/index.js';
export { NMB2BError } from './utils/NMB2BError.js';

import type { SoapDeserializer } from './utils/types.js';

export type SafeB2BDeserializedResponse<TResponsePart> =
  SoapDeserializer<TResponsePart>;

export interface B2BClient {
  Airspace: AirspaceService;
  Flight: FlightService;
  Flow: FlowService;
  GeneralInformation: GeneralInformationService;
}

interface InputOptions {
  security: Security;
  flavour?: B2BFlavour;
  XSD_PATH?: string;
  endpoint?: string;
  xsdEndpoint?: string;
  ignoreWSDLCache?: boolean;
}

const defaults = {
  flavour: 'OPS' as B2BFlavour,
  XSD_PATH: '/tmp/b2b-xsd',
};

export async function makeB2BClient(args: InputOptions): Promise<B2BClient> {
  const options = { ...defaults, ...args };

  debug('Instantiating B2B Client ...');
  if (!isConfigValid(options)) {
    debug('Invalid options provided');
    throw new Error('Invalid options provided');
  }

  debug('Config is %o', obfuscate(options));

  await downloadWSDL(options);

  const [Airspace, Flight, Flow, GeneralInformation] = await Promise.all([
    getAirspaceClient(options),
    getFlightClient(options),
    getFlowClient(options),
    getGeneralInformationClient(options),
  ]);

  debug('Successfully created B2B Client');

  return {
    Airspace,
    Flight,
    Flow,
    GeneralInformation,
  };
}

export async function makeAirspaceClient(
  args: InputOptions,
): Promise<AirspaceService> {
  const options = { ...defaults, ...args };
  debug('Instantiating B2B Airspace client ...');

  if (!isConfigValid(options)) {
    debug('Invalid options provided');
    throw new Error('Invalid options provided');
  }

  debug('Config is %o', obfuscate(options));

  await downloadWSDL(options);

  const client = await getAirspaceClient(options);

  debug('Successfully created B2B Airspace client');

  return client;
}

export async function makeFlightClient(
  args: InputOptions,
): Promise<FlightService> {
  const options = { ...defaults, ...args };
  debug('Instantiating B2B Flight client ...');

  if (!isConfigValid(options)) {
    debug('Invalid options provided');
    throw new Error('Invalid options provided');
  }

  debug('Config is %o', obfuscate(options));

  await downloadWSDL(options);

  const client = await getFlightClient(options);

  debug('Successfully created B2B Flight client');

  return client;
}

export async function makeFlowClient(args: InputOptions): Promise<FlowService> {
  const options = { ...defaults, ...args };
  debug('Instantiating B2B Flow client ...');

  if (!isConfigValid(options)) {
    debug('Invalid options provided');
    throw new Error('Invalid options provided');
  }

  debug('Config is %o', obfuscate(options));

  await downloadWSDL(options);

  const client = getFlowClient(options);

  debug('Successfully created B2B Flow client');

  return client;
}

export async function makeGeneralInformationClient(
  args: InputOptions,
): Promise<GeneralInformationService> {
  const options = { ...defaults, ...args };
  debug('Instantiating B2B GeneralInformation client ...');

  if (!isConfigValid(options)) {
    debug('Invalid options provided');
    throw new Error('Invalid options provided');
  }

  debug('Config is %o', obfuscate(options));

  await downloadWSDL(options);

  const client = await getGeneralInformationClient(options);

  debug('Successfully created B2B GeneralInformation client');

  return client;
}
