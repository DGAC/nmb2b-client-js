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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByAircraftOperator.input,
});
