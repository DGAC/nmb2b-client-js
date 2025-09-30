import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type {
  FlightListByMeasureRequest,
  FlightListByMeasureReply,
} from './types.js';

export const queryFlightsByMeasure = createSoapQueryDefinition<
  FlightListByMeasureRequest,
  FlightListByMeasureReply
>({
  service: 'Flight',
  query: 'queryFlightsByMeasure',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByMeasure.input,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  executeQuery: (client) => client.queryFlightsByMeasureAsync,
});
