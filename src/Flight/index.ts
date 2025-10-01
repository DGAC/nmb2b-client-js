import type { Config } from '../config.js';
import {
  createSoapService,
  type SoapService,
} from '../utils/soap-query-definition.js';

import { queryFlightPlans } from './queryFlightPlans.js';
import { queryFlightsByAerodrome } from './queryFlightsByAerodrome.js';
import { queryFlightsByAerodromeSet } from './queryFlightsByAerodromeSet.js';
import { queryFlightsByAircraftOperator } from './queryFlightsByAircraftOperator.js';
import { queryFlightsByAirspace } from './queryFlightsByAirspace.js';
import { queryFlightsByMeasure } from './queryFlightsByMeasure.js';
import { queryFlightsByTrafficVolume } from './queryFlightsByTrafficVolume.js';
import { retrieveFlight } from './retrieveFlight.js';

const queryDefinitions = {
  retrieveFlight,
  queryFlightPlans,
  queryFlightsByAerodrome,
  queryFlightsByAerodromeSet,
  queryFlightsByAircraftOperator,
  queryFlightsByAirspace,
  queryFlightsByMeasure,
  queryFlightsByTrafficVolume,
};

export type FlightService = SoapService<typeof queryDefinitions>;

export async function getFlightClient(config: Config): Promise<FlightService> {
  const service = await createSoapService({
    serviceName: 'FlightServices',
    config,
    queryDefinitions,
  });

  return service;
}
