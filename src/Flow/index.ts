import { createClient, type Client as SoapClient } from 'soap';
import type { Config } from '../config';
import { getWSDLPath } from '../constants';
import { prepareSecurity } from '../security';
import { deserializer as customDeserializer } from '../utils/transformers';

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

import type { BaseServiceInterface } from '../Common/ServiceInterface';
import type { Resolver as QueryHotspots } from './queryHotspots';
import queryHotspots from './queryHotspots';
import type { Resolver as QueryRegulations } from './queryRegulations';
import queryRegulations from './queryRegulations';
import type { Resolver as QueryTrafficCountsByAirspace } from './queryTrafficCountsByAirspace';
import queryTrafficCountsByAirspace from './queryTrafficCountsByAirspace';
import type { Resolver as QueryTrafficCountsByTrafficVolume } from './queryTrafficCountsByTrafficVolume';
import queryTrafficCountsByTrafficVolume from './queryTrafficCountsByTrafficVolume';
import type { Resolver as RetrieveCapacityPlan } from './retrieveCapacityPlan';
import retrieveCapacityPlan from './retrieveCapacityPlan';
import type { Resolver as RetrieveOTMVPlan } from './retrieveOTMVPlan';
import retrieveOTMVPlan from './retrieveOTMVPlan';
import type { Resolver as RetrieveRunwayConfigurationPlan } from './retrieveRunwayConfigurationPlan';
import retrieveRunwayConfigurationPlan from './retrieveRunwayConfigurationPlan';
import type { Resolver as RetrieveSectorConfigurationPlan } from './retrieveSectorConfigurationPlan';
import retrieveSectorConfigurationPlan from './retrieveSectorConfigurationPlan';
import type { Resolver as UpdateCapacityPlan } from './updateCapacityPlan';
import updateCapacityPlan from './updateCapacityPlan';
import type { Resolver as UpdateOTMVPlan } from './updateOTMVPlan';
import updateOTMVPlan from './updateOTMVPlan';

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
