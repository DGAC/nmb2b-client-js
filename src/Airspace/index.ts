import { createClientAsync, type Client as SoapClient } from 'soap';
import type { Config } from '../config.js';
import { getWSDLPath } from '../constants.js';
import { prepareSecurity } from '../security.js';
import { deserializer as customDeserializer } from '../utils/transformers/index.js';

import type { Resolver as QueryCompleteAIXMDatasets } from './queryCompleteAIXMDatasets.js';
import queryCompleteAIXMDatasets from './queryCompleteAIXMDatasets.js';
import type { Resolver as RetrieveAUP } from './retrieveAUP.js';
import retrieveAUP from './retrieveAUP.js';
import type { Resolver as RetrieveAUPChain } from './retrieveAUPChain.js';
import retrieveAUPChain from './retrieveAUPChain.js';
import type { Resolver as RetrieveEAUPChain } from './retrieveEAUPChain.js';
import retrieveEAUPChain from './retrieveEAUPChain.js';

import type { BaseServiceInterface } from '../Common/ServiceInterface.js';

export type AirspaceClient = SoapClient;

export interface AirspaceService extends BaseServiceInterface {
  queryCompleteAIXMDatasets: QueryCompleteAIXMDatasets;
  retrieveAUPChain: RetrieveAUPChain;
  retrieveEAUPChain: RetrieveEAUPChain;
  retrieveAUP: RetrieveAUP;
}

export async function getAirspaceClient(
  config: Config,
): Promise<AirspaceService> {
  const WSDL = getWSDLPath({
    service: 'AirspaceServices',
    flavour: config.flavour,
    XSD_PATH: config.XSD_PATH,
  });

  const security = prepareSecurity(config);

  const client = await createClientAsync(WSDL, { customDeserializer });
  client.setSecurity(security);

  return {
    __soapClient: client,
    config,
    queryCompleteAIXMDatasets: queryCompleteAIXMDatasets(client),
    retrieveAUPChain: retrieveAUPChain(client),
    retrieveEAUPChain: retrieveEAUPChain(client),
    retrieveAUP: retrieveAUP(client),
  };
}
