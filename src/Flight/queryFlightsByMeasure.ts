import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  FlightListByMeasureRequest,
  FlightListByMeasureReply,
} from './types.ts';

export const queryFlightsByMeasure = createSoapQueryDefinition<
  FlightListByMeasureRequest,
  FlightListByMeasureReply
>({
  service: 'Flight',
  query: 'queryFlightsByMeasure',
  getSchema: (client) =>
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByMeasure.input,
});
