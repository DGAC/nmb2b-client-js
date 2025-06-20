import { type Client as SoapClient, createClient } from 'soap';
import type { Config } from '../config.js';
import { getWSDLPath } from '../constants.js';
import { prepareSecurity } from '../security.js';
import { deserializer as customDeserializer } from '../utils/transformers/index.js';

import type { Resolver as RetrieveFlight } from './retrieveFlight.js';
import retrieveFlight from './retrieveFlight.js';

import type { Resolver as QueryFlightsByAirspace } from './queryFlightsByAirspace.js';
import queryFlightsByAirspace from './queryFlightsByAirspace.js';

import type { Resolver as QueryFlightPlans } from './queryFlightPlans.js';
import queryFlightPlans from './queryFlightPlans.js';

import type { Resolver as QueryFlightsByTrafficVolume } from './queryFlightsByTrafficVolume.js';
import queryFlightsByTrafficVolume from './queryFlightsByTrafficVolume.js';

import type { Resolver as QueryFlightsByMeasure } from './queryFlightsByMeasure.js';
import queryFlightsByMeasure from './queryFlightsByMeasure.js';

import type { Resolver as QueryFlightsByAerodrome } from './queryFlightsByAerodrome.js';
import queryFlightsByAerodrome from './queryFlightsByAerodrome.js';

import type { Resolver as QueryFlightsByAerodromeSet } from './queryFlightsByAerodromeSet.js';
import queryFlightsByAerodromeSet from './queryFlightsByAerodromeSet.js';

import type { BaseServiceInterface } from '../Common/ServiceInterface.js';
import type { Resolver as QueryFlightsByAircraftOperator } from './queryFlightsByAircraftOperator.js';
import queryFlightsByAircraftOperator from './queryFlightsByAircraftOperator.js';

const getWSDL = ({ flavour, XSD_PATH }: Pick<Config, 'flavour' | 'XSD_PATH'>) =>
  getWSDLPath({ service: 'FlightServices', flavour, XSD_PATH });

export type FlightClient = SoapClient;

function createFlightServices(config: Config): Promise<FlightClient> {
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

        // console.log(util.inspect(client.describe().FlightManagementService.FlightManagementPort.queryFlightPlans, { depth: 3 }));
        // console.log(
        //   client.wsdl.definitions.schemas['eurocontrol/cfmu/b2b/CommonServices']
        //     .complexTypes['Reply'].children[0].children,
        // );
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

export interface FlightService extends BaseServiceInterface {
  retrieveFlight: RetrieveFlight;
  queryFlightsByAirspace: QueryFlightsByAirspace;
  queryFlightPlans: QueryFlightPlans;
  queryFlightsByTrafficVolume: QueryFlightsByTrafficVolume;
  queryFlightsByMeasure: QueryFlightsByMeasure;
  queryFlightsByAerodrome: QueryFlightsByAerodrome;
  queryFlightsByAerodromeSet: QueryFlightsByAerodromeSet;
  queryFlightsByAircraftOperator: QueryFlightsByAircraftOperator;
}

export function getFlightClient(config: Config): Promise<FlightService> {
  return createFlightServices(config).then((client) => ({
    __soapClient: client,
    config,
    retrieveFlight: retrieveFlight(client),
    queryFlightsByAirspace: queryFlightsByAirspace(client),
    queryFlightPlans: queryFlightPlans(client),
    queryFlightsByTrafficVolume: queryFlightsByTrafficVolume(client),
    queryFlightsByMeasure: queryFlightsByMeasure(client),
    queryFlightsByAerodrome: queryFlightsByAerodrome(client),
    queryFlightsByAerodromeSet: queryFlightsByAerodromeSet(client),
    queryFlightsByAircraftOperator: queryFlightsByAircraftOperator(client),
  }));
}
