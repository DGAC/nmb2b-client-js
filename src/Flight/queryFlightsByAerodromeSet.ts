import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type {
  FlightListByAerodromeSetReply,
  FlightListByAerodromeSetRequest,
} from './types.js';

export const queryFlightsByAerodromeSet = createSoapQueryDefinition<
  FlightListByAerodromeSetRequest,
  FlightListByAerodromeSetReply
>({
  service: 'Flight',
  query: 'queryFlightsByAerodromeSet',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByAerodromeSet.input,
});
