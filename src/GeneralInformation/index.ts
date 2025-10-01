import type { Config } from '../config.js';
import {
  createSoapService,
  type SoapService,
} from '../utils/soap-query-definition.js';
import { queryNMB2BWSDLsDefinition } from './queryNMB2BWSDLs.js';

import { retrieveUserInformation } from './retrieveUserinformation.js';

const queryDefinitions = {
  queryNMB2BWSDLs: queryNMB2BWSDLsDefinition,
  retrieveUserInformation,
};

export type GeneralInformationService = SoapService<typeof queryDefinitions>;

export async function getGeneralInformationClient(
  config: Config,
): Promise<GeneralInformationService> {
  const service = await createSoapService({
    serviceName: 'GeneralinformationServices',
    config,
    queryDefinitions,
  });

  return service;
}
