import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  FlightListByAircraftOperatorReply,
  FlightListByAircraftOperatorRequest,
} from './types.ts';

export const queryFlightsByAircraftOperator = createSoapQueryDefinition<
  FlightListByAircraftOperatorRequest,
  FlightListByAircraftOperatorReply
>({
  service: 'Flight',
  query: 'queryFlightsByAircraftOperator',
  getSchema: (client) =>
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByAircraftOperator.input,
});
