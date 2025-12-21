import type { Config } from '../config.ts';
import {
  createSoapService,
  type SoapService,
} from '../utils/soap-query-definition.ts';

import { queryFlightPlans } from './queryFlightPlans.ts';
import { queryFlightsByAerodrome } from './queryFlightsByAerodrome.ts';
import { queryFlightsByAerodromeSet } from './queryFlightsByAerodromeSet.ts';
import { queryFlightsByAircraftOperator } from './queryFlightsByAircraftOperator.ts';
import { queryFlightsByAirspace } from './queryFlightsByAirspace.ts';
import { queryFlightsByMeasure } from './queryFlightsByMeasure.ts';
import { queryFlightsByTrafficVolume } from './queryFlightsByTrafficVolume.ts';
import { retrieveFlight } from './retrieveFlight.ts';

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
