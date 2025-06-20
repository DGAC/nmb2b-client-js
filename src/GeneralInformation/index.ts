import { createClient, type Client as SoapClient } from 'soap';
import type { Config } from '../config.js';
import { getWSDLPath } from '../constants.js';
import { prepareSecurity } from '../security.js';
import { deserializer as customDeserializer } from '../utils/transformers/index.js';

import type { Resolver as QueryNMB2BWSDLs } from './queryNMB2BWSDLs.js';
import queryNMB2BWSDLs from './queryNMB2BWSDLs.js';

import type { Resolver as RetrieveUserInformation } from './retrieveUserinformation.js';
import retrieveUserInformation from './retrieveUserinformation.js';

import type { BaseServiceInterface } from '../Common/ServiceInterface.js';

const getWSDL = ({ flavour, XSD_PATH }: Pick<Config, 'flavour' | 'XSD_PATH'>) =>
  getWSDLPath({ service: 'GeneralinformationServices', flavour, XSD_PATH });

export type GeneralInformationServiceClient = SoapClient;

function createGeneralInformationServices(
  config: Config,
): Promise<GeneralInformationServiceClient> {
  const WSDL = getWSDL(config);
  const security = prepareSecurity(config);

  return new Promise((resolve, reject) => {
    try {
      createClient(WSDL, { customDeserializer }, (err, client) => {
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
      });
    } catch (err) {
      // TODO: Implement a proper debug log message output
      reject(
        err instanceof Error ? err : new Error('Unknown error', { cause: err }),
      );
      return;
    }
  });
}

export interface GeneralInformationService extends BaseServiceInterface {
  __soapClient: object;
  queryNMB2BWSDLs: QueryNMB2BWSDLs;
  retrieveUserInformation: RetrieveUserInformation;
}

export function getGeneralInformationClient(
  config: Config,
): Promise<GeneralInformationService> {
  return createGeneralInformationServices(config).then(
    (client) => ({
      __soapClient: client,
      config,
      queryNMB2BWSDLs: queryNMB2BWSDLs(client),
      retrieveUserInformation: retrieveUserInformation(client),
    }),
    (err) => {
      // TODO: Implement a proper debug log message output
      console.error(err);
      return Promise.reject(
        err instanceof Error ? err : new Error('Unknown error', { cause: err }),
      );
    },
  );
}
