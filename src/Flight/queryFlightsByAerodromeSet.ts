import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  FlightListByAerodromeSetReply,
  FlightListByAerodromeSetRequest,
} from './types.ts';

export const queryFlightsByAerodromeSet = createSoapQueryDefinition<
  FlightListByAerodromeSetRequest,
  FlightListByAerodromeSetReply
>({
  service: 'Flight',
  query: 'queryFlightsByAerodromeSet',
  getSchema: (client) =>
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByAerodromeSet.input,
});
