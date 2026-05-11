import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type { FlightPlanListReply, FlightPlanListRequest } from './types.ts';

export const queryFlightPlans = createSoapQueryDefinition<
  FlightPlanListRequest,
  FlightPlanListReply
>({
  service: 'Flight',
  query: 'queryFlightPlans',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightPlans.input,
});
