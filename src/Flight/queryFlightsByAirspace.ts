import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type {
  FlightListByAirspaceReply,
  FlightListByAirspaceRequest,
} from './types.js';

export const queryFlightsByAirspace = createSoapQueryDefinition<
  FlightListByAirspaceRequest,
  FlightListByAirspaceReply
>({
  service: 'Flight',
  query: 'queryFlightsByAirspace',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByAirspace.input,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  executeQuery: (client) => client.queryFlightsByAirspaceAsync,
});
