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
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByTrafficVolume.input,
});
