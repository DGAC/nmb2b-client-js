/* @flow */
import invariant from 'invariant';
import promiseMap from './utils/promiseMap';
import path from 'path';
import type { Security } from './security';
import { B2B_VERSION, type B2BFlavour } from './constants';
import { isConfigValid, type Config } from './config';
import { dirExists, createDir } from './utils/fs';
import { downloadFile } from './utils/xsd/downloadFile';
import { requestFilename } from './utils/xsd/filePath';
import { getAirspaceClient } from './Airspace';
import type { AirspaceService } from './Airspace';
import { getFlightClient } from './Flight';
import type { FlightService } from './Flight';
import { getPublishSubscribeClient } from './PublishSubscribe';
import type { PublishSubscribeService } from './PublishSubscribe';
import { getFlowClient } from './Flow';
import type { FlowService } from './Flow';
import {
  getGeneralInformationClient,
  type GeneralInformationService,
} from './GeneralInformation';

export type B2BClient = {
  Airspace: AirspaceService,
  Flight: FlightService,
  PublishSubscribe: PublishSubscribeService,
  Flow: FlowService,
  GeneralInformation: GeneralInformationService,
};

type InputOptions = {
  security: Security,
  flavour?: B2BFlavour,
  XSD_PATH?: string,
};

const defaults = {
  flavour: 'OPS',
  XSD_PATH: '/tmp/b2b-xsd',
};

export async function makeB2BClient(args: InputOptions): Promise<B2BClient> {
  const options = Object.assign({}, defaults, args);
  if (!isConfigValid(options)) {
    throw new Error('Invalid options provided');
  }

  await downloadWSDLIfNotPresent(options);

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
  const options = Object.assign({}, defaults, args);
  if (!isConfigValid(options)) {
    throw new Error('Invalid options provided');
  }

  await downloadWSDLIfNotPresent(options);

  return getAirspaceClient(options);
}

export async function makeFlightClient(
  args: InputOptions,
): Promise<FlightService> {
  const options = Object.assign({}, defaults, args);
  if (!isConfigValid(options)) {
    throw new Error('Invalid options provided');
  }

  await downloadWSDLIfNotPresent(options);

  return getFlightClient(options);
}

export async function makeFlowClient(args: InputOptions): Promise<FlowService> {
  const options = Object.assign({}, defaults, args);
  if (!isConfigValid(options)) {
    throw new Error('Invalid options provided');
  }

  await downloadWSDLIfNotPresent(options);

  return getFlowClient(options);
}

export async function makeGeneralInformationClient(
  args: InputOptions,
): Promise<GeneralInformationService> {
  const options = Object.assign({}, defaults, args);
  if (!isConfigValid(options)) {
    throw new Error('Invalid options provided');
  }

  await downloadWSDLIfNotPresent(options);

  return getGeneralInformationClient(options);
}

export async function makePublishSubscribeClient(
  args: InputOptions,
): Promise<PublishSubscribeService> {
  const options = Object.assign({}, defaults, args);
  if (!isConfigValid(options)) {
    throw new Error('Invalid options provided');
  }

  await downloadWSDLIfNotPresent(options);

  return getPublishSubscribeClient(options);
}

async function downloadWSDLIfNotPresent(options: Config): Promise<void> {
  // Check if XSD are available, if not, download them
  if (
    !(await dirExists(options.XSD_PATH)) ||
    !(await dirExists(path.join(options.XSD_PATH, B2B_VERSION)))
  ) {
    console.log('XSD files not found, downloading from B2B ...');
    console.log(`Creating dir ${options.XSD_PATH}`);
    await createDir(options.XSD_PATH);
    await requestFilename({
      flavour: options.flavour,
      security: options.security,
    }).then(fileName =>
      downloadFile(fileName, {
        flavour: options.flavour,
        security: options.security,
        outputDir: options.XSD_PATH,
      }),
    );
    console.log(
      `Downloaded B2B XSD to ${path.join(options.XSD_PATH, B2B_VERSION)}`,
    );
  }
}
