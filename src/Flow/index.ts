import type { Config } from '../config.js';
import {
  createSoapService,
  type SoapService,
} from '../utils/soap-query-definition.js';

import { queryHotspots } from './queryHotspots.js';
import { queryRegulations } from './queryRegulations.js';
import { queryTrafficCountsByAirspace } from './queryTrafficCountsByAirspace.js';
import { queryTrafficCountsByTrafficVolume } from './queryTrafficCountsByTrafficVolume.js';
import { retrieveCapacityPlan } from './retrieveCapacityPlan.js';
import { retrieveOTMVPlan } from './retrieveOTMVPlan.js';
import { retrieveRunwayConfigurationPlan } from './retrieveRunwayConfigurationPlan.js';
import { retrieveSectorConfigurationPlan } from './retrieveSectorConfigurationPlan.js';
import { updateCapacityPlan } from './updateCapacityPlan.js';
import { updateOTMVPlan } from './updateOTMVPlan.js';

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
