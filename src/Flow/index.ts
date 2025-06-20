import { createClient, type Client as SoapClient } from 'soap';
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

const getWSDL = ({ flavour, XSD_PATH }: Pick<Config, 'flavour' | 'XSD_PATH'>) =>
  getWSDLPath({ service: 'FlowServices', flavour, XSD_PATH });

export type FlowClient = SoapClient;

function createFlowServices(config: Config): Promise<FlowClient> {
  const WSDL = getWSDL(config);
  const security = prepareSecurity(config);
  return new Promise((resolve, reject) => {
    try {
      createClient(WSDL, { customDeserializer }, (err, client) => {
        if (err) {
          reject(
            err instanceof Error
              ? err
              : new Error('Unknown error', { cause: err }),
          );
          return;
        }
        client.setSecurity(security);

        resolve(client);
      });
    } catch (err) {
      // TODO: Implement a proper debug log message output
      console.log(err);
      reject(
        err instanceof Error ? err : new Error('Unknown error', { cause: err }),
      );
      return;
    }
  });
}

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

export function getFlowClient(config: Config): Promise<FlowService> {
  return createFlowServices(config).then((client) => ({
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
  }));
}
