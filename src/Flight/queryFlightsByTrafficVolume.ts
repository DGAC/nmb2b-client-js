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
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByTrafficVolume.input,
});
