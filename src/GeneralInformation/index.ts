import { createClient } from 'soap';
import { Config, getEndpoint } from '../config';
import { getWSDLPath } from '../constants';
import { prepareSecurity } from '../security';
import { deserializer as customDeserializer } from '../utils/transformers';

const getWSDL = ({ flavour, XSD_PATH }: Pick<Config, 'flavour' | 'XSD_PATH'>) =>
  getWSDLPath({ service: 'GeneralinformationServices', flavour, XSD_PATH });

export type GeneralInformationServiceClient = any;

function createGeneralInformationServices(
  config: Config,
): Promise<GeneralInformationServiceClient> {
  const endpoint = getEndpoint(config);
  const WSDL = getWSDL(config);
  const security = prepareSecurity(config);

  return new Promise((resolve, reject) => {
    try {
      createClient(WSDL, { customDeserializer }, (err, client) => {
        if (err) {
          return reject(err);
        }

        client.setSecurity(security);

        return resolve(client);
      });
    } catch (err) {
      // TODO: Implement a proper debug log message output
      return reject(err);
    }
  });
}

import queryNMB2BWSDLs, {
  Resolver as QueryNMB2BWSDLs,
} from './queryNMB2BWSDLs';

import retrieveUserInformation, {
  Resolver as RetrieveUserInformation,
} from './retrieveUserinformation';

import type { BaseServiceInterface } from '../Common/ServiceInterface';

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
      return Promise.reject(err);
    },
  );
}
