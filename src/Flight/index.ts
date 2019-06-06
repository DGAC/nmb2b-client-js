import path from 'path';
import { getWSDLPath } from '../constants';
import { getEndpoint } from '../config';
import { prepareSecurity } from '../security';
import { createClient } from 'soap';
import { Config } from '../config';
import util from 'util';
import { deserializer as customDeserializer } from '../utils/transformers';

const getWSDL = ({ flavour, XSD_PATH }: Pick<Config, 'flavour' | 'XSD_PATH'>) =>
  getWSDLPath({ service: 'FlightServices', flavour, XSD_PATH });

export type FlightClient = any;

function createFlightServices(config: Config): Promise<FlightClient> {
  const WSDL = getWSDL(config);
  const security = prepareSecurity(config);
  return new Promise((resolve, reject) => {
    try {
      createClient(WSDL, { customDeserializer }, (err, client) => {
        if (err) {
          return reject(err);
        }
        client.setSecurity(security);

        // console.log(util.inspect(client.describe().FlightManagementService.FlightManagementPort.queryFlightPlans, { depth: 3 }));
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

import retrieveFlight from './retrieveFlight';
import { Resolver as RetrieveFlight } from './retrieveFlight';
import queryFlightsByAirspace from './queryFlightsByAirspace';
import { Resolver as QueryFlightsByAirspace } from './queryFlightsByAirspace';
import queryFlightPlans from './queryFlightPlans';
import { Resolver as QueryFlightPlans } from './queryFlightPlans';
import queryFlightsByTrafficVolume from './queryFlightsByTrafficVolume';
import { Resolver as QueryFlightsByTrafficVolume } from './queryFlightsByTrafficVolume';
import queryFlightsByMeasure from './queryFlightsByMeasure';
import { Resolver as QueryFlightsByMeasure } from './queryFlightsByMeasure';

export interface FlightService {
  __soapClient: object;
  retrieveFlight: RetrieveFlight;
  queryFlightsByAirspace: QueryFlightsByAirspace;
  queryFlightPlans: QueryFlightPlans;
  queryFlightsByTrafficVolume: QueryFlightsByTrafficVolume;
  queryFlightsByMeasure: QueryFlightsByMeasure;
}

export function getFlightClient(config: Config): Promise<FlightService> {
  return createFlightServices(config).then(client => ({
    __soapClient: client,
    retrieveFlight: retrieveFlight(client),
    queryFlightsByAirspace: queryFlightsByAirspace(client),
    queryFlightPlans: queryFlightPlans(client),
    queryFlightsByTrafficVolume: queryFlightsByTrafficVolume(client),
    queryFlightsByMeasure: queryFlightsByMeasure(client),
  }));
}
