import { getWSDLPath } from '../constants';
import { getEndpoint } from '../config';
import { prepareSecurity } from '../security';
import { createClient } from 'soap';
import { Config } from '../config';
import util from 'util';
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
      // tslint:disable-next-line
      console.log(err.message);
      return reject(err);
    }
  });
}

import queryNMB2BWSDLs, {
  Resolver as QueryNMB2BWSDLs,
} from './queryNMB2BWSDLs';

export interface GeneralInformationService {
  __soapClient: object;
  queryNMB2BWSDLs: QueryNMB2BWSDLs;
}

export function getGeneralInformationClient(
  config: Config,
): Promise<GeneralInformationService> {
  return createGeneralInformationServices(config).then(
    client => ({
      __soapClient: client,
      queryNMB2BWSDLs: queryNMB2BWSDLs(client),
    }),
    err => {
      // TODO: Implement a proper debug log message output
      // tslint:disable-next-line
      console.error(err);
      return Promise.reject(err);
    },
  );
}
