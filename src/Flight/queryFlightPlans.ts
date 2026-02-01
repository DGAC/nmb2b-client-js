import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type { FlightPlanListReply, FlightPlanListRequest } from './types.js';

export const queryFlightPlans = createSoapQueryDefinition<
  FlightPlanListRequest,
  FlightPlanListReply
>({
  service: 'Flight',
  query: 'queryFlightPlans',
  getSchema: (client) =>
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightPlans.input,
});
