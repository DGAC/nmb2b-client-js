import type { Config } from '../config.ts';
import {
  createSoapService,
  type SoapService,
} from '../utils/soap-query-definition.ts';

import { queryHotspots } from './queryHotspots.ts';
import { queryRegulations } from './queryRegulations.ts';
import { queryTrafficCountsByAirspace } from './queryTrafficCountsByAirspace.ts';
import { queryTrafficCountsByTrafficVolume } from './queryTrafficCountsByTrafficVolume.ts';
import { retrieveCapacityPlan } from './retrieveCapacityPlan.ts';
import { retrieveOTMVPlan } from './retrieveOTMVPlan.ts';
import { retrieveRunwayConfigurationPlan } from './retrieveRunwayConfigurationPlan.ts';
import { retrieveSectorConfigurationPlan } from './retrieveSectorConfigurationPlan.ts';
import { updateCapacityPlan } from './updateCapacityPlan.ts';
import { updateOTMVPlan } from './updateOTMVPlan.ts';

const queryDefinitions = {
  queryHotspots,
  queryRegulations,
  queryTrafficCountsByAirspace,
  queryTrafficCountsByTrafficVolume,
  retrieveCapacityPlan,
  retrieveOTMVPlan,
  retrieveRunwayConfigurationPlan,
  retrieveSectorConfigurationPlan,
  updateCapacityPlan,
  updateOTMVPlan,
};

export type FlowService = SoapService<typeof queryDefinitions>;

export async function getFlowClient(config: Config): Promise<FlowService> {
  const service = await createSoapService({
    serviceName: 'FlowServices',
    config,
    queryDefinitions,
  });

  return service;
}
