import { createClient } from 'soap';
import { Config } from '../config';
import { getWSDLPath } from '../constants';
import { prepareSecurity } from '../security';
import { deserializer as customDeserializer } from '../utils/transformers';

export const getWSDL = ({
  XSD_PATH,
  flavour,
}: Pick<Config, 'flavour' | 'XSD_PATH'>) =>
  getWSDLPath({ service: 'AirspaceServices', flavour, XSD_PATH });

export type AirspaceClient = any;

function createAirspaceServices(config: Config): Promise<AirspaceClient> {
  const WSDL = getWSDL(config);
  const security = prepareSecurity(config);

  return new Promise((resolve, reject) =>
    createClient(WSDL, { customDeserializer }, (err, client) => {
      if (err) {
        return reject(err);
      }

      client.setSecurity(security);

      return resolve(client);
    }),
  );
}

import queryCompleteAIXMDatasets, {
  Resolver as QueryCompleteAIXMDatasets,
} from './queryCompleteAIXMDatasets';
import retrieveAUP, { Resolver as RetrieveAUP } from './retrieveAUP';
import retrieveAUPChain, {
  Resolver as RetrieveAUPChain,
} from './retrieveAUPChain';
import retrieveEAUPChain, {
  Resolver as RetrieveEAUPChain,
} from './retrieveEAUPChain';

import { BaseServiceInterface } from '../Common/ServiceInterface';

export interface AirspaceService extends BaseServiceInterface {
  queryCompleteAIXMDatasets: QueryCompleteAIXMDatasets;
  retrieveAUPChain: RetrieveAUPChain;
  retrieveEAUPChain: RetrieveEAUPChain;
  retrieveAUP: RetrieveAUP;
}

export function getAirspaceClient(config: Config): Promise<AirspaceService> {
  return createAirspaceServices(config).then((client) => ({
    __soapClient: client,
    config,
    queryCompleteAIXMDatasets: queryCompleteAIXMDatasets(client),
    retrieveAUPChain: retrieveAUPChain(client),
    retrieveEAUPChain: retrieveEAUPChain(client),
    retrieveAUP: retrieveAUP(client),
  }));
}
