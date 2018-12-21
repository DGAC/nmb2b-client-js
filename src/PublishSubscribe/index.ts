import path from 'path';
import { getWSDLPath } from '../constants';
import { getEndpoint } from '../config';
import { prepareSecurity } from '../security';
import soap from 'soap';
import { Config } from '../config';
import { deserializer as customDeserializer } from '../utils/transformers';

const getWSDL = ({ flavour, XSD_PATH }: Pick<Config, 'flavour' | 'XSD_PATH'>) =>
  getWSDLPath({ service: 'PublishsubscribeServices', flavour, XSD_PATH });

export type PublishSubscribeClient = any;
function createPublishSubscribeServices(
  config: Config,
): Promise<PublishSubscribeClient> {
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

import listSubscriptions from './listSubscriptions';
import { Resolver as ListSubscriptions } from './listSubscriptions';
import createSubscription from './createSubscription';
import { Resolver as CreateSubscription } from './createSubscription';
import deleteSubscription from './deleteSubscription';
import { Resolver as DeleteSubscription } from './deleteSubscription';
import resumeSubscription from './resumeSubscription';
import { Resolver as ResumeSubscription } from './resumeSubscription';
import pauseSubscription from './pauseSubscription';
import { Resolver as PauseSubscription } from './pauseSubscription';

export interface PublishSubscribeService {
  __soapClient: object;
  listSubscriptions: ListSubscriptions;
  createSubscription: CreateSubscription;
  deleteSubscription: DeleteSubscription;
  resumeSubscription: ResumeSubscription;
  pauseSubscription: PauseSubscription;
}

export function getPublishSubscribeClient(
  config: Config,
): Promise<PublishSubscribeService> {
  return createPublishSubscribeServices(config).then(client => ({
    __soapClient: client,
    listSubscriptions: listSubscriptions(client),
    createSubscription: createSubscription(client),
    deleteSubscription: deleteSubscription(client),
    resumeSubscription: resumeSubscription(client),
    pauseSubscription: pauseSubscription(client),
  }));
}
