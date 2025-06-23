import { createClientAsync, type Client as SoapClient } from 'soap';
import type { Config } from '../config.js';
import { getWSDLPath } from '../constants.js';
import { prepareSecurity } from '../security.js';
import { deserializer as customDeserializer } from '../utils/transformers/index.js';

import type { Resolver as QueryNMB2BWSDLs } from './queryNMB2BWSDLs.js';
import queryNMB2BWSDLs from './queryNMB2BWSDLs.js';

import type { Resolver as RetrieveUserInformation } from './retrieveUserinformation.js';
import retrieveUserInformation from './retrieveUserinformation.js';

import type { BaseServiceInterface } from '../Common/ServiceInterface.js';

export type GeneralInformationServiceClient = SoapClient;

export interface GeneralInformationService extends BaseServiceInterface {
  __soapClient: object;
  queryNMB2BWSDLs: QueryNMB2BWSDLs;
  retrieveUserInformation: RetrieveUserInformation;
}

export async function getGeneralInformationClient(
  config: Config,
): Promise<GeneralInformationService> {
  const WSDL = getWSDLPath({
    service: 'GeneralinformationServices',
    flavour: config.flavour,
    XSD_PATH: config.XSD_PATH,
  });

  const security = prepareSecurity(config);

  const client = await createClientAsync(WSDL, { customDeserializer });
  client.setSecurity(security);

  return {
    __soapClient: client,
    config,
    queryNMB2BWSDLs: queryNMB2BWSDLs(client),
    retrieveUserInformation: retrieveUserInformation(client),
  };
}
