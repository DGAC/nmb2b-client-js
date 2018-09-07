/* @flow */
import path from 'path';
import { getWSDLPath } from '../constants';
import { getEndpoint } from '../config';
import { prepareSecurity } from '../security';
import soap from 'soap';
import type { Config } from '../config';
import { deserializer as customDeserializer } from '../utils/transformers';

const getWSDL = ({ flavour, XSD_PATH }) =>
  getWSDLPath({ service: 'PublishsubscribeServices', flavour, XSD_PATH });

export type PublishSubscribeClient = Object;
function createPublishSubscribeServices(config: Config): Promise<PublishSubscribeClient> {
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
import type { Resolver as ListSubscriptions } from './listSubscriptions';
import createSubscription from './createSubscription';
import type { Resolver as CreateSubscription } from './createSubscription';
import deleteSubscription from './deleteSubscription';
import type { Resolver as DeleteSubscription } from './deleteSubscription';
import resumeSubscription from './resumeSubscription';
import type { Resolver as ResumeSubscription } from './resumeSubscription';
import pauseSubscription from './pauseSubscription';
import type { Resolver as PauseSubscription } from './pauseSubscription';


export type PublishSubscribeService = {
  __soapClient: Object,
  listSubscriptions: ListSubscriptions,
  createSubscription: CreateSubscription,
  deleteSubscription: DeleteSubscription,
  resumeSubscription: ResumeSubscription,
  pauseSubscription: PauseSubscription,
};

export function getPublishSubscribeClient(config: Config): Promise<PublishSubscribeService> {
  return createPublishSubscribeServices(config).then(client => ({
    __soapClient: client,
    listSubscriptions: listSubscriptions(client),
    createSubscription: createSubscription(client),
    deleteSubscription: deleteSubscription(client),
    resumeSubscription: resumeSubscription(client),
    pauseSubscription: pauseSubscription(client),
  }));
}
