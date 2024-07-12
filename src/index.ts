import { isConfigValid, obfuscate } from './config';
import type { B2BFlavour } from './constants';
import type { Security } from './security';
import d from './utils/debug';
import { download as downloadWSDL } from './utils/xsd';
const debug = d();

import type { AirspaceService } from './Airspace';
import { getAirspaceClient } from './Airspace';
import type { FlightService } from './Flight';
import { getFlightClient } from './Flight';

import type { FlowService } from './Flow';
import { getFlowClient } from './Flow';
import type { GeneralInformationService } from './GeneralInformation';
import { getGeneralInformationClient } from './GeneralInformation';

export { AirspaceService } from './Airspace';
export { FlightService } from './Flight';
export { FlowService } from './Flow';
export { GeneralInformationService } from './GeneralInformation';
export { NMB2BError } from './utils/NMB2BError';

import type { SoapDeserializer } from './utils/types';

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

  return Promise.all([
    getAirspaceClient(options),
    getFlightClient(options),
    getFlowClient(options),
    getGeneralInformationClient(options),
  ])
    .then((res) => {
      debug('Successfully created B2B Client');
      return res;
    })
    .then(([Airspace, Flight, Flow, GeneralInformation]) => ({
      Airspace,
      Flight,
      Flow,
      GeneralInformation,
    }));
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

  return getAirspaceClient(options).then((res) => {
    debug('Successfully created B2B Airspace client');
    return res;
  });
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

  return getFlightClient(options).then((res) => {
    debug('Successfully created B2B Flight client');
    return res;
  });
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

  return getFlowClient(options).then((res) => {
    debug('Successfully created B2B Flow client');
    return res;
  });
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

  return getGeneralInformationClient(options).then((res) => {
    debug('Successfully created B2B GeneralInformation client');
    return res;
  });
}
