import type { Config } from '../config.js';
import {
  createService,
  type SoapService,
} from '../utils/soap-query-definition.js';
import { queryCompleteAIXMDatasets } from './queryCompleteAIXMDatasets.js';
import { retrieveAUP } from './retrieveAUP.js';
import { retrieveAUPChain } from './retrieveAUPChain.js';
import { retrieveEAUPChain } from './retrieveEAUPChain.js';

const queryDefinitions = {
  queryCompleteAIXMDatasets,
  retrieveAUP,
  retrieveAUPChain,
  retrieveEAUPChain,
};

export type AirspaceService = SoapService<typeof queryDefinitions>;

export async function getAirspaceClient(
  config: Config,
): Promise<AirspaceService> {
  const service = await createService({
    serviceName: 'AirspaceServices',
    config,
    queryDefinitions,
  });

  return service;
}
