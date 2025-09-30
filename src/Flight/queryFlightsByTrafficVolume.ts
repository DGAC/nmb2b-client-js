import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type {
  FlightListByTrafficVolumeRequest,
  FlightListByTrafficVolumeReply,
} from './types.js';

export const queryFlightsByTrafficVolume = createSoapQueryDefinition<
  FlightListByTrafficVolumeRequest,
  FlightListByTrafficVolumeReply
>({
  service: 'Flight',
  query: 'queryFlightsByTrafficVolume',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByTrafficVolume.input,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  executeQuery: (client) => client.queryFlightsByTrafficVolumeAsync,
});
