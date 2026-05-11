import type { Config } from '../config.ts';
import {
  createSoapService,
  type SoapService,
} from '../utils/soap-query-definition.ts';

import { queryNMB2BWSDLs } from './queryNMB2BWSDLs.ts';
import { retrieveUserInformation } from './retrieveUserinformation.ts';

const queryDefinitions = {
  queryNMB2BWSDLs,
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
