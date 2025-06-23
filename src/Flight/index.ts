import { type Client as SoapClient, createClientAsync } from 'soap';
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

export type FlightClient = SoapClient;

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

export async function getFlightClient(config: Config): Promise<FlightService> {
  const WSDL = getWSDLPath({
    service: 'FlightServices',
    flavour: config.flavour,
    XSD_PATH: config.XSD_PATH,
  });

  const security = prepareSecurity(config);

  const client = await createClientAsync(WSDL, { customDeserializer });
  client.setSecurity(security);

  return {
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
  };
}
