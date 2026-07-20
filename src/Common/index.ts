import type { Config } from '../config.ts';
import {
  createSoapService,
  type SoapService,
} from '../utils/soap-query-definition.ts';
import { deleteSubscription } from './deleteSubscription.ts';
import { listSubscriptions } from './listSubscriptions.ts';
import { pauseSubscription } from './pauseSubscription.ts';
import { resumeSubscription } from './resumeSubscription.ts';
import { subscriptionHistory } from './subscriptionHistory.ts';

const queryDefinitions = {
  deleteSubscription,
  listSubscriptions,
  pauseSubscription,
  resumeSubscription,
  subscriptionHistory,
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
