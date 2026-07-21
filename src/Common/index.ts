import type { Config } from '../config.ts';
import {
  createSoapService,
  type SoapService,
} from '../utils/soap-query-definition.ts';
import { deleteSubscription } from './deleteSubscription.ts';
import { listSubscriptions } from './listSubscriptions.ts';
import { pauseSubscription } from './pauseSubscription.ts';
import { pullMessages } from './pullMessages.ts';
import { resumeSubscription } from './resumeSubscription.ts';
import { subscriptionHistory } from './subscriptionHistory.ts';
import { synchroniseSubscription } from './synchroniseSubscription.ts';

const queryDefinitions = {
  deleteSubscription,
  listSubscriptions,
  pauseSubscription,
  pullMessages,
  resumeSubscription,
  subscriptionHistory,
  synchroniseSubscription,
};

export type CommonService = SoapService<typeof queryDefinitions>;

export async function getCommonClient(config: Config): Promise<CommonService> {
  const service = await createSoapService({
    serviceName: 'CommonServices',
    config,
    queryDefinitions,
  });

  return service;
}
