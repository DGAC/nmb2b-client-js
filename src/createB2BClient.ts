import type { SetOptional } from 'type-fest';
import type { AirspaceService } from './Airspace/index.ts';
import { getAirspaceClient } from './Airspace/index.ts';
import { assertValidConfig, obfuscate, type Config } from './config.ts';
import type { B2BFlavour } from './constants.ts';
import type { FlightService } from './Flight/index.ts';
import { getFlightClient } from './Flight/index.ts';
import type { FlowService } from './Flow/index.ts';
import { getFlowClient } from './Flow/index.ts';
import type { GeneralInformationService } from './GeneralInformation/index.ts';
import { getGeneralInformationClient } from './GeneralInformation/index.ts';
import { createDebugLogger } from './utils/debug.ts';
import { download as downloadWSDLIfNeeded } from './utils/xsd/index.ts';

const debug = createDebugLogger();

/**
 * Main client object grouping all available B2B domains (Airspace, Flight, Flow, GeneralInformation).
 */
export interface B2BClient {
  Airspace: AirspaceService;
  Flight: FlightService;
  Flow: FlowService;
  GeneralInformation: GeneralInformationService;
}

export type {
  AirspaceService,
  FlightService,
  FlowService,
  GeneralInformationService,
};

const CONFIG_DEFAULTS = {
  flavour: 'OPS' as B2BFlavour,
  XSD_PATH: '/tmp/b2b-xsd',
  hooks: [],
} satisfies Partial<Config>;

/**
 * Options for initializing the B2B client.
 */
export type CreateB2BClientOptions = SetOptional<
  Config,
  keyof typeof CONFIG_DEFAULTS
>;

/**
 * Main factory to create a fully initialized B2B client.
 * Handles WSDL downloading (if needed) and initializes all sub-services.
 *
 * @param options - Configuration options for the client. See {@link CreateB2BClientOptions}.
 * @returns The initialized {@link B2BClient} instance.
 */
export async function createB2BClient(
  options: CreateB2BClientOptions,
): Promise<B2BClient> {
  debug('Creating B2B Client ...');

  const config = prepareConfig(options);

  await downloadWSDLIfNeeded(config);

  const [Airspace, Flight, Flow, GeneralInformation] = await Promise.all([
    getAirspaceClient(config),
    getFlightClient(config),
    getFlowClient(config),
    getGeneralInformationClient(config),
  ]);

  debug('Successfully created B2B Client');

  return {
    Airspace,
    Flight,
    Flow,
    GeneralInformation,
  };
}

/**
 * Factory to create a standalone client for the Airspace domain.
 *
 * @param options - Configuration options for the client. See {@link CreateB2BClientOptions}.
 * @returns The initialized {@link AirspaceService} instance.
 */
export async function createAirspaceClient(
  options: CreateB2BClientOptions,
): Promise<AirspaceService> {
  debug('Creating B2B Airspace client ...');

  const config = prepareConfig(options);

  await downloadWSDLIfNeeded(config);

  const client = await getAirspaceClient(config);

  debug('Successfully created B2B Airspace client');

  return client;
}

/**
 * Factory to create a standalone client for the Flight domain.
 *
 * @param options - Configuration options for the client. See {@link CreateB2BClientOptions}.
 * @returns The initialized {@link FlightService} instance.
 */
export async function createFlightClient(
  options: CreateB2BClientOptions,
): Promise<FlightService> {
  debug('Creating B2B Flight client ...');

  const config = prepareConfig(options);

  await downloadWSDLIfNeeded(config);

  const client = await getFlightClient(config);

  debug('Successfully created B2B Flight client');

  return client;
}

/**
 * Factory to create a standalone client for the Flow domain.
 *
 * @param options - Configuration options for the client. See {@link CreateB2BClientOptions}.
 * @returns The initialized {@link FlowService} instance.
 */
export async function createFlowClient(
  options: CreateB2BClientOptions,
): Promise<FlowService> {
  debug('Creating B2B Flow client ...');

  const config = prepareConfig(options);

  await downloadWSDLIfNeeded(config);

  const client = await getFlowClient(config);

  debug('Successfully created B2B Flow client');

  return client;
}

/**
 * Factory to create a standalone client for the GeneralInformation domain.
 *
 * @param options - Configuration options for the client. See {@link CreateB2BClientOptions}.
 * @returns The initialized {@link GeneralInformationService} instance.
 */
export async function createGeneralInformationClient(
  options: CreateB2BClientOptions,
): Promise<GeneralInformationService> {
  debug('Creating B2B GeneralInformation client ...');

  const config = prepareConfig(options);

  await downloadWSDLIfNeeded(config);

  const client = await getGeneralInformationClient(config);

  debug('Successfully created B2B GeneralInformation client');

  return client;
}

function prepareConfig(options: CreateB2BClientOptions): Config {
  const config = { ...CONFIG_DEFAULTS, ...options };

  assertValidConfig(config);

  debug('Config is %o', obfuscate(config));

  return config;
}
