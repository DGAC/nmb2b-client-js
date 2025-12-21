import type { Config } from '../config.ts';
import {
  createSoapService,
  type SoapService,
} from '../utils/soap-query-definition.ts';
import { queryCompleteAIXMDatasets } from './queryCompleteAIXMDatasets.ts';
import { retrieveAUP } from './retrieveAUP.ts';
import { retrieveAUPChain } from './retrieveAUPChain.ts';
import { retrieveEAUPChain } from './retrieveEAUPChain.ts';

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
  const service = await createSoapService({
    serviceName: 'AirspaceServices',
    config,
    queryDefinitions,
  });

  return service;
}
