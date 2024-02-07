import { createClient } from 'soap';
import { Config, getEndpoint } from '../config';
import { getWSDLPath } from '../constants';
import { prepareSecurity } from '../security';
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
    createClient(WSDL, { customDeserializer, endpoint }, (err, client) => {
      if (err) {
        return reject(err);
      }

      client.setSecurity(security);

      return resolve(client);
    }),
  );
}

import createSubscription, {
  Resolver as CreateSubscription,
} from './createSubscription';
import deleteSubscription, {
  Resolver as DeleteSubscription,
} from './deleteSubscription';
import listSubscriptions, {
  Resolver as ListSubscriptions,
} from './listSubscriptions';
import pauseSubscription, {
  Resolver as PauseSubscription,
} from './pauseSubscription';
import resumeSubscription, {
  Resolver as ResumeSubscription,
} from './resumeSubscription';
import { BaseServiceInterface } from '../Common/ServiceInterface';

export interface PublishSubscribeService extends BaseServiceInterface {
  listSubscriptions: ListSubscriptions;
  createSubscription: CreateSubscription;
  deleteSubscription: DeleteSubscription;
  resumeSubscription: ResumeSubscription;
  pauseSubscription: PauseSubscription;
}

export function getPublishSubscribeClient(
  config: Config,
): Promise<PublishSubscribeService> {
  return createPublishSubscribeServices(config).then((client) => ({
    __soapClient: client,
    config,
    listSubscriptions: listSubscriptions(client),
    createSubscription: createSubscription(client),
    deleteSubscription: deleteSubscription(client),
    resumeSubscription: resumeSubscription(client),
    pauseSubscription: pauseSubscription(client),
  }));
}
