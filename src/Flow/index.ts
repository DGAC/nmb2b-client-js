import path from 'path';
import { getWSDLPath } from '../constants';
import { getEndpoint } from '../config';
import { prepareSecurity } from '../security';
import { createClient } from 'soap';
import { Config } from '../config';
import util from 'util';
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
      // tslint:disable-next-line
      console.log(err);
      return reject(err);
    }
  });
}

import retrieveSectorConfigurationPlan from './retrieveSectorConfigurationPlan';
import { Resolver as RetrieveSectorConfigurationPlan } from './retrieveSectorConfigurationPlan';
import queryTrafficCountsByAirspace from './queryTrafficCountsByAirspace';
import { Resolver as QueryTrafficCountsByAirspace } from './queryTrafficCountsByAirspace';
import queryRegulations from './queryRegulations';
import { Resolver as QueryRegulations } from './queryRegulations';
import queryHotspots from './queryHotspots';
import { Resolver as QueryHotspots } from './queryHotspots';
import queryTrafficCountsByTrafficVolume from './queryTrafficCountsByTrafficVolume';
import { Resolver as QueryTrafficCountsByTrafficVolume } from './queryTrafficCountsByTrafficVolume';
import retrieveOTMVPlan from './retrieveOTMVPlan';
import { Resolver as RetrieveOTMVPlan } from './retrieveOTMVPlan';
import updateOTMVPlan from './updateOTMVPlan';
import { Resolver as UpdateOTMVPlan } from './updateOTMVPlan';
import retrieveCapacityPlan, {
  Resolver as RetrieveCapacityPlan,
} from './retrieveCapacityPlan';
import updateCapacityPlan from './updateCapacityPlan';
import { Resolver as UpdateCapacityPlan } from './updateCapacityPlan';
import retrieveRunwayConfigurationPlan, {
  Resolver as RetrieveRunwayConfigurationPlan,
} from './retrieveRunwayConfigurationPlan';

export interface FlowService {
  __soapClient: object;
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
