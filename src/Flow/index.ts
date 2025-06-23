import { createClientAsync, type Client as SoapClient } from 'soap';
import type { Config } from '../config.js';
import { getWSDLPath } from '../constants.js';
import { prepareSecurity } from '../security.js';
import { deserializer as customDeserializer } from '../utils/transformers/index.js';

import type { BaseServiceInterface } from '../Common/ServiceInterface.js';
import type { Resolver as QueryHotspots } from './queryHotspots.js';
import queryHotspots from './queryHotspots.js';
import type { Resolver as QueryRegulations } from './queryRegulations.js';
import queryRegulations from './queryRegulations.js';
import type { Resolver as QueryTrafficCountsByAirspace } from './queryTrafficCountsByAirspace.js';
import queryTrafficCountsByAirspace from './queryTrafficCountsByAirspace.js';
import type { Resolver as QueryTrafficCountsByTrafficVolume } from './queryTrafficCountsByTrafficVolume.js';
import queryTrafficCountsByTrafficVolume from './queryTrafficCountsByTrafficVolume.js';
import type { Resolver as RetrieveCapacityPlan } from './retrieveCapacityPlan.js';
import retrieveCapacityPlan from './retrieveCapacityPlan.js';
import type { Resolver as RetrieveOTMVPlan } from './retrieveOTMVPlan.js';
import retrieveOTMVPlan from './retrieveOTMVPlan.js';
import type { Resolver as RetrieveRunwayConfigurationPlan } from './retrieveRunwayConfigurationPlan.js';
import retrieveRunwayConfigurationPlan from './retrieveRunwayConfigurationPlan.js';
import type { Resolver as RetrieveSectorConfigurationPlan } from './retrieveSectorConfigurationPlan.js';
import retrieveSectorConfigurationPlan from './retrieveSectorConfigurationPlan.js';
import type { Resolver as UpdateCapacityPlan } from './updateCapacityPlan.js';
import updateCapacityPlan from './updateCapacityPlan.js';
import type { Resolver as UpdateOTMVPlan } from './updateOTMVPlan.js';
import updateOTMVPlan from './updateOTMVPlan.js';

export type FlowClient = SoapClient;

export interface FlowService extends BaseServiceInterface {
  retrieveSectorConfigurationPlan: RetrieveSectorConfigurationPlan;
  queryTrafficCountsByAirspace: QueryTrafficCountsByAirspace;
  queryRegulations: QueryRegulations;
  queryHotspots: QueryHotspots;
  queryTrafficCountsByTrafficVolume: QueryTrafficCountsByTrafficVolume;
  retrieveOTMVPlan: RetrieveOTMVPlan;
  updateOTMVPlan: UpdateOTMVPlan;
  retrieveCapacityPlan: RetrieveCapacityPlan;
  updateCapacityPlan: UpdateCapacityPlan;
  retrieveRunwayConfigurationPlan: RetrieveRunwayConfigurationPlan;
}

export async function getFlowClient(config: Config): Promise<FlowService> {
  const WSDL = getWSDLPath({
    service: 'FlowServices',
    flavour: config.flavour,
    XSD_PATH: config.XSD_PATH,
  });

  const security = prepareSecurity(config);

  const client = await createClientAsync(WSDL, { customDeserializer });
  client.setSecurity(security);

  return {
    __soapClient: client,
    config,
    retrieveSectorConfigurationPlan: retrieveSectorConfigurationPlan(client),
    queryTrafficCountsByAirspace: queryTrafficCountsByAirspace(client),
    queryRegulations: queryRegulations(client),
    queryHotspots: queryHotspots(client),
    queryTrafficCountsByTrafficVolume:
      queryTrafficCountsByTrafficVolume(client),
    retrieveOTMVPlan: retrieveOTMVPlan(client),
    updateOTMVPlan: updateOTMVPlan(client),
    retrieveCapacityPlan: retrieveCapacityPlan(client),
    updateCapacityPlan: updateCapacityPlan(client),
    retrieveRunwayConfigurationPlan: retrieveRunwayConfigurationPlan(client),
  };
}
