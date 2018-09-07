/* @flow */
import path from 'path';
import { getWSDLPath } from '../constants';
import { getEndpoint } from '../config';
import { prepareSecurity } from '../security';
import soap from 'soap';
import { type Config } from '../config';
import { type B2BFlavour } from '../constants';
import { deserializer as customDeserializer } from '../utils/transformers';

export const getWSDL = ({
  XSD_PATH,
  flavour,
}: {
  XSD_PATH: string,
  flavour: B2BFlavour,
}) => getWSDLPath({ service: 'AirspaceServices', flavour, XSD_PATH });

export type AirspaceClient = Object;
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

import queryCompleteAIXMDatasets from './queryCompleteAIXMDatasets';
import type { Resolver as QueryCompleteAIXMDatasets } from './queryCompleteAIXMDatasets';
import retrieveAUPChain from './retrieveAUPChain';
import type { Resolver as RetrieveAUPChain } from './retrieveAUPChain';
import retrieveAUP from './retrieveAUP';
import type { Resolver as RetrieveAUP } from './retrieveAUP';

export type AirspaceService = {
  __soapClient: Object,
  queryCompleteAIXMDatasets: QueryCompleteAIXMDatasets,
  retrieveAUPChain: RetrieveAUPChain,
  retrieveAUP: RetrieveAUP,
};

export function getAirspaceClient(config: Config): Promise<AirspaceService> {
  return createAirspaceServices(config).then(client => ({
    __soapClient: client,
    queryCompleteAIXMDatasets: queryCompleteAIXMDatasets(client),
    retrieveAUPChain: retrieveAUPChain(client),
    retrieveAUP: retrieveAUP(client),
  }));
}
