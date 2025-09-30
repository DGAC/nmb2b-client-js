import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type {
  FlightListByAircraftOperatorReply,
  FlightListByAircraftOperatorRequest,
} from './types.js';

export const queryFlightsByAircraftOperator = createSoapQueryDefinition<
  FlightListByAircraftOperatorRequest,
  FlightListByAircraftOperatorReply
>({
  service: 'Flight',
  query: 'queryFlightsByAircraftOperator',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByAircraftOperator.input,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  executeQuery: (client) => client.queryFlightsByAircraftOperatorAsync,
});
