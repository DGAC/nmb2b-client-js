import { createClient, type Client as SoapClient } from 'soap';
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

export const getWSDL = ({
  XSD_PATH,
  flavour,
}: Pick<Config, 'flavour' | 'XSD_PATH'>) =>
  getWSDLPath({ service: 'AirspaceServices', flavour, XSD_PATH });

export type AirspaceClient = SoapClient;

function createAirspaceServices(config: Config): Promise<AirspaceClient> {
  const WSDL = getWSDL(config);
  const security = prepareSecurity(config);

  return new Promise((resolve, reject) => {
    createClient(WSDL, { customDeserializer }, (err, client) => {
      try {
        if (err) {
          reject(
            err instanceof Error
              ? err
              : new Error('Unknown error', { cause: err }),
          );
          return;
        }

        client.setSecurity(security);

        resolve(client);
      } catch (err) {
        // TODO: Implement a proper debug log message output
        console.log(err);
        reject(
          err instanceof Error
            ? err
            : new Error('Unknown error', { cause: err }),
        );
        return;
      }
    });
  });
}

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
