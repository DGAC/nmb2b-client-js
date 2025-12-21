import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  FlightListByAerodromeReply,
  FlightListByAerodromeRequest,
} from './types.ts';

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
});
