import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type {
  FlightListByAerodromeReply,
  FlightListByAerodromeRequest,
} from './types.js';

export const queryFlightsByAerodrome = createSoapQueryDefinition<
  FlightListByAerodromeRequest,
  FlightListByAerodromeReply
>({
  service: 'Flight',
  query: 'queryFlightsByAerodrome',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByAerodrome.input,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  executeQuery: (client) => client.queryFlightsByAerodromeAsync,
});
