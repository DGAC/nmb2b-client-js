import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  FlightListByAirspaceReply,
  FlightListByAirspaceRequest,
} from './types.ts';

export const queryFlightsByAirspace = createSoapQueryDefinition<
  FlightListByAirspaceRequest,
  FlightListByAirspaceReply
>({
  service: 'Flight',
  query: 'queryFlightsByAirspace',
  getSchema: (client) =>
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByAirspace.input,
});
