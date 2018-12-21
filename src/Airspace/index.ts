import path from 'path';
import { getWSDLPath } from '../constants';
import { getEndpoint } from '../config';
import { prepareSecurity } from '../security';
import soap from 'soap';
import { Config } from '../config';
import { deserializer as customDeserializer } from '../utils/transformers';

export const getWSDL = ({
  XSD_PATH,
  flavour,
}: Pick<Config, 'flavour' | 'XSD_PATH'>) =>
  getWSDLPath({ service: 'AirspaceServices', flavour, XSD_PATH });

export type AirspaceClient = any;

function createAirspaceServices(config: Config): Promise<AirspaceClient> {
  const endpoint = getEndpoint(config);
  const WSDL = getWSDL(config);
  const security = prepareSecurity(config);

  return new Promise((resolve, reject) =>
    soap.createClient(WSDL, { customDeserializer, endpoint }, (err, client) => {
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
import retrieveAUPChain, {
  Resolver as RetrieveAUPChain,
} from './retrieveAUPChain';
import retrieveAUP, { Resolver as RetrieveAUP } from './retrieveAUP';

export interface AirspaceService {
  __soapClient: object;
  queryCompleteAIXMDatasets: QueryCompleteAIXMDatasets;
  retrieveAUPChain: RetrieveAUPChain;
  retrieveAUP: RetrieveAUP;
}

export function getAirspaceClient(config: Config): Promise<AirspaceService> {
  return createAirspaceServices(config).then(client => ({
    __soapClient: client,
    queryCompleteAIXMDatasets: queryCompleteAIXMDatasets(client),
    retrieveAUPChain: retrieveAUPChain(client),
    retrieveAUP: retrieveAUP(client),
  }));
}
