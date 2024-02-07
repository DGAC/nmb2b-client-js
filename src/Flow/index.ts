import { createClient } from 'soap';
import { Config } from '../config';
import { getWSDLPath } from '../constants';
import { prepareSecurity } from '../security';
import { deserializer as customDeserializer } from '../utils/transformers';

const getWSDL = ({ flavour, XSD_PATH }: Pick<Config, 'flavour' | 'XSD_PATH'>) =>
  getWSDLPath({ service: 'FlowServices', flavour, XSD_PATH });

export type FlowClient = any;

function createFlowServices(config: Config): Promise<FlowClient> {
  const WSDL = getWSDL(config);
  const security = prepareSecurity(config);
  return new Promise((resolve, reject) => {
    try {
      createClient(WSDL, { customDeserializer }, (err, client) => {
        if (err) {
          return reject(err);
        }
        client.setSecurity(security);

        // console.log(util.inspect(client.describe(), { depth: 3 }));
        // console.log(
        //   client.wsdl.definitions.schemas['eurocontrol/cfmu/b2b/CommonServices']
        //     .complexTypes['Reply'].children[0].children,
        // );
        return resolve(client);
      });
    } catch (err) {
      // TODO: Implement a proper debug log message output
      console.log(err);
      return reject(err);
    }
  });
}

import { BaseServiceInterface } from '../Common/ServiceInterface';
import queryHotspots, { Resolver as QueryHotspots } from './queryHotspots';
import queryRegulations, {
  Resolver as QueryRegulations,
} from './queryRegulations';
import queryTrafficCountsByAirspace, {
  Resolver as QueryTrafficCountsByAirspace,
} from './queryTrafficCountsByAirspace';
import queryTrafficCountsByTrafficVolume, {
  Resolver as QueryTrafficCountsByTrafficVolume,
} from './queryTrafficCountsByTrafficVolume';
import retrieveCapacityPlan, {
  Resolver as RetrieveCapacityPlan,
} from './retrieveCapacityPlan';
import retrieveOTMVPlan, {
  Resolver as RetrieveOTMVPlan,
} from './retrieveOTMVPlan';
import retrieveRunwayConfigurationPlan, {
  Resolver as RetrieveRunwayConfigurationPlan,
} from './retrieveRunwayConfigurationPlan';
import retrieveSectorConfigurationPlan, {
  Resolver as RetrieveSectorConfigurationPlan,
} from './retrieveSectorConfigurationPlan';
import updateCapacityPlan, {
  Resolver as UpdateCapacityPlan,
} from './updateCapacityPlan';
import updateOTMVPlan, { Resolver as UpdateOTMVPlan } from './updateOTMVPlan';

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
