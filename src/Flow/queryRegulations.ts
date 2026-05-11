import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type { RegulationListRequest, RegulationListReply } from './types.ts';

export const queryRegulations = createSoapQueryDefinition<
  RegulationListRequest,
  RegulationListReply
>({
  service: 'Flow',
  query: 'queryRegulations',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().MeasuresService.MeasuresPort.queryRegulations.input,
});
