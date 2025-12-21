import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  FlightListByTrafficVolumeRequest,
  FlightListByTrafficVolumeReply,
} from './types.ts';

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
});
