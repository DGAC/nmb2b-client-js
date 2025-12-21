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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByMeasure.input,
});
